from fastapi.testclient import TestClient

from app.main import UNEXPECTED_ERROR_MESSAGE, app
from tests.conftest import TEST_EMAIL, TEST_PASSWORD


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
