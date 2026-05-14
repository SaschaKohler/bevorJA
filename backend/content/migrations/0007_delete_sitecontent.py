from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('content', '0006_remove_customsection_site_contents_and_more'),
    ]

    operations = [
        migrations.DeleteModel(
            name='SiteContent',
        ),
    ]
