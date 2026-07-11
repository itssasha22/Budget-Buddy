from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from app.budgets.models import Budget
from app.shared.utils import BaseRepository
import uuid


class BudgetRepository(BaseRepository):
    def __init__(self, session: AsyncSession):
        super().__init__(Budget, session)

    async def get_by_user_and_period(self, user_id: uuid.UUID, month: int, year: int) -> list[Budget]:
        result = await self.session.execute(
            select(Budget).where(
                and_(
                    Budget.user_id == user_id,
                    Budget.month == month,
                    Budget.year == year,
                )
            )
        )
        return list(result.scalars().all())

    async def get_by_category(self, user_id: uuid.UUID, category_id: uuid.UUID) -> list[Budget]:
        result = await self.session.execute(
            select(Budget).where(
                and_(
                    Budget.user_id == user_id,
                    Budget.category_id == category_id,
                )
            )
        )
        return list(result.scalars().all())
