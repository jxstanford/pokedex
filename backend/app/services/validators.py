"""Reusable validation helpers."""

from fastapi import HTTPException, status

from app.config import get_settings


settings = get_settings()


def validate_upload_size(content_length: int | None) -> None:
    if content_length is None:
        return
    if content_length > settings.max_upload_bytes:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail={
                "error": "file_too_large",
                "message": "Image size exceeds limit",
                "details": {"max_size_mb": settings.max_upload_bytes / (1024 * 1024)},
            },
        )
