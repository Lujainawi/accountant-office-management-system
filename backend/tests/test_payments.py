from datetime import date, datetime, timedelta, timezone

import pytest

from app.crud.client import CLIENT_HAS_PAYMENTS_MESSAGE
from app.crud.document import DOCUMENT_HAS_PAYMENTS_MESSAGE
from app.crud.payment import DOCUMENT_CLIENT_MISMATCH_MESSAGE
from tests.conftest import make_pdf_bytes, upload_document

CLIENT_HAS_PAYMENTS_MESSAGE_EXACT = (
    "לא ניתן למחוק לקוח שיש לו רשומות תשלום קשורות. יש למחוק את רשומות התשלום תחילה."
)
DOCUMENT_HAS_PAYMENTS_MESSAGE_EXACT = (
    "לא ניתן למחוק מסמך שקשור לרשומות תשלום. יש לעדכן או למחוק את רשומות התשלום תחילה."
)


def create_payment_payload(
    *,
    client_id: int,
    amount: str = "100.00",
    status: str = "unpaid",
    document_id: int | None = None,
    payment_method: str | None = None,
    payment_date: str | None = None,
    payment_period: str | None = None,
    notes: str | None = None,
):
    payload = {
        "client_id": client_id,
        "amount": amount,
        "status": status,
    }
    if document_id is not None:
        payload["document_id"] = document_id
    if payment_method is not None:
        payload["payment_method"] = payment_method
    if payment_date is not None:
        payload["payment_date"] = payment_date
    if payment_period is not None:
        payload["payment_period"] = payment_period
    if notes is not None:
        payload["notes"] = notes
    return payload


def test_payments_require_authentication(test_app):
    api = test_app["client"]
    client_id = test_app["seeded"]["client"].id
    response = api.post(
        "/api/payments",
        json=create_payment_payload(client_id=client_id),
    )
    assert response.status_code == 401

    assert api.get(f"/api/payments?client_id={client_id}").status_code == 401
    assert api.get("/api/payments/1").status_code == 401
    assert api.put("/api/payments/1", json={"notes": "x"}).status_code == 401
    assert api.delete("/api/payments/1").status_code == 401


def test_create_payment_with_all_fields(auth_client, test_app):
    client_id = test_app["seeded"]["client"].id
    doc_response = upload_document(auth_client, client_id=client_id)
    document_id = doc_response.json()["id"]

    response = auth_client.post(
        "/api/payments",
        json=create_payment_payload(
            client_id=client_id,
            amount="1250.00",
            status="paid",
            document_id=document_id,
            payment_method="bank_transfer",
            payment_date="2026-05-15",
            payment_period="May 2026",
            notes="Internal note",
        ),
    )
    assert response.status_code == 201
    payload = response.json()
    assert payload["client_id"] == client_id
    assert payload["document_id"] == document_id
    assert payload["amount"] == "1250.00"
    assert payload["status"] == "paid"
    assert payload["payment_method"] == "bank_transfer"
    assert payload["payment_date"] == "2026-05-15"
    assert payload["payment_period"] == "May 2026"
    assert payload["notes"] == "Internal note"


def test_create_paid_without_method(auth_client, test_app):
    client_id = test_app["seeded"]["client"].id
    response = auth_client.post(
        "/api/payments",
        json=create_payment_payload(
            client_id=client_id,
            status="paid",
            payment_date="2026-05-15",
        ),
    )
    assert response.status_code == 422


def test_create_paid_without_date(auth_client, test_app):
    client_id = test_app["seeded"]["client"].id
    response = auth_client.post(
        "/api/payments",
        json=create_payment_payload(
            client_id=client_id,
            status="paid",
            payment_method="cash",
        ),
    )
    assert response.status_code == 422


def test_create_partially_paid_without_method_or_date(auth_client, test_app):
    client_id = test_app["seeded"]["client"].id
    response = auth_client.post(
        "/api/payments",
        json=create_payment_payload(client_id=client_id, status="partially_paid"),
    )
    assert response.status_code == 422


@pytest.mark.parametrize("status", ["unpaid", "pending", "failed"])
def test_create_without_method_or_date_for_optional_statuses(
    auth_client, test_app, status
):
    client_id = test_app["seeded"]["client"].id
    response = auth_client.post(
        "/api/payments",
        json=create_payment_payload(client_id=client_id, status=status),
    )
    assert response.status_code == 201
    payload = response.json()
    assert payload["status"] == status
    assert payload["payment_method"] is None
    assert payload["payment_date"] is None


