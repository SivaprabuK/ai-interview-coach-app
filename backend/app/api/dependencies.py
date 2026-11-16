from datetime import datetime, timezone
from typing import Annotated
import uuid
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.security import decode_access_token
from app.db.database import get_db
from app.models import User, UserSession


bearer_scheme = HTTPBearer()

credentials_exception = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Could not validate credentials",
    headers={"WWW-Authenticate": "Bearer"},
)


def get_current_user(
    credentials: Annotated[
        HTTPAuthorizationCredentials,
        Depends(bearer_scheme),
    ],
    db: Annotated[Session, Depends(get_db)],
) -> User:

    try:
        payload = decode_access_token(credentials.credentials)

        if payload.get("type") != "access":
            raise credentials_exception

        subject = payload.get("sub")
        session_id = payload.get("sid")

        if not isinstance(subject, str) or not subject.isdigit():
            raise credentials_exception

        if not isinstance(session_id, str):
            raise credentials_exception

        user_id = int(subject)
        session_uuid = uuid.UUID(session_id)

    except (jwt.InvalidTokenError, ValueError, TypeError, AttributeError):
        raise credentials_exception from None

    user_session = (
        db.query(UserSession)
        .filter(
            UserSession.id == session_uuid,
            UserSession.user_id == user_id,
        )
        .first()
    )

    if user_session is None or user_session.revoked_at is not None:
        raise credentials_exception

    now = datetime.now(timezone.utc)
    session_expiry = user_session.expires_at

    if session_expiry.tzinfo is None:
        session_expiry = session_expiry.replace(tzinfo=timezone.utc)

    if session_expiry <= now:
        raise credentials_exception

    user = db.query(User).filter(User.id == user_id).first()

    if user is None or not user.is_active:
        raise credentials_exception

    return user