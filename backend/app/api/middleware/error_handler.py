"""Placeholder for consistent error responses."""

from fastapi import FastAPI
from fastapi.responses import JSONResponse


def register_error_handlers(app: FastAPI) -> None:
    @app.exception_handler(Exception)
    async def handle_generic_error(request, exc):  # type: ignore[override]
        return JSONResponse(
            status_code=500,
            content={
                "error": "internal_error",
                "message": "An unexpected error occurred",
                "details": {"type": exc.__class__.__name__},
            },
        )
