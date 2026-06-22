import io

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.crud.integration_status import (
    CANONICAL_INTEGRATION_SEEDS,
    list_integration_statuses,
    seed_integration_statuses_if_missing,
)
from app.models.document import Document
from app.models.integration_status import IntegrationStatus
from app.services.integrations.email_preview import EMAIL_PRESETS
from app.services.integrations.ocr_mock import OCR_PRESETS

INTEGRATION_ENDPOINTS = [
    ("GET", "/api/integrations/statuses"),
    ("POST", "/api/integrations/email/preview"),
    ("POST", "/api/integrations/ocr/mock-process"),
    ("GET", "/api/integrations/tax-authority/status"),
    ("GET", "/api/integrations/digital-signature/status"),
    ("GET", "/api/integrations/payments/status"),
    ("GET", "/api/integrations/ai-assistant/mock-suggestions"),
]

FORBIDDEN_RESPONSE_SUBSTRINGS = (
    "SECRET_KEY",
    "API_KEY",
    "sk-",
    "password",
    "file_path",
    "stored_filename",
    "stripe",
    "paypal",
    "http://",
    "https://",
    "4242",
    "card_number",
    "cvv",
    "DEMO-1001",
    "dana@example.test",
    "דנה כהן",
)


def _seed_integrations(session_factory) -> None:
    db = session_factory()
    try:
        seed_integration_statuses_if_missing(db)
    finally:
        db.close()


@pytest.fixture()
def integration_client(test_app):
    _seed_integrations(test_app["session_factory"])
    api = test_app["client"]
    response = api.post(
        "/api/auth/login",
        json={"email": "tester@example.test", "password": "test-password-123"},
    )
    assert response.status_code == 200
    return api


@pytest.fixture()
def integration_db(test_app) -> Session:
    _seed_integrations(test_app["session_factory"])
    db = test_app["session_factory"]()
    try:
        yield db
    finally:
        db.close()


@pytest.mark.parametrize("method,path", INTEGRATION_ENDPOINTS)
def test_integration_endpoints_require_auth(test_app, method, path):
    api: TestClient = test_app["client"]
    if method == "GET":
        response = api.get(path)
    else:
        response = api.post(path, json={"preset": "demo_invoice_1"})
    assert response.status_code == 401


def test_seed_creates_six_canonical_rows(integration_db: Session):
    rows = list_integration_statuses(integration_db)
    assert len(rows) == 6
    service_names = {row.service_name for row in rows}
    assert service_names == {seed["service_name"] for seed in CANONICAL_INTEGRATION_SEEDS}


def test_seed_is_idempotent(integration_db: Session):
    first = list_integration_statuses(integration_db)
    first_snapshot = [
        (row.service_name, row.status, row.mode, row.configured, row.notes)
        for row in first
    ]

    seed_integration_statuses_if_missing(integration_db)
    second = list_integration_statuses(integration_db)
    second_snapshot = [
        (row.service_name, row.status, row.mode, row.configured, row.notes)
        for row in second
    ]

    assert len(second) == 6
    assert first_snapshot == second_snapshot


def test_list_statuses_returns_safe_metadata(integration_client: TestClient):
    response = integration_client.get("/api/integrations/statuses")
    assert response.status_code == 200
    payload = response.json()
    assert payload["is_mock"] is True
    assert payload["data_source"] == "sample"
    assert len(payload["items"]) == 6
    for item in payload["items"]:
        assert item["is_mock"] is True
        assert item["data_source"] == "sample"
        assert "service_name" in item
        assert "status" in item
        assert "configured" in item
        assert item["configured"] is False
    body_text = response.text.lower()
    for forbidden in FORBIDDEN_RESPONSE_SUBSTRINGS:
        assert forbidden.lower() not in body_text


def test_email_preview_valid_preset(integration_client: TestClient):
    preset = next(iter(EMAIL_PRESETS))
    response = integration_client.post(
        "/api/integrations/email/preview",
        json={"preset": preset},
    )
    assert response.status_code == 200
    payload = response.json()
    assert payload["is_mock"] is True
    assert payload["data_source"] == "sample"
    assert payload["preset"] == preset
    assert payload["subject"]
    assert payload["body"]
    assert "לא נשלח" in payload["disclaimer"]
    assert "sent" not in payload
    assert "delivery" not in payload


def test_email_preview_invalid_preset(integration_client: TestClient):
    response = integration_client.post(
        "/api/integrations/email/preview",
        json={"preset": "invalid_preset"},
    )
    assert response.status_code == 422


def test_email_preview_rejects_extra_fields(integration_client: TestClient):
    preset = next(iter(EMAIL_PRESETS))
    response = integration_client.post(
        "/api/integrations/email/preview",
        json={"preset": preset, "recipient": "real@example.com"},
    )
    assert response.status_code == 422


