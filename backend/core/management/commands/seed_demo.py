import random
from decimal import Decimal

from django.core.management import call_command
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from core.models import AuditLog, Church, EvangelismRecord, Jimbo, Mtaa, Offering, OfferingType, User

DEMO_PASSWORD = "Demo@2026"

STRUCTURE = {
    "Mtaa wa Kinondoni": {
        "leader": "Mzee Petro Mushi",
        "location": "Kinondoni, Dar es Salaam",
        "churches": [
            ("Kanisa la Mwenge", "Mch. Yohana Mbwambo", 185),
            ("Kanisa la Tegeta", "Mch. Anna Lyimo", 142),
            ("Kanisa la Kawe", "Mch. Daudi Kimaro", 96),
        ],
    },
    "Mtaa wa Ilala": {
        "leader": "Mzee Samweli Nnko",
        "location": "Ilala, Dar es Salaam",
        "churches": [
            ("Kanisa la Buguruni", "Mch. Eliya Massawe", 210),
            ("Kanisa la Tabata", "Mch. Neema Urio", 124),
        ],
    },
    "Mtaa wa Temeke": {
        "leader": "Mzee Yakobo Shirima",
        "location": "Temeke, Dar es Salaam",
        "churches": [
            ("Kanisa la Mbagala", "Mch. Paulo Temba", 167),
            ("Kanisa la Chang'ombe", "Mch. Rehema Swai", 88),
            ("Kanisa la Kigamboni", "Mch. Isaya Mollel", 73),
        ],
    },
}

# Kiasi cha msingi (TSh) kwa kila aina ya toleo kwa kanisa lenye wanachama 100 kwa mwezi
BASE_AMOUNTS = {
    "zaka": 850_000,
    "shukrani": 320_000,
    "kambi": 90_000,
    "ujenzi-jimbo": 120_000,
    "majengo-kanisa": 200_000,
}

CHURCH_COORDS = (-6.80, 39.25)


def last_months(count):
    """Rudisha (mwezi, mwaka) ya miezi `count` iliyopita, ukiwemo mwezi huu."""
    now = timezone.localtime()
    month, year = now.month, now.year
    out = []
    for _ in range(count):
        out.append((month, year))
        month -= 1
        if month == 0:
            month, year = 12, year - 1
    return list(reversed(out))


