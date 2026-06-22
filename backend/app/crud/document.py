import logging
from datetime import datetime, timezone
from decimal import Decimal

from sqlalchemy import extract, func, or_
from sqlalchemy.orm import Session

from app.crud.client import get_client
from app.crud.office_settings import get_office_settings
from app.models.document import Document
from app.schemas.document import DocumentCreate, DocumentUpdate, document_to_response
from app.services.document_storage import delete_file_safe, generate_storage_key, save_file_content
from app.services.vat import compute_forward_vat
from app.utils.file_validation import (
    extract_final_extension,
    get_effective_allowed_extensions,
    validate_extension_allowed,
    validate_file_content,
    validate_original_filename,
)

logger = logging.getLogger(__name__)

NOT_FOUND_MESSAGE = "המסמך לא נמצא."
INVALID_CLIENT_MESSAGE = "הלקוח לא נמצא."
SAVE_FAILED_MESSAGE = "לא ניתן לשמור את המסמך."
DELETE_FAILED_MESSAGE = "לא ניתן למחוק את המסמך."
DOCUMENT_HAS_TASKS_MESSAGE = (
    "לא ניתן למחוק מסמך שקשור למשימות. יש לעדכן או למחוק את המשימות הקשורות תחילה."
)


def _utc_now() -> datetime:
    return datetime.now(timezone.utc)


def _resolve_vat_rate_for_create(db: Session, document_data: DocumentCreate) -> Decimal:
    if "vat_rate" in document_data.model_fields_set and document_data.vat_rate is not None:
        return document_data.vat_rate
    settings_row = get_office_settings(db)
    return settings_row.default_vat_rate


def _resolve_vat_rate_for_update(
    document: Document, update_data: DocumentUpdate
) -> Decimal:
    if "vat_rate" in update_data.model_fields_set:
        return update_data.vat_rate  # type: ignore[return-value]
    return document.vat_rate


def _resolve_amount_for_update(document: Document, update_data: DocumentUpdate) -> Decimal:
    if "amount_before_vat" in update_data.model_fields_set:
        return update_data.amount_before_vat  # type: ignore[return-value]
    return document.amount_before_vat


def _ensure_client_exists(db: Session, client_id: int) -> None:
    if get_client(db, client_id) is None:
        raise ValueError(INVALID_CLIENT_MESSAGE)


async def create_document(
    db: Session,
    document_data: DocumentCreate,
    *,
    original_filename: str,
    file_content: bytes,
) -> Document:
    _ensure_client_exists(db, document_data.client_id)

    allowed_extensions = get_effective_allowed_extensions(db)
    safe_original_name = validate_original_filename(original_filename)
    extension = extract_final_extension(safe_original_name)
    if extension is None:
        raise ValueError("סוג קובץ אינו נתמך.")

    validate_extension_allowed(extension, allowed_extensions)
    mime_type = validate_file_content(extension, file_content)

    vat_rate = _resolve_vat_rate_for_create(db, document_data)
    amount_before_vat, vat_amount, total_amount = compute_forward_vat(
        document_data.amount_before_vat, vat_rate
    )

    stored_filename, relative_key = generate_storage_key(extension)

    save_file_content(relative_key, file_content)

    now = _utc_now()
    document = Document(
        client_id=document_data.client_id,
        document_name=document_data.document_name,
        document_type=document_data.document_type,
        original_filename=safe_original_name,
        stored_filename=stored_filename,
        file_path=relative_key,
        mime_type=mime_type,
        file_size_bytes=len(file_content),
        document_date=document_data.document_date,
        amount_before_vat=amount_before_vat,
        vat_rate=vat_rate,
        vat_amount=vat_amount,
        total_amount=total_amount,
        status=document_data.status,
        notes=document_data.notes,
        created_at=now,
        updated_at=now,
    )

    db.add(document)
    try:
        db.commit()
        db.refresh(document)
    except Exception:
        db.rollback()
        delete_file_safe(relative_key)
        raise ValueError(SAVE_FAILED_MESSAGE) from None

    return document_to_response(document)


def get_document(db: Session, document_id: int) -> Document | None:
    return db.get(Document, document_id)


def list_documents(
    db: Session,
    *,
    q: str | None = None,
    client_id: int | None = None,
    status: str | None = None,
    document_type: str | None = None,
    month: int | None = None,
    year: int | None = None,
    limit: int | None = None,
):
    query = db.query(Document)

    if client_id is not None:
        query = query.filter(Document.client_id == client_id)

    if status:
        query = query.filter(Document.status == status)

    if document_type:
        query = query.filter(Document.document_type == document_type)

    if month is not None:
        query = query.filter(extract("month", Document.document_date) == month)

    if year is not None:
        query = query.filter(extract("year", Document.document_date) == year)

    if q:
        term = f"%{q.strip()}%"
        query = query.filter(
            or_(Document.document_name.ilike(term), Document.notes.ilike(term))
        )

    query = query.order_by(Document.document_date.desc(), Document.id.desc())

    if limit is not None:
        query = query.limit(limit)

    documents = query.all()
    return [document_to_response(document) for document in documents]


def update_document(
    db: Session, document: Document, update_data: DocumentUpdate
):
    update_fields = update_data.model_dump(exclude_unset=True)

    if "client_id" in update_fields:
        _ensure_client_exists(db, update_fields["client_id"])

    amount_before_vat = _resolve_amount_for_update(document, update_data)
    vat_rate = _resolve_vat_rate_for_update(document, update_data)
    amount_before_vat, vat_amount, total_amount = compute_forward_vat(
        amount_before_vat, vat_rate
    )

    for field_name, value in update_fields.items():
        if field_name in {"vat_rate", "amount_before_vat"}:
            continue
        setattr(document, field_name, value)

    document.amount_before_vat = amount_before_vat
    document.vat_rate = vat_rate
    document.vat_amount = vat_amount
    document.total_amount = total_amount
    document.updated_at = _utc_now()

    db.add(document)
    try:
        db.commit()
        db.refresh(document)
    except Exception:
        db.rollback()
        raise ValueError(SAVE_FAILED_MESSAGE) from None

    return document_to_response(document)


def delete_document(db: Session, document: Document) -> None:
    from app.crud.task import count_tasks_for_document

    linked_task_count = count_tasks_for_document(db, document.id)
    if linked_task_count > 0:
        raise ValueError(DOCUMENT_HAS_TASKS_MESSAGE)

    relative_key = document.file_path

    try:
        db.delete(document)
        db.commit()
    except Exception:
        db.rollback()
        raise ValueError(DELETE_FAILED_MESSAGE) from None

    delete_file_safe(relative_key)


def count_documents_for_client(db: Session, client_id: int) -> int:
    return db.query(Document).filter(Document.client_id == client_id).count()
