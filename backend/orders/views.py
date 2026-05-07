from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.response import Response

from products.models import Product
from .models import Order, OrderItem
from .serializers import OrderCreateSerializer, OrderSerializer


@api_view(["POST"])
def create_order(request):
    serializer = OrderCreateSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    data = serializer.validated_data

    for item_data in data["items"]:
        if not Product.objects.filter(id=item_data["product_id"]).exists():
            return Response(
                {"error": f"Produkt {item_data['product_id']} nicht gefunden"},
                status=status.HTTP_400_BAD_REQUEST,
            )

    order = Order.objects.create(
        first_name=data["first_name"],
        last_name=data["last_name"],
        email=data["email"],
        phone=data.get("phone", ""),
        street=data["street"],
        zip_code=data["zip_code"],
        city=data["city"],
        country=data.get("country", "Oesterreich"),
        notes=data.get("notes", ""),
    )

    total = 0
    for item_data in data["items"]:
        product = Product.objects.get(id=item_data["product_id"])
        item = OrderItem.objects.create(
            order=order,
            product=product,
            quantity=item_data["quantity"],
            price=product.price,
        )
        total += item.subtotal

    order.total = total
    order.save()

    return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)


@api_view(["GET"])
def order_detail(request, order_number):
    try:
        order = Order.objects.get(order_number=order_number)
    except Order.DoesNotExist:
        return Response(
            {"error": "Bestellung nicht gefunden"},
            status=status.HTTP_404_NOT_FOUND,
        )
    return Response(OrderSerializer(order).data)


@api_view(["POST"])
@permission_classes([AllowAny])
def order_lookup(request):
    email = request.data.get("email", "").strip()
    order_number = request.data.get("order_number", "").strip()

    if not email or not order_number:
        return Response(
            {"error": "E-Mail und Bestellnummer sind erforderlich"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        order = Order.objects.get(email__iexact=email, order_number=order_number)
    except Order.DoesNotExist:
        return Response(
            {"error": "Bestellung nicht gefunden"},
            status=status.HTTP_404_NOT_FOUND,
        )

    return Response(OrderSerializer(order).data)


@api_view(["GET"])
@permission_classes([IsAdminUser])
def orders_by_email(request):
    email = request.query_params.get("email", "").strip()
    if not email:
        return Response(
            {"error": "E-Mail Parameter ist erforderlich"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    orders = Order.objects.filter(email__iexact=email)
    return Response(OrderSerializer(orders, many=True).data)
