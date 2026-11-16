import uuid
from typing import Annotated
import jwt
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.core.security import decode_access_token
from app.db.database import get_db
from app.models import User
from app.schemas.auth import LoginRequest, RefreshTokenRequest
from app.schemas.user import UserCreate
from app.services.auth_service import AuthService
from app.api.dependencies import bearer_scheme, get_current_user
from app.utils.response import global_response_format


router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", status_code=status.HTTP_201_CREATED)
def register_user(
    user_data: UserCreate,
    db: Session = Depends(get_db),
):
    try:
        AuthService.register_user(db, user_data)

        return global_response_format(
            status_value=True,
            data={},
            status_code=status.HTTP_201_CREATED,
            status_message="User registered successfully",
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(exc),
        ) from exc

    except RuntimeError:
        return global_response_format(
            status_value=False,
            data={},
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            status_message="User registration failed",
        )


@router.post("/login")
def login_user(
    login_data: LoginRequest,
    db: Session = Depends(get_db),
):
    try:
        user = AuthService.login_user(db, login_data)
        tokens = AuthService.create_session(db, user)

        return global_response_format(
            status_value=True,
            data=tokens,
            status_code=status.HTTP_200_OK,
            status_message="Login successful",
        )

    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )


@router.post("/refresh")
def refresh_access_token(
    request: RefreshTokenRequest,
    db: Session = Depends(get_db),
):
    try:
        tokens = AuthService.refresh_session(
            db,
            request.refresh_token,
        )

        return global_response_format(
            status_value=True,
            data=tokens,
            status_code=status.HTTP_200_OK,
            status_message="Token refreshed successfully",
        )

    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
            headers={"WWW-Authenticate": "Bearer"},
        )


@router.post("/logout")
def logout_user(
    credentials: Annotated[
        HTTPAuthorizationCredentials,
        Depends(bearer_scheme),
    ],
    current_user: Annotated[
        User,
        Depends(get_current_user),
    ],
    db: Session = Depends(get_db),
):
    try:
        payload = decode_access_token(credentials.credentials)
        session_id = uuid.UUID(payload["sid"])

        AuthService.revoke_session(
            db,
            session_id=session_id,
            user_id=current_user.id,
        )

        return global_response_format(
            status_value=True,
            data={},
            status_code=status.HTTP_200_OK,
            status_message="Logout successful",
        )

    except (jwt.InvalidTokenError, ValueError, TypeError, KeyError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
