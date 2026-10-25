"""Membership administration and invitation tests."""
import os
import sys
import unittest

sys.path.insert(0, os.path.dirname(__file__))
from esg_harness import ESGApiTestCase, auth, token  # noqa: E402

API = "/api/esg"


def bearer(sub, email=None, verified=True, org=None):
    claims = {"email": email, "email_verified": verified} if email else {}
    h = {"Authorization": f"Bearer {token(sub, **claims)}"}
    if org:
        h["X-Organization-Id"] = org
    return h


class InvitationTest(ESGApiTestCase):
    def invite(self, email="new@alpha.example", role="data_contributor", sub="user-a"):
        return self.client.post(f"{API}/invitations", json={"email": email, "role": role}, headers=auth(sub))

    def accept(self, tok, sub="new-user", email="new@alpha.example", verified=True):
        return self.client.post(f"{API}/invitations/accept", json={"token": tok},
                                headers=bearer(sub, email, verified))

    def test_invite_and_accept_with_verified_email(self):
        res = self.invite(email="New@Alpha.example")
        self.assertEqual(res.status_code, 201, res.text)
        tok = res.json()["token"]
        self.assertEqual(self.accept(tok).json()["role"], "data_contributor")
        self.assertEqual(self.client.get(f"{API}/documents", headers=auth("new-user")).status_code, 200)
        self.assertEqual(self.accept(tok).status_code, 404)  # single use
        listed = self.client.get(f"{API}/invitations", headers=auth("user-a")).json()
        self.assertNotIn("token", listed[0])
        self.assertIsNotNone(listed[0]["accepted_at"])

    def test_wrong_or_unverified_email_and_bad_tokens_rejected(self):
        tok = self.invite().json()["token"]
        self.assertEqual(self.accept(tok, email="attacker@evil.example").status_code, 404)
        self.assertEqual(self.accept(tok, verified=False).status_code, 404)
        self.assertEqual(self.client.post(f"{API}/invitations/accept", json={"token": tok},
                                          headers=auth("no-email-claim")).status_code, 404)
        self.assertEqual(self.accept("x" * 43).status_code, 404)
        inv_id = self.client.get(f"{API}/invitations", headers=auth("user-a")).json()[0]["id"]
        self.assertEqual(self.client.delete(f"{API}/invitations/{inv_id}", headers=auth("user-a")).status_code, 204)
        self.assertEqual(self.accept(tok).status_code, 404)  # revoked

    def test_no_privilege_escalation(self):
        self.add_member(self.org_a, "admin-a", "esg_admin")
        self.add_member(self.org_a, "contrib-a", "data_contributor")
        self.assertEqual(self.invite(role="org_owner", sub="admin-a").status_code, 403)
        self.assertEqual(self.invite(sub="contrib-a").status_code, 403)
        self.assertEqual(self.invite(role="platform_god").status_code, 422)
        members = {m["user_sub"]: m["id"] for m in self.client.get(f"{API}/members", headers=auth("user-a")).json()}
        res = self.client.patch(f"{API}/members/{members['contrib-a']}", json={"role": "org_owner"}, headers=auth("admin-a"))
        self.assertEqual(res.status_code, 403)
        res = self.client.patch(f"{API}/members/{members['user-a']}", json={"role": "auditor"}, headers=auth("admin-a"))
        self.assertEqual(res.status_code, 403)

    def test_last_owner_cannot_be_removed_or_demoted(self):
        me = self.client.get(f"{API}/members", headers=auth("user-a")).json()[0]["id"]
        self.assertEqual(self.client.patch(f"{API}/members/{me}", json={"role": "auditor"},
                                           headers=auth("user-a")).status_code, 409)
        self.assertEqual(self.client.delete(f"{API}/members/{me}", headers=auth("user-a")).status_code, 409)

    def test_admin_cannot_touch_other_org_members(self):
        b_member = self.client.get(f"{API}/members", headers=auth("user-b")).json()[0]["id"]
        self.assertEqual(self.client.delete(f"{API}/members/{b_member}", headers=auth("user-a")).status_code, 404)
        self.assertEqual(self.client.patch(f"{API}/members/{b_member}", json={"role": "auditor"},
                                           headers=auth("user-a")).status_code, 404)

    def test_membership_changes_are_audited(self):
        self.add_member(self.org_a, "contrib-a", "data_contributor")
        mid = next(m["id"] for m in self.client.get(f"{API}/members", headers=auth("user-a")).json()
                   if m["user_sub"] == "contrib-a")
        self.client.patch(f"{API}/members/{mid}", json={"role": "auditor"}, headers=auth("user-a"))
        self.client.delete(f"{API}/members/{mid}", headers=auth("user-a"))
        actions = [e["action"] for e in self.client.get(f"{API}/audit-events", headers=auth("user-a")).json()["items"]]
        self.assertIn("member.role_change", actions)
        self.assertIn("member.remove", actions)


if __name__ == "__main__":
    unittest.main()
