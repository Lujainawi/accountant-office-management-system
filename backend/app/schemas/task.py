from datetime import date, datetime, timezone
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_serializer, field_validator, model_validator

TaskPriority = Literal["low", "medium", "high", "urgent"]
TaskStatus = Literal["open", "in_progress", "done"]

CLEARABLE_OPTIONAL_FIELDS = ("description", "due_date", "document_id")


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


def compute_is_overdue(
    due_date: date | None,
    status: str,
    *,
    today: date | None = None,
) -> bool:
    if due_date is None or status == "done":
        return False
    resolved_today = today if today is not None else date.today()
    return due_date < resolved_today


class TaskCreate(BaseModel):
    client_id: int
    document_id: int | None = None
    title: str = Field(min_length=1, max_length=255)
    description: str | None = None
    due_date: date | None = None
    priority: TaskPriority = "medium"
    status: TaskStatus = "open"

    @field_validator("title")
    @classmethod
    def validate_title(cls, value: str) -> str:
        trimmed = value.strip()
        if not trimmed:
            raise ValueError("כותרת המשימה היא שדה חובה.")
        return trimmed

    @field_validator("description")
    @classmethod
    def validate_description(cls, value: str | None) -> str | None:
        return normalize_optional_text(value)


class TaskUpdate(BaseModel):
    client_id: int | None = None
    document_id: int | None = None
    title: str | None = Field(default=None, min_length=1, max_length=255)
    description: str | None = None
    due_date: date | None = None
    priority: TaskPriority | None = None
    status: TaskStatus | None = None

    @model_validator(mode="after")
    def validate_has_updates(self) -> "TaskUpdate":
        if not self.model_fields_set:
            raise ValueError("יש לספק לפחות שדה אחד לעדכון.")
        return self

    @field_validator("title")
    @classmethod
    def validate_title(cls, value: str | None) -> str | None:
        if value is None:
            return None
        trimmed = value.strip()
        if not trimmed:
            raise ValueError("כותרת המשימה היא שדה חובה.")
        return trimmed

    @field_validator("description")
    @classmethod
    def validate_description(cls, value: str | None) -> str | None:
        return normalize_optional_text(value)


class TaskResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    client_id: int
    document_id: int | None
    title: str
    description: str | None
    due_date: date | None
    priority: TaskPriority
    status: TaskStatus
    is_overdue: bool
    created_at: datetime
    updated_at: datetime

    @field_serializer("due_date")
    def serialize_due_date(self, value: date | None) -> str | None:
        if value is None:
            return None
        return value.isoformat()

    @field_serializer("created_at", "updated_at")
    def serialize_timestamps(self, value: datetime) -> str:
        return serialize_utc_timestamp(value)


def task_to_response(task) -> TaskResponse:
    return TaskResponse(
        id=task.id,
        client_id=task.client_id,
        document_id=task.document_id,
        title=task.title,
        description=task.description,
        due_date=task.due_date,
        priority=task.priority,
        status=task.status,
        is_overdue=compute_is_overdue(task.due_date, task.status),
        created_at=ensure_utc(task.created_at),
        updated_at=ensure_utc(task.updated_at),
    )
