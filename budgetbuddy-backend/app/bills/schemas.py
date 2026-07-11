from pydantic import BaseModel
from datetime import datetime
import uuid


class BillCreate(BaseModel):
    name: str
    amount: float
    frequency: str
    due_date: datetime
    auto_generated: bool = False


class BillUpdate(BaseModel):
    name: str | None = None
    amount: float | None = None
    frequency: str | None = None
    due_date: datetime | None = None
    status: str | None = None
    auto_generated: bool | None = None


class BillResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    name: str
    amount: float
    frequency: str
    due_date: datetime
    status: str
    auto_generated: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
