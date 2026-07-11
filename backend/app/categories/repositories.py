import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.categories.models import Category
from app.shared.utils import BaseRepository


class CategoryRepository(BaseRepository):
    def __init__(self, session: AsyncSession):
        super().__init__(Category, session)

    async def get_by_id(self, id: uuid.UUID) -> Category | None:
        return await self.get(str(id))

    async def get_by_user(self, user_id: uuid.UUID) -> list[Category]:
        statement = select(Category).where(Category.user_id == user_id)
        return await self.get_all(statement)
