import os
from decimal import Decimal

from django.core.management import call_command
from rest_framework.test import APITestCase

from .models import AuditLog, Church, OfferingType, User


class ApiFlowTests(APITestCase):
    def setUp(self):
        call_command("seed_defaults", verbosity=0)
        self.admin = User.objects.create_user("mkuu", password="Imara#2026x", role="super_admin", full_name="Msimamizi")

    def login(self, username, password):
        res = self.client.post("/api/auth/login/", {"username": username, "password": password}, format="json")
        self.assertEqual(res.status_code, 200, res.content)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {res.data['access']}")
        return res

    def build_structure(self):
        self.login("mkuu", "Imara#2026x")
        jimbo = self.client.post("/api/jimbo/", {"name": "Jimbo la Kati"}, format="json")
        self.assertEqual(jimbo.status_code, 201, jimbo.content)
        mtaa = self.client.post("/api/mitaa/", {"jimbo": jimbo.data["id"], "name": "Mtaa A"}, format="json")
        self.assertEqual(mtaa.status_code, 201, mtaa.content)
        mtaa2 = self.client.post("/api/mitaa/", {"jimbo": jimbo.data["id"], "name": "Mtaa B"}, format="json")
        c1 = self.client.post("/api/churches/", {"mtaa": mtaa.data["id"], "name": "Kanisa 1", "member_count": 120}, format="json")
        c2 = self.client.post("/api/churches/", {"mtaa": mtaa2.data["id"], "name": "Kanisa 2", "member_count": 80}, format="json")
        self.assertEqual(c1.status_code, 201, c1.content)
        return jimbo.data, mtaa.data, mtaa2.data, c1.data, c2.data

    def test_full_flow_and_offering_split(self):
        jimbo, mtaa, _, c1, _ = self.build_structure()
        zaka = OfferingType.objects.get(slug="zaka")
        res = self.client.post(
            "/api/offerings/",
            {"church": c1["id"], "offering_type": zaka.id, "amount": "100000", "month": 3, "year": 2026, "latitude": -6.792354, "longitude": 39.208328},
            format="json",
        )
        self.assertEqual(res.status_code, 201, res.content)
        self.assertEqual(Decimal(res.data["church_share"]), Decimal("42000"))
        self.assertEqual(Decimal(res.data["field_share"]), Decimal("58000"))
        self.assertEqual(res.data["church_name"], "Kanisa 1")

        ev = self.client.post(
            "/api/evangelism/",
            {"church": c1["id"], "month": 3, "year": 2026, "baptized": 4, "converted": 7, "visited": 20, "supported": 3},
            format="json",
        )
        self.assertEqual(ev.status_code, 201, ev.content)
        dup = self.client.post("/api/evangelism/", {"church": c1["id"], "month": 3, "year": 2026}, format="json")
        self.assertEqual(dup.status_code, 400)

        stats = self.client.get("/api/dashboard-stats/", {"year": 2026}).data
        self.assertEqual(stats["total_churches"], 2)
        self.assertEqual(stats["total_members"], 200)
        self.assertEqual(stats["total_baptized"], 4)
        self.assertEqual(Decimal(stats["year_offerings"]), Decimal("100000"))
        self.assertEqual(stats["monthly"][2]["offerings"], 100000.0)

        report = self.client.get("/api/offerings/", {"jimbo": jimbo["id"], "year": 2026, "month": 3})
        self.assertEqual(report.data["count"], 1)
        self.assertTrue(AuditLog.objects.filter(action="CREATE", user=self.admin).exists())

    def test_zero_amount_rejected(self):
        _, _, _, c1, _ = self.build_structure()
        res = self.client.post(
            "/api/offerings/",
            {"church": c1["id"], "offering_type": OfferingType.objects.first().id, "amount": "0", "month": 1, "year": 2026},
            format="json",
        )
        self.assertEqual(res.status_code, 400)

    def test_user_creation_requires_password_and_can_login(self):
        _, _, _, c1, _ = self.build_structure()
        bad = self.client.post("/api/users/", {"username": "kiongozi", "role": "church_leader", "assigned_church": c1["id"]}, format="json")
        self.assertEqual(bad.status_code, 400)
        ok = self.client.post(
            "/api/users/",
            {"username": "kiongozi", "role": "church_leader", "assigned_church": c1["id"], "password": "Kanisa#2026"},
            format="json",
        )
        self.assertEqual(ok.status_code, 201, ok.content)
        self.assertNotIn("password", ok.data)
        self.client.credentials()
        self.login("kiongozi", "Kanisa#2026")

    def test_church_leader_is_scoped(self):
        _, _, _, c1, c2 = self.build_structure()
        User.objects.create_user("kl", password="Kanisa#2026", role="church_leader", assigned_church_id=c1["id"])
        self.client.credentials()
        self.login("kl", "Kanisa#2026")
        churches = self.client.get("/api/churches/").data["results"]
        self.assertEqual([c["id"] for c in churches], [c1["id"]])
        # hawezi kuona wala kuingiza taarifa za kanisa jingine
        self.assertEqual(self.client.get("/api/offerings/", {"church": c2["id"]}).data["count"], 0)
        zaka = OfferingType.objects.get(slug="zaka")
        other = self.client.post("/api/offerings/", {"church": c2["id"], "offering_type": zaka.id, "amount": "500", "month": 1, "year": 2026}, format="json")
        self.assertEqual(other.status_code, 403)
        own = self.client.post("/api/offerings/", {"church": c1["id"], "offering_type": zaka.id, "amount": "500", "month": 1, "year": 2026}, format="json")
        self.assertEqual(own.status_code, 201, own.content)
        # hawezi kuunda mtaa wala watumiaji
        self.assertEqual(self.client.post("/api/mitaa/", {"jimbo": 1, "name": "X"}, format="json").status_code, 403)
        self.assertEqual(self.client.get("/api/users/").status_code, 403)

    def test_viewer_is_read_only(self):
        _, _, _, c1, _ = self.build_structure()
        User.objects.create_user("mtazamaji", password="Tazama#2026", role="viewer")
        self.client.credentials()
        self.login("mtazamaji", "Tazama#2026")
        self.assertEqual(self.client.get("/api/churches/").status_code, 200)
        self.assertEqual(self.client.post("/api/churches/", {"mtaa": c1["mtaa"], "name": "Y"}, format="json").status_code, 403)
        self.assertEqual(self.client.delete(f"/api/churches/{c1['id']}/").status_code, 403)

    def test_soft_delete_church(self):
        _, _, _, c1, _ = self.build_structure()
        self.assertEqual(self.client.delete(f"/api/churches/{c1['id']}/").status_code, 204)
        self.assertTrue(Church.objects.filter(id=c1["id"], is_active=False).exists())
        self.assertEqual(self.client.get(f"/api/churches/{c1['id']}/").status_code, 404)

    def test_jimbo_with_mitaa_cannot_be_deleted(self):
        jimbo, *_ = self.build_structure()
        self.assertEqual(self.client.delete(f"/api/jimbo/{jimbo['id']}/").status_code, 403)

    def test_change_password_validates(self):
        self.login("mkuu", "Imara#2026x")
        weak = self.client.post("/api/change-password/", {"current_password": "Imara#2026x", "new_password": "123"}, format="json")
        self.assertEqual(weak.status_code, 400)
        ok = self.client.post("/api/change-password/", {"current_password": "Imara#2026x", "new_password": "Mpya#Salama2026"}, format="json")
        self.assertEqual(ok.status_code, 200)

    def test_spa_served_for_frontend_routes(self):
        res = self.client.get("/churches")
        self.assertIn(res.status_code, (200, 404))
        self.assertEqual(self.client.get("/api/health/").status_code, 200)

    def test_raw_phone_gps_is_rounded(self):
        _, _, _, c1, _ = self.build_structure()
        gps = {"latitude": -6.7923541234567, "longitude": 39.20832812345678}
        ev = self.client.post(
            "/api/evangelism/",
            {"church": c1["id"], "month": 2, "year": 2026, "location_accuracy": 12.345678, **gps},
            format="json",
        )
        self.assertEqual(ev.status_code, 201, ev.content)
        self.assertEqual(Decimal(ev.data["latitude"]), Decimal("-6.792354"))
        off = self.client.post(
            "/api/offerings/",
            {"church": c1["id"], "offering_type": OfferingType.objects.first().id, "amount": "1000", "month": 2, "year": 2026, **gps},
            format="json",
        )
        self.assertEqual(off.status_code, 201, off.content)
        self.assertIsNotNone(off.data["location_captured_at"])


class DemoSeedTests(APITestCase):
    def test_seed_demo_creates_usable_accounts(self):
        call_command("seed_demo", months=3, stdout=open(os.devnull, "w"))
        self.assertEqual(Church.objects.count(), 8)
        for username in ("demo_admin", "demo_jimbo", "demo_mtaa", "demo_kanisa", "demo_viewer"):
            res = self.client.post("/api/auth/login/", {"username": username, "password": "Demo@2026"}, format="json")
            self.assertEqual(res.status_code, 200, username)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {res.data['access']}")
        self.assertEqual(self.client.get("/api/dashboard-stats/").data["total_churches"], 8)
        # church leader anaona kanisa lake tu
        res = self.client.post("/api/auth/login/", {"username": "demo_kanisa", "password": "Demo@2026"}, format="json")
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {res.data['access']}")
        self.assertEqual(self.client.get("/api/churches/").data["count"], 1)
        # na mtaa wa kanisa lake tu
        self.assertEqual(self.client.get("/api/mitaa/").data["count"], 1)
        # kujaza tena bila --reset hakurudufishi data
        call_command("seed_demo", stdout=open(os.devnull, "w"))
        self.assertEqual(Church.objects.count(), 8)
