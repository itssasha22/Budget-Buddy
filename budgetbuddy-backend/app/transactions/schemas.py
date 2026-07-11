import uuid
from datetime import datetime
from enum import Enum
from pydantic import BaseModel


class TransactionType(str, Enum):
    EXPENSE = "expense"
    INCOME = "income"


class TransactionCreate(BaseModel):
    account_id: uuid.UUID
    category_id: uuid.UUID
    type: TransactionType
    amount: float
    currency: str = "USD"
    merchant: str | None = None
    description: str | None = None
    transaction_date: datetime
    payment_method: str | None = None


class TransactionUpdate(BaseModel):
    account_id: uuid.UUID | None = None
    category_id: uuid.UUID | None = None
    type: TransactionType | None = None
    amount: float | None = None
    currency: str | None = None
    merchant: str | None = None
    description: str | None = None
    transaction_date: datetime | None = None
    payment_method: str | None = None


class TransactionResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    account_id: uuid.UUID
    category_id: uuid.UUID
    type: TransactionType
    amount: float
    currency: str
    merchant: str | None
    description: str | None
    transaction_date: datetime
    payment_method: str | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
