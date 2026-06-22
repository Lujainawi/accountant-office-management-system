from datetime import date
from decimal import Decimal, InvalidOperation
from typing import Literal

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.crud.client import get_client
from app.crud.document import (
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
    FILE_TOO_LARGE_MESSAGE,
    get_upload_policy,
    max_upload_size_bytes,
    read_upload_bounded,
)

router = APIRouter(tags=["documents"])

DocumentTypeQuery = Literal["invoice", "receipt", "report", "bank_document", "other"]
DocumentStatusQuery = Literal["new", "in_progress", "completed", "missing_information"]

MISSING_FILE_MESSAGE = "קובץ המסמך לא נמצא במערכת."


def _get_document_or_404(db: Session, document_id: int):
    document = get_document(db, document_id)
    if document is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=NOT_FOUND_MESSAGE)
    return document


def _validation_error(exc: ValueError) -> HTTPException:
    return HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(exc))


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
    file: UploadFile = File(...),
    client_id: int = Form(...),
    document_name: str = Form(...),
    document_type: DocumentTypeQuery = Form(...),
    document_date: date = Form(...),
    amount_before_vat: str = Form(...),
    status: DocumentStatusQuery = Form(...),
    vat_rate: str | None = Form(None),
    notes: str | None = Form(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> DocumentResponse:
    _ = current_user

    try:
        amount = Decimal(amount_before_vat)
    except (InvalidOperation, ValueError) as exc:
        raise _validation_error(ValueError("סכום חייב להיות ערך לא שלילי.")) from exc

    parsed_vat_rate = None
    if vat_rate is not None and vat_rate.strip():
        try:
            parsed_vat_rate = Decimal(vat_rate)
        except (InvalidOperation, ValueError) as exc:
            raise _validation_error(ValueError("שיעור מע״מ חייב להיות ערך לא שלילי.")) from exc

    try:
        document_data = DocumentCreate(
            client_id=client_id,
            document_name=document_name,
            document_type=document_type,
            document_date=document_date,
            amount_before_vat=amount,
            vat_rate=parsed_vat_rate,
            status=status,
            notes=notes,
        )
    except ValueError as exc:
        raise _validation_error(exc) from exc

    original_filename = file.filename or ""
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
        if message == DOCUMENT_HAS_TASKS_MESSAGE:
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
