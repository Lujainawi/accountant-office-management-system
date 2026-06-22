from datetime import date, datetime, timedelta, timezone
from decimal import Decimal

import pytest

from app.models.client import Client
from app.models.document import Document
from app.models.task import Task
from app.services.dashboard_summary import get_dashboard_summary
from tests.conftest import upload_document


def create_task_payload(
    *,
    client_id: int,
    title: str = "משימת בדיקה",
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
    if due_date is not None:
        payload["due_date"] = due_date
    return payload


def clear_office_data(test_app):
    SessionLocal = test_app["session_factory"]
    db = SessionLocal()
    try:
        db.query(Task).delete()
        db.query(Document).delete()
        db.query(Client).delete()
        db.commit()
    finally:
        db.close()


def test_dashboard_requires_authentication(test_app):
    response = test_app["client"].get("/api/dashboard/summary")
    assert response.status_code == 401


def test_dashboard_empty_database(auth_client, test_app):
    clear_office_data(test_app)

    response = auth_client.get("/api/dashboard/summary")
    assert response.status_code == 200
    payload = response.json()

    assert payload["total_clients"] == 0
    assert payload["active_clients"] == 0
    assert payload["total_documents"] == 0
    assert payload["documents_by_status"] == {
        "new": 0,
        "in_progress": 0,
        "completed": 0,
        "missing_information": 0,
    }
    assert payload["open_task_count"] == 0
    assert payload["urgent_task_count"] == 0
    assert payload["current_month_total_before_vat"] == "0.00"
    assert payload["current_month_vat_total"] == "0.00"
    assert payload["current_month_total_including_vat"] == "0.00"
    assert payload["needs_attention"]["urgent_tasks"] == []
    assert payload["needs_attention"]["missing_information_documents"] == []
    assert payload["office_name"]
    assert payload["default_currency"] == "ILS"
    assert payload["current_month"]["year"] >= 1
    assert 1 <= payload["current_month"]["month"] <= 12


def test_dashboard_client_counts(auth_client, test_app):
    clear_office_data(test_app)
    auth_client.post(
        "/api/clients",
        json={
            "client_name": "לקוח פעיל",
            "client_type": "private_client",
            "status": "active",
        },
    )
    auth_client.post(
        "/api/clients",
        json={
            "client_name": "לקוח לא פעיל",
            "client_type": "private_client",
            "status": "inactive",
        },
    )

    response = auth_client.get("/api/dashboard/summary")
    assert response.status_code == 200
    payload = response.json()
    assert payload["total_clients"] == 2
    assert payload["active_clients"] == 1


def test_dashboard_document_status_counts(auth_client, test_app):
    client_id = test_app["seeded"]["client"].id
    statuses = ["new", "in_progress", "completed", "missing_information"]
    for index, status in enumerate(statuses):
        response = upload_document(
            auth_client,
            client_id=client_id,
            document_name=f"מסמך {index}",
            status=status,
        )
        assert response.status_code == 201

    response = auth_client.get("/api/dashboard/summary")
    assert response.status_code == 200
    payload = response.json()
    assert payload["total_documents"] == 4
    assert payload["documents_by_status"] == {
        "new": 1,
        "in_progress": 1,
        "completed": 1,
        "missing_information": 1,
    }


def test_dashboard_open_and_urgent_task_counts(auth_client, test_app):
    client_id = test_app["seeded"]["client"].id
    tasks = [
        ("open", "medium"),
        ("in_progress", "high"),
        ("done", "urgent"),
        ("open", "urgent"),
    ]
    for status, priority in tasks:
        response = auth_client.post(
            "/api/tasks",
            json=create_task_payload(
                client_id=client_id,
                title=f"{status}-{priority}",
                status=status,
                priority=priority,
            ),
        )
        assert response.status_code == 201

    response = auth_client.get("/api/dashboard/summary")
    assert response.status_code == 200
    payload = response.json()
    assert payload["open_task_count"] == 3
    assert payload["urgent_task_count"] == 1


def test_dashboard_current_month_boundaries(auth_client, test_app):
    client_id = test_app["seeded"]["client"].id
    fixed_today = date(2026, 6, 22)
    boundary_documents = [
        ("2026-05-31", "100.00"),
        ("2026-06-01", "200.00"),
        ("2026-06-30", "300.00"),
        ("2026-07-01", "400.00"),
    ]
    for document_date, amount in boundary_documents:
        response = upload_document(
            auth_client,
            client_id=client_id,
            document_name=f"מסמך {document_date}",
            document_date=document_date,
            amount_before_vat=amount,
            status="completed",
        )
        assert response.status_code == 201

    SessionLocal = test_app["session_factory"]
    db = SessionLocal()
    try:
        summary = get_dashboard_summary(db, today=fixed_today)
    finally:
        db.close()

    assert summary.current_month_total_before_vat == Decimal("500.00")
    assert summary.current_month_vat_total == Decimal("90.00")
    assert summary.current_month_total_including_vat == Decimal("590.00")
    assert summary.current_month.year == 2026
    assert summary.current_month.month == 6


def test_dashboard_current_month_includes_inactive_client_documents(auth_client, test_app):
    clear_office_data(test_app)
    inactive_response = auth_client.post(
        "/api/clients",
        json={
            "client_name": "לקוח לא פעיל",
            "client_type": "private_client",
            "status": "inactive",
        },
    )
    inactive_client_id = inactive_response.json()["id"]
    fixed_today = date(2026, 6, 22)

    response = upload_document(
        auth_client,
        client_id=inactive_client_id,
        document_date="2026-06-15",
        amount_before_vat="1000.00",
        status="missing_information",
    )
    assert response.status_code == 201

    SessionLocal = test_app["session_factory"]
    db = SessionLocal()
    try:
        summary = get_dashboard_summary(db, today=fixed_today)
    finally:
        db.close()

    assert summary.total_clients == 1
    assert summary.active_clients == 0
    assert summary.total_documents == 1
    assert summary.documents_by_status.missing_information == 1
    assert summary.current_month_total_before_vat == Decimal("1000.00")


def test_dashboard_urgent_task_ordering(auth_client, test_app):
    client_id = test_app["seeded"]["client"].id
    fixed_today = date(2026, 6, 22)

    task_specs = [
        ("ללא תאריך", None, "open"),
        ("עתידי מאוחר", "2026-06-30", "open"),
        ("עבר מועד", "2026-06-20", "in_progress"),
        ("עתידי קרוב", "2026-06-25", "open"),
        ("דחוף שהושלם", "2026-06-10", "done"),
    ]
    for title, due_date, status in task_specs:
        response = auth_client.post(
            "/api/tasks",
            json=create_task_payload(
                client_id=client_id,
                title=title,
                due_date=due_date,
                priority="urgent",
                status=status,
            ),
        )
        assert response.status_code == 201

    SessionLocal = test_app["session_factory"]
    db = SessionLocal()
    try:
        summary = get_dashboard_summary(db, today=fixed_today)
    finally:
        db.close()

    titles = [task.title for task in summary.needs_attention.urgent_tasks]
    assert titles == ["עבר מועד", "עתידי קרוב", "עתידי מאוחר", "ללא תאריך"]
    assert summary.urgent_task_count == 4
    assert summary.needs_attention.urgent_tasks[0].is_overdue is True
    assert all(task.priority == "urgent" for task in summary.needs_attention.urgent_tasks)
    assert "דחוף שהושלם" not in titles


def test_dashboard_urgent_tasks_respect_updated_at_and_id_tiebreakers(test_app):
    SessionLocal = test_app["session_factory"]
    db = SessionLocal()
    fixed_today = date(2026, 6, 22)
    now = datetime(2026, 6, 22, 12, 0, tzinfo=timezone.utc)

    client = Client(
        client_name="לקוח דחיפות",
        business_name=None,
        phone=None,
        email=None,
        business_id=None,
        client_type="private_client",
        address=None,
        status="active",
        notes=None,
        created_at=now,
        updated_at=now,
    )
    db.add(client)
    db.commit()
    db.refresh(client)

    shared_due_date = date(2026, 6, 25)
    tasks = [
        Task(
            client_id=client.id,
            document_id=None,
            title="ישן יותר",
            description=None,
            due_date=shared_due_date,
            priority="urgent",
            status="open",
            created_at=now,
            updated_at=now - timedelta(hours=2),
        ),
        Task(
            client_id=client.id,
            document_id=None,
            title="חדש יותר",
            description=None,
            due_date=shared_due_date,
            priority="urgent",
            status="open",
            created_at=now,
            updated_at=now - timedelta(hours=1),
        ),
    ]
    db.add_all(tasks)
    db.commit()

    try:
        summary = get_dashboard_summary(db, today=fixed_today)
    finally:
        db.close()

    titles = [task.title for task in summary.needs_attention.urgent_tasks]
    assert titles == ["חדש יותר", "ישן יותר"]


def test_dashboard_needs_attention_limits(auth_client, test_app):
    client_id = test_app["seeded"]["client"].id

    for index in range(6):
        response = auth_client.post(
            "/api/tasks",
            json=create_task_payload(
                client_id=client_id,
                title=f"דחוף {index}",
                priority="urgent",
                status="open",
                due_date=f"2026-06-{10 + index:02d}",
            ),
        )
        assert response.status_code == 201

        doc_response = upload_document(
            auth_client,
            client_id=client_id,
            document_name=f"חסר מידע {index}",
            status="missing_information",
            document_date=f"2026-06-{10 + index:02d}",
        )
        assert doc_response.status_code == 201

    response = auth_client.get("/api/dashboard/summary")
    assert response.status_code == 200
    payload = response.json()
    assert len(payload["needs_attention"]["urgent_tasks"]) == 5
    assert len(payload["needs_attention"]["missing_information_documents"]) == 5


def test_dashboard_money_values_are_two_decimal_strings(auth_client, test_app):
    client_id = test_app["seeded"]["client"].id
    fixed_today = date(2026, 6, 22)
    response = upload_document(
        auth_client,
        client_id=client_id,
        document_date="2026-06-10",
        amount_before_vat="1000.00",
    )
    assert response.status_code == 201

    SessionLocal = test_app["session_factory"]
    db = SessionLocal()
    try:
        summary = get_dashboard_summary(db, today=fixed_today)
        api_response = auth_client.get("/api/dashboard/summary")
    finally:
        db.close()

    assert api_response.status_code == 200
    payload = api_response.json()
    assert payload["current_month_total_before_vat"] == "1000.00"
    assert payload["current_month_vat_total"] == "180.00"
    assert payload["current_month_total_including_vat"] == "1180.00"
    assert f"{summary.current_month_total_before_vat:.2f}" == "1000.00"
