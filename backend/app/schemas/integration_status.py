from datetime import datetime, timezone

from pydantic import BaseModel, ConfigDict, Field, field_serializer


def ensure_utc(value: datetime) -> datetime:
    if value.tzinfo is None:
        return value.replace(tzinfo=timezone.utc)
    return value.astimezone(timezone.utc)


def serialize_utc_timestamp(value: datetime) -> str:
    return ensure_utc(value).isoformat().replace("+00:00", "Z")


class IntegrationStatusResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    service_name: str = Field(max_length=80)
    status: str = Field(max_length=50)
    mode: str = Field(max_length=50)
    configured: bool
    notes: str | None = None
    created_at: datetime
    updated_at: datetime
    is_mock: bool = True
    data_source: str = "sample"

    @field_serializer("created_at", "updated_at")
    def serialize_timestamps(self, value: datetime) -> str:
        return serialize_utc_timestamp(value)


class IntegrationStatusListResponse(BaseModel):
    items: list[IntegrationStatusResponse]
    is_mock: bool = True
    data_source: str = "sample"
