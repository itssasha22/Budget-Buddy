import uuid
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.models import User
from app.auth.dependencies import get_current_active_user
from app.shared.database.session import get_db
from app.savings.schemas import SavingsGoalCreate, SavingsGoalUpdate, SavingsGoalResponse
from app.savings.services import SavingsGoalService

router = APIRouter(prefix="/goals", tags=["savings"])


@router.post("", response_model=SavingsGoalResponse, status_code=status.HTTP_201_CREATED)
async def create_goal(
    data: SavingsGoalCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    service = SavingsGoalService(db)
    return await service.create_goal(current_user.id, data)


@router.get("", response_model=list[SavingsGoalResponse])
async def get_goals(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    service = SavingsGoalService(db)
    return await service.get_goals(current_user.id)


@router.patch("/{goal_id}", response_model=SavingsGoalResponse)
async def update_goal(
    goal_id: uuid.UUID,
    data: SavingsGoalUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    service = SavingsGoalService(db)
    return await service.update_goal(goal_id, current_user.id, data)


@router.delete("/{goal_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_goal(
    goal_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    service = SavingsGoalService(db)
    await service.delete_goal(goal_id, current_user.id)
