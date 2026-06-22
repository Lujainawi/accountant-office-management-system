from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.crud.task import (
    DOCUMENT_CLIENT_MISMATCH_MESSAGE,
    INVALID_CLIENT_MESSAGE,
    INVALID_DOCUMENT_MESSAGE,
    NOT_FOUND_MESSAGE,
    create_task,
    delete_task,
    get_task,
    list_tasks,
    update_task,
)
from app.database import get_db
from app.dependencies import get_current_user
from app.models.task import TASK_PRIORITIES, TASK_STATUSES
from app.models.user import User
from app.schemas.task import TaskCreate, TaskResponse, TaskUpdate, task_to_response

router = APIRouter(tags=["tasks"])

TaskPriorityQuery = Literal["low", "medium", "high", "urgent"]
TaskStatusQuery = Literal["open", "in_progress", "done"]


def _get_task_or_404(db: Session, task_id: int):
    task = get_task(db, task_id)
    if task is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=NOT_FOUND_MESSAGE)
    return task


def _validation_error(exc: ValueError) -> HTTPException:
    message = str(exc)
    if message == INVALID_CLIENT_MESSAGE or message == INVALID_DOCUMENT_MESSAGE:
        return HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=message)
    if message == DOCUMENT_CLIENT_MISMATCH_MESSAGE:
        return HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=message)
    return HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=message)


@router.post("/tasks", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def post_task(
    body: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> TaskResponse:
    _ = current_user
    try:
        return create_task(db, body)
    except ValueError as exc:
        raise _validation_error(exc) from exc


@router.get("/tasks", response_model=list[TaskResponse])
def get_tasks(
    client_id: int | None = Query(default=None),
    status: TaskStatusQuery | None = Query(default=None),
    priority: TaskPriorityQuery | None = Query(default=None),
    limit: int | None = Query(default=None, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[TaskResponse]:
    _ = current_user

    if status is not None and status not in TASK_STATUSES:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="סטטוס משימה אינו תקין.",
        )

    if priority is not None and priority not in TASK_PRIORITIES:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="עדיפות משימה אינה תקינה.",
        )

    return list_tasks(
        db,
        client_id=client_id,
        status=status,
        priority=priority,
        limit=limit,
    )


@router.get("/tasks/{task_id}", response_model=TaskResponse)
def get_task_by_id(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> TaskResponse:
    _ = current_user
    task = _get_task_or_404(db, task_id)
    return task_to_response(task)


@router.put("/tasks/{task_id}", response_model=TaskResponse)
def put_task(
    task_id: int,
    body: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> TaskResponse:
    _ = current_user
    task = _get_task_or_404(db, task_id)

    try:
        return update_task(db, task, body)
    except ValueError as exc:
        raise _validation_error(exc) from exc


@router.delete("/tasks/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    _ = current_user
    task = _get_task_or_404(db, task_id)

    try:
        delete_task(db, task)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(exc),
        ) from exc
