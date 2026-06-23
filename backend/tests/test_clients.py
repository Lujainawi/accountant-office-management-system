import pytest

from app.crud.client import NOT_FOUND_MESSAGE
from app.schemas.client import INVALID_EMAIL_MESSAGE

MINIMAL_CLIENT_PAYLOAD = {
    "client_name": "לקוח חדש",
    "client_type": "private_client",
    "status": "active",
}


def _create_client(auth_client, **overrides):
    payload = {**MINIMAL_CLIENT_PAYLOAD, **overrides}
    return auth_client.post("/api/clients", json=payload)


def test_create_minimal_client(auth_client):
    response = _create_client(auth_client, client_name="לקוח יצירה")
    assert response.status_code == 201
    payload = response.json()
    assert payload["client_name"] == "לקוח יצירה"
    assert payload["client_type"] == "private_client"
    assert payload["status"] == "active"


def test_list_clients_includes_seeded_and_created(auth_client, test_app):
    seeded_name = test_app["seeded"]["client"].client_name
    create_response = _create_client(auth_client, client_name="לקוח רשימה")
    assert create_response.status_code == 201

    response = auth_client.get("/api/clients")
    assert response.status_code == 200
    names = [item["client_name"] for item in response.json()]
    assert seeded_name in names
    assert "לקוח רשימה" in names


def test_get_client_by_id(auth_client, test_app):
    client_id = test_app["seeded"]["client"].id
    response = auth_client.get(f"/api/clients/{client_id}")
    assert response.status_code == 200
    assert response.json()["id"] == client_id
    assert response.json()["client_name"] == test_app["seeded"]["client"].client_name


def test_get_unknown_client_returns_404(auth_client):
    response = auth_client.get("/api/clients/99999")
    assert response.status_code == 404
    assert response.json()["detail"] == NOT_FOUND_MESSAGE


def test_update_client_persists(auth_client, test_app):
    client_id = test_app["seeded"]["client"].id
    response = auth_client.put(
        f"/api/clients/{client_id}",
        json={"client_name": "שם מעודכן", "notes": "הערה פנימית"},
    )
    assert response.status_code == 200
    payload = response.json()
    assert payload["client_name"] == "שם מעודכן"
    assert payload["notes"] == "הערה פנימית"

    reload = auth_client.get(f"/api/clients/{client_id}")
    assert reload.json()["client_name"] == "שם מעודכן"
    assert reload.json()["notes"] == "הערה פנימית"


def test_update_empty_body_returns_422(auth_client, test_app):
    client_id = test_app["seeded"]["client"].id
    response = auth_client.put(f"/api/clients/{client_id}", json={})
    assert response.status_code == 422


def test_delete_client_without_linked_records(auth_client):
    create_response = _create_client(auth_client, client_name="לקוח למחיקה")
    assert create_response.status_code == 201
    client_id = create_response.json()["id"]

    delete_response = auth_client.delete(f"/api/clients/{client_id}")
    assert delete_response.status_code == 204

    get_response = auth_client.get(f"/api/clients/{client_id}")
    assert get_response.status_code == 404
    assert get_response.json()["detail"] == NOT_FOUND_MESSAGE


def test_update_unknown_client_returns_404(auth_client):
    response = auth_client.put(
        "/api/clients/99999",
        json={"client_name": "לא קיים"},
    )
    assert response.status_code == 404
    assert response.json()["detail"] == NOT_FOUND_MESSAGE


def test_delete_unknown_client_returns_404(auth_client):
    response = auth_client.delete("/api/clients/99999")
    assert response.status_code == 404
    assert response.json()["detail"] == NOT_FOUND_MESSAGE


@pytest.mark.parametrize(
    ("field", "value", "query"),
    [
        ("client_name", "חיפוש שם ייחודי", "חיפוש שם"),
        ("business_name", "עסק חיפוש ייחודי", "עסק חיפוש"),
        ("phone", "050-777-0201", "777-0201"),
        ("email", "search-client@example.test", "search-client"),
        ("business_id", "SEARCH-9001", "SEARCH-9001"),
    ],
)
def test_search_clients_by_field(auth_client, field, value, query):
    payload = {
        **MINIMAL_CLIENT_PAYLOAD,
        "client_name": f"לקוח {field}",
        field: value,
    }
    create_response = auth_client.post("/api/clients", json=payload)
    assert create_response.status_code == 201

    response = auth_client.get("/api/clients", params={"q": query})
    assert response.status_code == 200
    matches = [item for item in response.json() if item[field] == value]
    assert len(matches) == 1
    assert matches[0][field] == value


def test_filter_clients_by_status(auth_client):
    active_response = _create_client(
        auth_client,
        client_name="לקוח פעיל סינון",
        status="active",
    )
    inactive_response = _create_client(
        auth_client,
        client_name="לקוח לא פעיל סינון",
        status="inactive",
    )
    assert active_response.status_code == 201
    assert inactive_response.status_code == 201

    active_only = auth_client.get("/api/clients", params={"status": "active"})
    assert active_only.status_code == 200
    active_names = {item["client_name"] for item in active_only.json()}
    assert "לקוח פעיל סינון" in active_names
    assert "לקוח לא פעיל סינון" not in active_names


def test_filter_clients_by_client_type(auth_client):
    private_response = _create_client(
        auth_client,
        client_name="לקוח פרטי סינון",
        client_type="private_client",
    )
    company_response = _create_client(
        auth_client,
        client_name="לקוח חברה סינון",
        client_type="company",
    )
    assert private_response.status_code == 201
    assert company_response.status_code == 201

    company_only = auth_client.get("/api/clients", params={"client_type": "company"})
    assert company_only.status_code == 200
    company_names = {item["client_name"] for item in company_only.json()}
    assert "לקוח חברה סינון" in company_names
    assert "לקוח פרטי סינון" not in company_names


def test_create_client_with_invalid_email_returns_422(auth_client):
    response = _create_client(
        auth_client,
        client_name="לקוח אימייל לא תקין",
        email="not-an-email",
    )
    assert response.status_code == 422
    detail = response.json()["detail"]
    if isinstance(detail, list):
        messages = [item.get("msg", "") for item in detail if isinstance(item, dict)]
        assert any(INVALID_EMAIL_MESSAGE in message for message in messages)
    else:
        assert INVALID_EMAIL_MESSAGE in detail


def test_create_client_with_whitespace_name_returns_422(auth_client):
    response = _create_client(auth_client, client_name="   ")
    assert response.status_code == 422


def test_invalid_status_filter_returns_422(auth_client):
    response = auth_client.get("/api/clients", params={"status": "invalid_status"})
    assert response.status_code == 422


def test_invalid_client_type_filter_returns_422(auth_client):
    response = auth_client.get("/api/clients", params={"client_type": "invalid_type"})
    assert response.status_code == 422
