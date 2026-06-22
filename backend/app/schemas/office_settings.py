import json
from datetime import datetime, timezone
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field, field_serializer, field_validator, model_validator
from sqlalchemy.orm import Session

from app.utils.money_validation import (
    EXPLICIT_NULL_VAT_RATE_MESSAGE,
    validate_vat_rate,
)
from app.utils.upload_policy_constants import (
    CANONICAL_EXTENSION_ORDER,
    SECURE_SYSTEM_ALLOWLIST,
)

DEFAULT_ALLOWED_FILE_EXTENSIONS = list(CANONICAL_EXTENSION_ORDER)

DEFAULT_ACCOUNTANT_NAME = "מנהל מערכת"
DEFAULT_OFFICE_NAME = "מערכת ניהול משרד רואה חשבון"
DEFAULT_VAT_RATE = Decimal("18.00")
DEFAULT_CURRENCY = "ILS"

INVALID_EXTENSION_MESSAGE = "סוג קובץ אינו נתמך בהגדרות המשרד."
EXTENSIONS_REQUIRED_MESSAGE = "יש לבחור לפחות סוג קובץ אחד מותר."


def normalize_file_extensions(extensions: list[str]) -> list[str]:
    seen: set[str] = set()
    normalized: list[str] = []

    for extension in extensions:
        value = extension.strip().lower()
        if value.startswith("."):
            value = value[1:]

        if not value:
            raise ValueError(EXTENSIONS_REQUIRED_MESSAGE)
        if value not in SECURE_SYSTEM_ALLOWLIST:
            raise ValueError(INVALID_EXTENSION_MESSAGE)
        if value not in seen:
            seen.add(value)
            normalized.append(value)

    if not normalized:
        raise ValueError(EXTENSIONS_REQUIRED_MESSAGE)

    return [ext for ext in CANONICAL_EXTENSION_ORDER if ext in seen]


def ensure_utc(value: datetime) -> datetime:
    if value.tzinfo is None:
        return value.replace(tzinfo=timezone.utc)
    return value.astimezone(timezone.utc)


def serialize_utc_timestamp(value: datetime) -> str:
    return ensure_utc(value).isoformat().replace("+00:00", "Z")


class OfficeSettingsUpdate(BaseModel):
    accountant_name: str | None = Field(default=None, max_length=120)
    office_name: str | None = Field(default=None, max_length=160)
    default_vat_rate: Decimal | None = None
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

    @field_validator("default_vat_rate")
    @classmethod
    def validate_default_vat_rate(cls, value: Decimal | None) -> Decimal | None:
        if value is None:
            return None
        return validate_vat_rate(value)

    @model_validator(mode="after")
    def reject_explicit_null_default_vat_rate(self) -> "OfficeSettingsUpdate":
        if (
            "default_vat_rate" in self.model_fields_set
            and self.default_vat_rate is None
        ):
            raise ValueError(EXPLICIT_NULL_VAT_RATE_MESSAGE)
        return self

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
    effective_allowed_file_extensions: list[str]
    created_at: datetime
    updated_at: datetime

    @field_serializer("default_vat_rate")
    def serialize_default_vat_rate(self, value: Decimal) -> str:
        return f"{value:.2f}"

    @field_serializer("created_at", "updated_at")
    def serialize_timestamps(self, value: datetime) -> str:
        return serialize_utc_timestamp(value)


def office_settings_to_response(settings_row, db: Session) -> OfficeSettingsResponse:
    from app.utils.file_validation import get_effective_allowed_extensions

    return OfficeSettingsResponse(
        id=settings_row.id,
        accountant_name=settings_row.accountant_name,
        office_name=settings_row.office_name,
        default_vat_rate=settings_row.default_vat_rate,
        default_currency=settings_row.default_currency,
        allowed_file_extensions=json.loads(settings_row.allowed_file_extensions),
        effective_allowed_file_extensions=get_effective_allowed_extensions(db),
        created_at=ensure_utc(settings_row.created_at),
        updated_at=ensure_utc(settings_row.updated_at),
    )
