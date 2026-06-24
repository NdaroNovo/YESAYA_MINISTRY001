from django.core.management.base import BaseCommand
from core.models import OfferingType


class Command(BaseCommand):
    help = "Seed default offering types and split rules"

    def handle(self, *args, **options):
        defaults = [
            {
                "name": "Zaka",
                "slug": "zaka",
                "kind": "zaka",
                "church_percentage": 42,
                "field_percentage": 58,
            },
            {
                "name": "Sadaka ya Shukrani",
                "slug": "shukrani",
                "kind": "shukrani",
                "church_percentage": 42,
                "field_percentage": 58,
            },
            {
                "name": "Sadaka ya Kambi",
                "slug": "kambi",
                "kind": "kambi",
                "church_percentage": 0,
                "field_percentage": 100,
            },
            {
                "name": "Sadaka ya Ujenzi wa Jimbo",
                "slug": "ujenzi-jimbo",
                "kind": "ujenzi_jimbo",
                "church_percentage": 0,
                "field_percentage": 100,
            },
            {
                "name": "Sadaka ya Majengo ya Kanisa",
                "slug": "majengo-kanisa",
                "kind": "majengo_kanisa",
                "church_percentage": 100,
                "field_percentage": 0,
            },
        ]

        for item in defaults:
            obj, created = OfferingType.objects.update_or_create(
                slug=item["slug"],
                defaults={
                    "name": item["name"],
                    "kind": item["kind"],
                    "church_percentage": item["church_percentage"],
                    "field_percentage": item["field_percentage"],
                },
            )
            action = "Created" if created else "Updated"
            self.stdout.write(self.style.SUCCESS(f"{action}: {obj.name}"))

        self.stdout.write(self.style.SUCCESS("Default offering types seeded successfully."))
