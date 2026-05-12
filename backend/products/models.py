from django.db import models


class Occasion(models.Model):
    """Anlässe für die Boxen (Geburtstag, Taufe, etc.)"""
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=50, default="Gift", help_text="Lucide icon name")
    sort_order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    is_default = models.BooleanField(default=False, help_text="Standard-Anlass für den Shop")

    # Theme-Farben für den Anlass
    color_primary = models.CharField(max_length=7, default="#d4a574", help_text="Hex-Farbe z.B. #d4a574")
    color_secondary = models.CharField(max_length=7, default="#8b7355", help_text="Hex-Farbe z.B. #8b7355")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["sort_order", "name"]
        verbose_name = "Anlass"
        verbose_name_plural = "Anlässe"

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        # Stelle sicher, dass nur ein Anlass als Default markiert ist
        if self.is_default:
            Occasion.objects.filter(is_default=True).update(is_default=False)
        super().save(*args, **kwargs)


class BoxType(models.Model):
    """Box-Grundtypen: Audio-Box, Holz-Box, etc."""
    BOX_TYPE_CHOICES = [
        ("audio", "Hörbox (Audio-Aufnahmen)"),
        ("wood", "Holzbox (Cards only)"),
        ("hybrid", "Hybrid (Audio + Cards)"),
    ]

    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True)
    box_type = models.CharField(max_length=20, choices=BOX_TYPE_CHOICES, default="audio")
    base_price = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    is_active = models.BooleanField(default=True)
    sort_order = models.PositiveIntegerField(default=0)

    # Technische Spezifikationen
    weight_grams = models.PositiveIntegerField(default=0, help_text="Gewicht in Gramm")
    dimensions = models.JSONField(default=dict, blank=True, help_text='{"length": 20, "width": 15, "height": 10}')

    # Spezifische Features je Box-Typ
    features = models.JSONField(default=list, blank=True, help_text="[\"USB-C\", \"LED-Anzeige\"]")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["sort_order", "name"]
        verbose_name = "Box-Typ"
        verbose_name_plural = "Box-Typen"

    def __str__(self):
        return f"{self.name} ({self.get_box_type_display()})"


class CardPackage(models.Model):
    """Kartenpakete mit verschiedenen Größen (12, 24, 48 Karten)"""
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    card_count = models.PositiveIntegerField(help_text="Anzahl der Karten")
    price = models.DecimalField(max_digits=8, decimal_places=2)
    is_active = models.BooleanField(default=True)
    sort_order = models.PositiveIntegerField(default=0)

    # Verfügbare Anlässe für dieses Paket
    occasions = models.ManyToManyField(Occasion, blank=True, related_name="card_packages")

    # Standard-Designs die verfügbar sind
    available_designs = models.JSONField(default=list, blank=True, help_text="['elegant', 'modern', 'rustic']")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["sort_order", "card_count"]
        verbose_name = "Kartenpaket"
        verbose_name_plural = "Kartenpakete"

    def __str__(self):
        return f"{self.name} ({self.card_count} Karten)"


