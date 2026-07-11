from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.bills.schemas import BillCreate, BillUpdate, BillResponse
from app.bills.services import BillService
from app.auth.dependencies import get_current_active_user
from app.shared.database.session import get_db
from app.shared.exceptions import AppException
from app.auth.models import User
import uuid

router = APIRouter(prefix="/bills", tags=["bills"])


@router.post("", response_model=BillResponse, status_code=status.HTTP_201_CREATED)
async def create_bill(data: BillCreate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    service = BillService(db)
    return await service.create_bill(current_user.id, data)


@router.get("", response_model=list[BillResponse])
async def get_bills(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    service = BillService(db)
    return await service.get_bills(current_user.id)


@router.patch("/{id}", response_model=BillResponse)
async def update_bill(id: uuid.UUID, data: BillUpdate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    service = BillService(db)
    return await service.update_bill(current_user.id, id, data)


@router.post("/{id}/pay", response_model=BillResponse)
async def pay_bill(id: uuid.UUID, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    service = BillService(db)
    return await service.pay_bill(current_user.id, id)
