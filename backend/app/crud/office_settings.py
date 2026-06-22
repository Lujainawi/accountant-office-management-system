import json
from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.models.office_settings import OfficeSettings
from app.schemas.office_settings import (
    DEFAULT_ACCOUNTANT_NAME,
    DEFAULT_ALLOWED_FILE_EXTENSIONS,
    DEFAULT_CURRENCY,
    DEFAULT_OFFICE_NAME,
    DEFAULT_VAT_RATE,
    OfficeSettingsUpdate,
    office_settings_to_response,
)


def _utc_now() -> datetime:
    return datetime.now(timezone.utc)


def seed_office_settings_if_missing(db: Session) -> OfficeSettings:
    existing = db.get(OfficeSettings, 1)
    if existing is not None:
        return existing

    if db.query(OfficeSettings).count() > 0:
        return db.query(OfficeSettings).first()

    now = _utc_now()
    settings_row = OfficeSettings(
        id=1,
        accountant_name=DEFAULT_ACCOUNTANT_NAME,
        office_name=DEFAULT_OFFICE_NAME,
        default_vat_rate=DEFAULT_VAT_RATE,
        default_currency=DEFAULT_CURRENCY,
        allowed_file_extensions=json.dumps(DEFAULT_ALLOWED_FILE_EXTENSIONS),
        created_at=now,
        updated_at=now,
    )
    db.add(settings_row)
    db.commit()
    db.refresh(settings_row)
    return settings_row


def get_office_settings(db: Session) -> OfficeSettings:
    settings_row = db.get(OfficeSettings, 1)
    if settings_row is None:
        settings_row = seed_office_settings_if_missing(db)
    return settings_row


def update_office_settings(db: Session, update_data: OfficeSettingsUpdate):
    settings_row = get_office_settings(db)
    update_fields = update_data.model_dump(exclude_unset=True)

    if "allowed_file_extensions" in update_fields:
        update_fields["allowed_file_extensions"] = json.dumps(
            update_fields["allowed_file_extensions"]
        )

    for field_name, value in update_fields.items():
        setattr(settings_row, field_name, value)

    settings_row.updated_at = _utc_now()
    db.add(settings_row)
    db.commit()
    db.refresh(settings_row)
    return office_settings_to_response(settings_row, db)
