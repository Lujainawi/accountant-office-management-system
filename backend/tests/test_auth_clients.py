from datetime import datetime, timedelta, timezone

import jwt
import pytest

from app.config import settings
from app.dependencies import UNAUTHORIZED_MESSAGE
from app.routes.auth import INVALID_LOGIN_MESSAGE
from app.utils.security import ALGORITHM, COOKIE_NAME, hash_password
from tests.conftest import TEST_EMAIL, TEST_PASSWORD

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


def test_valid_login_returns_safe_user_information(test_app):
    response = test_app["client"].post(
        "/api/auth/login",
        json={"email": TEST_EMAIL, "password": TEST_PASSWORD},
    )
    assert response.status_code == 200
    payload = response.json()
    assert set(payload.keys()) == {"user"}
    user = payload["user"]
    assert set(user.keys()) == {
        "id",
        "name",
        "email",
        "role",
        "is_active",
        "created_at",
        "updated_at",
    }
    assert user["email"] == TEST_EMAIL
    assert user["is_active"] is True
    assert "password_hash" not in response.text
    assert settings.secret_key not in response.text


def test_auth_me_after_login(auth_client):
    response = auth_client.get("/api/auth/me")
    assert response.status_code == 200
    payload = response.json()
    assert payload["email"] == TEST_EMAIL
    assert payload["is_active"] is True
    assert "password_hash" not in response.text


def test_logout_clears_session(auth_client):
    logout_response = auth_client.post("/api/auth/logout")
    assert logout_response.status_code == 200
    assert logout_response.json() == {"ok": True}

    me_response = auth_client.get("/api/auth/me")
    assert me_response.status_code == 401
    assert me_response.json()["detail"] == UNAUTHORIZED_MESSAGE


def test_malformed_jwt_cookie_returns_401(test_app):
    api = test_app["client"]
    api.cookies.set(COOKIE_NAME, "not-a-valid-jwt")
    response = api.get("/api/auth/me")
    assert response.status_code == 401
    assert response.json()["detail"] == UNAUTHORIZED_MESSAGE


def test_expired_jwt_cookie_returns_401(test_app):
    api = test_app["client"]
    user_id = test_app["seeded"]["user"].id
    now = datetime.now(timezone.utc)
    token = jwt.encode(
        {
            "sub": str(user_id),
            "iat": int((now - timedelta(hours=2)).timestamp()),
            "exp": int((now - timedelta(hours=1)).timestamp()),
        },
        settings.secret_key,
        algorithm=ALGORITHM,
    )
    api.cookies.set(COOKIE_NAME, token)
    response = api.get("/api/auth/me")
    assert response.status_code == 401
    assert response.json()["detail"] == UNAUTHORIZED_MESSAGE


def test_inactive_user_login_is_rejected(test_app):
    session_factory = test_app["session_factory"]
    now = datetime.now(timezone.utc)
    db = session_factory()
    try:
        from app.models.user import User

        inactive_user = User(
            name="משתמש לא פעיל",
            email="inactive@example.test",
            password_hash=hash_password(TEST_PASSWORD),
            role="staff",
            is_active=False,
            created_at=now,
            updated_at=now,
        )
        db.add(inactive_user)
        db.commit()
    finally:
        db.close()

    response = test_app["client"].post(
        "/api/auth/login",
        json={"email": "inactive@example.test", "password": TEST_PASSWORD},
    )
    assert response.status_code == 401
    assert response.json()["detail"] == INVALID_LOGIN_MESSAGE
