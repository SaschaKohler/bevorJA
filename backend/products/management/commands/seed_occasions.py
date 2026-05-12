from django.core.management.base import BaseCommand

from products.models import Occasion, OccasionContent


class Command(BaseCommand):
    help = "Initialize default occasions for the flexible framework"

    OCCASIONS_DATA = [
        {
            "name": "Hochzeit",
            "slug": "hochzeit",
            "description": "Die schönsten Wünsche für Ihren großen Tag",
            "icon": "Heart",
            "is_default": True,
            "color_primary": "#d4a574",
            "color_secondary": "#8b7355",
            "sort_order": 1,
            "content": {
                "hero_title": "Unvergessliche Wünsche",
                "hero_subtitle": "für Ihren großen Tag",
                "hero_description": "Mit Vorja bewahren Sie die herzlichsten Grüße und Wünsche Ihrer Hochzeitsgäste in einer wunderschönen Audio- und Kartenbox für die Ewigkeit auf.",
                "product_title": "Unsere Boxen für Ihre Hochzeit",
                "product_description": "Wählen Sie die perfekte Größe für Ihre Feier",
                "box_audio_title": "Audio-Hörbox",
                "box_audio_description": "Mit persönlichen Sprachnachrichten Ihrer Gäste",
                "box_wood_title": "Holz-Erinnerungsbox",
                "box_wood_description": "Elegante Aufbewahrung für Ihre Karten",
                "cta_title": "Bereit für unvergessliche Erinnerungen?",
                "cta_description": "Bestellen Sie jetzt Ihre Vorja-Box und machen Sie Ihre Hochzeit noch unvergesslicher.",
            },
        },
        {
            "name": "Geburtstag",
            "slug": "geburtstag",
            "description": "Glückwünsche für jedes Lebensjahr",
            "icon": "Gift",
            "color_primary": "#f59e0b",
            "color_secondary": "#d97706",
            "sort_order": 2,
            "content": {
                "hero_title": "Glückwünsche zum Fest",
                "hero_subtitle": "für Geburtstage jeder Art",
                "hero_description": "Ob 18., 50. oder 80. Geburtstag – sammeln Sie die herzlichsten Wünsche Ihrer Gäste in einer wunderschönen Box.",
                "product_title": "Unsere Geburtstags-Boxen",
                "product_description": "Die perfekte Geschenkidee für jeden Jubilar",
                "box_audio_title": "Audio-Glückwunschbox",
                "box_audio_description": "Mit persönlichen Geburtstagsgrüßen",
                "box_wood_title": "Erinnerungsbox",
                "box_wood_description": "Für Karten und kleine Geschenke",
                "cta_title": "Machen Sie den Geburtstag unvergesslich?",
                "cta_description": "Bestellen Sie jetzt und überraschen Sie den Jubilar mit einzigartigen Erinnerungen.",
            },
        },
        {
            "name": "Taufe",
            "slug": "taufe",
            "description": "Segenswünsche für das neue Leben",
            "icon": "Baby",
            "color_primary": "#60a5fa",
            "color_secondary": "#3b82f6",
            "sort_order": 3,
            "content": {
                "hero_title": "Segenswünsche",
                "hero_subtitle": "für den wichtigsten Tag Ihres Kindes",
                "hero_description": "Bewahren Sie die liebevollen Wünsche und Segen der Tauf-Gäste für Ihr Kind – ein Schatz fürs Leben.",
                "product_title": "Unsere Tauf-Boxen",
                "product_description": "Zarte Erinnerungen für einen besonderen Tag",
                "box_audio_title": "Audio-Segensbox",
                "box_audio_description": "Mit persönlichen Segenswünschen",
                "box_wood_title": "Tauf-Erinnerungsbox",
                "box_wood_description": "Zur Aufbewahrung von Karten und Erinnerungen",
                "cta_title": "Bereit für Tauferinnerungen?",
                "cta_description": "Bestellen Sie jetzt Ihre Tauf-Box und sammeln Sie liebevolle Wünsche.",
            },
        },
        {
            "name": "Kommunion / Konfirmation",
            "slug": "kommunion",
            "description": "Glaubenswünsche für den besonderen Tag",
            "icon": "Cross",
            "color_primary": "#a78bfa",
            "color_secondary": "#8b5cf6",
            "sort_order": 4,
            "content": {
                "hero_title": "Glaubenswünsche",
                "hero_subtitle": "für diesen besonderen Tag",
                "hero_description": "Sammeln Sie die herzlichen Glückwünsche und Segen für die Kommunion oder Konfirmation Ihres Kindes.",
                "product_title": "Unsere Kommunions-Boxen",
                "product_description": "Glaubenswünsche für die Ewigkeit bewahrt",
                "box_audio_title": "Audio-Glaubensbox",
                "box_audio_description": "Mit persönlichen Glaubenswünschen",
                "box_wood_title": "Kommunion-Erinnerungsbox",
                "box_wood_description": "Für Karten und religiöse Erinnerungen",
                "cta_title": "Bereit für Kommunionserinnerungen?",
                "cta_description": "Bestellen Sie jetzt und bewahren Sie die Wünsche für die Ewigkeit.",
            },
        },
        {
            "name": "Baby Shower",
            "slug": "baby-shower",
            "description": "Wünsche für die werdenden Eltern",
            "icon": "HeartHandshake",
            "color_primary": "#f472b6",
            "color_secondary": "#ec4899",
            "sort_order": 5,
            "content": {
                "hero_title": "Wünsche für die Eltern",
                "hero_subtitle": "vor dem großen Tag",
                "hero_description": "Sammeln Sie die aufregendsten Wünsche und Ratschläge für die werdenden Eltern auf Ihrer Baby Shower.",
                "product_title": "Unsere Baby Shower Boxen",
                "product_description": "Die schönste Erinnerung an die Vorfreude",
                "box_audio_title": "Audio-Wunschbox",
                "box_audio_description": "Mit Ratschlägen und Glückwünschen",
                "box_wood_title": "Baby-Erinnerungsbox",
                "box_wood_description": "Für Karten und erste Erinnerungen",
                "cta_title": "Bereit für die Baby Shower?",
                "cta_description": "Bestellen Sie jetzt und machen Sie die Feier unvergesslich.",
            },
        },
        {
            "name": "Abschied / Ruhestand",
            "slug": "abschied",
            "description": "Wertschätzung für einen neuen Lebensabschnitt",
            "icon": "Sunset",
            "color_primary": "#fb923c",
            "color_secondary": "#f97316",
            "sort_order": 6,
            "content": {
                "hero_title": "Wertschätzung",
                "hero_subtitle": "für einen neuen Abschnitt",
                "hero_description": "Ob Ruhestand oder beruflicher Abschied – sammeln Sie die wertvollsten Wünsche und Erinnerungen.",
                "product_title": "Unsere Abschieds-Boxen",
                "product_description": "Für den würdigen Abschluss",
                "box_audio_title": "Audio-Abschiedsbox",
                "box_audio_description": "Mit persönlichen Wertschätzungen",
                "box_wood_title": "Abschieds-Erinnerungsbox",
                "box_wood_description": "Für Erinnerungen an gemeinsame Zeit",
                "cta_title": "Zeigen Sie Wertschätzung?",
                "cta_description": "Bestellen Sie jetzt für den perfekten Abschied.",
            },
        },
        {
            "name": "Trauerfeier / Gedenken",
            "slug": "trauer",
            "description": "Erinnerungen an geliebte Menschen",
            "icon": "Flower2",
            "color_primary": "#94a3b8",
            "color_secondary": "#64748b",
            "sort_order": 7,
            "content": {
                "hero_title": "Erinnerungen bewahren",
                "hero_subtitle": "an geliebte Menschen",
                "hero_description": "Bewahren Sie die liebevollen Worte und Erinnerungen an einen besonderen Menschen – ein Trost in schweren Zeiten.",
                "product_title": "Unsere Gedenk-Boxen",
                "product_description": "Würdevolle Erinnerung",
                "box_audio_title": "Audio-Gedenkbox",
                "box_audio_description": "Mit persönlichen Erinnerungen",
                "box_wood_title": "Gedenk-Erinnerungsbox",
                "box_wood_description": "Zur würdevollen Aufbewahrung",
                "cta_title": "Erinnerungen bewahren?",
                "cta_description": "Bestellen Sie jetzt für einen würdevollen Gedenken.",
            },
        },
        {
            "name": "Jubiläum",
            "slug": "jubilaeum",
            "description": "Meilensteine feiern",
            "icon": "Award",
            "color_primary": "#10b981",
            "color_secondary": "#059669",
            "sort_order": 8,
            "content": {
                "hero_title": "Meilensteine feiern",
                "hero_subtitle": "von Hochzeit bis Firmenjubiläum",
                "hero_description": "Silberhochzeit, Goldene Hochzeit oder Firmenjubiläum – feiern Sie mit wertvollen Wünschen.",
                "product_title": "Unsere Jubiläums-Boxen",
                "product_description": "Für jeden wichtigen Meilenstein",
                "box_audio_title": "Audio-Jubiläumsbox",
                "box_audio_description": "Mit Glückwünschen zum Jubiläum",
                "box_wood_title": "Jubiläums-Erinnerungsbox",
                "box_wood_description": "Für Erinnerungen an gemeinsame Jahre",
                "cta_title": "Feiern Sie den Meilenstein?",
                "cta_description": "Bestellen Sie jetzt für das perfekte Jubiläum.",
            },
        },
    ]

    def handle(self, *args, **options):
        self.stdout.write("Creating default occasions...")

        created_count = 0
        for occasion_data in self.OCCASIONS_DATA:
            content_data = occasion_data.pop("content")

            occasion, created = Occasion.objects.get_or_create(
                slug=occasion_data["slug"],
                defaults=occasion_data
            )

            if created:
                self.stdout.write(f"  Created: {occasion.name}")
                created_count += 1

                # Create content for this occasion
                for key, content in content_data.items():
                    OccasionContent.objects.get_or_create(
                        occasion=occasion,
                        key=key,
                        defaults={"content": content, "content_en": ""}
                    )
            else:
                self.stdout.write(f"  Exists: {occasion.name}")

        self.stdout.write(self.style.SUCCESS(f"Successfully created {created_count} occasions"))
