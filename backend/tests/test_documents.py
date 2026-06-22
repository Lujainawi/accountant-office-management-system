from decimal import Decimal

import pytest

from app.utils.file_validation import (
    get_effective_allowed_extensions,
    parse_office_allowed_extensions,
    SECURE_SYSTEM_ALLOWLIST,
)
from tests.conftest import (
    DEV_ENGINE_ERROR,
    DEV_SESSIONLOCAL_ERROR,
    make_pdf_bytes,
    upload_document,
)


def test_development_database_is_not_used(test_app):
    from app.database import SessionLocal, engine

    with pytest.raises(RuntimeError, match=DEV_SESSIONLOCAL_ERROR):
        SessionLocal()

    with pytest.raises(RuntimeError, match=DEV_ENGINE_ERROR):
        engine.connect()

    configured_path = test_app["configured_dev_db_path"]
    assert configured_path is not None
    assert configured_path.name == "accountant_app.db"


def test_client_summary_empty(auth_client, test_app):
    client_id = test_app["seeded"]["client"].id
    response = auth_client.get(f"/api/clients/{client_id}/summary")
    assert response.status_code == 200
    payload = response.json()
    assert payload["document_count"] == 0
    assert payload["documents_by_status"] == {
        "new": 0,
        "in_progress": 0,
        "completed": 0,
        "missing_information": 0,
    }
    assert payload["total_before_vat"] == "0.00"
    assert payload["vat_total"] == "0.00"
    assert payload["total_including_vat"] == "0.00"
    assert payload["open_task_count"] == 0
    assert payload["payment_record_count"] == 0


def test_create_document_without_vat_rate_uses_office_default(auth_client, test_app):
    _reset_default_vat(auth_client, "18.00")
    client_id = test_app["seeded"]["client"].id
    response = upload_document(auth_client, client_id=client_id)
    assert response.status_code == 201
    payload = response.json()
    assert payload["vat_rate"] == "18.00"
    assert payload["vat_amount"] == "180.00"
    assert payload["total_amount"] == "1180.00"
    assert "file_path" not in payload
    assert "stored_filename" not in payload


def test_update_amount_only_keeps_existing_vat_rate(auth_client, test_app):
    client_id = test_app["seeded"]["client"].id
    create_response = upload_document(
        auth_client,
        client_id=client_id,
        vat_rate="17.00",
        amount_before_vat="1000.00",
    )
    document_id = create_response.json()["id"]

    update_response = auth_client.put(
        f"/api/documents/{document_id}",
        json={"amount_before_vat": "2000.00"},
    )
    assert update_response.status_code == 200
    payload = update_response.json()
    assert payload["vat_rate"] == "17.00"
    assert payload["vat_amount"] == "340.00"
    assert payload["total_amount"] == "2340.00"


def test_list_limit_and_ordering(auth_client, test_app):
    client_id = test_app["seeded"]["client"].id
    dates = ["2026-05-01", "2026-05-02", "2026-05-03", "2026-05-04", "2026-05-05", "2026-05-06"]
    for index, document_date in enumerate(dates):
        response = upload_document(
            auth_client,
            client_id=client_id,
            document_name=f"מסמך {index}",
            document_date=document_date,
        )
        assert response.status_code == 201

    response = auth_client.get(f"/api/documents?client_id={client_id}&limit=5")
    assert response.status_code == 200
    payload = response.json()
    assert len(payload) == 5
    returned_dates = [item["document_date"] for item in payload]
    assert returned_dates == sorted(returned_dates, reverse=True)


def test_client_delete_guard_with_documents(auth_client, test_app):
    client_id = test_app["seeded"]["client"].id
    upload_response = upload_document(auth_client, client_id=client_id)
    assert upload_response.status_code == 201

    delete_response = auth_client.delete(f"/api/clients/{client_id}")
    assert delete_response.status_code == 409
    assert "מסמכים קשורים" in delete_response.json()["detail"]


def test_hard_delete_removes_document_and_file(auth_client, test_app):
    client_id = test_app["seeded"]["client"].id
    upload_dir = test_app["upload_dir"]
    create_response = upload_document(auth_client, client_id=client_id)
    document_id = create_response.json()["id"]
    files_before = list(upload_dir.iterdir())
    assert len(files_before) == 1

    delete_response = auth_client.delete(f"/api/documents/{document_id}")
    assert delete_response.status_code == 204
    assert auth_client.get(f"/api/documents/{document_id}").status_code == 404
    assert list(upload_dir.iterdir()) == []


