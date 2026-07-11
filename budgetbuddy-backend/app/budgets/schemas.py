import uuid
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel


class BudgetCreate(BaseModel):
    category_id: uuid.UUID
    month: int
    year: int
    limit_amount: Decimal


class BudgetUpdate(BaseModel):
    category_id: uuid.UUID | None = None
    month: int | None = None
    year: int | None = None
    limit_amount: Decimal | None = None
    spent_amount: Decimal | None = None


class BudgetResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    category_id: uuid.UUID
    month: int
    year: int
    limit_amount: Decimal
    spent_amount: Decimal
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
