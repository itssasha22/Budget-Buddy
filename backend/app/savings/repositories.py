import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.savings.models import SavingsGoal
from app.shared.utils import BaseRepository


class SavingsGoalRepository(BaseRepository):
    def __init__(self, session: AsyncSession):
        super().__init__(SavingsGoal, session)

    async def get_by_user(self, user_id: uuid.UUID) -> list[SavingsGoal]:
        statement = select(SavingsGoal).where(SavingsGoal.user_id == user_id)
        return await self.get_all(statement)

    async def get_active(self, user_id: uuid.UUID) -> list[SavingsGoal]:
        statement = select(SavingsGoal).where(
            SavingsGoal.user_id == user_id,
            SavingsGoal.status == "active",
        )
        return await self.get_all(statement)
