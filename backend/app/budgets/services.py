from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.budgets.models import Budget
from app.budgets.repositories import BudgetRepository
from app.budgets.schemas import BudgetCreate, BudgetUpdate, BudgetResponse
from app.shared.exceptions import NotFoundException
import uuid


class BudgetService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.budget_repo = BudgetRepository(session)

    async def create_budget(self, user_id: uuid.UUID, data: BudgetCreate) -> BudgetResponse:
        budget = Budget(
            user_id=user_id,
            category_id=data.category_id,
            month=data.month,
            year=data.year,
            limit_amount=data.limit_amount,
        )
        created = await self.budget_repo.create(budget)
        return BudgetResponse.model_validate(created)

    async def get_budgets(self, user_id: uuid.UUID, month: int | None = None, year: int | None = None) -> list[BudgetResponse]:
        if month and year:
            budgets = await self.budget_repo.get_by_user_and_period(user_id, month, year)
        else:
            stmt = select(Budget).where(Budget.user_id == user_id)
            budgets = await self.budget_repo.get_all(stmt)
        return [BudgetResponse.model_validate(b) for b in budgets]

    async def get_budget(self, user_id: uuid.UUID, budget_id: uuid.UUID) -> BudgetResponse:
        budget = await self.budget_repo.get(str(budget_id))
        if not budget or budget.user_id != user_id:
            raise NotFoundException("Budget")
        return BudgetResponse.model_validate(budget)

    async def update_budget(self, user_id: uuid.UUID, budget_id: uuid.UUID, data: BudgetUpdate) -> BudgetResponse:
        budget = await self.budget_repo.get(str(budget_id))
        if not budget or budget.user_id != user_id:
            raise NotFoundException("Budget")

        if data.category_id is not None:
            budget.category_id = data.category_id
        if data.month is not None:
            budget.month = data.month
        if data.year is not None:
            budget.year = data.year
        if data.limit_amount is not None:
            budget.limit_amount = data.limit_amount
        if data.spent_amount is not None:
            budget.spent_amount = data.spent_amount

        updated = await self.budget_repo.update(budget)
        return BudgetResponse.model_validate(updated)

    async def delete_budget(self, user_id: uuid.UUID, budget_id: uuid.UUID) -> None:
        budget = await self.budget_repo.get(str(budget_id))
        if not budget or budget.user_id != user_id:
            raise NotFoundException("Budget")
        await self.budget_repo.delete(budget)

    async def calculate_progress(self, user_id: uuid.UUID, budget_id: uuid.UUID) -> dict:
        budget = await self.budget_repo.get(str(budget_id))
        if not budget or budget.user_id != user_id:
            raise NotFoundException("Budget")

        progress = (float(budget.spent_amount) / float(budget.limit_amount)) * 100 if budget.limit_amount else 0
        return {
            "budget_id": budget.id,
            "spent_amount": budget.spent_amount,
            "limit_amount": budget.limit_amount,
            "progress_percentage": round(progress, 2),
        }

    async def detect_overspending(self, user_id: uuid.UUID) -> list[dict]:
        stmt = select(Budget).where(Budget.user_id == user_id)
        budgets = await self.budget_repo.get_all(stmt)

        overspent = []
        for budget in budgets:
            if budget.spent_amount > budget.limit_amount:
                overspent.append({
                    "budget_id": budget.id,
                    "category_id": budget.category_id,
                    "month": budget.month,
                    "year": budget.year,
                    "limit_amount": budget.limit_amount,
                    "spent_amount": budget.spent_amount,
                    "overspent_amount": budget.spent_amount - budget.limit_amount,
                })
        return overspent
