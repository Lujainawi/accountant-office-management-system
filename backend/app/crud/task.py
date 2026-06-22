from datetime import datetime, timezone

from sqlalchemy import case
from sqlalchemy.orm import Session

from app.crud.client import get_client
from app.crud.document import get_document
from app.models.task import TASK_PRIORITIES, TASK_STATUSES, Task
from app.schemas.task import TaskCreate, TaskUpdate, task_to_response

NOT_FOUND_MESSAGE = "המשימה לא נמצאה."
INVALID_CLIENT_MESSAGE = "הלקוח לא נמצא."
INVALID_DOCUMENT_MESSAGE = "המסמך לא נמצא."
DOCUMENT_CLIENT_MISMATCH_MESSAGE = "המסמך שנבחר אינו שייך ללקוח שנבחר."
SAVE_FAILED_MESSAGE = "לא ניתן לשמור את המשימה."
DELETE_FAILED_MESSAGE = "לא ניתן למחוק את המשימה."

PRIORITY_ORDER = case(
    (Task.priority == "urgent", 0),
    (Task.priority == "high", 1),
    (Task.priority == "medium", 2),
    (Task.priority == "low", 3),
    else_=4,
)


def _utc_now() -> datetime:
    return datetime.now(timezone.utc)


def _ensure_client_exists(db: Session, client_id: int) -> None:
    if get_client(db, client_id) is None:
        raise ValueError(INVALID_CLIENT_MESSAGE)


def _validate_document_for_client(
    db: Session, *, client_id: int, document_id: int | None
) -> None:
    if document_id is None:
        return

    document = get_document(db, document_id)
    if document is None:
        raise ValueError(INVALID_DOCUMENT_MESSAGE)
    if document.client_id != client_id:
        raise ValueError(DOCUMENT_CLIENT_MISMATCH_MESSAGE)


def create_task(db: Session, task_data: TaskCreate):
    _ensure_client_exists(db, task_data.client_id)
    _validate_document_for_client(
        db, client_id=task_data.client_id, document_id=task_data.document_id
    )

    now = _utc_now()
    task = Task(
        client_id=task_data.client_id,
        document_id=task_data.document_id,
        title=task_data.title,
        description=task_data.description,
        due_date=task_data.due_date,
        priority=task_data.priority,
        status=task_data.status,
        created_at=now,
        updated_at=now,
    )

    db.add(task)
    try:
        db.commit()
        db.refresh(task)
    except Exception:
        db.rollback()
        raise ValueError(SAVE_FAILED_MESSAGE) from None

    return task_to_response(task)


def get_task(db: Session, task_id: int) -> Task | None:
    return db.get(Task, task_id)


def list_tasks(
    db: Session,
    *,
    client_id: int | None = None,
    status: str | None = None,
    priority: str | None = None,
    limit: int | None = None,
):
    query = db.query(Task)

    if client_id is not None:
        query = query.filter(Task.client_id == client_id)

    if status:
        query = query.filter(Task.status == status)

    if priority:
        query = query.filter(Task.priority == priority)

    status_done_last = case((Task.status == "done", 1), else_=0)
    due_date_nulls_last = case((Task.due_date.is_(None), 1), else_=0)

    query = query.order_by(
        status_done_last.asc(),
        due_date_nulls_last.asc(),
        Task.due_date.asc(),
        PRIORITY_ORDER.asc(),
        Task.updated_at.desc(),
        Task.id.desc(),
    )

    if limit is not None:
        query = query.limit(limit)

    tasks = query.all()
    return [task_to_response(task) for task in tasks]


def update_task(db: Session, task: Task, update_data: TaskUpdate):
    update_fields = update_data.model_dump(exclude_unset=True)

    effective_client_id = update_fields.get("client_id", task.client_id)
    if "client_id" in update_fields:
        _ensure_client_exists(db, effective_client_id)

    if "document_id" in update_fields:
        effective_document_id = update_fields["document_id"]
    elif "client_id" in update_fields:
        effective_document_id = task.document_id
    else:
        effective_document_id = None

    if "document_id" in update_fields or (
        "client_id" in update_fields and task.document_id is not None
    ):
        _validate_document_for_client(
            db,
            client_id=effective_client_id,
            document_id=effective_document_id,
        )

    for field_name, value in update_fields.items():
        setattr(task, field_name, value)

    task.updated_at = _utc_now()

    db.add(task)
    try:
        db.commit()
        db.refresh(task)
    except Exception:
        db.rollback()
        raise ValueError(SAVE_FAILED_MESSAGE) from None

    return task_to_response(task)


def delete_task(db: Session, task: Task) -> None:
    try:
        db.delete(task)
        db.commit()
    except Exception:
        db.rollback()
        raise ValueError(DELETE_FAILED_MESSAGE) from None


def count_open_tasks_for_client(db: Session, client_id: int) -> int:
    return (
        db.query(Task)
        .filter(
            Task.client_id == client_id,
            Task.status.in_(("open", "in_progress")),
        )
        .count()
    )


def count_tasks_for_document(db: Session, document_id: int) -> int:
    return db.query(Task).filter(Task.document_id == document_id).count()


def count_tasks_for_client(db: Session, client_id: int) -> int:
    return db.query(Task).filter(Task.client_id == client_id).count()
