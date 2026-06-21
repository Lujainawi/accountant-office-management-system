from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.crud.office_settings import get_office_settings, update_office_settings
from app.database import get_db
from app.schemas.office_settings import (
    OfficeSettingsResponse,
    OfficeSettingsUpdate,
    office_settings_to_response,
)

router = APIRouter(tags=["settings"])


@router.get("/settings", response_model=OfficeSettingsResponse)
def read_office_settings(db: Session = Depends(get_db)) -> OfficeSettingsResponse:
    settings_row = get_office_settings(db)
    return office_settings_to_response(settings_row)


@router.put("/settings", response_model=OfficeSettingsResponse)
def put_office_settings(
    update_data: OfficeSettingsUpdate,
    db: Session = Depends(get_db),
) -> OfficeSettingsResponse:
    return update_office_settings(db, update_data)
