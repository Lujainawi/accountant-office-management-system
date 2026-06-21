from io import BytesIO
import zipfile

import pytest

from app.utils.file_validation import (
    get_effective_allowed_extensions,
    get_upload_policy,
    parse_office_allowed_extensions,
)
from tests.conftest import make_pdf_bytes, make_png_bytes, upload_document


def test_upload_policy_route_before_dynamic_id(auth_client):
    response = auth_client.get("/api/documents/upload-policy")
    assert response.status_code == 200
    payload = response.json()
    assert "allowed_extensions" in payload
    assert "max_upload_size_mb" in payload
    assert isinstance(payload["allowed_extensions"], list)
    assert isinstance(payload["max_upload_size_mb"], int)


def test_upload_policy_requires_auth(test_app):
    response = test_app["client"].get("/api/documents/upload-policy")
    assert response.status_code == 401


def test_policy_and_validator_use_same_extensions(auth_client, test_app):
    policy_response = auth_client.get("/api/documents/upload-policy")
    assert policy_response.status_code == 200
    policy_extensions = policy_response.json()["allowed_extensions"]

    db = test_app["session_factory"]()
    try:
        assert get_effective_allowed_extensions(db) == policy_extensions
        assert get_upload_policy(db)["allowed_extensions"] == policy_extensions
    finally:
        db.close()


def test_unsupported_extension_rejected(auth_client, test_app):
    client_id = test_app["seeded"]["client"].id
    files = {"file": ("demo.exe", b"MZ", "application/octet-stream")}
    data = {
        "client_id": str(client_id),
        "document_name": "bad",
        "document_type": "invoice",
        "document_date": "2026-05-15",
        "amount_before_vat": "100.00",
        "status": "new",
        "notes": "",
    }
    response = auth_client.post("/api/documents", files=files, data=data)
    assert response.status_code == 422


def test_mime_mismatch_rejected(auth_client, test_app):
    client_id = test_app["seeded"]["client"].id
    files = {"file": ("demo.pdf", b"not-a-pdf", "application/pdf")}
    data = {
        "client_id": str(client_id),
        "document_name": "bad",
        "document_type": "invoice",
        "document_date": "2026-05-15",
        "amount_before_vat": "100.00",
        "status": "new",
        "notes": "",
    }
    response = auth_client.post("/api/documents", files=files, data=data)
    assert response.status_code == 422


def test_oversized_file_rejected(auth_client, test_app, monkeypatch):
    from app.config import settings

    monkeypatch.setattr(settings, "max_upload_size_mb", 1)
    client_id = test_app["seeded"]["client"].id
    huge = b"%PDF-1.4\n" + (b"a" * (2 * 1024 * 1024))
    files = {"file": ("big.pdf", huge, "application/pdf")}
    data = {
        "client_id": str(client_id),
        "document_name": "big",
        "document_type": "invoice",
        "document_date": "2026-05-15",
        "amount_before_vat": "100.00",
        "status": "new",
        "notes": "",
    }
    response = auth_client.post("/api/documents", files=files, data=data)
    assert response.status_code == 422


def test_hebrew_multidot_filename_download(auth_client, test_app):
    client_id = test_app["seeded"]["client"].id
    filename = "חשבונית.מאי.2026.pdf"
    create_response = upload_document(
        auth_client,
        client_id=client_id,
        filename=filename,
    )
    assert create_response.status_code == 201
    document_id = create_response.json()["id"]

    download_response = auth_client.get(f"/api/documents/{document_id}/download")
    assert download_response.status_code == 200
    content_disposition = download_response.headers.get("content-disposition", "")
    assert filename in content_disposition or "filename*=" in content_disposition
    assert ".hex." not in content_disposition.lower()
    body = download_response.content
    assert body.startswith(b"%PDF")


def test_download_requires_auth(test_app, auth_client):
    client_id = test_app["seeded"]["client"].id
    create_response = upload_document(auth_client, client_id=client_id)
    document_id = create_response.json()["id"]
    api = test_app["client"]
    api.cookies.clear()
    response = api.get(f"/api/documents/{document_id}/download")
    assert response.status_code == 401


def test_missing_file_on_download(auth_client, test_app):
    client_id = test_app["seeded"]["client"].id
    create_response = upload_document(auth_client, client_id=client_id)
    document_id = create_response.json()["id"]
    stored_file = next(test_app["upload_dir"].iterdir())
    stored_file.unlink()

    response = auth_client.get(f"/api/documents/{document_id}/download")
    assert response.status_code == 404
    assert response.json()["detail"] == "קובץ המסמך לא נמצא במערכת."


def test_multi_dot_original_filename_allowed(auth_client, test_app):
    client_id = test_app["seeded"]["client"].id
    response = upload_document(
        auth_client,
        client_id=client_id,
        filename="חשבונית.מאי.2026.pdf",
    )
    assert response.status_code == 201
    assert response.json()["original_filename"] == "חשבונית.מאי.2026.pdf"


def test_malformed_office_extensions_yield_empty_policy(test_app):
    db = test_app["session_factory"]()
    try:
        from app.models.office_settings import OfficeSettings

        settings_row = db.get(OfficeSettings, 1)
        settings_row.allowed_file_extensions = "{bad json"
        db.commit()
        assert get_effective_allowed_extensions(db) == []
    finally:
        db.close()
