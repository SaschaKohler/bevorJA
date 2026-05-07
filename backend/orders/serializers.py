from rest_framework import serializers

from .models import Order, OrderItem
from products.serializers import ProductSerializer


class OrderItemSerializer(serializers.ModelSerializer):
    product_detail = ProductSerializer(source="product", read_only=True)

    class Meta:
        model = OrderItem
        fields = ["id", "product", "product_detail", "quantity", "price", "subtotal"]
        read_only_fields = ["price", "subtotal"]


class OrderCreateItemSerializer(serializers.Serializer):
    product_id = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1)


class OrderCreateSerializer(serializers.Serializer):
    first_name = serializers.CharField(max_length=100)
    last_name = serializers.CharField(max_length=100)
    email = serializers.EmailField()
    phone = serializers.CharField(max_length=30, required=False, allow_blank=True)
    street = serializers.CharField(max_length=200)
    zip_code = serializers.CharField(max_length=10)
    city = serializers.CharField(max_length=100)
    country = serializers.CharField(max_length=100, required=False, default="Oesterreich")
    notes = serializers.CharField(required=False, allow_blank=True)
    items = OrderCreateItemSerializer(many=True)


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = [
            "id",
            "order_number",
            "status",
            "first_name",
            "last_name",
            "email",
            "phone",
            "street",
            "zip_code",
            "city",
            "country",
            "notes",
            "total",
            "items",
            "created_at",
        ]
