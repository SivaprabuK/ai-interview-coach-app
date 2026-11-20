from datetime import datetime
from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


class UserCreate(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)

    @field_validator("password")
    @classmethod
    def validate_password_strength(cls, value: str) -> str:
        import re

        if not re.search(r"[A-Z]", value):
            raise ValueError("Password must contain at least one uppercase letter.")

        if not re.search(r"[a-z]", value):
            raise ValueError("Password must contain at least one lowercase letter.")

        if not re.search(r"\d", value):
            raise ValueError("Password must contain at least one number.")

        if not re.search(r"[@$!%*?&]", value):
            raise ValueError("Password must contain at least one special character.")

        return value


class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class UserUpdate(BaseModel):
    name: str | None = Field(
        default=None,
        min_length=2,
        max_length=100,
    )
    email: EmailStr | None = None


class PasswordChangeRequest(BaseModel):
    current_password: str = Field(min_length=8, max_length=128)
    new_password: str = Field(min_length=8, max_length=128)