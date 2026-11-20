import hmac
import uuid
from datetime import datetime, timezone
import jwt
from sqlalchemy.orm import Session
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_refresh_token,
    hash_password,
    hash_refresh_token,
    verify_password,
)
from app.models import User, UserSession
from app.schemas.user import UserCreate
from app.schemas.auth import LoginRequest


class AuthService:

    @staticmethod
    def register_user(db: Session, user_data: UserCreate) -> User:
        existing_user = (
            db.query(User)
            .filter(User.email == user_data.email)
            .first()
        )

        if existing_user:
            raise ValueError("Email is already registered")

        user = User(
            name=user_data.name,
            email=str(user_data.email),
            hashed_password=hash_password(user_data.password),
        )

        db.add(user)
        db.commit()
        db.refresh(user)

        return user

    @staticmethod
    def login_user(db: Session, login_data: LoginRequest) -> User:
        user = (
            db.query(User)
            .filter(User.email == str(login_data.email))
            .first()
        )

        if not user or not verify_password(
            login_data.password,
            user.hashed_password,
        ):
            raise ValueError("Invalid email or password")

        if not user.is_active:
            raise ValueError("User account is inactive")

        return user

    @staticmethod
    def create_session(db: Session, user: User) -> dict:
        session_id = str(uuid.uuid4())

        access_token = create_access_token(
            subject=str(user.id),
            session_id=session_id,
        )

        refresh_token = create_refresh_token(
            subject=str(user.id),
            session_id=session_id,
        )

        refresh_payload = decode_refresh_token(refresh_token)

        expires_at = datetime.fromtimestamp(
            refresh_payload["exp"],
            tz=timezone.utc,
        )

        user_session = UserSession(
            id=uuid.UUID(session_id),
            user_id=user.id,
            refresh_token_hash=hash_refresh_token(refresh_token),
            expires_at=expires_at,
        )

        db.add(user_session)
        db.commit()

        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
        }

    @staticmethod
    def refresh_session(db: Session, refresh_token: str) -> dict:
        try:
            payload = decode_refresh_token(refresh_token)

            if payload.get("type") != "refresh":
                raise ValueError("Invalid refresh token")

            subject = payload.get("sub")
            session_id = uuid.UUID(payload.get("sid", ""))

            if not isinstance(subject, str) or not subject.isdigit():
                raise ValueError("Invalid refresh token")

        except (jwt.InvalidTokenError, ValueError, TypeError, AttributeError):
            raise ValueError("Invalid or expired refresh token") from None

        user_id = int(subject)
        now = datetime.now(timezone.utc)

        user_session = (
            db.query(UserSession)
            .filter(
                UserSession.id == session_id,
                UserSession.user_id == user_id,
            )
            .with_for_update()
            .first()
        )

        if (
            user_session is None
            or user_session.revoked_at is not None
            or user_session.expires_at <= now
            or not hmac.compare_digest(
                user_session.refresh_token_hash,
                hash_refresh_token(refresh_token),
            )
        ):
            raise ValueError("Invalid or expired refresh token")

        user = db.query(User).filter(User.id == user_id).first()

        if user is None or not user.is_active:
            raise ValueError("Invalid or expired refresh token")

        new_access_token = create_access_token(
            subject=str(user.id),
            session_id=str(user_session.id),
        )

        new_refresh_token = create_refresh_token(
            subject=str(user.id),
            session_id=str(user_session.id),
        )

        new_refresh_payload = decode_refresh_token(new_refresh_token)

        user_session.refresh_token_hash = hash_refresh_token(
            new_refresh_token
        )

        user_session.expires_at = datetime.fromtimestamp(
            new_refresh_payload["exp"],
            tz=timezone.utc,
        )

        db.commit()

        return {
            "access_token": new_access_token,
            "refresh_token": new_refresh_token,
            "token_type": "bearer",
        }

    @staticmethod
    def revoke_session(
        db: Session,
        session_id: uuid.UUID,
        user_id: int,
    ) -> bool:
        user_session = (
            db.query(UserSession)
            .filter(
                UserSession.id == session_id,
                UserSession.user_id == user_id,
            )
            .with_for_update()
            .first()
        )

        if user_session is None:
            return False

        if user_session.revoked_at is None:
            user_session.revoked_at = datetime.now(timezone.utc)
            db.commit()

        return True

    @staticmethod
    def update_user(
        db: Session,
        user: User,
        name: str | None = None,
        email: str | None = None,
    ) -> User:

        if name is not None:
            user.name = name

        if email is not None:
            existing_user = (
                db.query(User)
                .filter(
                    User.email == email,
                    User.id != user.id,
                )
                .first()
            )

            if existing_user:
                raise ValueError("Email is already registered")

            user.email = email

        db.commit()
        db.refresh(user)

        return user


    @staticmethod
    def change_password(
        db: Session,
        user: User,
        current_password: str,
        new_password: str,
    ) -> None:

        if not verify_password(
            current_password,
            user.hashed_password,
        ):
            raise ValueError("Current password is incorrect")

        user.hashed_password = hash_password(new_password)

        db.query(UserSession).filter(
            UserSession.user_id == user.id,
            UserSession.revoked_at.is_(None),
        ).update(
            {"revoked_at": datetime.now(timezone.utc)},
            synchronize_session=False,
        )

        db.commit()
