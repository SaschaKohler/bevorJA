from rest_framework import serializers

from .models import Product


class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = [
            "id",
            "name",
            "slug",
            "description",
            "card_count",
            "price",
            "image",
            "features",
            "is_active",
            "created_at",
        ]
