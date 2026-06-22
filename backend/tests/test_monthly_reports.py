from datetime import date, datetime, timezone
from decimal import Decimal

from app.models.client import Client
from app.models.document import Document
from app.models.task import Task
from app.services.monthly_report import get_monthly_report
from tests.conftest import upload_document


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


def fetch_monthly_report(auth_client, *, month: int, year: int):
    return auth_client.get("/api/reports/monthly", params={"month": month, "year": year})


def assert_zero_status_map(status_map: dict):
    assert status_map == {
        "new": 0,
        "in_progress": 0,
        "completed": 0,
        "missing_information": 0,
    }


def test_monthly_report_requires_authentication(test_app):
    response = test_app["client"].get("/api/reports/monthly", params={"month": 6, "year": 2026})
    assert response.status_code == 401


def test_monthly_report_missing_month(auth_client):
    response = auth_client.get("/api/reports/monthly", params={"year": 2026})
    assert response.status_code == 422
    assert response.json()["detail"] == "יש לבחור חודש."


def test_monthly_report_missing_year(auth_client):
    response = auth_client.get("/api/reports/monthly", params={"month": 6})
    assert response.status_code == 422
    assert response.json()["detail"] == "יש לבחור שנה."


def test_monthly_report_invalid_month(auth_client):
    response = auth_client.get("/api/reports/monthly", params={"month": 0, "year": 2026})
    assert response.status_code == 422
    assert response.json()["detail"] == "חודש לא תקין. יש לבחור ערך בין 1 ל-12."


def test_monthly_report_invalid_year(auth_client):
    response = auth_client.get("/api/reports/monthly", params={"month": 6, "year": 1899})
    assert response.status_code == 422
    assert response.json()["detail"] == "שנה לא תקינה. יש לבחור ערך בין 1900 ל-2100."


def test_monthly_report_empty_period(auth_client, test_app):
    clear_office_data(test_app)

    response = fetch_monthly_report(auth_client, month=6, year=2026)
    assert response.status_code == 200
    payload = response.json()

    assert payload["period"] == {"year": 2026, "month": 6}
    assert payload["summary"] == {
        "clients_handled": 0,
        "document_count": 0,
        "total_before_vat": "0.00",
        "vat_total": "0.00",
        "total_including_vat": "0.00",
    }
    assert_zero_status_map(payload["documents_by_status"])
    assert payload["clients"] == []


def test_monthly_report_month_boundaries(auth_client, test_app):
    clear_office_data(test_app)
    client_response = auth_client.post(
        "/api/clients",
        json={
            "client_name": "לקוח גבולות",
            "client_type": "private_client",
            "status": "active",
        },
    )
    client_id = client_response.json()["id"]

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

    response = fetch_monthly_report(auth_client, month=6, year=2026)
    assert response.status_code == 200
    payload = response.json()

    assert payload["summary"]["document_count"] == 2
    assert payload["summary"]["clients_handled"] == 1
    assert payload["summary"]["total_before_vat"] == "500.00"
    assert payload["summary"]["vat_total"] == "90.00"
    assert payload["summary"]["total_including_vat"] == "590.00"


def test_monthly_report_excludes_adjacent_months(auth_client, test_app):
    clear_office_data(test_app)
    client_response = auth_client.post(
        "/api/clients",
        json={
            "client_name": "לקוח סמוך",
            "client_type": "private_client",
            "status": "active",
        },
    )
    client_id = client_response.json()["id"]

    for document_date in ("2026-05-31", "2026-07-01"):
        response = upload_document(
            auth_client,
            client_id=client_id,
            document_name=f"מסמך {document_date}",
            document_date=document_date,
            amount_before_vat="1000.00",
        )
        assert response.status_code == 201

    response = fetch_monthly_report(auth_client, month=6, year=2026)
    assert response.status_code == 200
    payload = response.json()
    assert payload["summary"]["document_count"] == 0
    assert_zero_status_map(payload["documents_by_status"])


