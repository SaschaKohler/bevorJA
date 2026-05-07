from django.db import models


class SiteContent(models.Model):
    SECTION_CHOICES = [
        ('hero', 'Hero Bereich'),
        ('hero_features', 'Hero Features'),
        ('features', 'Features Bereich'),
        ('products', 'Produkte Bereich'),
        ('cta', 'Call-to-Action Bereich'),
        ('footer', 'Footer Bereich'),
    ]
    
    KEY_CHOICES = [
        # Hero
        ('title', 'Titel'),
        ('subtitle', 'Untertitel'),
        ('description', 'Beschreibung'),
        ('button_text', 'Button Text'),
        # Features
        ('feature_1_title', 'Feature 1 Titel'),
        ('feature_1_desc', 'Feature 1 Beschreibung'),
        ('feature_2_title', 'Feature 2 Titel'),
        ('feature_2_desc', 'Feature 2 Beschreibung'),
        ('feature_3_title', 'Feature 3 Titel'),
        ('feature_3_desc', 'Feature 3 Beschreibung'),
        # CTA
        ('cta_title', 'CTA Titel'),
        ('cta_description', 'CTA Beschreibung'),
        ('cta_button', 'CTA Button Text'),
        # Footer
        ('footer_tagline', 'Footer Tagline'),
        ('contact_email', 'Kontakt Email'),
    ]
    
    section = models.CharField(max_length=50, choices=SECTION_CHOICES)
    key = models.CharField(max_length=100, choices=KEY_CHOICES)
    content = models.TextField(blank=True)
    content_en = models.TextField(blank=True, verbose_name='Content (EN)')
    image = models.ImageField(upload_to='content/', blank=True, null=True)
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['section', 'order', 'key']
        verbose_name = 'Seiteninhalt'
        verbose_name_plural = 'Seiteninhalte'
        unique_together = ['section', 'key']
    
    def __str__(self):
        return f"{self.get_section_display()} - {self.get_key_display()}"


class HomeFeature(models.Model):
    """Editable features for the hero section"""
    icon = models.CharField(max_length=50, default='Heart', help_text='Lucide icon name')
    title = models.CharField(max_length=100)
    description = models.TextField()
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        ordering = ['order']
        verbose_name = 'Home Feature'
        verbose_name_plural = 'Home Features'
    
    def __str__(self):
        return self.title


class CustomSection(models.Model):
    TEMPLATE_CHOICES = [
        ('hero', 'Hero – Vollbild mit Titel & CTA'),
        ('text_image_left', 'Text + Bild (Bild links)'),
        ('text_image_right', 'Text + Bild (Bild rechts)'),
        ('features_grid', 'Features-Grid (3 oder 4 Spalten)'),
        ('testimonials', 'Testimonials / Bewertungen'),
        ('faq', 'FAQ Accordion'),
        ('gallery', 'Bildgalerie'),
        ('timeline', 'Timeline / Ablauf'),
        ('countdown', 'Countdown Timer'),
        ('video', 'Video Embed (YouTube/Vimeo)'),
        ('pricing', 'Pricing-Tabelle'),
        ('contact', 'Kontakt-Formular'),
    ]

    title = models.CharField(max_length=200)
    anchor = models.SlugField(unique=True)
    template_type = models.CharField(max_length=50, choices=TEMPLATE_CHOICES)
    content = models.JSONField(default=dict)
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    # Beziehung zu Seiteninhalten
    site_contents = models.ManyToManyField(
        SiteContent,
        related_name='custom_sections',
        blank=True,
        verbose_name='Zugeordnete Seiteninhalte'
    )

    class Meta:
        ordering = ['order']
        verbose_name = 'Custom Section'
        verbose_name_plural = 'Custom Sections'

    def __str__(self):
        return f"{self.title} ({self.get_template_type_display()})"


class SectionImage(models.Model):
    section = models.ForeignKey(
        CustomSection, on_delete=models.CASCADE, related_name='images'
    )
    image = models.ImageField(upload_to='sections/')
    alt_text = models.CharField(max_length=200, blank=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.section.title} - Bild {self.order}"
