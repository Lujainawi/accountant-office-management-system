from datetime import date, datetime, timezone
from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_serializer, field_validator, model_validator

from app.utils.money_validation import (
    EXPLICIT_NULL_AMOUNT_MESSAGE,
    EXPLICIT_NULL_VAT_RATE_MESSAGE,
    validate_amount_before_vat,
    validate_vat_rate,
)

DocumentType = Literal["invoice", "receipt", "report", "bank_document", "other"]
DocumentStatus = Literal["new", "in_progress", "completed", "missing_information"]


def ensure_utc(value: datetime) -> datetime:
    if value.tzinfo is None:
        return value.replace(tzinfo=timezone.utc)
    return value.astimezone(timezone.utc)


def serialize_utc_timestamp(value: datetime) -> str:
    return ensure_utc(value).isoformat().replace("+00:00", "Z")


def normalize_optional_notes(value: str | None) -> str | None:
    if value is None:
        return None
    trimmed = value.strip()
    return trimmed if trimmed else None


class DocumentCreate(BaseModel):
    client_id: int
    document_name: str = Field(min_length=1, max_length=255)
    document_type: DocumentType
    document_date: date
    amount_before_vat: Decimal
    vat_rate: Decimal | None = None
    status: DocumentStatus
    notes: str | None = None

    @field_validator("document_name")
    @classmethod
    def validate_document_name(cls, value: str) -> str:
        trimmed = value.strip()
        if not trimmed:
            raise ValueError("שם המסמך הוא שדה חובה.")
        return trimmed

    @field_validator("amount_before_vat")
    @classmethod
    def validate_amount(cls, value: Decimal) -> Decimal:
        return validate_amount_before_vat(value)

    @field_validator("vat_rate")
    @classmethod
    def validate_vat_rate_field(cls, value: Decimal | None) -> Decimal | None:
        if value is None:
            return None
        return validate_vat_rate(value)

    @model_validator(mode="after")
    def reject_explicit_null_vat_rate(self) -> "DocumentCreate":
        if "vat_rate" in self.model_fields_set and self.vat_rate is None:
            raise ValueError(EXPLICIT_NULL_VAT_RATE_MESSAGE)
        return self

    @field_validator("notes")
    @classmethod
    def validate_notes(cls, value: str | None) -> str | None:
        return normalize_optional_notes(value)


class DocumentUpdate(BaseModel):
    client_id: int | None = None
    document_name: str | None = Field(default=None, min_length=1, max_length=255)
    document_type: DocumentType | None = None
    document_date: date | None = None
    amount_before_vat: Decimal | None = None
    vat_rate: Decimal | None = None
    status: DocumentStatus | None = None
    notes: str | None = None

    @model_validator(mode="after")
    def validate_has_updates(self) -> "DocumentUpdate":
        if not self.model_fields_set:
            raise ValueError("יש לספק לפחות שדה אחד לעדכון.")
        return self

    @model_validator(mode="after")
    def reject_explicit_null_money_fields(self) -> "DocumentUpdate":
        if (
            "amount_before_vat" in self.model_fields_set
            and self.amount_before_vat is None
        ):
            raise ValueError(EXPLICIT_NULL_AMOUNT_MESSAGE)
        if "vat_rate" in self.model_fields_set and self.vat_rate is None:
            raise ValueError(EXPLICIT_NULL_VAT_RATE_MESSAGE)
        return self

    @field_validator("document_name")
    @classmethod
    def validate_document_name(cls, value: str | None) -> str | None:
        if value is None:
            return None
        trimmed = value.strip()
        if not trimmed:
            raise ValueError("שם המסמך הוא שדה חובה.")
        return trimmed

    @field_validator("amount_before_vat")
    @classmethod
    def validate_amount(cls, value: Decimal | None) -> Decimal | None:
        if value is None:
            return None
        return validate_amount_before_vat(value)

    @field_validator("vat_rate")
    @classmethod
    def validate_vat_rate_field(cls, value: Decimal | None) -> Decimal | None:
        if value is None:
            return None
        return validate_vat_rate(value)

    @field_validator("notes")
    @classmethod
    def validate_notes(cls, value: str | None) -> str | None:
        return normalize_optional_notes(value)


class DocumentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    client_id: int
    document_name: str
    document_type: DocumentType
    original_filename: str
    mime_type: str
    file_size_bytes: int
    document_date: date
    amount_before_vat: Decimal
    vat_rate: Decimal
    vat_amount: Decimal
    total_amount: Decimal
    status: DocumentStatus
    notes: str | None
    created_at: datetime
    updated_at: datetime

    @field_serializer(
        "amount_before_vat", "vat_rate", "vat_amount", "total_amount", "document_date"
    )
    def serialize_values(self, value):
        if isinstance(value, Decimal):
            return f"{value:.2f}"
        if isinstance(value, date):
            return value.isoformat()
        return value

    @field_serializer("created_at", "updated_at")
    def serialize_timestamps(self, value: datetime) -> str:
        return serialize_utc_timestamp(value)


class DocumentUploadPolicyResponse(BaseModel):
    allowed_extensions: list[str]
    max_upload_size_mb: int


def document_to_response(document) -> DocumentResponse:
    return DocumentResponse(
        id=document.id,
        client_id=document.client_id,
        document_name=document.document_name,
        document_type=document.document_type,
        original_filename=document.original_filename,
        mime_type=document.mime_type,
        file_size_bytes=document.file_size_bytes,
        document_date=document.document_date,
        amount_before_vat=document.amount_before_vat,
        vat_rate=document.vat_rate,
        vat_amount=document.vat_amount,
        total_amount=document.total_amount,
        status=document.status,
        notes=document.notes,
        created_at=ensure_utc(document.created_at),
        updated_at=ensure_utc(document.updated_at),
    )
