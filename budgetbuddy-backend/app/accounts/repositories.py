import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.accounts.models import Account
from app.shared.utils import BaseRepository


class AccountRepository(BaseRepository):
    def __init__(self, session: AsyncSession):
        super().__init__(Account, session)

    async def get_by_id(self, id: uuid.UUID) -> Account | None:
        return await self.get(str(id))

    async def get_by_user(self, user_id: uuid.UUID) -> list[Account]:
        statement = select(Account).where(Account.user_id == user_id)
        return await self.get_all(statement)
