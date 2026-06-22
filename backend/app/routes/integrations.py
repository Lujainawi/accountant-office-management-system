from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.crud.integration_status import (
    get_integration_status_by_service,
    list_integration_statuses,
)
from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.integration_status import (
    IntegrationStatusListResponse,
    IntegrationStatusResponse,
)
from app.schemas.integrations.email import EmailPreviewRequest, EmailPreviewResponse
from app.schemas.integrations.ocr import OcrMockProcessRequest, OcrMockProcessResponse
from app.schemas.integrations.status import (
    AiMockSuggestionsResponse,
    DigitalSignatureStatusResponse,
    OnlinePaymentsStatusResponse,
    TaxAuthorityStatusResponse,
)
from app.services.integrations.ai_mock import build_ai_mock_suggestions
from app.services.integrations.email_preview import (
    INVALID_EMAIL_PRESET_MESSAGE,
    build_email_preview,
)
from app.services.integrations.ocr_mock import (
    INVALID_OCR_PRESET_MESSAGE,
    build_ocr_mock_result,
)
from app.services.integrations.status_mock import (
    SERVICE_NOT_FOUND_MESSAGE,
    build_digital_signature_status,
    build_online_payments_status,
    build_tax_authority_status,
)

router = APIRouter(tags=["integrations"])

JSON_ONLY_MESSAGE = "נדרש גוף בקשה בפורמט JSON בלבד."


def _validation_error(message: str) -> HTTPException:
    return HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=message)


def _service_not_found() -> HTTPException:
    return HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=SERVICE_NOT_FOUND_MESSAGE)


def _reject_non_json_request(request: Request) -> None:
    content_type = (request.headers.get("content-type") or "").lower()
    if content_type.startswith("multipart/form-data"):
        raise _validation_error(JSON_ONLY_MESSAGE)


@router.get("/integrations/statuses", response_model=IntegrationStatusListResponse)
def read_integration_statuses(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> IntegrationStatusListResponse:
    _ = current_user
    rows = list_integration_statuses(db)
    return IntegrationStatusListResponse(
        items=[
            IntegrationStatusResponse.model_validate(row) for row in rows
        ],
        is_mock=True,
        data_source="sample",
    )


@router.post("/integrations/email/preview", response_model=EmailPreviewResponse)
def post_email_preview(
    body: EmailPreviewRequest,
    request: Request,
    current_user: User = Depends(get_current_user),
) -> EmailPreviewResponse:
    _ = current_user
    _reject_non_json_request(request)
    try:
        return build_email_preview(body.preset)
    except ValueError as exc:
        if str(exc) == INVALID_EMAIL_PRESET_MESSAGE:
            raise _validation_error(INVALID_EMAIL_PRESET_MESSAGE) from exc
        raise _validation_error(str(exc)) from exc


@router.post("/integrations/ocr/mock-process", response_model=OcrMockProcessResponse)
def post_ocr_mock_process(
    body: OcrMockProcessRequest,
    request: Request,
    current_user: User = Depends(get_current_user),
) -> OcrMockProcessResponse:
    _ = current_user
    _reject_non_json_request(request)
    try:
        return build_ocr_mock_result(body.preset)
    except ValueError as exc:
        if str(exc) == INVALID_OCR_PRESET_MESSAGE:
            raise _validation_error(INVALID_OCR_PRESET_MESSAGE) from exc
        raise _validation_error(str(exc)) from exc


@router.get(
    "/integrations/tax-authority/status",
    response_model=TaxAuthorityStatusResponse,
)
def read_tax_authority_status(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> TaxAuthorityStatusResponse:
    _ = current_user
    row = get_integration_status_by_service(db, "tax_authority")
    if row is None:
        raise _service_not_found()
    return build_tax_authority_status(row)


@router.get(
    "/integrations/digital-signature/status",
    response_model=DigitalSignatureStatusResponse,
)
def read_digital_signature_status(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> DigitalSignatureStatusResponse:
    _ = current_user
    row = get_integration_status_by_service(db, "digital_signature")
    if row is None:
        raise _service_not_found()
    return build_digital_signature_status(row)


@router.get("/integrations/payments/status", response_model=OnlinePaymentsStatusResponse)
def read_online_payments_status(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> OnlinePaymentsStatusResponse:
    _ = current_user
    row = get_integration_status_by_service(db, "online_payments")
    if row is None:
        raise _service_not_found()
    return build_online_payments_status(row)


@router.get(
    "/integrations/ai-assistant/mock-suggestions",
    response_model=AiMockSuggestionsResponse,
)
def read_ai_mock_suggestions(
    current_user: User = Depends(get_current_user),
) -> AiMockSuggestionsResponse:
    _ = current_user
    return build_ai_mock_suggestions()
