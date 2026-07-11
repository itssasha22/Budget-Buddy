import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from app.categories.models import Category
from app.categories.schemas import CategoryCreate, CategoryUpdate, CategoryResponse
from app.categories.repositories import CategoryRepository
from app.shared.exceptions import NotFoundException


class CategoryService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.category_repo = CategoryRepository(session)

    async def create_category(self, data: CategoryCreate, user_id: uuid.UUID) -> CategoryResponse:
        category = Category(
            name=data.name,
            icon=data.icon,
            color=data.color if data.color is not None else "#888888",
            user_id=user_id,
        )
        created = await self.category_repo.create(category)
        return CategoryResponse.model_validate(created)

    async def get_categories(self, user_id: uuid.UUID) -> list[CategoryResponse]:
        categories = await self.category_repo.get_by_user(user_id)
        return [CategoryResponse.model_validate(category) for category in categories]

    async def get_category(self, category_id: uuid.UUID, user_id: uuid.UUID) -> CategoryResponse:
        category = await self._get_owned_category(category_id, user_id)
        return CategoryResponse.model_validate(category)

    async def update_category(
        self, category_id: uuid.UUID, data: CategoryUpdate, user_id: uuid.UUID
    ) -> CategoryResponse:
        category = await self._get_owned_category(category_id, user_id)

        if data.name is not None:
            category.name = data.name
        if data.icon is not None:
            category.icon = data.icon
        if data.color is not None:
            category.color = data.color

        await self.category_repo.update(category)
        return CategoryResponse.model_validate(category)

    async def delete_category(self, category_id: uuid.UUID, user_id: uuid.UUID) -> None:
        category = await self._get_owned_category(category_id, user_id)
        await self.category_repo.delete(category)

    async def _get_owned_category(self, category_id: uuid.UUID, user_id: uuid.UUID) -> Category:
        category = await self.category_repo.get_by_id(category_id)
        if not category or category.user_id != user_id:
            raise NotFoundException("Category")
        return category
