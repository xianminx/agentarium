from django.core.management.base import BaseCommand
from django.core.management import call_command


class Command(BaseCommand):
    help = "Seed all initial data for the project."

    def handle(self, *args, **options):
        self.stdout.write("Seeding database...")

        call_command("loaddata", "fixtures/users.json")
        call_command("loaddata", "fixtures/agents.json")

        self.stdout.write(self.style.SUCCESS("✅ Seed complete!"))
