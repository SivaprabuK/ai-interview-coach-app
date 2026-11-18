from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.api.dependencies import get_current_user
from app.db.database import get_db
from app.models import User
from app.schemas.user_profile import (
    UserProfileCreateUpdate,
    UserProfileResponse,
)
from app.services.user_profile_service import UserProfileService
from app.utils.response import global_response_format


router = APIRouter(prefix="/profile", tags=["Career Profile"])


@router.get("/")
def get_user_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    profile = UserProfileService.get_profile(
        db=db,
        user_id=current_user.id,
    )

    return global_response_format(
        status_value=True,
        data=(
            UserProfileResponse.model_validate(profile).model_dump()
            if profile
            else None
        ),
        status_code=status.HTTP_200_OK,
        status_message="Profile retrieved successfully",
    )


@router.put("/")
def create_or_update_user_profile(
    profile_data: UserProfileCreateUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    profile = UserProfileService.create_or_update_profile(
        db=db,
        user_id=current_user.id,
        profile_data=profile_data,
    )

    return global_response_format(
        status_value=True,
        data=UserProfileResponse.model_validate(profile).model_dump(),
        status_code=status.HTTP_200_OK,
        status_message="Profile saved successfully",
    )