def test_create_invalid_payment_method(auth_client, test_app):
    client_id = test_app["seeded"]["client"].id
    response = auth_client.post(
        "/api/payments",
        json=create_payment_payload(
            client_id=client_id,
            status="paid",
            payment_method="credit_card",
            payment_date="2026-05-15",
        ),
    )
    assert response.status_code == 422


def test_create_invalid_status(auth_client, test_app):
    client_id = test_app["seeded"]["client"].id
    response = auth_client.post(
        "/api/payments",
        json=create_payment_payload(client_id=client_id, status="completed"),
    )
    assert response.status_code == 422


def test_create_invalid_decimal(auth_client, test_app):
    client_id = test_app["seeded"]["client"].id
    response = auth_client.post(
        "/api/payments",
        json=create_payment_payload(client_id=client_id, amount="abc"),
    )
    assert response.status_code == 422


def test_create_negative_amount(auth_client, test_app):
    client_id = test_app["seeded"]["client"].id
    response = auth_client.post(
        "/api/payments",
        json=create_payment_payload(client_id=client_id, amount="-10.00"),
    )
    assert response.status_code == 422


@pytest.mark.parametrize(
    ("input_amount", "expected_amount"),
    [
        ("1250", "1250.00"),
        ("1250.0", "1250.00"),
        ("1250.00", "1250.00"),
    ],
)
def test_create_exact_decimal_precision(
    auth_client, test_app, input_amount, expected_amount
):
    client_id = test_app["seeded"]["client"].id
    response = auth_client.post(
        "/api/payments",
        json=create_payment_payload(client_id=client_id, amount=input_amount),
    )
    assert response.status_code == 201
    assert response.json()["amount"] == expected_amount


def test_create_rejects_more_than_two_decimal_places(auth_client, test_app):
    client_id = test_app["seeded"]["client"].id
    response = auth_client.post(
        "/api/payments",
        json=create_payment_payload(client_id=client_id, amount="1250.999"),
    )
    assert response.status_code == 422


def test_create_invalid_client(auth_client):
    response = auth_client.post(
        "/api/payments",
        json=create_payment_payload(client_id=99999),
    )
    assert response.status_code == 404


def test_create_invalid_document(auth_client, test_app):
    client_id = test_app["seeded"]["client"].id
    response = auth_client.post(
        "/api/payments",
        json=create_payment_payload(client_id=client_id, document_id=99999),
    )
    assert response.status_code == 404


def test_create_document_wrong_client(auth_client, test_app):
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
        "/api/payments",
        json=create_payment_payload(client_id=other_client_id, document_id=document_id),
    )
    assert response.status_code == 422
    assert response.json()["detail"] == DOCUMENT_CLIENT_MISMATCH_MESSAGE


def test_put_with_client_id_rejected(auth_client, test_app):
    client_id = test_app["seeded"]["client"].id
    create_response = auth_client.post(
        "/api/payments",
        json=create_payment_payload(client_id=client_id),
    )
    payment_id = create_response.json()["id"]

    update_response = auth_client.put(
        f"/api/payments/{payment_id}",
        json={"client_id": 99999, "notes": "changed"},
    )
    assert update_response.status_code == 422

    get_response = auth_client.get(f"/api/payments/{payment_id}")
    assert get_response.json()["client_id"] == client_id


def test_put_empty_body_rejected(auth_client, test_app):
    client_id = test_app["seeded"]["client"].id
    create_response = auth_client.post(
        "/api/payments",
        json=create_payment_payload(client_id=client_id),
    )
    payment_id = create_response.json()["id"]

    update_response = auth_client.put(f"/api/payments/{payment_id}", json={})
    assert update_response.status_code == 422


def test_paid_notes_only_update(auth_client, test_app):
    client_id = test_app["seeded"]["client"].id
    create_response = auth_client.post(
        "/api/payments",
        json=create_payment_payload(
            client_id=client_id,
            status="paid",
            payment_method="cash",
            payment_date="2026-05-10",
            notes="Original",
        ),
    )
    payment_id = create_response.json()["id"]

    update_response = auth_client.put(
        f"/api/payments/{payment_id}",
        json={"notes": "Updated note"},
    )
    assert update_response.status_code == 200
    payload = update_response.json()
    assert payload["notes"] == "Updated note"
    assert payload["payment_method"] == "cash"
    assert payload["payment_date"] == "2026-05-10"


