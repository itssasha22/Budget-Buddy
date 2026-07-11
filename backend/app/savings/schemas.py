import uuid
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel


class SavingsGoalCreate(BaseModel):
    title: str
    target_amount: Decimal
    deadline: datetime | None = None


class SavingsGoalUpdate(BaseModel):
    title: str | None = None
    target_amount: Decimal | None = None
    deadline: datetime | None = None
    status: str | None = None


class SavingsGoalResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    title: str
    target_amount: Decimal
    current_amount: Decimal
    deadline: datetime | None
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
