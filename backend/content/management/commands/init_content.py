from django.core.management.base import BaseCommand
from content.models import HomeFeature


class Command(BaseCommand):
    help = 'Initialize default content for the website'

    def handle(self, *args, **options):
        self.stdout.write('Creating default site content...')
        
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