def test_delete_missing_file_still_succeeds(auth_client, test_app, monkeypatch):
    client_id = test_app["seeded"]["client"].id
    create_response = upload_document(auth_client, client_id=client_id)
    document_id = create_response.json()["id"]
    stored_file = next(test_app["upload_dir"].iterdir())
    stored_file.unlink()

    delete_response = auth_client.delete(f"/api/documents/{document_id}")
    assert delete_response.status_code == 204


def test_create_commit_failure_removes_saved_file(auth_client, test_app, monkeypatch):
    client_id = test_app["seeded"]["client"].id
    upload_dir = test_app["upload_dir"]

    def fail_commit(self):
        raise RuntimeError("commit failed")

    monkeypatch.setattr(
        "app.crud.document.Session.commit",
        fail_commit,
    )

    response = upload_document(auth_client, client_id=client_id)
    assert response.status_code == 422
    assert list(upload_dir.iterdir()) == []


def test_delete_commit_failure_keeps_file(auth_client, test_app, monkeypatch):
    client_id = test_app["seeded"]["client"].id
    create_response = upload_document(auth_client, client_id=client_id)
    document_id = create_response.json()["id"]
    files_before = list(test_app["upload_dir"].iterdir())
    assert len(files_before) == 1

    def fail_commit(self):
        raise RuntimeError("commit failed")

    monkeypatch.setattr(
        "app.crud.document.Session.commit",
        fail_commit,
    )

    delete_response = auth_client.delete(f"/api/documents/{document_id}")
    assert delete_response.status_code == 500
    assert len(list(test_app["upload_dir"].iterdir())) == 1
    assert auth_client.get(f"/api/documents/{document_id}").status_code == 200


def test_parse_office_extensions_normalization():
    assert parse_office_allowed_extensions('["PDF", ".Jpg", "pdf", "jpg"]') == ["jpg", "pdf"]
    assert parse_office_allowed_extensions("PDF, .PNG ,png") == ["pdf", "png"]
    assert parse_office_allowed_extensions("not-json") == []
    assert parse_office_allowed_extensions("{bad") == []


def test_effective_extensions_intersection(test_app):
    db = test_app["session_factory"]()
    try:
        from app.models.office_settings import OfficeSettings

        settings_row = db.get(OfficeSettings, 1)
        settings_row.allowed_file_extensions = '["pdf","exe","txt"]'
        db.commit()

        effective = get_effective_allowed_extensions(db)
        assert effective == ["pdf"]
        assert set(effective).issubset(SECURE_SYSTEM_ALLOWLIST)
    finally:
        db.close()


def _reset_default_vat(auth_client, rate="18.00"):
    auth_client.put("/api/settings", json={"default_vat_rate": rate})


def test_create_document_rejects_amount_with_extra_decimals(auth_client, test_app):
    client_id = test_app["seeded"]["client"].id
    response = upload_document(
        auth_client,
        client_id=client_id,
        amount_before_vat="10.005",
    )
    assert response.status_code == 422


def test_create_document_rejects_invalid_vat_scale(auth_client, test_app):
    client_id = test_app["seeded"]["client"].id
    response = upload_document(
        auth_client,
        client_id=client_id,
        vat_rate="18.001",
    )
    assert response.status_code == 422


def test_create_document_rejects_vat_over_max(auth_client, test_app):
    client_id = test_app["seeded"]["client"].id
    response = upload_document(
        auth_client,
        client_id=client_id,
        vat_rate="100.01",
    )
    assert response.status_code == 422


def test_create_document_rejects_nan_amount(auth_client, test_app):
    client_id = test_app["seeded"]["client"].id
    response = upload_document(
        auth_client,
        client_id=client_id,
        amount_before_vat="NaN",
    )
    assert response.status_code == 422


def test_create_document_rejects_empty_vat_rate(auth_client, test_app):
    client_id = test_app["seeded"]["client"].id
    files = {"file": ("demo.pdf", make_pdf_bytes(), "application/pdf")}
    data = {
        "client_id": str(client_id),
        "document_name": "מסמך דוגמה",
        "document_type": "invoice",
        "document_date": "2026-05-15",
        "amount_before_vat": "1000.00",
        "status": "new",
        "notes": "",
        "vat_rate": "",
    }
    response = auth_client.post("/api/documents", files=files, data=data)
    assert response.status_code == 422


def test_create_document_rejects_literal_null_vat_rate(auth_client, test_app):
    client_id = test_app["seeded"]["client"].id
    files = {"file": ("demo.pdf", make_pdf_bytes(), "application/pdf")}
    data = {
        "client_id": str(client_id),
        "document_name": "מסמך דוגמה",
        "document_type": "invoice",
        "document_date": "2026-05-15",
        "amount_before_vat": "1000.00",
        "status": "new",
        "notes": "",
        "vat_rate": "null",
    }
    response = auth_client.post("/api/documents", files=files, data=data)
    assert response.status_code == 422


