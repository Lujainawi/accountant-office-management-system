import pytest

from app.routes.auth import INVALID_LOGIN_MESSAGE

MINIMAL_CLIENT_PAYLOAD = {
    "client_name": "לקוח בדיקה",
    "client_type": "private_client",
    "status": "active",
}


@pytest.mark.parametrize(
    "method,path,json_body",
    [
        ("GET", "/api/auth/me", None),
        ("GET", "/api/clients", None),
        ("POST", "/api/clients", MINIMAL_CLIENT_PAYLOAD),
    ],
)
def test_auth_required_routes_without_session(test_app, method, path, json_body):
    api = test_app["client"]
    if method == "GET":
        response = api.get(path)
    else:
        response = api.post(path, json=json_body)
    assert response.status_code == 401


def test_client_detail_requires_auth(test_app):
    client_id = test_app["seeded"]["client"].id
    response = test_app["client"].get(f"/api/clients/{client_id}")
    assert response.status_code == 401


def test_client_update_requires_auth(test_app):
    client_id = test_app["seeded"]["client"].id
    response = test_app["client"].put(
        f"/api/clients/{client_id}",
        json={"client_name": "שם מעודכן"},
    )
    assert response.status_code == 401


def test_client_delete_requires_auth(test_app):
    client_id = test_app["seeded"]["client"].id
    response = test_app["client"].delete(f"/api/clients/{client_id}")
    assert response.status_code == 401


def test_invalid_login_uses_generic_hebrew_message(test_app):
    api = test_app["client"]

    unknown_email = api.post(
        "/api/auth/login",
        json={"email": "nobody@example.test", "password": "wrong-password"},
    )
    assert unknown_email.status_code == 401
    assert unknown_email.json()["detail"] == INVALID_LOGIN_MESSAGE

    known_email = api.post(
        "/api/auth/login",
        json={"email": "tester@example.test", "password": "wrong-password"},
    )
    assert known_email.status_code == 401
    assert known_email.json()["detail"] == INVALID_LOGIN_MESSAGE
    assert known_email.json()["detail"] == unknown_email.json()["detail"]