class ProductVariant(models.Model):
    """Kombinations-Produkt aus BoxType + CardPackage + optional Occasion"""
    name = models.CharField(max_length=200, blank=True, help_text="Auto-generiert wenn leer")
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True)

    box_type = models.ForeignKey(BoxType, on_delete=models.PROTECT, related_name="variants")
    card_package = models.ForeignKey(CardPackage, on_delete=models.PROTECT, related_name="variants")
    occasion = models.ForeignKey(
        Occasion,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="variants",
        help_text="Optional: Spezifischer Anlass, oder universell wenn leer"
    )

    # Preis-Konfiguration
    base_price_override = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Optional: Überschreibe den berechneten Preis"
    )
    price_adjustment = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        default=0,
        help_text="Zuschlag zum berechneten Preis (positiv oder negativ)"
    )

    # Sichtbarkeit
    is_active = models.BooleanField(default=True)
    is_default = models.BooleanField(default=False, help_text="Standard-Variante für schnellen Kauf")

    # Bilder
    image = models.ImageField(upload_to="products/variants/", blank=True)

    # Personalisierungs-Optionen
    customization_options = models.JSONField(
        default=dict,
        blank=True,
        help_text='{"engraving": true, "color_choice": ["natur", "dunkel"], "message_card": true}'
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["box_type__sort_order", "card_package__card_count"]
        verbose_name = "Produkt-Variante"
        verbose_name_plural = "Produkt-Varianten"
        unique_together = ["box_type", "card_package", "occasion"]

    def __str__(self):
        occasion_str = f" - {self.occasion.name}" if self.occasion else ""
        return f"{self.name or self.generate_name()}{occasion_str}"

    def generate_name(self):
        """Auto-generiere den Namen aus Komponenten"""
        parts = [self.box_type.name, self.card_package.name]
        if self.occasion:
            parts.append(f"für {self.occasion.name}")
        return " ".join(parts)

    def save(self, *args, **kwargs):
        if not self.name:
            self.name = self.generate_name()
        if not self.slug:
            from django.utils.text import slugify
            base_slug = slugify(self.name)
            slug = base_slug
            counter = 1
            while ProductVariant.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug
        super().save(*args, **kwargs)

    @property
    def calculated_price(self):
        """Berechne den Preis aus Komponenten + Anpassung"""
        if self.base_price_override is not None:
            return self.base_price_override

        base = self.box_type.base_price + self.card_package.price
        return max(0, base + self.price_adjustment)

    @property
    def card_count(self):
        """Shortcut zu Kartenanzahl"""
        return self.card_package.card_count


class ProductVariantImage(models.Model):
    """Galerie-Bilder für Produkt-Varianten"""
    variant = models.ForeignKey(
        ProductVariant, on_delete=models.CASCADE, related_name="gallery_images"
    )
    image = models.ImageField(upload_to="products/variants/gallery/")
    alt_text = models.CharField(max_length=200, blank=True)
    is_primary = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return f"{self.variant.name} - Bild {self.order}"


class OccasionContent(models.Model):
    """Anlass-spezifische Inhalte für CMS"""
    CONTENT_KEY_CHOICES = [
        ("hero_title", "Hero Titel"),
        ("hero_subtitle", "Hero Untertitel"),
        ("hero_description", "Hero Beschreibung"),
        ("product_title", "Produkt-Bereich Titel"),
        ("product_description", "Produkt-Bereich Beschreibung"),
        ("box_audio_title", "Audio-Box Titel"),
        ("box_audio_description", "Audio-Box Beschreibung"),
        ("box_wood_title", "Holz-Box Titel"),
        ("box_wood_description", "Holz-Box Beschreibung"),
        ("cta_title", "CTA Titel"),
        ("cta_description", "CTA Beschreibung"),
    ]

    occasion = models.ForeignKey(Occasion, on_delete=models.CASCADE, related_name="contents")
    key = models.CharField(max_length=50, choices=CONTENT_KEY_CHOICES)
    content = models.TextField(blank=True)
    content_en = models.TextField(blank=True, verbose_name="Content (EN)")
    image = models.ImageField(upload_to="content/occasions/", blank=True, null=True)

    class Meta:
        unique_together = ["occasion", "key"]
        verbose_name = "Anlass-Inhalt"
        verbose_name_plural = "Anlass-Inhalte"

    def __str__(self):
        return f"{self.occasion.name} - {self.get_key_display()}"


# Legacy-Modelle für Migration (werden später entfernt)
class Product(models.Model):
    """LEGACY: Altes Produkt-Modell für Migration"""
    name = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    description = models.TextField()
    card_count = models.PositiveIntegerField(
        help_text="Anzahl der Karten (12, 24 oder 48)"
    )
    price = models.DecimalField(max_digits=8, decimal_places=2)
    image = models.ImageField(upload_to="products/", blank=True)
    features = models.JSONField(default=list, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Migration-Hilfsfeld
    migrated_to_variant = models.ForeignKey(
        ProductVariant,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="legacy_product"
    )

    class Meta:
        ordering = ["card_count"]

    def __str__(self):
        return f"{self.name} ({self.card_count} Karten) - LEGACY"


class ProductImage(models.Model):
    """LEGACY: Alte Produkt-Bilder"""
    product = models.ForeignKey(
        Product, on_delete=models.CASCADE, related_name="gallery_images"
    )
    image = models.ImageField(upload_to="products/gallery/")
    alt_text = models.CharField(max_length=200, blank=True)
    is_primary = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return f"{self.product.name} - Bild {self.order} - LEGACY"
