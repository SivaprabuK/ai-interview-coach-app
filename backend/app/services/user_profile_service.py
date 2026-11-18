from sqlalchemy.orm import Session
from app.models import UserProfile
from app.schemas.user_profile import UserProfileCreateUpdate


class UserProfileService:

    @staticmethod
    def get_profile(db: Session, user_id: int) -> UserProfile | None:
        return (
            db.query(UserProfile)
            .filter(UserProfile.user_id == user_id)
            .first()
        )

    @staticmethod
    def create_or_update_profile(
        db: Session,
        user_id: int,
        profile_data: UserProfileCreateUpdate,
    ) -> UserProfile:

        profile = (
            db.query(UserProfile)
            .filter(UserProfile.user_id == user_id)
            .first()
        )

        if profile is None:
            profile = UserProfile(
                user_id=user_id,
                **profile_data.model_dump(),
            )
            db.add(profile)
        else:
            for field, value in profile_data.model_dump().items():
                setattr(profile, field, value)

        db.commit()
        db.refresh(profile)

        return profile