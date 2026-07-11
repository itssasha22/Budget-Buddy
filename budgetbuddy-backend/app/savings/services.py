import uuid
from decimal import Decimal

from sqlalchemy.ext.asyncio import AsyncSession

from app.savings.models import SavingsGoal
from app.savings.repositories import SavingsGoalRepository
from app.savings.schemas import SavingsGoalCreate, SavingsGoalUpdate
from app.shared.exceptions import NotFoundException


class SavingsGoalService:
    def __init__(self, db: AsyncSession):
        self.repo = SavingsGoalRepository(db)

    async def create_goal(
        self, user_id: uuid.UUID, data: SavingsGoalCreate
    ) -> SavingsGoal:
        goal = SavingsGoal(
            user_id=user_id,
            title=data.title,
            target_amount=data.target_amount,
            deadline=data.deadline,
        )
        return await self.repo.create(goal)

    async def get_goals(self, user_id: uuid.UUID) -> list[SavingsGoal]:
        return await self.repo.get_by_user(user_id)

    async def get_goal(self, goal_id: uuid.UUID, user_id: uuid.UUID) -> SavingsGoal:
        goal = await self.repo.get(str(goal_id))
        if not goal or goal.user_id != user_id:
            raise NotFoundException("Savings goal")
        return goal

    async def update_goal(
        self, goal_id: uuid.UUID, user_id: uuid.UUID, data: SavingsGoalUpdate
    ) -> SavingsGoal:
        goal = await self.get_goal(goal_id, user_id)
        if data.title is not None:
            goal.title = data.title
        if data.target_amount is not None:
            goal.target_amount = data.target_amount
        if data.deadline is not None:
            goal.deadline = data.deadline
        if data.status is not None:
            goal.status = data.status
        return await self.repo.update(goal)

    async def delete_goal(self, goal_id: uuid.UUID, user_id: uuid.UUID) -> None:
        goal = await self.get_goal(goal_id, user_id)
        await self.repo.delete(goal)

    async def calculate_progress(self, goal: SavingsGoal) -> Decimal:
        if goal.target_amount <= 0:
            return Decimal("0")
        progress = (goal.current_amount / goal.target_amount) * Decimal("100")
        return min(progress, Decimal("100"))

    async def calculate_contribution(
        self, goal: SavingsGoal, amount: Decimal
    ) -> SavingsGoal:
        goal.current_amount += amount
        if goal.current_amount >= goal.target_amount:
            goal.current_amount = goal.target_amount
            goal.status = "completed"
        return await self.repo.update(goal)
