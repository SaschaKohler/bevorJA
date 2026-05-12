import uuid

from django.db import models

from products.models import Product, ProductVariant, Occasion


class Order(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Ausstehend"
        PAID = "paid", "Bezahlt"
        PROCESSING = "processing", "In Bearbeitung"
        SHIPPED = "shipped", "Versendet"
        DELIVERED = "delivered", "Zugestellt"
        CANCELLED = "cancelled", "Storniert"

    order_number = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.PENDING
    )

    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=30, blank=True)

    street = models.CharField(max_length=200)
    zip_code = models.CharField(max_length=10)
    city = models.CharField(max_length=100)
    country = models.CharField(max_length=100, default="Oesterreich")

    stripe_session_id = models.CharField(max_length=200, blank=True)
    stripe_payment_intent = models.CharField(max_length=200, blank=True)

    notes = models.TextField(blank=True)
    total = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    # NEU: Referenz zum Anlass
    occasion = models.ForeignKey(
        Occasion,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="orders"
    )

    # NEU: Personalisierungs-Details als JSON
    customization_details = models.JSONField(
        default=dict,
        blank=True,
        help_text='{"engraving": "Text", "box_color": "natur", "selected_design": "elegant"}'
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Bestellung {self.order_number} - {self.first_name} {self.last_name}"


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items")
    # LEGACY: Altes Produkt-Modell (für Rückwärtskompatibilität)
    product = models.ForeignKey(Product, on_delete=models.PROTECT, null=True, blank=True)
    # NEU: Flexible Produkt-Variante
    product_variant = models.ForeignKey(
        ProductVariant,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name="order_items"
    )
    quantity = models.PositiveIntegerField(default=1)
    price = models.DecimalField(max_digits=8, decimal_places=2)

    # NEU: Ausgewählte Personalisierung für dieses Item
    item_customization = models.JSONField(
        default=dict,
        blank=True,
        help_text='{"engraving_text": "...", "selected_design": "elegant", "box_color": "natur"}'
    )

    def __str__(self):
        return f"{self.quantity}x {self.product.name}"

    @property
    def subtotal(self):
        return self.quantity * self.price
