import uuid
from typing import TYPE_CHECKING
from sqlalchemy import String, ForeignKey, Numeric
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.shared.database.base import Base

if TYPE_CHECKING:
    from app.auth.models import User
    from app.transactions.models import Transaction

class Account(Base):
    __tablename__ = "accounts"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    type: Mapped[str] = mapped_column(String(50), nullable=False) # Cash, Bank, M-Pesa, Credit Card, PayPal, Savings
    balance: Mapped[float] = mapped_column(Numeric(12, 2), default=0.0)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="accounts")
    transactions: Mapped[list["Transaction"]] = relationship("Transaction", back_populates="account")
