from datetime import date, datetime, timezone
from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_serializer, field_validator, model_validator

from app.utils.money_validation import (
    MoneyValidationError,
    validate_payment_amount,
)

PaymentStatus = Literal["unpaid", "paid", "partially_paid", "pending", "failed"]
PaymentMethod = Literal[
    "cash", "bank_transfer", "check", "bit", "standing_order", "other"
]

PAID_STATUSES = frozenset({"paid", "partially_paid"})


def ensure_utc(value: datetime) -> datetime:
    if value.tzinfo is None:
        return value.replace(tzinfo=timezone.utc)
    return value.astimezone(timezone.utc)


def serialize_utc_timestamp(value: datetime) -> str:
    return ensure_utc(value).isoformat().replace("+00:00", "Z")


def normalize_optional_text(value: str | None) -> str | None:
    if value is None:
        return None
    trimmed = value.strip()
    return trimmed if trimmed else None


class PaymentCreate(BaseModel):
    client_id: int
    document_id: int | None = None
    amount: Decimal
    status: PaymentStatus = "unpaid"
    payment_method: PaymentMethod | None = None
    payment_date: date | None = None
    payment_period: str | None = Field(default=None, max_length=100)
    notes: str | None = None

    @field_validator("amount", mode="before")
    @classmethod
    def validate_amount(cls, value) -> Decimal:
        if isinstance(value, str):
            text = value.strip()
            if not text:
                raise ValueError("סכום התשלום הוא שדה חובה.")
            try:
                decimal_value = Decimal(text)
            except Exception as exc:
                raise ValueError("סכום התשלום אינו תקין.") from exc
        elif isinstance(value, Decimal):
            decimal_value = value
        elif isinstance(value, int):
            decimal_value = Decimal(value)
        else:
            raise ValueError("סכום התשלום אינו תקין.")

        try:
            return validate_payment_amount(decimal_value)
        except MoneyValidationError as exc:
            raise ValueError(str(exc)) from exc

    @field_validator("payment_period", "notes")
    @classmethod
    def validate_optional_text(cls, value: str | None) -> str | None:
        return normalize_optional_text(value)


class PaymentUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    document_id: int | None = None
    amount: Decimal | None = None
    status: PaymentStatus | None = None
    payment_method: PaymentMethod | None = None
    payment_date: date | None = None
    payment_period: str | None = Field(default=None, max_length=100)
    notes: str | None = None

    @model_validator(mode="after")
    def validate_has_updates(self) -> "PaymentUpdate":
        if not self.model_fields_set:
            raise ValueError("יש לספק לפחות שדה אחד לעדכון.")
        return self

    @field_validator("amount", mode="before")
    @classmethod
    def validate_amount(cls, value) -> Decimal | None:
        if value is None:
            return None
        if isinstance(value, str):
            text = value.strip()
            if not text:
                raise ValueError("סכום התשלום אינו תקין.")
            try:
                decimal_value = Decimal(text)
            except Exception as exc:
                raise ValueError("סכום התשלום אינו תקין.") from exc
        elif isinstance(value, Decimal):
            decimal_value = value
        elif isinstance(value, int):
            decimal_value = Decimal(value)
        else:
            raise ValueError("סכום התשלום אינו תקין.")

        try:
            return validate_payment_amount(decimal_value)
        except MoneyValidationError as exc:
            raise ValueError(str(exc)) from exc

    @field_validator("payment_period", "notes")
    @classmethod
    def validate_optional_text(cls, value: str | None) -> str | None:
        return normalize_optional_text(value)


class PaymentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    client_id: int
    document_id: int | None
    amount: Decimal
    status: PaymentStatus
    payment_method: PaymentMethod | None
    payment_date: date | None
    payment_period: str | None
    notes: str | None
    created_at: datetime
    updated_at: datetime

    @field_serializer("amount")
    def serialize_amount(self, value: Decimal) -> str:
        normalized = validate_payment_amount(value)
        return f"{normalized:.2f}"

    @field_serializer("payment_date")
    def serialize_payment_date(self, value: date | None) -> str | None:
        if value is None:
            return None
        return value.isoformat()

    @field_serializer("created_at", "updated_at")
    def serialize_timestamps(self, value: datetime) -> str:
        return serialize_utc_timestamp(value)


def payment_to_response(payment) -> PaymentResponse:
    return PaymentResponse(
        id=payment.id,
        client_id=payment.client_id,
        document_id=payment.document_id,
        amount=payment.amount,
        status=payment.status,
        payment_method=payment.payment_method,
        payment_date=payment.payment_date,
        payment_period=payment.payment_period,
        notes=payment.notes,
        created_at=ensure_utc(payment.created_at),
        updated_at=ensure_utc(payment.updated_at),
    )
