from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from app.shared.database.session import get_db
from app.shared.security import decode_token
from app.auth.repositories import UserRepository
from app.shared.exceptions import UnauthorizedException
import uuid

security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db),
):
    token = credentials.credentials
    payload = decode_token(token)
    if not payload or payload.get("type") != "access":
        raise UnauthorizedException()

    user_id = payload.get("sub")
    user_repo = UserRepository(db)
    user = await user_repo.get_by_id(uuid.UUID(user_id))
    if not user:
        raise UnauthorizedException()

    return user


async def get_current_active_user(current_user = Depends(get_current_user)):
    if not current_user.is_active:
        raise UnauthorizedException("Account is inactive.")
    return current_user
