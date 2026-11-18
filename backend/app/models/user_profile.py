from sqlalchemy import (
    ForeignKey,
    Integer,
    String,
    Text,
    Float,
    JSON,
)
from sqlalchemy.orm import Mapped, mapped_column
from app.db.database import Base


class UserProfile(Base):
    __tablename__ = "user_profiles"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
        index=True,
    )

    professional_summary: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    years_of_experience: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
    )

    technical_skills: Mapped[list[str]] = mapped_column(
        JSON,
        default=list,
        nullable=False,
    )

    target_roles: Mapped[list[str]] = mapped_column(
        JSON,
        default=list,
        nullable=False,
    )

    preferred_difficulty: Mapped[str] = mapped_column(
        String(30),
        default="Intermediate",
        nullable=False,
    )
