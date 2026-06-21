from datetime import datetime, timezone

from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.models.client import Client
from app.schemas.client import ClientCreate, ClientUpdate, client_to_response

NOT_FOUND_MESSAGE = "הלקוח לא נמצא."


def _utc_now() -> datetime:
    return datetime.now(timezone.utc)


def create_client(db: Session, client_data: ClientCreate):
    now = _utc_now()
    client = Client(
        client_name=client_data.client_name,
        business_name=client_data.business_name,
        phone=client_data.phone,
        email=client_data.email,
        business_id=client_data.business_id,
        client_type=client_data.client_type,
        address=client_data.address,
        status=client_data.status,
        notes=client_data.notes,
        created_at=now,
        updated_at=now,
    )
    db.add(client)
    db.commit()
    db.refresh(client)
    return client_to_response(client)


def get_client(db: Session, client_id: int) -> Client | None:
    return db.get(Client, client_id)


def list_clients(
    db: Session,
    *,
    q: str | None = None,
    status: str | None = None,
    client_type: str | None = None,
):
    query = db.query(Client)

    if status:
        query = query.filter(Client.status == status)

    if client_type:
        query = query.filter(Client.client_type == client_type)

    if q:
        term = f"%{q.strip()}%"
        query = query.filter(
            or_(
                Client.client_name.ilike(term),
                Client.business_name.ilike(term),
                Client.phone.ilike(term),
                Client.email.ilike(term),
                Client.business_id.ilike(term),
            )
        )

    clients = query.order_by(Client.client_name.asc(), Client.id.desc()).all()
    return [client_to_response(client) for client in clients]


def update_client(db: Session, client: Client, update_data: ClientUpdate):
    update_fields = update_data.model_dump(exclude_unset=True)

    for field_name, value in update_fields.items():
        setattr(client, field_name, value)

    client.updated_at = _utc_now()
    db.add(client)
    db.commit()
    db.refresh(client)
    return client_to_response(client)


def delete_client(db: Session, client: Client) -> None:
    # TODO: When Documents, Tasks, and Payments are implemented, add dependency
    # checks here and raise HTTP 409 if related records exist. Keep archive
    # (status=inactive) as the recommended UI action when dependents exist.
    db.delete(client)
    db.commit()
