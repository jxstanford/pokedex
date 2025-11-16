"""Simple in-memory rate limiter placeholder."""

from collections import defaultdict, deque
from time import monotonic
from typing import Deque, DefaultDict

from fastapi import HTTPException, Request, status

from app.config import get_settings

settings = get_settings()
WINDOW_SECONDS = 60
MAX_REQUESTS = settings.rate_limit_requests_per_minute
_requests: DefaultDict[str, Deque[float]] = defaultdict(deque)


async def enforce_rate_limit(request: Request) -> None:
    client = request.client.host if request.client else "unknown"
    now = monotonic()
    queue = _requests[client]
    queue.append(now)
    while queue and now - queue[0] > WINDOW_SECONDS:
        queue.popleft()
    if len(queue) > MAX_REQUESTS:
        retry_after = int(WINDOW_SECONDS - (now - queue[0])) if queue else WINDOW_SECONDS
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail={
                "error": "rate_limit_exceeded",
                "message": "Rate limit exceeded. Maximum 10 requests per minute.",
                "details": {"retry_after_seconds": retry_after},
            },
        )


def reset_rate_limiter() -> None:
    """Testing helper to clear recorded requests."""

    _requests.clear()
