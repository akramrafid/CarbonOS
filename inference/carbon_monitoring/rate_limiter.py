"""
Thread-safe sliding-window rate limiter for FastAPI endpoints.
Zero external dependencies. Enforces per-client or per-user request limits
and returns HTTP 429 with Retry-After header.
"""
import os
import time
import threading
from collections import defaultdict, deque
from typing import Dict, Deque, Optional
from fastapi import Request, HTTPException


class SlidingWindowRateLimiter:
    """
    In-memory thread-safe rate limiter using sliding timestamp windows.
    """
    MAX_BUCKETS = 10000

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

        # [COMMENTED OUT FOR PERSONAL REFERENCE — arbitrary demo-* Bearer prefix let callers mint unlimited rate-limit buckets]
        # auth_header = request.headers.get("Authorization", "")
        # if auth_header.lower().startswith("bearer "):
        #     token = auth_header[7:].strip()
        #     if token.startswith("demo-"):
        #         return f"{self.key_prefix}:token:{token}"

        # Fallback to client host; only honor X-Forwarded-For when explicitly trusted behind reverse proxy
        client_ip = request.client.host if (request.client and request.client.host) else "127.0.0.1"
        if os.getenv("TRUST_PROXY_HEADERS", "false").lower() == "true":
            forwarded = request.headers.get("X-Forwarded-For")
            if forwarded:
                # Rightmost hop added by trusted proxy cannot be spoofed by client header prefixing
                hops = [h.strip() for h in forwarded.split(",") if h.strip()]
                if hops:
                    client_ip = hops[-1]

        return f"{self.key_prefix}:ip:{client_ip}"

    def check(self, request: Request) -> None:
        key = self._resolve_client_key(request)
        now = time.time()
        window_start = now - self.window_seconds

        with self._lock:
            if key not in self._windows and len(self._windows) >= self.MAX_BUCKETS:
                stale_keys = [
                    k for k, dq in self._windows.items()
                    if not dq or dq[-1] < window_start
                ]
                for sk in stale_keys:
                    del self._windows[sk]
                if len(self._windows) >= self.MAX_BUCKETS:
                    oldest_key = next(iter(self._windows))
                    del self._windows[oldest_key]
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

