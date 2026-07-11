import uuid
from datetime import datetime
from decimal import Decimal
from sqlalchemy.ext.asyncio import AsyncSession
from app.transactions.models import Transaction, TransactionType
from app.transactions.schemas import TransactionCreate, TransactionUpdate, TransactionResponse
from app.transactions.repositories import TransactionRepository
from app.shared.exceptions import NotFoundException


class TransactionService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.transaction_repo = TransactionRepository(session)

    async def create_transaction(self, data: TransactionCreate, user_id: uuid.UUID) -> TransactionResponse:
        transaction = Transaction(
            user_id=user_id,
            account_id=data.account_id,
            category_id=data.category_id,
            type=data.type,
            amount=data.amount,
            currency=data.currency,
            merchant=data.merchant,
            description=data.description,
            transaction_date=data.transaction_date,
            payment_method=data.payment_method,
        )
        created = await self.transaction_repo.create(transaction)
        return TransactionResponse.model_validate(created)

    async def get_transactions(self, user_id: uuid.UUID) -> list[TransactionResponse]:
        transactions = await self.transaction_repo.get_by_user(user_id)
        return [TransactionResponse.model_validate(t) for t in transactions]

    async def get_transaction(self, transaction_id: uuid.UUID, user_id: uuid.UUID) -> TransactionResponse:
        transaction = await self._get_owned_transaction(transaction_id, user_id)
        return TransactionResponse.model_validate(transaction)

    async def update_transaction(self, transaction_id: uuid.UUID, data: TransactionUpdate, user_id: uuid.UUID) -> TransactionResponse:
        transaction = await self._get_owned_transaction(transaction_id, user_id)

        if data.account_id is not None:
            transaction.account_id = data.account_id
        if data.category_id is not None:
            transaction.category_id = data.category_id
        if data.type is not None:
            transaction.type = data.type
        if data.amount is not None:
            transaction.amount = data.amount
        if data.currency is not None:
            transaction.currency = data.currency
        if data.merchant is not None:
            transaction.merchant = data.merchant
        if data.description is not None:
            transaction.description = data.description
        if data.transaction_date is not None:
            transaction.transaction_date = data.transaction_date
        if data.payment_method is not None:
            transaction.payment_method = data.payment_method

        await self.transaction_repo.update(transaction)
        return TransactionResponse.model_validate(transaction)

    async def delete_transaction(self, transaction_id: uuid.UUID, user_id: uuid.UUID) -> None:
        transaction = await self._get_owned_transaction(transaction_id, user_id)
        await self.transaction_repo.delete(transaction)

    async def get_summary(self, user_id: uuid.UUID, start_date: datetime, end_date: datetime) -> dict:
        transactions = await self.transaction_repo.get_by_date_range(user_id, start_date, end_date)

        total_income = sum(t.amount for t in transactions if t.type == TransactionType.INCOME)
        total_expense = sum(t.amount for t in transactions if t.type == TransactionType.EXPENSE)

        return {
            "total_income": float(total_income),
            "total_expense": float(total_expense),
            "net": float(total_income - total_expense),
            "count": len(transactions),
        }

    async def _get_owned_transaction(self, transaction_id: uuid.UUID, user_id: uuid.UUID) -> Transaction:
        transaction = await self.transaction_repo.get_by_id(transaction_id)
        if not transaction or transaction.user_id != user_id:
            raise NotFoundException("Transaction")
        return transaction
