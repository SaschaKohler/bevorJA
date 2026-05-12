from django.core.management.base import BaseCommand

from products.models import BoxType, CardPackage, Occasion, ProductVariant


class Command(BaseCommand):
    help = "Create default product variants by combining box types, card packages and occasions"

    def handle(self, *args, **options):
        self.stdout.write("Creating default product variants...")

        box_types = BoxType.objects.filter(is_active=True)
        card_packages = CardPackage.objects.filter(is_active=True)
        occasions = Occasion.objects.filter(is_active=True)

        created_count = 0

        # Create variants for all combinations
        for box_type in box_types:
            for card_package in card_packages:
                # Create universal variant (no specific occasion)
                universal_variant, created = ProductVariant.objects.get_or_create(
                    box_type=box_type,
                    card_package=card_package,
                    occasion=None,
                    defaults={
                        "is_active": True,
                        "price_adjustment": 0,
                        "customization_options": {
                            "engraving": box_type.box_type == "wood",
                            "color_choice": ["natur", "dunkel"] if box_type.box_type == "wood" else [],
                            "message_card": True
                        }
                    }
                )
                if created:
                    self.stdout.write(f"  Created universal: {universal_variant.name}")
                    created_count += 1

                # Create occasion-specific variants
                for occasion in occasions:
                    variant, created = ProductVariant.objects.get_or_create(
                        box_type=box_type,
                        card_package=card_package,
                        occasion=occasion,
                        defaults={
                            "is_active": True,
                            "price_adjustment": 0,
                            "customization_options": {
                                "engraving": box_type.box_type == "wood",
                                "color_choice": ["natur", "dunkel"] if box_type.box_type == "wood" else [],
                                "message_card": True,
                                "occasion_designs": card_package.available_designs
                            }
                        }
                    )
                    if created:
                        self.stdout.write(f"  Created for {occasion.name}: {variant.name}")
                        created_count += 1

        # Mark one variant as default (Hochzeit + Classic + Audio)
        try:
            default_variant = ProductVariant.objects.get(
                box_type__slug="audio-box",
                card_package__slug="classic",
                occasion__slug="hochzeit"
            )
            default_variant.is_default = True
            default_variant.save()
            self.stdout.write(f"  Set as default: {default_variant.name}")
        except ProductVariant.DoesNotExist:
            pass

        self.stdout.write(self.style.SUCCESS(f"Successfully created {created_count} product variants"))