def test_monthly_report_includes_document_date_in_month_even_if_created_outside(
    auth_client, test_app
):
    clear_office_data(test_app)
    SessionLocal = test_app["session_factory"]
    db = SessionLocal()
    now = datetime(2026, 7, 15, 12, 0, tzinfo=timezone.utc)

    client = Client(
        client_name="לקוח תאריך מסמך",
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

    document = Document(
        client_id=client.id,
        document_name="מסמך יוני",
        document_type="invoice",
        original_filename="demo.pdf",
        stored_filename="stored-demo.pdf",
        file_path="stored-demo.pdf",
        mime_type="application/pdf",
        file_size_bytes=10,
        document_date=date(2026, 6, 15),
        amount_before_vat=Decimal("1000.00"),
        vat_rate=Decimal("18.00"),
        vat_amount=Decimal("180.00"),
        total_amount=Decimal("1180.00"),
        status="completed",
        notes=None,
        created_at=now,
        updated_at=now,
    )
    db.add(document)
    db.commit()
    db.close()

    response = fetch_monthly_report(auth_client, month=6, year=2026)
    assert response.status_code == 200
    payload = response.json()
    assert payload["summary"]["document_count"] == 1
    assert payload["summary"]["total_before_vat"] == "1000.00"


def test_monthly_report_excludes_document_date_outside_month_even_if_created_inside(
    auth_client, test_app
):
    clear_office_data(test_app)
    SessionLocal = test_app["session_factory"]
    db = SessionLocal()
    now = datetime(2026, 6, 15, 12, 0, tzinfo=timezone.utc)

    client = Client(
        client_name="לקוח יצירה ביוני",
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

    document = Document(
        client_id=client.id,
        document_name="מסמך מאי",
        document_type="invoice",
        original_filename="demo.pdf",
        stored_filename="stored-demo.pdf",
        file_path="stored-demo.pdf",
        mime_type="application/pdf",
        file_size_bytes=10,
        document_date=date(2026, 5, 15),
        amount_before_vat=Decimal("1000.00"),
        vat_rate=Decimal("18.00"),
        vat_amount=Decimal("180.00"),
        total_amount=Decimal("1180.00"),
        status="completed",
        notes=None,
        created_at=now,
        updated_at=now,
    )
    db.add(document)
    db.commit()
    db.close()

    response = fetch_monthly_report(auth_client, month=6, year=2026)
    assert response.status_code == 200
    payload = response.json()
    assert payload["summary"]["document_count"] == 0
    assert payload["summary"]["total_before_vat"] == "0.00"


def test_monthly_report_clients_handled_counts_distinct_document_clients_only(
    auth_client, test_app
):
    clear_office_data(test_app)
    active_response = auth_client.post(
        "/api/clients",
        json={
            "client_name": "לקוח א",
            "client_type": "private_client",
            "status": "active",
        },
    )
    inactive_response = auth_client.post(
        "/api/clients",
        json={
            "client_name": "לקוח ב",
            "client_type": "private_client",
            "status": "inactive",
        },
    )
    no_document_response = auth_client.post(
        "/api/clients",
        json={
            "client_name": "לקוח ללא מסמכים",
            "client_type": "private_client",
            "status": "active",
        },
    )
    client_a_id = active_response.json()["id"]
    client_b_id = inactive_response.json()["id"]
    no_document_client_id = no_document_response.json()["id"]

    for index in range(2):
        response = upload_document(
            auth_client,
            client_id=client_a_id,
            document_name=f"מסמך א {index}",
            document_date="2026-06-10",
            amount_before_vat="100.00",
        )
        assert response.status_code == 201

    response = upload_document(
        auth_client,
        client_id=client_b_id,
        document_name="מסמך ב",
        document_date="2026-06-12",
        amount_before_vat="200.00",
    )
    assert response.status_code == 201

    task_response = auth_client.post(
        "/api/tasks",
        json={
            "client_id": no_document_client_id,
            "title": "משימה בלבד",
            "priority": "medium",
            "status": "open",
        },
    )
    assert task_response.status_code == 201

    payment_response = auth_client.post(
        "/api/payments",
        json={
            "client_id": no_document_client_id,
            "amount": "500.00",
            "status": "paid",
            "payment_method": "bank_transfer",
            "payment_date": "2026-06-15",
        },
    )
    assert payment_response.status_code == 201

    response = fetch_monthly_report(auth_client, month=6, year=2026)
    assert response.status_code == 200
    payload = response.json()
    assert payload["summary"]["clients_handled"] == 2
    assert payload["summary"]["document_count"] == 3


def test_monthly_report_inactive_client_with_in_period_document_is_included(
    auth_client, test_app
):
    clear_office_data(test_app)
    inactive_response = auth_client.post(
        "/api/clients",
        json={
            "client_name": "לקוח לא פעיל",
            "client_type": "private_client",
            "status": "inactive",
        },
    )
    client_id = inactive_response.json()["id"]

    response = upload_document(
        auth_client,
        client_id=client_id,
        document_name="מסמך לא פעיל",
        document_date="2026-06-15",
        amount_before_vat="1000.00",
        status="missing_information",
    )
    assert response.status_code == 201

    report_response = fetch_monthly_report(auth_client, month=6, year=2026)
    assert report_response.status_code == 200
    payload = report_response.json()
    assert payload["summary"]["clients_handled"] == 1
    assert payload["clients"][0]["client_name"] == "לקוח לא פעיל"


def test_monthly_report_status_counters_include_zeros(auth_client, test_app):
    clear_office_data(test_app)
    client_response = auth_client.post(
        "/api/clients",
        json={
            "client_name": "לקוח סטטוס",
            "client_type": "private_client",
            "status": "active",
        },
    )
    client_id = client_response.json()["id"]

    response = upload_document(
        auth_client,
        client_id=client_id,
        document_name="מסמך חדש",
        document_date="2026-06-10",
        status="new",
    )
    assert response.status_code == 201

    report_response = fetch_monthly_report(auth_client, month=6, year=2026)
    assert report_response.status_code == 200
    payload = report_response.json()
    assert payload["documents_by_status"] == {
        "new": 1,
        "in_progress": 0,
        "completed": 0,
        "missing_information": 0,
    }


def test_monthly_report_sums_stored_vat_without_recalculation(auth_client, test_app):
    clear_office_data(test_app)
    client_response = auth_client.post(
        "/api/clients",
        json={
            "client_name": "לקוח מע״מ",
            "client_type": "private_client",
            "status": "active",
        },
    )
    client_id = client_response.json()["id"]

    response = upload_document(
        auth_client,
        client_id=client_id,
        document_name="מסמך שיעור היסטורי",
        document_date="2026-06-10",
        amount_before_vat="1000.00",
        vat_rate="17.00",
        status="completed",
    )
    assert response.status_code == 201

    SessionLocal = test_app["session_factory"]
    db = SessionLocal()
    try:
        report = get_monthly_report(db, year=2026, month=6)
    finally:
        db.close()

    assert report.summary.vat_total == Decimal("170.00")
    assert report.summary.total_including_vat == Decimal("1170.00")


def test_monthly_report_client_breakdown_totals_and_ordering(auth_client, test_app):
    clear_office_data(test_app)
    alpha_response = auth_client.post(
        "/api/clients",
        json={
            "client_name": "אלפא",
            "client_type": "private_client",
            "status": "active",
        },
    )
    beta_response = auth_client.post(
        "/api/clients",
        json={
            "client_name": "בטא",
            "client_type": "private_client",
            "status": "active",
        },
    )
    gamma_response = auth_client.post(
        "/api/clients",
        json={
            "client_name": "גמא",
            "client_type": "private_client",
            "status": "active",
        },
    )
    alpha_id = alpha_response.json()["id"]
    beta_id = beta_response.json()["id"]
    gamma_id = gamma_response.json()["id"]

    uploads = [
        (alpha_id, "2026-06-10", "100.00", "completed"),
        (beta_id, "2026-06-11", "500.00", "new"),
        (gamma_id, "2026-06-12", "500.00", "in_progress"),
    ]
    for client_id, document_date, amount, status in uploads:
        response = upload_document(
            auth_client,
            client_id=client_id,
            document_name=f"מסמך {client_id}",
            document_date=document_date,
            amount_before_vat=amount,
            status=status,
        )
        assert response.status_code == 201

    response = fetch_monthly_report(auth_client, month=6, year=2026)
    assert response.status_code == 200
    payload = response.json()

    assert payload["summary"]["document_count"] == 3
    assert payload["summary"]["total_before_vat"] == "1100.00"
    assert payload["summary"]["vat_total"] == "198.00"
    assert payload["summary"]["total_including_vat"] == "1298.00"

    client_names = [row["client_name"] for row in payload["clients"]]
    assert client_names == ["בטא", "גמא", "אלפא"]

    beta_row = payload["clients"][0]
    assert beta_row["document_count"] == 1
    assert beta_row["total_before_vat"] == "500.00"
    assert beta_row["vat_total"] == "90.00"
    assert beta_row["total_including_vat"] == "590.00"


def test_monthly_report_money_strings_have_two_decimal_places(auth_client, test_app):
    clear_office_data(test_app)
    client_response = auth_client.post(
        "/api/clients",
        json={
            "client_name": "לקוח כסף",
            "client_type": "private_client",
            "status": "active",
        },
    )
    client_id = client_response.json()["id"]

    response = upload_document(
        auth_client,
        client_id=client_id,
        document_name="מסמך עשרות",
        document_date="2026-06-10",
        amount_before_vat="1000.00",
    )
    assert response.status_code == 201

    report_response = fetch_monthly_report(auth_client, month=6, year=2026)
    assert report_response.status_code == 200
    payload = report_response.json()

    for field in ("total_before_vat", "vat_total", "total_including_vat"):
        value = payload["summary"][field]
        assert value == f"{Decimal(value):.2f}"
        assert "." in value

    for row in payload["clients"]:
        for field in ("total_before_vat", "vat_total", "total_including_vat"):
            value = row[field]
            assert value == f"{Decimal(value):.2f}"