def test_unpaid_to_paid_without_method(auth_client, test_app):
    client_id = test_app["seeded"]["client"].id
    create_response = auth_client.post(
        "/api/payments",
        json=create_payment_payload(client_id=client_id, status="unpaid"),
    )
    payment_id = create_response.json()["id"]

    update_response = auth_client.put(
        f"/api/payments/{payment_id}",
        json={"status": "paid", "payment_date": "2026-05-10"},
    )
    assert update_response.status_code == 422


def test_unpaid_to_paid_without_date(auth_client, test_app):
    client_id = test_app["seeded"]["client"].id
    create_response = auth_client.post(
        "/api/payments",
        json=create_payment_payload(client_id=client_id, status="unpaid"),
    )
    payment_id = create_response.json()["id"]

    update_response = auth_client.put(
        f"/api/payments/{payment_id}",
        json={"status": "paid", "payment_method": "cash"},
    )
    assert update_response.status_code == 422


def test_paid_to_unpaid_keeps_method_and_date(auth_client, test_app):
    client_id = test_app["seeded"]["client"].id
    create_response = auth_client.post(
        "/api/payments",
        json=create_payment_payload(
            client_id=client_id,
            status="paid",
            payment_method="check",
            payment_date="2026-04-01",
        ),
    )
    payment_id = create_response.json()["id"]

    update_response = auth_client.put(
        f"/api/payments/{payment_id}",
        json={"status": "unpaid"},
    )
    assert update_response.status_code == 200
    payload = update_response.json()
    assert payload["status"] == "unpaid"
    assert payload["payment_method"] == "check"
    assert payload["payment_date"] == "2026-04-01"


def test_clear_method_while_paid_rejected(auth_client, test_app):
    client_id = test_app["seeded"]["client"].id
    create_response = auth_client.post(
        "/api/payments",
        json=create_payment_payload(
            client_id=client_id,
            status="paid",
            payment_method="cash",
            payment_date="2026-04-01",
        ),
    )
    payment_id = create_response.json()["id"]

    update_response = auth_client.put(
        f"/api/payments/{payment_id}",
        json={"payment_method": None},
    )
    assert update_response.status_code == 422


def test_clear_date_while_paid_rejected(auth_client, test_app):
    client_id = test_app["seeded"]["client"].id
    create_response = auth_client.post(
        "/api/payments",
        json=create_payment_payload(
            client_id=client_id,
            status="paid",
            payment_method="cash",
            payment_date="2026-04-01",
        ),
    )
    payment_id = create_response.json()["id"]

    update_response = auth_client.put(
        f"/api/payments/{payment_id}",
        json={"payment_date": None},
    )
    assert update_response.status_code == 422


def test_explicit_document_unlink(auth_client, test_app):
    client_id = test_app["seeded"]["client"].id
    doc_response = upload_document(auth_client, client_id=client_id)
    document_id = doc_response.json()["id"]

    create_response = auth_client.post(
        "/api/payments",
        json=create_payment_payload(
            client_id=client_id,
            document_id=document_id,
            status="paid",
            payment_method="cash",
            payment_date="2026-05-01",
        ),
    )
    payment_id = create_response.json()["id"]
    assert create_response.json()["document_id"] == document_id

    update_response = auth_client.put(
        f"/api/payments/{payment_id}",
        json={"document_id": None},
    )
    assert update_response.status_code == 200
    assert update_response.json()["document_id"] is None


def test_list_payments_ordering(auth_client, test_app):
    client_id = test_app["seeded"]["client"].id
    today = date.today()

    auth_client.post(
        "/api/payments",
        json=create_payment_payload(
            client_id=client_id,
            amount="100.00",
            payment_date=(today - timedelta(days=2)).isoformat(),
            status="paid",
            payment_method="cash",
        ),
    )
    auth_client.post(
        "/api/payments",
        json=create_payment_payload(
            client_id=client_id,
            amount="200.00",
            payment_date=(today - timedelta(days=1)).isoformat(),
            status="paid",
            payment_method="cash",
        ),
    )
    auth_client.post(
        "/api/payments",
        json=create_payment_payload(
            client_id=client_id,
            amount="300.00",
            status="unpaid",
        ),
    )

    response = auth_client.get(f"/api/payments?client_id={client_id}")
    assert response.status_code == 200
    amounts = [item["amount"] for item in response.json()]
    assert amounts[0] == "200.00"
    assert amounts[1] == "100.00"
    assert amounts[2] == "300.00"


