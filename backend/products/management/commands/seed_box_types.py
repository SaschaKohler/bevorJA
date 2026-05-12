from django.core.management.base import BaseCommand

from products.models import BoxType


class Command(BaseCommand):
    help = "Initialize default box types (Audio and Wood)"

    BOX_TYPES_DATA = [
        {
            "name": "Vorja Audio-Box",
            "slug": "audio-box",
            "box_type": "audio",
            "description": "Die klassische Audio-Box mit Hochwertiger Sprachaufzeichnung. Gäste hinterlassen persönliche Sprachnachrichten.",
            "base_price": 29.90,
            "features": ["USB-C Anschluss", "LED-Aufnahme-Anzeige", "Hochwertiges Mikrofon", "Wiederaufladbarer Akku", "Einfache Bedienung"],
            "weight_grams": 450,
            "dimensions": {"length": 18, "width": 12, "height": 8},
            "sort_order": 1,
        },
        {
            "name": "Vorja Holz-Box",
            "slug": "wood-box",
            "box_type": "wood",
            "description": "Elegante handgefertigte Holzbox zur Aufbewahrung von Karten und kleinen Erinnerungen. Ohne Audio-Funktion.",
            "base_price": 19.90,
            "features": ["Handgefertigtes Holz", "Magnetverschluss", "Samteinlage", "Gravur-Option", "Geschenkverpackung"],
            "weight_grams": 320,
            "dimensions": {"length": 20, "width": 15, "height": 10},
            "sort_order": 2,
        },
    ]

    def handle(self, *args, **options):
        self.stdout.write("Creating default box types...")

        created_count = 0
        for box_data in self.BOX_TYPES_DATA:
            box_type, created = BoxType.objects.get_or_create(
                slug=box_data["slug"],
                defaults=box_data
            )

            if created:
                self.stdout.write(f"  Created: {box_type.name}")
                created_count += 1
            else:
                self.stdout.write(f"  Exists: {box_type.name}")

        self.stdout.write(self.style.SUCCESS(f"Successfully created {created_count} box types"))
