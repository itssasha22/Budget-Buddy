from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.auth.schemas import UserRegister, UserLogin, TokenResponse, UserResponse, UserUpdate, RefreshTokenRequest
from app.auth.services import AuthService
from app.auth.dependencies import get_current_active_user
from app.shared.database.session import get_db
from app.auth.models import User
from app.shared.exceptions import AppException
import uuid

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(data: UserRegister, db: AsyncSession = Depends(get_db)):
    service = AuthService(db)
    return await service.register(data)


@router.post("/login", response_model=TokenResponse)
async def login(data: UserLogin, db: AsyncSession = Depends(get_db)):
    service = AuthService(db)
    return await service.login(data)


@router.post("/refresh", response_model=TokenResponse)
async def refresh(data: RefreshTokenRequest):
    from app.auth.services import AuthService
    from app.shared.database.session import async_session_maker
    async with async_session_maker() as db:
        service = AuthService(db)
        return await service.refresh(data.refresh_token)


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_active_user)):
    from app.auth.schemas import UserResponse
    return UserResponse.model_validate(current_user)


@router.patch("/me", response_model=UserResponse)
async def update_me(data: UserUpdate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    service = AuthService(db)
    return await service.update_profile(current_user.id, data)