def test_list_payments_requires_client_id(auth_client):
    response = auth_client.get("/api/payments")
    assert response.status_code == 422


def test_client_summary_payment_counters(auth_client, test_app):
    client_id = test_app["seeded"]["client"].id
    auth_client.post(
        "/api/payments",
        json=create_payment_payload(client_id=client_id, status="unpaid"),
    )
    auth_client.post(
        "/api/payments",
        json=create_payment_payload(
            client_id=client_id,
            status="paid",
            payment_method="cash",
            payment_date="2026-05-01",
        ),
    )
    auth_client.post(
        "/api/payments",
        json=create_payment_payload(client_id=client_id, status="pending"),
    )

    summary_response = auth_client.get(f"/api/clients/{client_id}/summary")
    assert summary_response.status_code == 200
    payload = summary_response.json()
    assert payload["payment_record_count"] == 3
    assert payload["payments_by_status"]["unpaid"] == 1
    assert payload["payments_by_status"]["paid"] == 1
    assert payload["payments_by_status"]["pending"] == 1
    assert payload["payments_by_status"]["partially_paid"] == 0
    assert payload["payments_by_status"]["failed"] == 0


def test_delete_client_with_payments_blocked(auth_client, test_app):
    client_id = test_app["seeded"]["client"].id
    auth_client.post(
        "/api/payments",
        json=create_payment_payload(client_id=client_id),
    )

    delete_response = auth_client.delete(f"/api/clients/{client_id}")
    assert delete_response.status_code == 409
    assert delete_response.json()["detail"] == CLIENT_HAS_PAYMENTS_MESSAGE_EXACT
    assert CLIENT_HAS_PAYMENTS_MESSAGE == CLIENT_HAS_PAYMENTS_MESSAGE_EXACT


def test_delete_document_with_linked_payment_blocked(auth_client, test_app):
    client_id = test_app["seeded"]["client"].id
    doc_response = upload_document(auth_client, client_id=client_id)
    document_id = doc_response.json()["id"]

    auth_client.post(
        "/api/payments",
        json=create_payment_payload(
            client_id=client_id,
            document_id=document_id,
            status="paid",
            payment_method="cash",
            payment_date="2026-05-01",
        ),
    )

    delete_response = auth_client.delete(f"/api/documents/{document_id}")
    assert delete_response.status_code == 409
    assert delete_response.json()["detail"] == DOCUMENT_HAS_PAYMENTS_MESSAGE_EXACT
    assert DOCUMENT_HAS_PAYMENTS_MESSAGE == DOCUMENT_HAS_PAYMENTS_MESSAGE_EXACT


def test_delete_payment(auth_client, test_app):
    client_id = test_app["seeded"]["client"].id
    create_response = auth_client.post(
        "/api/payments",
        json=create_payment_payload(client_id=client_id),
    )
    payment_id = create_response.json()["id"]

    delete_response = auth_client.delete(f"/api/payments/{payment_id}")
    assert delete_response.status_code == 204

    get_response = auth_client.get(f"/api/payments/{payment_id}")
    assert get_response.status_code == 404


def test_edit_payment_fields(auth_client, test_app):
    client_id = test_app["seeded"]["client"].id
    doc_response = upload_document(auth_client, client_id=client_id)
    document_id = doc_response.json()["id"]

    create_response = auth_client.post(
        "/api/payments",
        json=create_payment_payload(client_id=client_id, status="unpaid"),
    )
    payment_id = create_response.json()["id"]

    update_response = auth_client.put(
        f"/api/payments/{payment_id}",
        json={
            "document_id": document_id,
            "amount": "500.00",
            "status": "partially_paid",
            "payment_method": "bit",
            "payment_date": "2026-06-01",
            "payment_period": "Q2 2026",
            "notes": "Updated",
        },
    )
    assert update_response.status_code == 200
    payload = update_response.json()
    assert payload["document_id"] == document_id
    assert payload["amount"] == "500.00"
    assert payload["status"] == "partially_paid"
    assert payload["payment_method"] == "bit"
    assert payload["payment_date"] == "2026-06-01"
    assert payload["payment_period"] == "Q2 2026"
    assert payload["notes"] == "Updated"
