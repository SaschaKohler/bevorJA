from django.core.management.base import BaseCommand
from content.models import SiteContent, HomeFeature


class Command(BaseCommand):
    help = 'Initialize default content for the website'

    def handle(self, *args, **options):
        self.stdout.write('Creating default site content...')
        
        # Hero content
        hero_data = [
            ('title', 'Unvergessliche Wünsche', 'Unforgettable Wishes', 1),
            ('subtitle', 'für Ihren großen Tag', 'for your special day', 2),
            ('description', 'Mit Vorja bewahren Sie die herzlichsten Grüße und Wünsche Ihrer Hochzeitsgäste in einer wunderschönen Audio- und Kartenbox für die Ewigkeit auf.', 
             'With Vorja, preserve the warmest greetings and wishes from your wedding guests in a beautiful audio and card box for eternity.', 3),
            ('button_text', 'Jetzt entdecken', 'Discover now', 4),
        ]
        
        for key, content_de, content_en, order in hero_data:
            SiteContent.objects.get_or_create(
                section='hero',
                key=key,
                defaults={
                    'content': content_de,
                    'content_en': content_en,
                    'order': order,
                    'is_active': True,
                }
            )
        
        # Features section title
        SiteContent.objects.get_or_create(
            section='features',
            key='section_title',
            defaults={
                'content': 'Warum Vorja?',
                'content_en': 'Why Vorja?',
                'order': 1,
                'is_active': True,
            }
        )
        
        # Products section
        SiteContent.objects.get_or_create(
            section='products',
            key='section_title',
            defaults={
                'content': 'Unsere Boxen',
                'content_en': 'Our Boxes',
                'order': 1,
                'is_active': True,
            }
        )
        SiteContent.objects.get_or_create(
            section='products',
            key='section_description',
            defaults={
                'content': 'Wählen Sie die perfekte Größe für Ihre Feier',
                'content_en': 'Choose the perfect size for your celebration',
                'order': 2,
                'is_active': True,
            }
        )
        
        # CTA section
        cta_data = [
            ('cta_title', 'Bereit für unvergessliche Erinnerungen?', 'Ready for unforgettable memories?', 1),
            ('cta_description', 'Bestellen Sie jetzt Ihre Vorja-Box und machen Sie Ihre Hochzeit noch unvergesslicher.',
             'Order your Vorja box now and make your wedding even more unforgettable.', 2),
            ('cta_button', 'Alle Produkte ansehen', 'View all products', 3),
        ]
        
        for key, content_de, content_en, order in cta_data:
            SiteContent.objects.get_or_create(
                section='cta',
                key=key,
                defaults={
                    'content': content_de,
                    'content_en': content_en,
                    'order': order,
                    'is_active': True,
                }
            )
        
        # Home Features
        features_data = [
            ('Music', 'Audio-Aufnahmen', 'Gäste hinterlassen persönliche Sprachnachrichten, die Sie immer wieder anhören können.', 1),
            ('Gift', 'Elegantes Design', 'Hochwertige Verarbeitung mit wunderschönem Hochzeitsdesign, das perfekt zu Ihrem Fest passt.', 2),
            ('Heart', 'Erinnerung für immer', 'Bewahren Sie die schönsten Momente und Wünsche Ihrer Gäste für die Ewigkeit auf.', 3),
        ]
        
        for icon, title, description, order in features_data:
            HomeFeature.objects.get_or_create(
                title=title,
                defaults={
                    'icon': icon,
                    'description': description,
                    'order': order,
                    'is_active': True,
                }
            )
        
        self.stdout.write(self.style.SUCCESS('Successfully created default content'))
