from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import ValidationError
from sqlalchemy.orm import Session

from app.crud.office_settings import get_office_settings, update_office_settings
from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.office_settings import (
    OfficeSettingsResponse,
    OfficeSettingsUpdate,
    office_settings_to_response,
)
from app.utils.money_validation import MoneyValidationError

router = APIRouter(tags=["settings"])


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


@router.get("/settings", response_model=OfficeSettingsResponse)
def read_office_settings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> OfficeSettingsResponse:
    _ = current_user
    settings_row = get_office_settings(db)
    return office_settings_to_response(settings_row, db)


@router.put("/settings", response_model=OfficeSettingsResponse)
def put_office_settings(
    update_data: OfficeSettingsUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> OfficeSettingsResponse:
    _ = current_user
    try:
        return update_office_settings(db, update_data)
    except MoneyValidationError as exc:
        raise _validation_error(exc) from exc
    except ValidationError as exc:
        raise _format_validation_error(exc) from exc
