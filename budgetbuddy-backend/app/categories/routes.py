import uuid
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.categories.schemas import CategoryCreate, CategoryUpdate, CategoryResponse
from app.categories.services import CategoryService
from app.auth.dependencies import get_current_active_user
from app.auth.models import User
from app.shared.database.session import get_db

router = APIRouter(prefix="/categories", tags=["categories"])


@router.post("", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
async def create_category(
    data: CategoryCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    service = CategoryService(db)
    return await service.create_category(data, current_user.id)


@router.get("", response_model=list[CategoryResponse])
async def get_categories(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    service = CategoryService(db)
    return await service.get_categories(current_user.id)


@router.get("/{category_id}", response_model=CategoryResponse)
async def get_category(
    category_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    service = CategoryService(db)
    return await service.get_category(category_id, current_user.id)


@router.patch("/{category_id}", response_model=CategoryResponse)
async def update_category(
    category_id: uuid.UUID,
    data: CategoryUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    service = CategoryService(db)
    return await service.update_category(category_id, data, current_user.id)


@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_category(
    category_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    service = CategoryService(db)
    await service.delete_category(category_id, current_user.id)
