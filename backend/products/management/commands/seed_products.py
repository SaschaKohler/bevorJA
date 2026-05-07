from django.core.management.base import BaseCommand

from products.models import Product


PRODUCTS = [
    {
        "name": "Vorja Mini",
        "slug": "vorja-mini",
        "description": "Die kompakte Audio-Box fuer intime Feiern. Perfekt fuer kleine Hochzeiten und besondere Anlaesse.",
        "card_count": 12,
        "price": 49.90,
        "features": [
            "12 personalisierte Karten",
            "Hochwertige Audio-Aufnahme",
            "Elegantes Design",
            "Einfache Bedienung",
            "USB-C Anschluss",
        ],
    },
    {
        "name": "Vorja Classic",
        "slug": "vorja-classic",
        "description": "Der Bestseller fuer Ihre Hochzeit. Genug Platz fuer Wuensche und Gruesse aller Gaeste.",
        "card_count": 24,
        "price": 79.90,
        "features": [
            "24 personalisierte Karten",
            "Hochwertige Audio-Aufnahme",
            "Elegantes Design",
            "Einfache Bedienung",
            "USB-C Anschluss",
            "Geschenkverpackung inklusive",
        ],
    },
    {
        "name": "Vorja Premium",
        "slug": "vorja-premium",
        "description": "Die grosse Audio-Box fuer unvergessliche Feiern. Fuer alle, die keine Wuensche auslassen moechten.",
        "card_count": 48,
        "price": 119.90,
        "features": [
            "48 personalisierte Karten",
            "Hochwertige Audio-Aufnahme",
            "Premium-Design mit Goldpraegung",
            "Einfache Bedienung",
            "USB-C Anschluss",
            "Geschenkverpackung inklusive",
            "Persoenliche Gravur moeglich",
            "Expresslieferung",
        ],
    },
]


class Command(BaseCommand):
    help = "Erstellt die Vorja-Produkte in der Datenbank"

    def handle(self, *args, **options):
        for product_data in PRODUCTS:
            product, created = Product.objects.update_or_create(
                slug=product_data["slug"],
                defaults=product_data,
            )
            action = "Erstellt" if created else "Aktualisiert"
            self.stdout.write(f"{action}: {product}")

        self.stdout.write(self.style.SUCCESS("Produkte erfolgreich angelegt!"))
