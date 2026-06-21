from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy.orm import Session

from app.crud.client import (
    NOT_FOUND_MESSAGE,
    create_client,
    delete_client,
    get_client,
    list_clients,
    update_client,
)
from app.database import get_db
from app.dependencies import get_current_user
from app.models.client import CLIENT_STATUSES, CLIENT_TYPES
from app.models.user import User
from app.schemas.client import ClientCreate, ClientResponse, ClientUpdate, client_to_response
from app.schemas.client_summary import ClientSummaryResponse
from app.services.client_summary import get_client_summary

router = APIRouter(tags=["clients"])

ClientTypeQuery = Literal["private_client", "exempt_dealer", "authorized_dealer", "company", "other"]
ClientStatusQuery = Literal["active", "inactive"]


def _get_client_or_404(db: Session, client_id: int):
    client = get_client(db, client_id)
    if client is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=NOT_FOUND_MESSAGE)
    return client


@router.post("/clients", response_model=ClientResponse, status_code=status.HTTP_201_CREATED)
def post_client(
    body: ClientCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ClientResponse:
    _ = current_user
    return create_client(db, body)


@router.get("/clients", response_model=list[ClientResponse])
def get_clients(
    q: str | None = Query(default=None, max_length=255),
    status: ClientStatusQuery | None = Query(default=None),
    client_type: ClientTypeQuery | None = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[ClientResponse]:
    _ = current_user

    if status is not None and status not in CLIENT_STATUSES:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="סטטוס לקוח אינו תקין.",
        )

    if client_type is not None and client_type not in CLIENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="סוג לקוח אינו תקין.",
        )

    return list_clients(db, q=q, status=status, client_type=client_type)


@router.get("/clients/{client_id}", response_model=ClientResponse)
def get_client_by_id(
    client_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ClientResponse:
    _ = current_user
    client = _get_client_or_404(db, client_id)
    return client_to_response(client)


@router.get("/clients/{client_id}/summary", response_model=ClientSummaryResponse)
def get_client_summary_by_id(
    client_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ClientSummaryResponse:
    _ = current_user
    summary = get_client_summary(db, client_id)
    if summary is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=NOT_FOUND_MESSAGE)
    return summary


@router.put("/clients/{client_id}", response_model=ClientResponse)
def put_client(
    client_id: int,
    body: ClientUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ClientResponse:
    _ = current_user
    client = _get_client_or_404(db, client_id)
    return update_client(db, client, body)


@router.delete("/clients/{client_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_client(
    client_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Response:
    _ = current_user
    client = _get_client_or_404(db, client_id)
    delete_client(db, client)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
