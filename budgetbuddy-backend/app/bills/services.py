from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from app.bills.models import Bill
from app.bills.schemas import BillCreate, BillUpdate, BillResponse
from app.bills.repositories import BillRepository
from app.shared.exceptions import NotFoundException, ValidationException
import uuid


class BillService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.repo = BillRepository(session)

    async def create_bill(self, user_id: uuid.UUID, data: BillCreate) -> BillResponse:
        bill = Bill(
            user_id=user_id,
            name=data.name,
            amount=data.amount,
            frequency=data.frequency,
            due_date=data.due_date,
            auto_generated=data.auto_generated,
        )
        created = await self.repo.create(bill)
        return BillResponse.model_validate(created)

    async def get_bills(self, user_id: uuid.UUID) -> list[BillResponse]:
        bills = await self.repo.get_by_user(user_id)
        return [BillResponse.model_validate(b) for b in bills]

    async def get_bill(self, user_id: uuid.UUID, bill_id: uuid.UUID) -> BillResponse:
        bill = await self.repo.get(str(bill_id))
        if not bill or bill.user_id != user_id:
            raise NotFoundException("Bill")
        return BillResponse.model_validate(bill)

    async def update_bill(self, user_id: uuid.UUID, bill_id: uuid.UUID, data: BillUpdate) -> BillResponse:
        bill = await self.repo.get(str(bill_id))
        if not bill or bill.user_id != user_id:
            raise NotFoundException("Bill")

        if data.name is not None:
            bill.name = data.name
        if data.amount is not None:
            bill.amount = data.amount
        if data.frequency is not None:
            bill.frequency = data.frequency
        if data.due_date is not None:
            bill.due_date = data.due_date
        if data.status is not None:
            bill.status = data.status
        if data.auto_generated is not None:
            bill.auto_generated = data.auto_generated

        updated = await self.repo.update(bill)
        return BillResponse.model_validate(updated)

    async def delete_bill(self, user_id: uuid.UUID, bill_id: uuid.UUID) -> None:
        bill = await self.repo.get(str(bill_id))
        if not bill or bill.user_id != user_id:
            raise NotFoundException("Bill")
        await self.repo.delete(bill)

    async def pay_bill(self, user_id: uuid.UUID, bill_id: uuid.UUID) -> BillResponse:
        bill = await self.repo.get(str(bill_id))
        if not bill or bill.user_id != user_id:
            raise NotFoundException("Bill")

        if bill.status == "paid":
            raise ValidationException([{"field": "status", "code": "BILL_ALREADY_PAID"}])

        bill.status = "paid"
        updated = await self.repo.update(bill)
        return BillResponse.model_validate(updated)