def test_ocr_mock_valid_preset(integration_client: TestClient, integration_db: Session):
    preset = next(iter(OCR_PRESETS))
    documents_before = integration_db.query(Document).count()
    response = integration_client.post(
        "/api/integrations/ocr/mock-process",
        json={"preset": preset},
    )
    assert response.status_code == 200
    payload = response.json()
    assert payload["is_mock"] is True
    assert payload["data_source"] == "sample"
    assert payload["preset"] == preset
    assert payload["extracted_fields"]["total_amount"] == "1180.00"
    assert "דוגמה" in payload["disclaimer"]
    documents_after = integration_db.query(Document).count()
    assert documents_after == documents_before


def test_ocr_mock_invalid_preset(integration_client: TestClient):
    response = integration_client.post(
        "/api/integrations/ocr/mock-process",
        json={"preset": "invalid_preset"},
    )
    assert response.status_code == 422


def test_ocr_rejects_multipart(integration_client: TestClient, integration_db: Session):
    documents_before = integration_db.query(Document).count()
    response = integration_client.post(
        "/api/integrations/ocr/mock-process",
        files={"file": ("invoice.pdf", io.BytesIO(b"%PDF-1.4 demo"), "application/pdf")},
        data={"preset": "demo_invoice_1"},
    )
    assert response.status_code == 422
    documents_after = integration_db.query(Document).count()
    assert documents_after == documents_before


def test_online_payments_status_distinct_from_manual_payments(integration_client: TestClient):
    status_response = integration_client.get("/api/integrations/payments/status")
    assert status_response.status_code == 200
    status_payload = status_response.json()
    assert status_payload["service_name"] == "online_payments"
    assert status_payload["is_mock"] is True
    assert status_payload["data_source"] == "sample"
    assert "concept_title" in status_payload
    assert "card" not in status_response.text.lower()

    payments_response = integration_client.get("/api/payments")
    assert payments_response.status_code == 422


def test_tax_authority_status_mock(integration_client: TestClient):
    response = integration_client.get("/api/integrations/tax-authority/status")
    assert response.status_code == 200
    payload = response.json()
    assert payload["is_mock"] is True
    assert payload["data_source"] == "sample"
    assert len(payload["workflow_steps"]) >= 1


def test_digital_signature_status_mock(integration_client: TestClient):
    response = integration_client.get("/api/integrations/digital-signature/status")
    assert response.status_code == 200
    payload = response.json()
    assert payload["is_mock"] is True
    assert payload["data_source"] == "sample"
    assert len(payload["sample_documents"]) >= 1


def test_ai_suggestions_are_generic(integration_client: TestClient):
    response = integration_client.get("/api/integrations/ai-assistant/mock-suggestions")
    assert response.status_code == 200
    payload = response.json()
    assert payload["is_mock"] is True
    assert payload["data_source"] == "sample"
    assert len(payload["suggestions"]) >= 1
    combined = " ".join(item["text"] for item in payload["suggestions"])
    assert "דוגמה" in combined
    assert "document_id" not in response.text
    for forbidden in ("DEMO-1001", "dana@example.test", "דנה כהן"):
        assert forbidden not in response.text


@pytest.mark.parametrize("method,path,body", [
    ("POST", "/api/integrations/email/preview", {"preset": "demo_client_followup"}),
    ("POST", "/api/integrations/ocr/mock-process", {"preset": "demo_invoice_1"}),
    ("GET", "/api/integrations/tax-authority/status", None),
    ("GET", "/api/integrations/digital-signature/status", None),
    ("GET", "/api/integrations/payments/status", None),
    ("GET", "/api/integrations/ai-assistant/mock-suggestions", None),
])
def test_mock_action_responses_include_flags(integration_client, method, path, body):
    if method == "GET":
        response = integration_client.get(path)
    else:
        response = integration_client.post(path, json=body)
    assert response.status_code == 200
    payload = response.json()
    assert payload["is_mock"] is True
    assert payload["data_source"] == "sample"


def test_responses_contain_no_secrets(integration_client: TestClient):
    endpoints = [
        ("GET", "/api/integrations/statuses", None),
        ("POST", "/api/integrations/email/preview", {"preset": "demo_client_followup"}),
        ("POST", "/api/integrations/ocr/mock-process", {"preset": "demo_invoice_1"}),
        ("GET", "/api/integrations/tax-authority/status", None),
        ("GET", "/api/integrations/digital-signature/status", None),
        ("GET", "/api/integrations/payments/status", None),
        ("GET", "/api/integrations/ai-assistant/mock-suggestions", None),
    ]
    for method, path, body in endpoints:
        if method == "GET":
            response = integration_client.get(path)
        else:
            response = integration_client.post(path, json=body)
        assert response.status_code == 200
        text = response.text.lower()
        for forbidden in FORBIDDEN_RESPONSE_SUBSTRINGS:
            assert forbidden.lower() not in text
