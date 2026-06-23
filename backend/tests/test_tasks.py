from datetime import date, datetime, timedelta, timezone

import pytest

from app.crud.client import CLIENT_HAS_DOCUMENTS_MESSAGE, CLIENT_HAS_TASKS_MESSAGE
from app.crud.document import DOCUMENT_HAS_TASKS_MESSAGE
from app.crud.task import DOCUMENT_CLIENT_MISMATCH_MESSAGE
from tests.conftest import make_pdf_bytes, upload_document

CLIENT_HAS_TASKS_MESSAGE_EXACT = (
    "לא ניתן למחוק לקוח שיש לו משימות קשורות. יש למחוק את המשימות הקשורות תחילה."
)
DOCUMENT_HAS_TASKS_MESSAGE_EXACT = (
    "לא ניתן למחוק מסמך שקשור למשימות. יש לעדכן או למחוק את המשימות הקשורות תחילה."
)


def create_task_payload(
    *,
    client_id: int,
    title: str = "משימת בדיקה",
    document_id: int | None = None,
    description: str | None = None,
    due_date: str | None = None,
    priority: str = "medium",
    status: str = "open",
):
    payload = {
        "client_id": client_id,
        "title": title,
        "priority": priority,
        "status": status,
    }
    if document_id is not None:
        payload["document_id"] = document_id
    if description is not None:
        payload["description"] = description
    if due_date is not None:
        payload["due_date"] = due_date
    return payload


def test_tasks_require_authentication(test_app):
    api = test_app["client"]
    client_id = test_app["seeded"]["client"].id
    response = api.post("/api/tasks", json=create_task_payload(client_id=client_id))
    assert response.status_code == 401


def test_create_task_minimal(auth_client, test_app):
    client_id = test_app["seeded"]["client"].id
    response = auth_client.post(
        "/api/tasks",
        json=create_task_payload(client_id=client_id),
    )
    assert response.status_code == 201
    payload = response.json()
    assert payload["client_id"] == client_id
    assert payload["document_id"] is None
    assert payload["title"] == "משימת בדיקה"
    assert payload["priority"] == "medium"
    assert payload["status"] == "open"
    assert payload["is_overdue"] is False


def test_create_task_with_document(auth_client, test_app):
    client_id = test_app["seeded"]["client"].id
    doc_response = upload_document(auth_client, client_id=client_id)
    document_id = doc_response.json()["id"]

    response = auth_client.post(
        "/api/tasks",
        json=create_task_payload(client_id=client_id, document_id=document_id),
    )
    assert response.status_code == 201
    assert response.json()["document_id"] == document_id


def test_create_task_invalid_client(auth_client):
    response = auth_client.post(
        "/api/tasks",
        json=create_task_payload(client_id=99999),
    )
    assert response.status_code == 404
    assert response.json()["detail"] == "הלקוח לא נמצא."


def test_create_task_invalid_document(auth_client, test_app):
    client_id = test_app["seeded"]["client"].id
    response = auth_client.post(
        "/api/tasks",
        json=create_task_payload(client_id=client_id, document_id=99999),
    )
    assert response.status_code == 404
    assert response.json()["detail"] == "המסמך לא נמצא."


def test_create_task_document_wrong_client(auth_client, test_app):
    client_id = test_app["seeded"]["client"].id
    session_factory = test_app["session_factory"]
    now = datetime.now(timezone.utc)

    db = session_factory()
    try:
        from app.models.client import Client

        other_client = Client(
            client_name="לקוח נוסף",
            business_name=None,
            phone=None,
            email="other@example.test",
            business_id="DEMO-2000",
            client_type="company",
            address=None,
            status="active",
            notes=None,
            created_at=now,
            updated_at=now,
        )
        db.add(other_client)
        db.commit()
        db.refresh(other_client)
        other_client_id = other_client.id
    finally:
        db.close()

    doc_response = upload_document(auth_client, client_id=client_id)
    document_id = doc_response.json()["id"]

    response = auth_client.post(
        "/api/tasks",
        json=create_task_payload(client_id=other_client_id, document_id=document_id),
    )
    assert response.status_code == 422
    assert response.json()["detail"] == DOCUMENT_CLIENT_MISMATCH_MESSAGE


