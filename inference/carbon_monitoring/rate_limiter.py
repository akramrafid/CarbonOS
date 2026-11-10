"""
Thread-safe sliding-window rate limiter for FastAPI endpoints.
Zero external dependencies. Enforces per-client or per-user request limits
and returns HTTP 429 with Retry-After header.
"""
import time
import threading
from collections import defaultdict, deque
from typing import Dict, Deque, Optional
from fastapi import Request, HTTPException


class SlidingWindowRateLimiter:
    """
    In-memory thread-safe rate limiter using sliding timestamp windows.
    """
    def __init__(self, max_requests: int = 60, window_seconds: int = 60, key_prefix: str = ""):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.key_prefix = key_prefix
        self._lock = threading.Lock()
        self._windows: Dict[str, Deque[float]] = defaultdict(deque)

    def _resolve_client_key(self, request: Request) -> str:
        # Check if caller has an identified user attached (e.g. from auth dependency)
        user = getattr(request.state, "user", None)
        if user and getattr(user, "sub", None):
            return f"{self.key_prefix}:user:{user.sub}"

        # Otherwise check Authorization header sub or IP
        auth_header = request.headers.get("Authorization", "")
        if auth_header.lower().startswith("bearer "):
            token = auth_header[7:].strip()
            # If demo token, extract identifier
            if token.startswith("demo-"):
                return f"{self.key_prefix}:token:{token}"

        # Fallback to client host
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            client_ip = forwarded.split(",")[0].strip()
        elif request.client and request.client.host:
            client_ip = request.client.host
        else:
            client_ip = "127.0.0.1"

        return f"{self.key_prefix}:ip:{client_ip}"

    def check(self, request: Request) -> None:
        key = self._resolve_client_key(request)
        now = time.time()
        window_start = now - self.window_seconds

        with self._lock:
            timestamps = self._windows[key]
            # Prune old timestamps
            while timestamps and timestamps[0] < window_start:
                timestamps.popleft()

            if len(timestamps) >= self.max_requests:
                oldest = timestamps[0]
                retry_after = max(1, int(oldest + self.window_seconds - now) + 1)
                raise HTTPException(
                    status_code=429,
                    detail=f"Rate limit exceeded: maximum {self.max_requests} requests per {self.window_seconds}s.",
                    headers={"Retry-After": str(retry_after)},
                )

            timestamps.append(now)

    def __call__(self, request: Request) -> None:
        self.check(request)

    def reset(self) -> None:
        with self._lock:
            self._windows.clear()


# Pre-configured rate limiters for carbon monitoring & inference
rate_limit_analyze = SlidingWindowRateLimiter(max_requests=10, window_seconds=60, key_prefix="analyze")
rate_limit_predict = SlidingWindowRateLimiter(max_requests=10, window_seconds=60, key_prefix="predict")
rate_limit_upload = SlidingWindowRateLimiter(max_requests=10, window_seconds=60, key_prefix="upload")
rate_limit_standard = SlidingWindowRateLimiter(max_requests=60, window_seconds=60, key_prefix="standard")

