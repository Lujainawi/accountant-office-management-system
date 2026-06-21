import json
from datetime import datetime, timezone
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field, field_serializer, field_validator

DEFAULT_ALLOWED_FILE_EXTENSIONS = ["pdf", "png", "jpg", "jpeg", "docx", "xlsx"]

DEFAULT_ACCOUNTANT_NAME = "מנהל מערכת"
DEFAULT_OFFICE_NAME = "מערכת ניהול משרד רואה חשבון"
DEFAULT_VAT_RATE = Decimal("18.00")
DEFAULT_CURRENCY = "ILS"


def normalize_file_extensions(extensions: list[str]) -> list[str]:
    normalized: list[str] = []

    for extension in extensions:
        value = extension.strip().lower()
        if value.startswith("."):
            value = value[1:]

        if not value:
            raise ValueError("File extension values must not be empty.")

        normalized.append(value)

    if not normalized:
        raise ValueError("At least one file extension is required.")

    return normalized


def ensure_utc(value: datetime) -> datetime:
    if value.tzinfo is None:
        return value.replace(tzinfo=timezone.utc)
    return value.astimezone(timezone.utc)


def serialize_utc_timestamp(value: datetime) -> str:
    return ensure_utc(value).isoformat().replace("+00:00", "Z")


class OfficeSettingsUpdate(BaseModel):
    accountant_name: str | None = Field(default=None, max_length=120)
    office_name: str | None = Field(default=None, max_length=160)
    default_vat_rate: Decimal | None = Field(default=None, ge=0)
    default_currency: str | None = Field(default=None, min_length=3, max_length=3)
    allowed_file_extensions: list[str] | None = None

    @field_validator("accountant_name", "office_name")
    @classmethod
    def validate_non_empty_text(cls, value: str | None) -> str | None:
        if value is not None and not value.strip():
            raise ValueError("Value must not be empty.")
        return value.strip() if value is not None else None

    @field_validator("default_currency")
    @classmethod
    def validate_currency(cls, value: str | None) -> str | None:
        if value is None:
            return None
        return value.strip().upper()

    @field_validator("allowed_file_extensions")
    @classmethod
    def validate_allowed_file_extensions(cls, value: list[str] | None) -> list[str] | None:
        if value is None:
            return None
        return normalize_file_extensions(value)


class OfficeSettingsResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    accountant_name: str
    office_name: str
    default_vat_rate: Decimal
    default_currency: str
    allowed_file_extensions: list[str]
    created_at: datetime
    updated_at: datetime

    @field_serializer("created_at", "updated_at")
    def serialize_timestamps(self, value: datetime) -> str:
        return serialize_utc_timestamp(value)


def office_settings_to_response(settings_row) -> OfficeSettingsResponse:
    return OfficeSettingsResponse(
        id=settings_row.id,
        accountant_name=settings_row.accountant_name,
        office_name=settings_row.office_name,
        default_vat_rate=settings_row.default_vat_rate,
        default_currency=settings_row.default_currency,
        allowed_file_extensions=json.loads(settings_row.allowed_file_extensions),
        created_at=ensure_utc(settings_row.created_at),
        updated_at=ensure_utc(settings_row.updated_at),
    )
