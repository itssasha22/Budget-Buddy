import uuid
from pydantic import BaseModel


class AccountCreate(BaseModel):
    name: str
    type: str
    balance: float = 0.0


class AccountUpdate(BaseModel):
    name: str | None = None
    type: str | None = None
    balance: float | None = None


class AccountResponse(BaseModel):
    id: uuid.UUID
    name: str
    type: str
    balance: float
    user_id: uuid.UUID

    model_config = {"from_attributes": True}
