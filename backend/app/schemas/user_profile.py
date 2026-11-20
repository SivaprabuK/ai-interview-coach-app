from pydantic import BaseModel, ConfigDict, Field


class UserProfileCreateUpdate(BaseModel):
    professional_summary: str | None = Field(
        default=None,
        max_length=2000
    )
    years_of_experience: float | None = Field(
        default=None,
        ge=0,
        le=50
    )
    technical_skills: list[str] = Field(default_factory=list)
    target_roles: list[str] = Field(default_factory=list)
    preferred_difficulty: str = Field(
        default="Intermediate",
        pattern="^(Beginner|Intermediate|Advanced)$"
    )
    preferred_question_count: int = Field(
        default=10,
        ge=5,
        le=20,
        multiple_of=5,
    )


class UserProfileResponse(UserProfileCreateUpdate):
    id: int
    user_id: int

    model_config = ConfigDict(from_attributes=True)