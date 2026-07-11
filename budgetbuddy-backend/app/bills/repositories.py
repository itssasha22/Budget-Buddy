from datetime import datetime
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession
from app.bills.models import Bill
from app.shared.utils import BaseRepository
import uuid


class BillRepository(BaseRepository):
    def __init__(self, session: AsyncSession):
        super().__init__(Bill, session)

    async def get_by_user(self, user_id: uuid.UUID) -> list[Bill]:
        result = await self.session.execute(select(Bill).where(Bill.user_id == user_id))
        return list(result.scalars().all())

    async def get_upcoming(self, user_id: uuid.UUID, from_date: datetime, to_date: datetime) -> list[Bill]:
        result = await self.session.execute(
            select(Bill).where(
                and_(
                    Bill.user_id == user_id,
                    Bill.due_date >= from_date,
                    Bill.due_date <= to_date,
                    Bill.status != "paid"
                )
            )
        )
        return list(result.scalars().all())

    async def get_by_status(self, user_id: uuid.UUID, status: str) -> list[Bill]:
        result = await self.session.execute(
            select(Bill).where(
                and_(
                    Bill.user_id == user_id,
                    Bill.status == status
                )
            )
        )
        return list(result.scalars().all())
