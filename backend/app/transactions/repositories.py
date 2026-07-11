import uuid
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.transactions.models import Transaction, TransactionType
from app.shared.utils import BaseRepository


class TransactionRepository(BaseRepository):
    def __init__(self, session: AsyncSession):
        super().__init__(Transaction, session)

    async def get_by_id(self, id: uuid.UUID) -> Transaction | None:
        return await self.get(str(id))

    async def get_by_user(self, user_id: uuid.UUID) -> list[Transaction]:
        statement = select(Transaction).where(Transaction.user_id == user_id)
        return await self.get_all(statement)

    async def get_by_category(self, category_id: uuid.UUID) -> list[Transaction]:
        statement = select(Transaction).where(Transaction.category_id == category_id)
        return await self.get_all(statement)

    async def get_by_date_range(self, user_id: uuid.UUID, start_date: datetime, end_date: datetime) -> list[Transaction]:
        statement = select(Transaction).where(
            Transaction.user_id == user_id,
            Transaction.transaction_date >= start_date,
            Transaction.transaction_date <= end_date,
        )
        return await self.get_all(statement)