class Command(BaseCommand):
    help = "Jaza database na data ya demo (Jimbo, Mitaa, Makanisa, Uinjilisti, Matoleo na watumiaji wa kila role)"

    def add_arguments(self, parser):
        parser.add_argument("--reset", action="store_true", help="Futa data zote za demo kwanza kisha jaza upya")
        parser.add_argument("--months", type=int, default=12, help="Idadi ya miezi ya taarifa (default 12)")

    @transaction.atomic
    def handle(self, *args, **options):
        rng = random.Random(2026)  # data ile ile kila mara
        call_command("seed_defaults", verbosity=0)

        if options["reset"]:
            AuditLog.objects.all().delete()
            Offering.objects.all().delete()
            EvangelismRecord.objects.all().delete()
            User.objects.filter(username__startswith="demo_").delete()
            Church.objects.all().delete()
            Mtaa.objects.all().delete()
            Jimbo.objects.all().delete()
        elif Jimbo.objects.filter(name="Jimbo la Mashariki (Demo)").exists():
            self.stdout.write(self.style.WARNING("Data ya demo ipo tayari. Tumia --reset kuijaza upya."))
            return

        jimbo = Jimbo.objects.create(
            name="Jimbo la Mashariki (Demo)",
            district="Dar es Salaam",
            region="Tanzania",
            address="S.L.P 1234, Dar es Salaam",
            phone="+255 700 000 000",
            email="jimbo@yesayaministry.org",
        )

        types = {t.slug: t for t in OfferingType.objects.filter(is_active=True)}
        months = last_months(options["months"])
        first_mtaa = first_church = None

        for mtaa_name, info in STRUCTURE.items():
            mtaa = Mtaa.objects.create(
                jimbo=jimbo,
                name=mtaa_name,
                leader_name=info["leader"],
                phone=f"+255 71{rng.randint(1000000, 9999999)}",
                location=info["location"],
            )
            first_mtaa = first_mtaa or mtaa
            for church_name, pastor, members in info["churches"]:
                church = Church.objects.create(
                    mtaa=mtaa,
                    name=church_name,
                    pastor_name=pastor,
                    phone=f"+255 75{rng.randint(1000000, 9999999)}",
                    address=f"{church_name.replace('Kanisa la ', '')}, {info['location']}",
                    member_count=members,
                )
                first_church = first_church or church
                self._records(church, months, types, rng)

        self._users(first_mtaa, first_church)
        self._summary(jimbo)

    def _records(self, church, months, types, rng):
        size = church.member_count / 100
        lat = Decimal(str(round(CHURCH_COORDS[0] + rng.uniform(-0.08, 0.08), 6)))
        lng = Decimal(str(round(CHURCH_COORDS[1] + rng.uniform(-0.08, 0.08), 6)))
        for month, year in months:
            EvangelismRecord.objects.create(
                church=church,
                month=month,
                year=year,
                baptized=rng.randint(0, int(4 * size) + 1),
                converted=rng.randint(1, int(8 * size) + 2),
                visited=rng.randint(10, int(40 * size) + 11),
                supported=rng.randint(0, int(10 * size) + 1),
                comments=rng.choice(["", "Mkutano wa injili ulifanyika.", "Ziara za nyumba kwa nyumba.", "Semina ya vijana."]),
                latitude=lat,
                longitude=lng,
            )
            for slug, base in BASE_AMOUNTS.items():
                offering_type = types.get(slug)
                if not offering_type:
                    continue
                # Kambi na Ujenzi wa Jimbo hazitolewi kila mwezi
                if slug in ("kambi", "ujenzi-jimbo") and rng.random() < 0.5:
                    continue
                amount = round(base * size * rng.uniform(0.7, 1.3), -3)
                Offering.objects.create(
                    church=church,
                    offering_type=offering_type,
                    amount=Decimal(amount),
                    month=month,
                    year=year,
                    latitude=lat,
                    longitude=lng,
                )

    def _users(self, mtaa, church):
        accounts = [
            ("demo_admin", "Msimamizi Mkuu (Demo)", "super_admin", {}),
            ("demo_jimbo", "Msimamizi wa Jimbo (Demo)", "jimbo_admin", {}),
            ("demo_mtaa", "Kiongozi wa Mtaa (Demo)", "mtaa_leader", {"assigned_mtaa": mtaa}),
            ("demo_kanisa", "Kiongozi wa Kanisa (Demo)", "church_leader", {"assigned_church": church}),
            ("demo_viewer", "Mwangaliazi (Demo)", "viewer", {}),
        ]
        for username, full_name, role, extra in accounts:
            user, _ = User.objects.update_or_create(
                username=username,
                defaults={
                    "full_name": full_name,
                    "role": role,
                    "email": f"{username}@yesayaministry.org",
                    "phone": "+255 700 111 222",
                    "is_active": True,
                    "is_staff": role == "super_admin",
                    "is_superuser": role == "super_admin",
                    **extra,
                },
            )
            user.set_password(DEMO_PASSWORD)
            user.save()

    def _summary(self, jimbo):
        w = self.stdout.write
        w(self.style.SUCCESS("Data ya demo imejazwa:"))
        w(f"  Jimbo: {jimbo.name}")
        w(f"  Mitaa: {Mtaa.objects.count()}  Makanisa: {Church.objects.count()}")
        w(f"  Uinjilisti: {EvangelismRecord.objects.count()}  Matoleo: {Offering.objects.count()}")
        w(f"  Watumiaji (nenosiri '{DEMO_PASSWORD}'): demo_admin, demo_jimbo, demo_mtaa, demo_kanisa, demo_viewer")
