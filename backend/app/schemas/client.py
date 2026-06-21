from datetime import datetime, timezone
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_serializer, field_validator, model_validator

ClientType = Literal["private_client", "exempt_dealer", "authorized_dealer", "company", "other"]
ClientStatus = Literal["active", "inactive"]

CLEARABLE_OPTIONAL_FIELDS = (
    "business_name",
    "phone",
    "email",
    "business_id",
    "address",
    "notes",
)

INVALID_EMAIL_MESSAGE = "כתובת אימייל אינה תקינה."


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


def normalize_optional_email(value: str | None) -> str | None:
    if value is None:
        return None

    trimmed = value.strip()
    if not trimmed:
        return None

    normalized = trimmed.lower()
    if " " in normalized:
        raise ValueError(INVALID_EMAIL_MESSAGE)
    if normalized.count("@") != 1:
        raise ValueError(INVALID_EMAIL_MESSAGE)

    local, domain = normalized.split("@", 1)
    if not local or not domain:
        raise ValueError(INVALID_EMAIL_MESSAGE)
    if local.startswith(".") or local.endswith("."):
        raise ValueError(INVALID_EMAIL_MESSAGE)
    if domain.startswith(".") or domain.endswith("."):
        raise ValueError(INVALID_EMAIL_MESSAGE)
    if ".." in normalized:
        raise ValueError(INVALID_EMAIL_MESSAGE)

    return normalized


class ClientCreate(BaseModel):
    client_name: str = Field(min_length=1, max_length=160)
    business_name: str | None = Field(default=None, max_length=160)
    phone: str | None = Field(default=None, max_length=40)
    email: str | None = Field(default=None, max_length=255)
    business_id: str | None = Field(default=None, max_length=80)
    client_type: ClientType
    address: str | None = None
    status: ClientStatus = "active"
    notes: str | None = None

    @field_validator("client_name")
    @classmethod
    def validate_client_name(cls, value: str) -> str:
        trimmed = value.strip()
        if not trimmed:
            raise ValueError("שם הלקוח הוא שדה חובה.")
        return trimmed

    @field_validator("business_name", "phone", "business_id", "address", "notes")
    @classmethod
    def validate_optional_text(cls, value: str | None) -> str | None:
        return normalize_optional_text(value)

    @field_validator("email")
    @classmethod
    def validate_email(cls, value: str | None) -> str | None:
        return normalize_optional_email(value)


class ClientUpdate(BaseModel):
    client_name: str | None = Field(default=None, min_length=1, max_length=160)
    business_name: str | None = Field(default=None, max_length=160)
    phone: str | None = Field(default=None, max_length=40)
    email: str | None = Field(default=None, max_length=255)
    business_id: str | None = Field(default=None, max_length=80)
    client_type: ClientType | None = None
    address: str | None = None
    status: ClientStatus | None = None
    notes: str | None = None

    @model_validator(mode="after")
    def validate_has_updates(self) -> "ClientUpdate":
        if not self.model_fields_set:
            raise ValueError("יש לספק לפחות שדה אחד לעדכון.")
        return self

    @field_validator("client_name")
    @classmethod
    def validate_client_name(cls, value: str | None) -> str | None:
        if value is None:
            raise ValueError("שם הלקוח הוא שדה חובה.")
        trimmed = value.strip()
        if not trimmed:
            raise ValueError("שם הלקוח הוא שדה חובה.")
        return trimmed

    @field_validator("client_type", "status")
    @classmethod
    def validate_required_enums(cls, value: str | None) -> str | None:
        if value is None:
            raise ValueError("לא ניתן לרוקן שדה חובה.")
        return value

    @field_validator("business_name", "phone", "business_id", "address", "notes")
    @classmethod
    def validate_clearable_optional_text(cls, value: str | None) -> str | None:
        if value is None:
            return None
        return normalize_optional_text(value)

    @field_validator("email")
    @classmethod
    def validate_email(cls, value: str | None) -> str | None:
        return normalize_optional_email(value)


class ClientResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    client_name: str
    business_name: str | None
    phone: str | None
    email: str | None
    business_id: str | None
    client_type: ClientType
    address: str | None
    status: ClientStatus
    notes: str | None
    created_at: datetime
    updated_at: datetime

    @field_serializer("created_at", "updated_at")
    def serialize_timestamps(self, value: datetime) -> str:
        return serialize_utc_timestamp(value)


def client_to_response(client) -> ClientResponse:
    return ClientResponse(
        id=client.id,
        client_name=client.client_name,
        business_name=client.business_name,
        phone=client.phone,
        email=client.email,
        business_id=client.business_id,
        client_type=client.client_type,
        address=client.address,
        status=client.status,
        notes=client.notes,
        created_at=ensure_utc(client.created_at),
        updated_at=ensure_utc(client.updated_at),
    )
