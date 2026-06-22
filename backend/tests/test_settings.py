import json

import pytest

from app.utils.file_validation import get_effective_allowed_extensions, get_upload_policy
from app.utils.upload_policy_constants import (
    CANONICAL_EXTENSION_ORDER,
    SECURE_SYSTEM_ALLOWLIST,
)


def test_settings_get_requires_auth(test_app):
    response = test_app["client"].get("/api/settings")
    assert response.status_code == 401


def test_settings_put_requires_auth(test_app):
    response = test_app["client"].put(
        "/api/settings",
        json={"office_name": "משרד בדיקה"},
    )
    assert response.status_code == 401


def test_settings_get_returns_defaults(auth_client):
    response = auth_client.get("/api/settings")
    assert response.status_code == 200
    payload = response.json()
    assert payload["default_vat_rate"] == "18.00"
    assert payload["default_currency"] == "ILS"
    canonical_defaults = list(CANONICAL_EXTENSION_ORDER)
    assert payload["allowed_file_extensions"] == canonical_defaults
    assert payload["effective_allowed_file_extensions"] == canonical_defaults
    assert set(payload["effective_allowed_file_extensions"]) == SECURE_SYSTEM_ALLOWLIST


def test_settings_put_persists_changes(auth_client):
    response = auth_client.put(
        "/api/settings",
        json={
            "accountant_name": "יואב לוי",
            "office_name": "לוי חשבונאות",
            "default_vat_rate": "17.00",
        },
    )
    assert response.status_code == 200
    payload = response.json()
    assert payload["accountant_name"] == "יואב לוי"
    assert payload["office_name"] == "לוי חשבונאות"
    assert payload["default_vat_rate"] == "17.00"

    reload = auth_client.get("/api/settings")
    assert reload.json()["default_vat_rate"] == "17.00"


def test_settings_rejects_default_vat_null(auth_client):
    response = auth_client.put(
        "/api/settings",
        json={"default_vat_rate": None},
    )
    assert response.status_code == 422


def test_settings_rejects_default_vat_nan(auth_client):
    response = auth_client.put(
        "/api/settings",
        json={"default_vat_rate": "NaN"},
    )
    assert response.status_code == 422


def test_settings_rejects_default_vat_over_max(auth_client):
    response = auth_client.put(
        "/api/settings",
        json={"default_vat_rate": "100.01"},
    )
    assert response.status_code == 422


def test_settings_rejects_unsafe_extension(auth_client):
    response = auth_client.put(
        "/api/settings",
        json={"allowed_file_extensions": ["pdf", "exe"]},
    )
    assert response.status_code == 422


def test_settings_valid_extension_subset(auth_client, test_app):
    response = auth_client.put(
        "/api/settings",
        json={"allowed_file_extensions": ["pdf", "png"]},
    )
    assert response.status_code == 200
    payload = response.json()
    assert payload["allowed_file_extensions"] == ["pdf", "png"]
    assert payload["effective_allowed_file_extensions"] == ["pdf", "png"]

    db = test_app["session_factory"]()
    try:
        policy = get_upload_policy(db)
        assert policy["allowed_extensions"] == ["pdf", "png"]
    finally:
        db.close()


def test_settings_partial_update_without_extensions(auth_client):
    response = auth_client.put(
        "/api/settings",
        json={"office_name": "שם משרד חדש"},
    )
    assert response.status_code == 200
    assert response.json()["office_name"] == "שם משרד חדש"


def test_settings_legacy_invalid_extensions_are_transparent(auth_client, test_app):
    db = test_app["session_factory"]()
    try:
        from app.models.office_settings import OfficeSettings

        settings_row = db.get(OfficeSettings, 1)
        settings_row.allowed_file_extensions = '["pdf","exe","txt"]'
        db.commit()
    finally:
        db.close()

    response = auth_client.get("/api/settings")
    assert response.status_code == 200
    payload = response.json()
    assert "exe" in payload["allowed_file_extensions"]
    assert payload["effective_allowed_file_extensions"] == ["pdf"]

    restore = auth_client.put(
        "/api/settings",
        json={"allowed_file_extensions": ["pdf", "png", "jpg", "jpeg", "docx", "xlsx"]},
    )
    assert restore.status_code == 200


def test_settings_update_default_vat_to_twenty(auth_client):
    response = auth_client.put(
        "/api/settings",
        json={"default_vat_rate": "20.00"},
    )
    assert response.status_code == 200
    assert response.json()["default_vat_rate"] == "20.00"
