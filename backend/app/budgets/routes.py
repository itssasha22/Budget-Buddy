from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.budgets.schemas import BudgetCreate, BudgetUpdate, BudgetResponse
from app.budgets.services import BudgetService
from app.auth.dependencies import get_current_active_user
from app.shared.database.session import get_db
from app.auth.models import User
import uuid

router = APIRouter(prefix="/budgets", tags=["budgets"])


@router.post("/", response_model=BudgetResponse, status_code=status.HTTP_201_CREATED)
async def create_budget(data: BudgetCreate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    service = BudgetService(db)
    return await service.create_budget(current_user.id, data)


@router.get("/", response_model=list[BudgetResponse])
async def get_budgets(month: int | None = None, year: int | None = None, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    service = BudgetService(db)
    return await service.get_budgets(current_user.id, month, year)


@router.patch("/{budget_id}", response_model=BudgetResponse)
async def update_budget(budget_id: uuid.UUID, data: BudgetUpdate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    service = BudgetService(db)
    return await service.update_budget(current_user.id, budget_id, data)


@router.delete("/{budget_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_budget(budget_id: uuid.UUID, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    service = BudgetService(db)
    await service.delete_budget(current_user.id, budget_id)
