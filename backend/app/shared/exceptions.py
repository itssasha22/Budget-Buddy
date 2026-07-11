from typing import Any
from fastapi.responses import JSONResponse


class AppException(Exception):
    def __init__(self, message: str, code: str = "APP_ERROR", status_code: int = 400):
        self.message = message
        self.code = code
        self.status_code = status_code
        super().__init__(self.message)


class NotFoundException(AppException):
    def __init__(self, resource: str = "Resource"):
        super().__init__(
            message=f"{resource} not found.",
            code="NOT_FOUND",
            status_code=404,
        )


class UnauthorizedException(AppException):
    def __init__(self, message: str = "Unauthorized."):
        super().__init__(message=message, code="UNAUTHORIZED", status_code=401)


class ForbiddenException(AppException):
    def __init__(self, message: str = "Forbidden."):
        super().__init__(message=message, code="FORBIDDEN", status_code=403)


class ValidationException(AppException):
    def __init__(self, errors: list[dict[str, Any]]):
        self.errors = errors
        super().__init__(
            message="Validation failed.",
            code="VALIDATION_ERROR",
            status_code=422,
        )


def app_exception_handler(request, exc: AppException):
    payload = {
        "success": False,
        "message": exc.message,
        "code": exc.code,
    }
    if hasattr(exc, "errors"):
        payload["errors"] = exc.errors
    return JSONResponse(status_code=exc.status_code, content=payload)