def test_list_tasks_filters(auth_client, test_app):
    client_id = test_app["seeded"]["client"].id
    auth_client.post(
        "/api/tasks",
        json=create_task_payload(client_id=client_id, title="פתוחה", status="open", priority="low"),
    )
    auth_client.post(
        "/api/tasks",
        json=create_task_payload(
            client_id=client_id,
            title="דחופה",
            status="in_progress",
            priority="urgent",
        ),
    )
    auth_client.post(
        "/api/tasks",
        json=create_task_payload(client_id=client_id, title="הושלמה", status="done", priority="high"),
    )

    all_response = auth_client.get(f"/api/tasks?client_id={client_id}")
    assert all_response.status_code == 200
    assert len(all_response.json()) == 3

    open_response = auth_client.get(f"/api/tasks?client_id={client_id}&status=open")
    assert len(open_response.json()) == 1
    assert open_response.json()[0]["title"] == "פתוחה"

    urgent_response = auth_client.get(f"/api/tasks?client_id={client_id}&priority=urgent")
    assert len(urgent_response.json()) == 1
    assert urgent_response.json()[0]["title"] == "דחופה"


def test_mark_task_done(auth_client, test_app):
    client_id = test_app["seeded"]["client"].id
    create_response = auth_client.post(
        "/api/tasks",
        json=create_task_payload(
            client_id=client_id,
            due_date=(date.today() - timedelta(days=1)).isoformat(),
        ),
    )
    task_id = create_response.json()["id"]
    assert create_response.json()["is_overdue"] is True

    update_response = auth_client.put(
        f"/api/tasks/{task_id}",
        json={"status": "done"},
    )
    assert update_response.status_code == 200
    payload = update_response.json()
    assert payload["status"] == "done"
    assert payload["is_overdue"] is False


def test_overdue_computation(auth_client, test_app):
    client_id = test_app["seeded"]["client"].id

    past_response = auth_client.post(
        "/api/tasks",
        json=create_task_payload(
            client_id=client_id,
            title="באיחור",
            due_date=(date.today() - timedelta(days=2)).isoformat(),
            status="open",
        ),
    )
    assert past_response.json()["is_overdue"] is True

    future_response = auth_client.post(
        "/api/tasks",
        json=create_task_payload(
            client_id=client_id,
            title="עתידית",
            due_date=(date.today() + timedelta(days=5)).isoformat(),
            status="open",
        ),
    )
    assert future_response.json()["is_overdue"] is False

    no_due_response = auth_client.post(
        "/api/tasks",
        json=create_task_payload(client_id=client_id, title="ללא תאריך"),
    )
    assert no_due_response.json()["is_overdue"] is False


def test_update_client_without_revalidating_document_fails(auth_client, test_app):
    client_id = test_app["seeded"]["client"].id
    session_factory = test_app["session_factory"]
    now = datetime.now(timezone.utc)

    db = session_factory()
    try:
        from app.models.client import Client

        other_client = Client(
            client_name="לקוח שני",
            business_name=None,
            phone=None,
            email="second@example.test",
            business_id="DEMO-2001",
            client_type="company",
            address=None,
            status="active",
            notes=None,
            created_at=now,
            updated_at=now,
        )
        db.add(other_client)
        db.commit()
        db.refresh(other_client)
        other_client_id = other_client.id
    finally:
        db.close()

    doc_response = upload_document(auth_client, client_id=client_id)
    document_id = doc_response.json()["id"]

    create_response = auth_client.post(
        "/api/tasks",
        json=create_task_payload(client_id=client_id, document_id=document_id),
    )
    task_id = create_response.json()["id"]

    update_response = auth_client.put(
        f"/api/tasks/{task_id}",
        json={"client_id": other_client_id},
    )
    assert update_response.status_code == 422
    assert update_response.json()["detail"] == DOCUMENT_CLIENT_MISMATCH_MESSAGE


def test_delete_task(auth_client, test_app):
    client_id = test_app["seeded"]["client"].id
    create_response = auth_client.post(
        "/api/tasks",
        json=create_task_payload(client_id=client_id),
    )
    task_id = create_response.json()["id"]

    delete_response = auth_client.delete(f"/api/tasks/{task_id}")
    assert delete_response.status_code == 204

    get_response = auth_client.get(f"/api/tasks/{task_id}")
    assert get_response.status_code == 404


