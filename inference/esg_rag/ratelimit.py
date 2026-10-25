"""
Per-user rate limits for expensive ESG endpoints (AI queries, uploads/extraction).

ponytail: in-process sliding window; each API replica counts separately. Move to the gateway or a
shared store (Redis) when running more than one replica.
"""
import os
import threading
import time
from collections import defaultdict, deque

from fastapi import Depends, HTTPException

from .auth import Principal, require


class SlidingWindow:
    def __init__(self, limit: int, seconds: float = 60.0):
        self.limit, self.seconds = limit, seconds
        self._hits = defaultdict(deque)
        self._lock = threading.Lock()

    def hit(self, key: str) -> bool:
        now = time.monotonic()
        with self._lock:
            q = self._hits[key]
            while q and now - q[0] >= self.seconds:
                q.popleft()
            if len(q) >= self.limit:
                return False
            q.append(now)
            return True


BUCKETS = {
    "ai": SlidingWindow(int(os.getenv("ESG_RATE_AI_PER_MIN", "20"))),
    "upload": SlidingWindow(int(os.getenv("ESG_RATE_UPLOAD_PER_MIN", "30"))),
}


def limited(bucket: str, permission: str):
    def dependency(principal: Principal = Depends(require(permission))) -> Principal:
        if not BUCKETS[bucket].hit(f"{principal.organization_id}:{principal.sub}"):
            raise HTTPException(429, "Too many requests; please retry in a minute", headers={"Retry-After": "60"})
        return principal
    return dependency
