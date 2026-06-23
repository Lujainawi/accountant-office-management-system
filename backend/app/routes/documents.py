from datetime import date
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from fastapi.responses import FileResponse
from pydantic import ValidationError
from sqlalchemy.orm import Session

from app.crud.client import get_client
from app.crud.document import (
    DOCUMENT_HAS_PAYMENTS_MESSAGE,
    DOCUMENT_HAS_TASKS_MESSAGE,
    NOT_FOUND_MESSAGE,
    create_document,
    delete_document,
    get_document,
    list_documents,
    update_document,
)
from app.database import get_db
from app.dependencies import get_current_user
from app.models.document import DOCUMENT_STATUSES, DOCUMENT_TYPES
from app.models.user import User
from app.schemas.document import (
    DocumentCreate,
    DocumentResponse,
    DocumentUpdate,
    DocumentUploadPolicyResponse,
    document_to_response,
)
from app.services.document_storage import file_exists, get_file_path
from app.utils.file_validation import (
    get_upload_policy,
    max_upload_size_bytes,
    read_upload_bounded,
)
from app.utils.money_validation import (
    MoneyValidationError,
    OMITTED,
    parse_multipart_amount,
    parse_multipart_vat_rate,
    validate_amount_before_vat,
)

router = APIRouter(tags=["documents"])

DocumentTypeQuery = Literal["invoice", "receipt", "report", "bank_document", "other"]
DocumentStatusQuery = Literal["new", "in_progress", "completed", "missing_information"]

MISSING_FILE_MESSAGE = "קובץ המסמך לא נמצא במערכת."
MISSING_CLIENT_ID_MESSAGE = "יש לספק מזהה לקוח."
INVALID_CLIENT_ID_MESSAGE = "מזהה לקוח אינו תקין."
MISSING_DOCUMENT_NAME_MESSAGE = "שם המסמך הוא שדה חובה."
MISSING_DOCUMENT_TYPE_MESSAGE = "סוג מסמך הוא שדה חובה."
MISSING_DOCUMENT_DATE_MESSAGE = "תאריך מסמך הוא שדה חובה."
INVALID_DOCUMENT_DATE_MESSAGE = "תאריך מסמך אינו תקין."
MISSING_DOCUMENT_STATUS_MESSAGE = "סטטוס מסמך הוא שדה חובה."


def _require_form_text(form, form_keys: set[str], field_name: str, message: str) -> str:
    if field_name not in form_keys:
        raise ValueError(message)
    raw = form.get(field_name)
    if raw is None:
        raise ValueError(message)
    return str(raw)


def _parse_multipart_client_id(form, form_keys: set[str]) -> int:
    if "client_id" not in form_keys:
        raise ValueError(MISSING_CLIENT_ID_MESSAGE)
    raw = form.get("client_id")
    if raw is None or not str(raw).strip():
        raise ValueError(MISSING_CLIENT_ID_MESSAGE)
    try:
        return int(str(raw).strip())
    except (TypeError, ValueError):
        raise ValueError(INVALID_CLIENT_ID_MESSAGE) from None


def _parse_multipart_document_date(form, form_keys: set[str]) -> date:
    if "document_date" not in form_keys:
        raise ValueError(MISSING_DOCUMENT_DATE_MESSAGE)
    raw = form.get("document_date")
    if raw is None or not str(raw).strip():
        raise ValueError(MISSING_DOCUMENT_DATE_MESSAGE)
    try:
        return date.fromisoformat(str(raw).strip())
    except ValueError:
        raise ValueError(INVALID_DOCUMENT_DATE_MESSAGE) from None


def _build_document_create_from_form(
    form,
    form_keys: set[str],
    *,
    amount,
    parsed_vat_rate,
) -> DocumentCreate:
    client_id = _parse_multipart_client_id(form, form_keys)
    document_name = _require_form_text(
        form, form_keys, "document_name", MISSING_DOCUMENT_NAME_MESSAGE
    )
    document_type = _require_form_text(
        form, form_keys, "document_type", MISSING_DOCUMENT_TYPE_MESSAGE
    )
    document_date = _parse_multipart_document_date(form, form_keys)
    status_value = _require_form_text(
        form, form_keys, "status", MISSING_DOCUMENT_STATUS_MESSAGE
    )
    notes_raw = form.get("notes") if "notes" in form_keys else None
    notes = str(notes_raw) if notes_raw not in (None, "") else None

    create_kwargs = {
        "client_id": client_id,
        "document_name": document_name,
        "document_type": document_type,
        "document_date": document_date,
        "amount_before_vat": amount,
        "status": status_value,
        "notes": notes,
    }
    if parsed_vat_rate is not OMITTED:
        create_kwargs["vat_rate"] = parsed_vat_rate

    return DocumentCreate(**create_kwargs)