def test_client_summary_open_task_count(auth_client, test_app):
    client_id = test_app["seeded"]["client"].id
    auth_client.post(
        "/api/tasks",
        json=create_task_payload(client_id=client_id, title="פתוחה", status="open"),
    )
    auth_client.post(
        "/api/tasks",
        json=create_task_payload(client_id=client_id, title="בטיפול", status="in_progress"),
    )
    auth_client.post(
        "/api/tasks",
        json=create_task_payload(client_id=client_id, title="הושלמה", status="done"),
    )

    summary_response = auth_client.get(f"/api/clients/{client_id}/summary")
    assert summary_response.status_code == 200
    assert summary_response.json()["open_task_count"] == 2


def test_delete_client_with_tasks_blocked(auth_client, test_app):
    client_id = test_app["seeded"]["client"].id
    auth_client.post(
        "/api/tasks",
        json=create_task_payload(client_id=client_id),
    )

    delete_response = auth_client.delete(f"/api/clients/{client_id}")
    assert delete_response.status_code == 409
    assert delete_response.json()["detail"] == CLIENT_HAS_TASKS_MESSAGE_EXACT
    assert CLIENT_HAS_TASKS_MESSAGE == CLIENT_HAS_TASKS_MESSAGE_EXACT

    get_response = auth_client.get(f"/api/clients/{client_id}")
    assert get_response.status_code == 200


def test_delete_client_with_documents_still_blocked(auth_client, test_app):
    client_id = test_app["seeded"]["client"].id
    upload_response = upload_document(auth_client, client_id=client_id)
    assert upload_response.status_code == 201

    delete_response = auth_client.delete(f"/api/clients/{client_id}")
    assert delete_response.status_code == 409
    assert delete_response.json()["detail"] == CLIENT_HAS_DOCUMENTS_MESSAGE


def test_delete_document_with_linked_task_blocked(auth_client, test_app):
    client_id = test_app["seeded"]["client"].id
    doc_response = upload_document(auth_client, client_id=client_id)
    document_id = doc_response.json()["id"]

    auth_client.post(
        "/api/tasks",
        json=create_task_payload(client_id=client_id, document_id=document_id),
    )

    delete_response = auth_client.delete(f"/api/documents/{document_id}")
    assert delete_response.status_code == 409
    assert delete_response.json()["detail"] == DOCUMENT_HAS_TASKS_MESSAGE_EXACT
    assert DOCUMENT_HAS_TASKS_MESSAGE == DOCUMENT_HAS_TASKS_MESSAGE_EXACT

    get_response = auth_client.get(f"/api/documents/{document_id}")
    assert get_response.status_code == 200

    upload_dir = test_app["upload_dir"]
    stored_files = list(upload_dir.rglob("*"))
    assert any(path.is_file() for path in stored_files)


def test_list_tasks_limit(auth_client, test_app):
    client_id = test_app["seeded"]["client"].id
    for index in range(6):
        auth_client.post(
            "/api/tasks",
            json=create_task_payload(client_id=client_id, title=f"משימה {index}"),
        )

    response = auth_client.get(f"/api/tasks?client_id={client_id}&limit=5")
    assert response.status_code == 200
    assert len(response.json()) == 5


def test_get_task_by_id(auth_client, test_app):
    client_id = test_app["seeded"]["client"].id
    create_response = auth_client.post(
        "/api/tasks",
        json=create_task_payload(client_id=client_id, title="משימה לקריאה"),
    )
    assert create_response.status_code == 201
    task_id = create_response.json()["id"]

    response = auth_client.get(f"/api/tasks/{task_id}")
    assert response.status_code == 200
    assert response.json()["id"] == task_id
    assert response.json()["title"] == "משימה לקריאה"


def test_get_unknown_task_returns_404(auth_client):
    response = auth_client.get("/api/tasks/99999")
    assert response.status_code == 404
    assert response.json()["detail"] == "המשימה לא נמצאה."


def test_update_task_empty_body_returns_422(auth_client, test_app):
    client_id = test_app["seeded"]["client"].id
    create_response = auth_client.post(
        "/api/tasks",
        json=create_task_payload(client_id=client_id),
    )
    task_id = create_response.json()["id"]

    response = auth_client.put(f"/api/tasks/{task_id}", json={})
    assert response.status_code == 422


def test_list_tasks_invalid_status_filter_returns_422(auth_client):
    response = auth_client.get("/api/tasks", params={"status": "invalid_status"})
    assert response.status_code == 422


def test_list_tasks_invalid_priority_filter_returns_422(auth_client):
    response = auth_client.get("/api/tasks", params={"priority": "invalid_priority"})
    assert response.status_code == 422
