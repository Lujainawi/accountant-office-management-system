from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from app.config import settings
from app.crud.user import get_user_by_email
from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.auth import LoginRequest, LoginResponse, LogoutResponse
from app.schemas.user import UserResponse, user_to_response
from app.utils.security import COOKIE_NAME, create_access_token, verify_password

router = APIRouter(prefix="/auth", tags=["auth"])

INVALID_LOGIN_MESSAGE = "אימייל או סיסמה שגויים"


def _set_auth_cookie(response: Response, token: str) -> None:
    response.set_cookie(
        key=COOKIE_NAME,
        value=token,
        httponly=True,
        samesite="lax",
        path="/",
        max_age=settings.access_token_expire_minutes * 60,
        secure=settings.cookie_secure,
    )


def _clear_auth_cookie(response: Response) -> None:
    response.delete_cookie(
        key=COOKIE_NAME,
        path="/",
        samesite="lax",
        secure=settings.cookie_secure,
    )


@router.post("/login", response_model=LoginResponse)
def login(
    body: LoginRequest,
    response: Response,
    db: Session = Depends(get_db),
) -> LoginResponse:
    email = body.email.strip().lower()
    user = get_user_by_email(db, email)

    if user is None or not user.is_active or not verify_password(
        body.password,
        user.password_hash,
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=INVALID_LOGIN_MESSAGE,
        )

    token = create_access_token(
        user.id,
        settings.secret_key,
        settings.access_token_expire_minutes,
    )
    _set_auth_cookie(response, token)
    return LoginResponse(user=user_to_response(user))


@router.post("/logout", response_model=LogoutResponse)
def logout(response: Response) -> LogoutResponse:
    _clear_auth_cookie(response)
    return LogoutResponse(ok=True)


@router.get("/me", response_model=UserResponse)
def read_current_user(current_user: User = Depends(get_current_user)) -> UserResponse:
    return user_to_response(current_user)