def test_create_document_with_max_amount_zero_vat(auth_client, test_app):
    client_id = test_app["seeded"]["client"].id
    response = upload_document(
        auth_client,
        client_id=client_id,
        amount_before_vat="999999999999.99",
        vat_rate="0.00",
    )
    assert response.status_code == 201
    payload = response.json()
    assert payload["vat_amount"] == "0.00"
    assert payload["total_amount"] == "999999999999.99"


def test_create_document_rejects_calculated_overflow(auth_client, test_app):
    client_id = test_app["seeded"]["client"].id
    response = upload_document(
        auth_client,
        client_id=client_id,
        amount_before_vat="999999999999.99",
        vat_rate="0.01",
    )
    assert response.status_code == 422


def test_create_document_rejects_amount_over_max(auth_client, test_app):
    client_id = test_app["seeded"]["client"].id
    response = upload_document(
        auth_client,
        client_id=client_id,
        amount_before_vat="1000000000000.00",
    )
    assert response.status_code == 422


def test_update_rejects_null_amount(auth_client, test_app):
    client_id = test_app["seeded"]["client"].id
    create_response = upload_document(auth_client, client_id=client_id)
    document_id = create_response.json()["id"]
    response = auth_client.put(
        f"/api/documents/{document_id}",
        json={"amount_before_vat": None},
    )
    assert response.status_code == 422


def test_update_rejects_null_vat_rate(auth_client, test_app):
    client_id = test_app["seeded"]["client"].id
    create_response = upload_document(auth_client, client_id=client_id)
    document_id = create_response.json()["id"]
    response = auth_client.put(
        f"/api/documents/{document_id}",
        json={"vat_rate": None},
    )
    assert response.status_code == 422


def test_update_rejects_vat_over_max(auth_client, test_app):
    client_id = test_app["seeded"]["client"].id
    create_response = upload_document(auth_client, client_id=client_id)
    document_id = create_response.json()["id"]
    response = auth_client.put(
        f"/api/documents/{document_id}",
        json={"vat_rate": "100.01"},
    )
    assert response.status_code == 422


def test_update_overflow_keeps_existing_document(auth_client, test_app):
    client_id = test_app["seeded"]["client"].id
    create_response = upload_document(
        auth_client,
        client_id=client_id,
        amount_before_vat="999999999999.99",
        vat_rate="0.00",
    )
    document_id = create_response.json()["id"]
    before = create_response.json()

    response = auth_client.put(
        f"/api/documents/{document_id}",
        json={"vat_rate": "0.01"},
    )
    assert response.status_code == 422

    reload = auth_client.get(f"/api/documents/{document_id}")
    assert reload.status_code == 200
    payload = reload.json()
    assert payload["amount_before_vat"] == before["amount_before_vat"]
    assert payload["vat_rate"] == before["vat_rate"]
    assert payload["vat_amount"] == before["vat_amount"]
    assert payload["total_amount"] == before["total_amount"]


def test_create_with_explicit_rate_after_settings_change(auth_client, test_app):
    _reset_default_vat(auth_client, "20.00")
    client_id = test_app["seeded"]["client"].id
    response = upload_document(
        auth_client,
        client_id=client_id,
        vat_rate="20.00",
        amount_before_vat="1000.00",
    )
    assert response.status_code == 201
    payload = response.json()
    assert payload["vat_rate"] == "20.00"
    assert payload["vat_amount"] == "200.00"
    assert payload["total_amount"] == "1200.00"
    _reset_default_vat(auth_client, "18.00")


def test_existing_document_rate_preserved_after_settings_change(auth_client, test_app):
    client_id = test_app["seeded"]["client"].id
    create_response = upload_document(
        auth_client,
        client_id=client_id,
        vat_rate="17.00",
        amount_before_vat="1000.00",
    )
    document_id = create_response.json()["id"]

    settings_response = auth_client.put(
        "/api/settings",
        json={"default_vat_rate": "20.00"},
    )
    assert settings_response.status_code == 200

    update_response = auth_client.put(
        f"/api/documents/{document_id}",
        json={"amount_before_vat": "2000.00"},
    )
    assert update_response.status_code == 200
    payload = update_response.json()
    assert payload["vat_rate"] == "17.00"
    assert payload["vat_amount"] == "340.00"
    assert payload["total_amount"] == "2340.00"

    _reset_default_vat(auth_client, "18.00")