def _get_document_or_404(db: Session, document_id: int):
    document = get_document(db, document_id)
    if document is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=NOT_FOUND_MESSAGE)
    return document


def _validation_error(exc: ValueError) -> HTTPException:
    return HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(exc))


def _format_validation_error(exc: ValidationError) -> HTTPException:
    messages = []
    for error in exc.errors():
        message = error.get("msg")
        if isinstance(message, str):
            if message.startswith("Value error, "):
                message = message.removeprefix("Value error, ")
            messages.append(message)
    detail = messages[0] if messages else "נתונים לא תקינים."
    return HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=detail)


@router.get("/documents/upload-policy", response_model=DocumentUploadPolicyResponse)
def read_upload_policy(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> DocumentUploadPolicyResponse:
    _ = current_user
    policy = get_upload_policy(db)
    return DocumentUploadPolicyResponse(**policy)


@router.get("/documents", response_model=list[DocumentResponse])
def get_documents(
    q: str | None = Query(default=None, max_length=255),
    client_id: int | None = Query(default=None),
    status: DocumentStatusQuery | None = Query(default=None),
    document_type: DocumentTypeQuery | None = Query(default=None),
    month: int | None = Query(default=None, ge=1, le=12),
    year: int | None = Query(default=None, ge=1900, le=9999),
    limit: int | None = Query(default=None, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[DocumentResponse]:
    _ = current_user

    if status is not None and status not in DOCUMENT_STATUSES:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="סטטוס מסמך אינו תקין.",
        )

    if document_type is not None and document_type not in DOCUMENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="סוג מסמך אינו תקין.",
        )

    return list_documents(
        db,
        q=q,
        client_id=client_id,
        status=status,
        document_type=document_type,
        month=month,
        year=year,
        limit=limit,
    )


@router.post("/documents", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
async def post_document(
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> DocumentResponse:
    _ = current_user

    form = await request.form()
    form_keys = set(form.keys())

    if "file" not in form_keys:
        raise _validation_error(ValueError("יש לבחור קובץ להעלאה."))

    file = form["file"]
    if not hasattr(file, "read"):
        raise _validation_error(ValueError("יש לבחור קובץ להעלאה."))

    try:
        amount = parse_multipart_amount(
            form.get("amount_before_vat"), key_present="amount_before_vat" in form_keys
        )
        validate_amount_before_vat(amount)
        parsed_vat_rate = parse_multipart_vat_rate(
            form.get("vat_rate"), key_present="vat_rate" in form_keys
        )
        document_data = _build_document_create_from_form(
            form,
            form_keys,
            amount=amount,
            parsed_vat_rate=parsed_vat_rate,
        )
    except MoneyValidationError as exc:
        raise _validation_error(exc) from exc
    except ValueError as exc:
        raise _validation_error(exc) from exc
    except ValidationError as exc:
        raise _format_validation_error(exc) from exc

    original_filename = getattr(file, "filename", None) or ""
    max_bytes = max_upload_size_bytes()

    try:
        content = await read_upload_bounded(file, max_bytes)
    except ValueError as exc:
        raise _validation_error(exc) from exc

    try:
        return await create_document(
            db,
            document_data,
            original_filename=original_filename,
            file_content=content,
        )
    except MoneyValidationError as exc:
        raise _validation_error(exc) from exc
    except ValueError as exc:
        raise _validation_error(exc) from exc


@router.get("/documents/{document_id}", response_model=DocumentResponse)
def get_document_by_id(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> DocumentResponse:
    _ = current_user
    document = _get_document_or_404(db, document_id)
    return document_to_response(document)


@router.put("/documents/{document_id}", response_model=DocumentResponse)
def put_document(
    document_id: int,
    body: DocumentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> DocumentResponse:
    _ = current_user
    document = _get_document_or_404(db, document_id)

    try:
        return update_document(db, document, body)
    except MoneyValidationError as exc:
        raise _validation_error(exc) from exc
    except ValueError as exc:
        if str(exc) == "הלקוח לא נמצא.":
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
        raise _validation_error(exc) from exc


@router.delete("/documents/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    _ = current_user
    document = _get_document_or_404(db, document_id)

    try:
        delete_document(db, document)
    except ValueError as exc:
        message = str(exc)
        if message in {DOCUMENT_HAS_TASKS_MESSAGE, DOCUMENT_HAS_PAYMENTS_MESSAGE}:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=message,
            ) from exc
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=message,
        ) from exc


@router.get("/documents/{document_id}/download")
def download_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _ = current_user
    document = _get_document_or_404(db, document_id)

    if not file_exists(document.file_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=MISSING_FILE_MESSAGE,
        )

    file_path = get_file_path(document.file_path)

    return FileResponse(
        path=file_path,
        media_type=document.mime_type,
        filename=document.original_filename,
    )
