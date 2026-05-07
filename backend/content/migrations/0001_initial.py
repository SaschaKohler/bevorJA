# Generated manually for content app

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='SiteContent',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('section', models.CharField(choices=[('hero', 'Hero Bereich'), ('hero_features', 'Hero Features'), ('features', 'Features Bereich'), ('products', 'Produkte Bereich'), ('cta', 'Call-to-Action Bereich'), ('footer', 'Footer Bereich')], max_length=50)),
                ('key', models.CharField(choices=[('title', 'Titel'), ('subtitle', 'Untertitel'), ('description', 'Beschreibung'), ('button_text', 'Button Text'), ('feature_1_title', 'Feature 1 Titel'), ('feature_1_desc', 'Feature 1 Beschreibung'), ('feature_2_title', 'Feature 2 Titel'), ('feature_2_desc', 'Feature 2 Beschreibung'), ('feature_3_title', 'Feature 3 Titel'), ('feature_3_desc', 'Feature 3 Beschreibung'), ('cta_title', 'CTA Titel'), ('cta_description', 'CTA Beschreibung'), ('cta_button', 'CTA Button Text'), ('footer_tagline', 'Footer Tagline'), ('contact_email', 'Kontakt Email')], max_length=100)),
                ('content', models.TextField(blank=True)),
                ('content_en', models.TextField(blank=True, verbose_name='Content (EN)')),
                ('image', models.ImageField(blank=True, null=True, upload_to='content/')),
                ('order', models.PositiveIntegerField(default=0)),
                ('is_active', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name': 'Seiteninhalt',
                'verbose_name_plural': 'Seiteninhalte',
                'ordering': ['section', 'order', 'key'],
                'unique_together': {('section', 'key')},
            },
        ),
        migrations.CreateModel(
            name='HomeFeature',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('icon', models.CharField(default='Heart', help_text='Lucide icon name', max_length=50)),
                ('title', models.CharField(max_length=100)),
                ('description', models.TextField()),
                ('order', models.PositiveIntegerField(default=0)),
                ('is_active', models.BooleanField(default=True)),
            ],
            options={
                'verbose_name': 'Home Feature',
                'verbose_name_plural': 'Home Features',
                'ordering': ['order'],
            },
        ),
    ]
