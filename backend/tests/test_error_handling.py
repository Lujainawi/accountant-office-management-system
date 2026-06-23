from fastapi.testclient import TestClient

from app.crud.client import CLIENT_HAS_DOCUMENTS_MESSAGE, NOT_FOUND_MESSAGE
from app.dependencies import UNAUTHORIZED_MESSAGE
from app.main import UNEXPECTED_ERROR_MESSAGE, app
from tests.conftest import TEST_EMAIL, TEST_PASSWORD, upload_document


def test_unhandled_exception_returns_safe_hebrew_message(test_app, monkeypatch):
    secret_message = "TOP_SECRET_INTERNAL_FAILURE_uploads/secret/path"

    def fail_list_clients(*args, **kwargs):
        raise RuntimeError(secret_message)

    monkeypatch.setattr("app.routes.clients.list_clients", fail_list_clients)

    with TestClient(app, raise_server_exceptions=False) as client:
        login = client.post(
            "/api/auth/login",
            json={"email": TEST_EMAIL, "password": TEST_PASSWORD},
        )
        assert login.status_code == 200
        response = client.get("/api/clients")

    assert response.status_code == 500
    payload = response.json()
    assert payload == {"detail": UNEXPECTED_ERROR_MESSAGE}
    assert secret_message not in response.text
    assert "Traceback" not in response.text
    assert "RuntimeError" not in response.text


def test_protected_route_without_auth_returns_safe_401(test_app):
    response = test_app["client"].get("/api/clients")
    assert response.status_code == 401
    assert response.json()["detail"] == UNAUTHORIZED_MESSAGE
    assert "Traceback" not in response.text


def test_domain_not_found_returns_safe_hebrew_404(auth_client):
    response = auth_client.get("/api/clients/99999")
    assert response.status_code == 404
    assert response.json()["detail"] == NOT_FOUND_MESSAGE
    assert "Traceback" not in response.text
    assert "SQL" not in response.text


def test_linked_record_delete_guard_returns_safe_409(auth_client, test_app):
    client_id = test_app["seeded"]["client"].id
    upload_response = upload_document(auth_client, client_id=client_id)
    assert upload_response.status_code == 201

    response = auth_client.delete(f"/api/clients/{client_id}")
    assert response.status_code == 409
    assert response.json()["detail"] == CLIENT_HAS_DOCUMENTS_MESSAGE
    assert "Traceback" not in response.text
    assert "uploads/" not in response.text.lower()
