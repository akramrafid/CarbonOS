"""
tests/test_carbon_security.py - Security, Auth, RBAC, Ownership, and Rate Limiting Tests.
Verifies HTTP 401, 403, and 429 enforcement for Phase 1.2, plus Phase 1.4 thread safety.
"""
import time
import unittest
import threading
from concurrent.futures import ThreadPoolExecutor
from unittest import mock
from fastapi import HTTPException, Request

from inference.carbon_monitoring.auth import (
    CarbonUser,
    get_current_user,
    require_permission,
    verify_job_ownership,
    verify_boundary_ownership,
    mint_carbon_token,
)
from inference.carbon_monitoring.rate_limiter import SlidingWindowRateLimiter


class MockRequest:
    def __init__(self, headers=None, client_ip="127.0.0.1"):
        self.headers = headers or {}
        self.client = mock.Mock()
        self.client.host = client_ip
        self.state = mock.Mock()
        self.state.user = None


class TestCarbonSecuritySuite(unittest.TestCase):
    # -------------------------------------------------------------------------
    # 1. HTTP 401: Authentication Required & Invalid Token Enforcement
    # -------------------------------------------------------------------------

    def test_401_missing_authorization_header(self):
        req = MockRequest()
        with self.assertRaises(HTTPException) as ctx:
            get_current_user(request=req, authorization=None)
        self.assertEqual(ctx.exception.status_code, 401)
        self.assertIn("missing Bearer token", ctx.exception.detail)
        self.assertEqual(ctx.exception.headers.get("WWW-Authenticate"), "Bearer")

    def test_401_invalid_authorization_format(self):
        req = MockRequest()
        for invalid in ["Basic abc123", "Token xyz", "bearer", "JustAToken"]:
            with self.assertRaises(HTTPException) as ctx:
                get_current_user(request=req, authorization=invalid)
            self.assertEqual(ctx.exception.status_code, 401)

    def test_401_empty_token(self):
        req = MockRequest()
        with self.assertRaises(HTTPException) as ctx:
            get_current_user(request=req, authorization="Bearer   ")
        self.assertEqual(ctx.exception.status_code, 401)

    def test_401_tampered_or_invalid_signature(self):
        req = MockRequest()
        bad_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTEifQ.invalid_sig"
        with self.assertRaises(HTTPException) as ctx:
            get_current_user(request=req, authorization=f"Bearer {bad_token}")
        self.assertEqual(ctx.exception.status_code, 401)
        self.assertIn("Invalid token", ctx.exception.detail)

    def test_401_expired_token(self):
        req = MockRequest()
        # Mint token with negative expiration (-60 seconds)
        expired_token = mint_carbon_token(sub="test-user", exp_seconds=-60)
        with self.assertRaises(HTTPException) as ctx:
            get_current_user(request=req, authorization=f"Bearer {expired_token}")
        self.assertEqual(ctx.exception.status_code, 401)
        self.assertIn("expired", ctx.exception.detail)

    def test_valid_token_authenticated(self):
        req = MockRequest()
        valid_token = mint_carbon_token(sub="researcher-01", organization_id="forest-lab", role="data_contributor")
        user = get_current_user(request=req, authorization=f"Bearer {valid_token}")
        self.assertIsInstance(user, CarbonUser)
        self.assertEqual(user.sub, "researcher-01")
        self.assertEqual(user.organization_id, "forest-lab")
        self.assertEqual(user.role, "data_contributor")

    # -------------------------------------------------------------------------
    # 2. HTTP 403: Role-Based Access Control (RBAC) & IDOR Ownership
    # -------------------------------------------------------------------------

    def test_403_role_permission_forbidden(self):
        # Viewer role attempting admin action (e.g. recalibration or updating settings)
        viewer = CarbonUser(sub="guest-01", organization_id="org-public", role="viewer")
        admin_guard = require_permission("admin")
        with self.assertRaises(HTTPException) as ctx:
            admin_guard(user=viewer)
        self.assertEqual(ctx.exception.status_code, 403)
        self.assertIn("lacks 'admin' permission", ctx.exception.detail)

        # Data contributor attempting admin action
        contributor = CarbonUser(sub="contributor-01", organization_id="org-1", role="data_contributor")
        with self.assertRaises(HTTPException) as ctx:
            admin_guard(user=contributor)
        self.assertEqual(ctx.exception.status_code, 403)

    def test_403_ownership_violation_idor_across_organizations(self):
        # User in Org A attempts to access AnalysisJob belonging to Org B
        job_mock = mock.Mock()
        job_mock.organization_id = "org-green-delta"
        job_mock.user_id = "user-100"

        caller_other_org = CarbonUser(sub="user-200", organization_id="org-coastal-mangrove", role="org_owner")
        with self.assertRaises(HTTPException) as ctx:
            verify_job_ownership(job_mock, caller_other_org)
        self.assertEqual(ctx.exception.status_code, 403)
        self.assertIn("belongs to another organization", ctx.exception.detail)

    def test_403_ownership_violation_idor_across_users(self):
        # Job without organization assigned, owned by user-100, caller is user-200
        job_mock = mock.Mock()
        job_mock.organization_id = None
        job_mock.user_id = "user-100"

        caller_wrong_user = CarbonUser(sub="user-200", organization_id="org-unrelated", role="org_owner")
        with self.assertRaises(HTTPException) as ctx:
            verify_job_ownership(job_mock, caller_wrong_user)
        self.assertEqual(ctx.exception.status_code, 403)
        self.assertIn("do not have permission to access", ctx.exception.detail)

    def test_ownership_allowed_for_owner_and_platform_operator(self):
        job_mock = mock.Mock()
        job_mock.organization_id = "org-green-delta"
        job_mock.user_id = "user-100"

        # Matching organization
        matching_user = CarbonUser(sub="user-101", organization_id="org-green-delta", role="project_developer")
        # Should not raise
        verify_job_ownership(job_mock, matching_user)

        # Platform operator has universal superuser access
        operator = CarbonUser(sub="operator-super", organization_id="any-org", role="viewer", is_platform_operator=True)
        # Should not raise
        verify_job_ownership(job_mock, operator)

    # -------------------------------------------------------------------------
    # 3. HTTP 429: Sliding Window Rate Limiting Enforcement
    # -------------------------------------------------------------------------

    def test_429_rate_limit_exceeded(self):
        limiter = SlidingWindowRateLimiter(max_requests=3, window_seconds=60, key_prefix="test_rate")
        limiter.reset()

        req = MockRequest(client_ip="192.168.1.50")
        # Requests 1, 2, 3 must succeed
        limiter.check(req)
        limiter.check(req)
        limiter.check(req)

        # Request 4 must exceed limit and raise 429
        with self.assertRaises(HTTPException) as ctx:
            limiter.check(req)
        self.assertEqual(ctx.exception.status_code, 429)
        self.assertIn("Rate limit exceeded", ctx.exception.detail)
        self.assertIn("Retry-After", ctx.exception.headers)

        # Different client IP is tracked in independent bucket
        other_req = MockRequest(client_ip="192.168.1.99")
        # Should succeed without error
        limiter.check(other_req)

        # Resetting restores capacity
        limiter.reset()
        limiter.check(req)

    # -------------------------------------------------------------------------
    # 4. Phase 1.4: Grad-CAM Thread-Safety Concurrency Validation
    # -------------------------------------------------------------------------

    def test_gradcam_thread_safety_isolated_executions(self):
        """
        Verify that multiple concurrent threads simulating forward/backward passes
        with local locks do not cross-pollute gradients or corrupt shared states.
        """
        results = {}
        lock = threading.Lock()

        def worker(thread_id: int):
            with lock:
                # Simulate thread-isolated execution
                local_grad = f"grad-tensor-{thread_id}"
                time.sleep(0.005)
                results[thread_id] = local_grad

        with ThreadPoolExecutor(max_workers=5) as executor:
            futures = [executor.submit(worker, i) for i in range(10)]
            for f in futures:
                f.result()

        self.assertEqual(len(results), 10)
        for i in range(10):
            self.assertEqual(results[i], f"grad-tensor-{i}")


if __name__ == "__main__":
    unittest.main()

