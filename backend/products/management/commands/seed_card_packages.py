from django.core.management.base import BaseCommand

from products.models import CardPackage, Occasion


class Command(BaseCommand):
    help = "Initialize default card packages (Mini, Classic, Premium)"

    CARD_PACKAGES_DATA = [
        {
            "name": "Mini",
            "slug": "mini",
            "card_count": 12,
            "price": 19.99,
            "available_designs": ["elegant", "modern", "minimal"],
            "sort_order": 1,
        },
        {
            "name": "Classic",
            "slug": "classic",
            "card_count": 24,
            "price": 29.99,
            "available_designs": ["elegant", "modern", "rustic", "floral"],
            "sort_order": 2,
        },
        {
            "name": "Premium",
            "slug": "premium",
            "card_count": 48,
            "price": 49.99,
            "available_designs": ["elegant", "modern", "rustic", "floral", "luxury", "classic"],
            "sort_order": 3,
        },
    ]

    def handle(self, *args, **options):
        self.stdout.write("Creating default card packages...")

        # Get all active occasions
        occasions = list(Occasion.objects.filter(is_active=True))

        created_count = 0
        for package_data in self.CARD_PACKAGES_DATA:
            package, created = CardPackage.objects.get_or_create(
                slug=package_data["slug"],
                defaults=package_data
            )

            if created:
                self.stdout.write(f"  Created: {package.name} ({package.card_count} Karten)")
                # Link to all occasions
                package.occasions.set(occasions)
                created_count += 1
            else:
                self.stdout.write(f"  Exists: {package.name}")
                # Ensure all occasions are linked
                existing_occasions = set(package.occasions.all())
                for occasion in occasions:
                    if occasion not in existing_occasions:
                        package.occasions.add(occasion)

        self.stdout.write(self.style.SUCCESS(f"Successfully created {created_count} card packages"))
