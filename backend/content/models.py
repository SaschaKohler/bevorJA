from django.db import models


class Page(models.Model):
    """Pages are containers for sections that can be displayed as one-page layouts."""
    TEMPLATE_CHOICES = [
        ('default', 'Standard'),
        ('landing', 'Landingpage'),
        ('shop', 'Shop'),
    ]

    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    template = models.CharField(max_length=50, choices=TEMPLATE_CHOICES, default='default')
    meta_title = models.CharField(max_length=70, blank=True)
    meta_description = models.CharField(max_length=160, blank=True)
    is_published = models.BooleanField(default=False)
    published_at = models.DateTimeField(null=True, blank=True)
    show_in_nav = models.BooleanField(default=False)
    nav_order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['nav_order', 'title']
        verbose_name = 'Seite'
        verbose_name_plural = 'Seiten'

    def __str__(self):
        return self.title

    @property
    def sections_count(self):
        return self.sections.filter(is_active=True).count()


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

    page = models.ForeignKey(
        Page,
        on_delete=models.CASCADE,
        related_name='sections',
        verbose_name='Zugeordnete Seite'
    )
    title = models.CharField(max_length=200)
    anchor = models.SlugField(unique=True)
    template_type = models.CharField(max_length=50, choices=TEMPLATE_CHOICES)
    content = models.JSONField(default=dict)
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

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
