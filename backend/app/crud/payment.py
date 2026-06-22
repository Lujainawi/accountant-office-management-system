from datetime import date, datetime, timezone

from sqlalchemy import case
from sqlalchemy.orm import Session

from app.crud.client import get_client
from app.crud.document import get_document
from app.models.payment import PAYMENT_METHODS, PAYMENT_STATUSES, Payment
from app.schemas.payment import PAID_STATUSES, PaymentCreate, PaymentUpdate, payment_to_response

NOT_FOUND_MESSAGE = "רשומת התשלום לא נמצאה."
INVALID_CLIENT_MESSAGE = "הלקוח לא נמצא."
INVALID_DOCUMENT_MESSAGE = "המסמך לא נמצא."
DOCUMENT_CLIENT_MISMATCH_MESSAGE = "המסמך שנבחר אינו שייך ללקוח שנבחר."
SAVE_FAILED_MESSAGE = "לא ניתן לשמור את רשומת התשלום."
DELETE_FAILED_MESSAGE = "לא ניתן למחוק את רשומת התשלום."
METHOD_REQUIRED_MESSAGE = "יש לבחור אמצעי תשלום עבור סטטוס שולם או שולם חלקית."
DATE_REQUIRED_MESSAGE = "יש להזין תאריך תשלום עבור סטטוס שולם או שולם חלקית."
NO_UPDATES_MESSAGE = "יש לספק לפחות שדה אחד לעדכון."
CLIENT_ID_REQUIRED_MESSAGE = "יש לספק מזהה לקוח לרשימת תשלומים."


def _utc_now() -> datetime:
    return datetime.now(timezone.utc)


def _ensure_client_exists(db: Session, client_id: int) -> None:
    if get_client(db, client_id) is None:
        raise ValueError(INVALID_CLIENT_MESSAGE)


def _validate_document_for_client(
    db: Session, *, client_id: int, document_id: int | None
) -> None:
    if document_id is None:
        return

    document = get_document(db, document_id)
    if document is None:
        raise ValueError(INVALID_DOCUMENT_MESSAGE)
    if document.client_id != client_id:
        raise ValueError(DOCUMENT_CLIENT_MISMATCH_MESSAGE)


def _validate_effective_payment_state(
    *,
    status: str,
    payment_method: str | None,
    payment_date: date | None,
) -> None:
    if status not in PAYMENT_STATUSES:
        raise ValueError("סטטוס תשלום אינו תקין.")

    if payment_method is not None and payment_method not in PAYMENT_METHODS:
        raise ValueError("אמצעי תשלום אינו תקין.")

    if status in PAID_STATUSES:
        if payment_method is None:
            raise ValueError(METHOD_REQUIRED_MESSAGE)
        if payment_date is None:
            raise ValueError(DATE_REQUIRED_MESSAGE)


def _effective_field(update_data: PaymentUpdate, field_name: str, payment: Payment):
    if field_name in update_data.model_fields_set:
        return getattr(update_data, field_name)
    return getattr(payment, field_name)


def create_payment(db: Session, payment_data: PaymentCreate):
    _ensure_client_exists(db, payment_data.client_id)
    _validate_document_for_client(
        db,
        client_id=payment_data.client_id,
        document_id=payment_data.document_id,
    )
    _validate_effective_payment_state(
        status=payment_data.status,
        payment_method=payment_data.payment_method,
        payment_date=payment_data.payment_date,
    )

    now = _utc_now()
    payment = Payment(
        client_id=payment_data.client_id,
        document_id=payment_data.document_id,
        amount=payment_data.amount,
        status=payment_data.status,
        payment_method=payment_data.payment_method,
        payment_date=payment_data.payment_date,
        payment_period=payment_data.payment_period,
        notes=payment_data.notes,
        created_at=now,
        updated_at=now,
    )

    db.add(payment)
    try:
        db.commit()
        db.refresh(payment)
    except Exception:
        db.rollback()
        raise ValueError(SAVE_FAILED_MESSAGE) from None

    return payment_to_response(payment)


def get_payment(db: Session, payment_id: int) -> Payment | None:
    return db.get(Payment, payment_id)


def list_payments(db: Session, *, client_id: int):
    _ensure_client_exists(db, client_id)

    payment_date_nulls_last = case((Payment.payment_date.is_(None), 1), else_=0)

    payments = (
        db.query(Payment)
        .filter(Payment.client_id == client_id)
        .order_by(
            payment_date_nulls_last.asc(),
            Payment.payment_date.desc(),
            Payment.created_at.desc(),
            Payment.id.desc(),
        )
        .all()
    )
    return [payment_to_response(payment) for payment in payments]


def update_payment(db: Session, payment: Payment, update_data: PaymentUpdate):
    if not update_data.model_fields_set:
        raise ValueError(NO_UPDATES_MESSAGE)

    update_fields = update_data.model_dump(exclude_unset=True)

    effective_status = _effective_field(update_data, "status", payment)
    effective_method = _effective_field(update_data, "payment_method", payment)
    effective_date = _effective_field(update_data, "payment_date", payment)

    if "document_id" in update_data.model_fields_set:
        _validate_document_for_client(
            db,
            client_id=payment.client_id,
            document_id=update_fields.get("document_id"),
        )

    _validate_effective_payment_state(
        status=effective_status,
        payment_method=effective_method,
        payment_date=effective_date,
    )

    for field_name in update_data.model_fields_set:
        setattr(payment, field_name, update_fields[field_name])

    payment.updated_at = _utc_now()

    db.add(payment)
    try:
        db.commit()
        db.refresh(payment)
    except Exception:
        db.rollback()
        raise ValueError(SAVE_FAILED_MESSAGE) from None

    return payment_to_response(payment)


def delete_payment(db: Session, payment: Payment) -> None:
    try:
        db.delete(payment)
        db.commit()
    except Exception:
        db.rollback()
        raise ValueError(DELETE_FAILED_MESSAGE) from None


def count_payments_for_client(db: Session, client_id: int) -> int:
    return db.query(Payment).filter(Payment.client_id == client_id).count()


def count_payments_for_document(db: Session, document_id: int) -> int:
    return db.query(Payment).filter(Payment.document_id == document_id).count()


def count_payments_by_status_for_client(db: Session, client_id: int) -> dict[str, int]:
    from sqlalchemy import func

    counts = {status: 0 for status in PAYMENT_STATUSES}
    grouped = (
        db.query(Payment.status, func.count(Payment.id))
        .filter(Payment.client_id == client_id)
        .group_by(Payment.status)
        .all()
    )
    for status, count in grouped:
        if status in counts:
            counts[status] = count
    return counts
