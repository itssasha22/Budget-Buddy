from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from app.auth.models import User
from app.auth.schemas import UserRegister, UserLogin, TokenResponse, UserResponse
from app.auth.repositories import UserRepository
from app.shared.exceptions import AppException, UnauthorizedException, ValidationException
from app.shared.security import hash_password, verify_password, create_access_token, create_refresh_token
import uuid


class AuthService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.user_repo = UserRepository(session)

    async def register(self, data: UserRegister) -> UserResponse:
        existing = await self.user_repo.get_by_email(data.email)
        if existing:
            raise ValidationException([{"field": "email", "code": "EMAIL_EXISTS"}])

        user = User(
            email=data.email,
            hashed_password=hash_password(data.password),
            full_name=data.full_name,
        )
        created = await self.user_repo.create(user)
        return UserResponse.model_validate(created)

    async def login(self, data: UserLogin) -> TokenResponse:
        user = await self.user_repo.get_by_email(data.email)
        if not user or not verify_password(data.password, user.hashed_password):
            raise UnauthorizedException("Invalid credentials.")

        access = create_access_token(subject=user.id)
        refresh = create_refresh_token(subject=user.id)
        return TokenResponse(access_token=access, refresh_token=refresh)

    async def refresh(self, refresh_token: str) -> TokenResponse:
        from app.shared.security import decode_token
        payload = decode_token(refresh_token)
        if not payload or payload.get("type") != "refresh":
            raise UnauthorizedException("Invalid refresh token.")

        user_id = payload.get("sub")
        user = await self.user_repo.get_by_id(uuid.UUID(user_id))
        if not user:
            raise UnauthorizedException("User not found.")

        access = create_access_token(subject=user.id)
        new_refresh = create_refresh_token(subject=user.id)
        return TokenResponse(access_token=access, refresh_token=new_refresh)

    async def get_current_user(self, user_id: uuid.UUID) -> UserResponse:
        user = await self.user_repo.get_by_id(user_id)
        if not user:
            raise UnauthorizedException("User not found.")
        return UserResponse.model_validate(user)

    async def update_profile(self, user_id: uuid.UUID, data) -> UserResponse:
        user = await self.user_repo.get_by_id(user_id)
        if not user:
            raise UnauthorizedException("User not found.")

        if data.full_name is not None:
            user.full_name = data.full_name
        if data.currency is not None:
            user.currency = data.currency
        if data.timezone is not None:
            user.timezone = data.timezone
        if data.language is not None:
            user.language = data.language

        await self.user_repo.update(user)
        return UserResponse.model_validate(user)
