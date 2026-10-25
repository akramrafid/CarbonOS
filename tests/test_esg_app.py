"""Standalone ESG service: startup config validation, error hygiene, request ids."""
import os
import sys
import unittest
from unittest import mock

sys.path.insert(0, os.path.dirname(__file__))
import esg_harness  # noqa: E402,F401  (test environment)
import esg_app  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402

PROD_OK = {
    "ESG_AUTH_JWKS_URL": "https://idp.example/.well-known/jwks.json", "ESG_AUTH_ISSUER": "https://idp.example/",
    "ESG_AUTH_AUDIENCE": "carbonos-esg", "DATABASE_URL": "postgresql+psycopg2://u@db/esg",
    "ALLOWED_ORIGINS": "https://app.carbonos.example",
}


class AppConfigTest(unittest.TestCase):
    def test_production_requires_secure_settings(self):
        with mock.patch.object(esg_app, "ENV", "production"):
            with mock.patch.dict(os.environ, PROD_OK):
                esg_app.validate_config()
            for key, bad in (("ESG_AUTH_JWKS_URL", ""), ("ALLOWED_ORIGINS", "*"), ("DATABASE_URL", "sqlite:///x"),
                             ("ALLOWED_ORIGINS", "http://localhost:5173")):
                with mock.patch.dict(os.environ, {**PROD_OK, key: bad}), self.assertRaises(RuntimeError):
                    esg_app.validate_config()
            with mock.patch.dict(os.environ, {**PROD_OK, "ESG_LLM_EXTRACTION_ENABLED": "true"}), \
                    self.assertRaises(RuntimeError):
                esg_app.validate_config()

    def test_errors_hide_internals_and_carry_request_id(self):
        def boom():
            raise ValueError("secret internal detail /etc/passwd")
        esg_app.app.add_api_route("/__boom", boom)
        client = TestClient(esg_app.app, raise_server_exceptions=False)
        res = client.get("/__boom", headers={"X-Request-Id": "abc123"})
        self.assertEqual(res.status_code, 500)
        self.assertNotIn("secret", res.text)
        self.assertEqual(res.json()["request_id"], "abc123")
        self.assertEqual(res.headers["x-request-id"], "abc123")
        self.assertEqual(client.get("/healthz").headers["x-content-type-options"], "nosniff")
        self.assertEqual(client.get("/api/esg/periods").status_code, 401)


if __name__ == "__main__":
    unittest.main()
