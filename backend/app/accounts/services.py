import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from app.accounts.models import Account
from app.accounts.schemas import AccountCreate, AccountUpdate, AccountResponse
from app.accounts.repositories import AccountRepository
from app.shared.exceptions import NotFoundException


class AccountService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.account_repo = AccountRepository(session)

    async def create_account(self, data: AccountCreate, user_id: uuid.UUID) -> AccountResponse:
        account = Account(
            name=data.name,
            type=data.type,
            balance=data.balance,
            user_id=user_id,
        )
        created = await self.account_repo.create(account)
        return AccountResponse.model_validate(created)

    async def get_accounts(self, user_id: uuid.UUID) -> list[AccountResponse]:
        accounts = await self.account_repo.get_by_user(user_id)
        return [AccountResponse.model_validate(account) for account in accounts]

    async def get_account(self, account_id: uuid.UUID, user_id: uuid.UUID) -> AccountResponse:
        account = await self._get_owned_account(account_id, user_id)
        return AccountResponse.model_validate(account)

    async def update_account(self, account_id: uuid.UUID, data: AccountUpdate, user_id: uuid.UUID) -> AccountResponse:
        account = await self._get_owned_account(account_id, user_id)

        if data.name is not None:
            account.name = data.name
        if data.type is not None:
            account.type = data.type
        if data.balance is not None:
            account.balance = data.balance

        await self.account_repo.update(account)
        return AccountResponse.model_validate(account)

    async def delete_account(self, account_id: uuid.UUID, user_id: uuid.UUID) -> None:
        account = await self._get_owned_account(account_id, user_id)
        await self.account_repo.delete(account)

    async def _get_owned_account(self, account_id: uuid.UUID, user_id: uuid.UUID) -> Account:
        account = await self.account_repo.get_by_id(account_id)
        if not account or account.user_id != user_id:
            raise NotFoundException("Account")
        return account
