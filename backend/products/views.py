from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django_filters.rest_framework import DjangoFilterBackend

from .models import Product, ProductImage
from .serializers import ProductSerializer, ProductImageSerializer


class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Product.objects.filter(is_active=True)
    serializer_class = ProductSerializer
    lookup_field = "slug"
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["card_count"]


@api_view(["GET"])
@permission_classes([AllowAny])
def product_images(request, slug):
    product = get_object_or_404(Product, slug=slug)
    images = product.gallery_images.all()
    return Response(ProductImageSerializer(images, many=True).data)


@api_view(["POST"])
@permission_classes([IsAdminUser])
@parser_classes([MultiPartParser, FormParser])
def admin_upload_product_image(request, slug):
    product = get_object_or_404(Product, slug=slug)
    image_file = request.FILES.get("image")
    if not image_file:
        return Response(
            {"error": "Kein Bild hochgeladen"}, status=status.HTTP_400_BAD_REQUEST
        )

    alt_text = request.data.get("alt_text", "")
    is_primary = request.data.get("is_primary", "false").lower() == "true"
    order = int(request.data.get("order", 0))

    if is_primary:
        product.gallery_images.filter(is_primary=True).update(is_primary=False)

    img = ProductImage.objects.create(
        product=product,
        image=image_file,
        alt_text=alt_text,
        is_primary=is_primary,
        order=order,
    )
    return Response(ProductImageSerializer(img).data, status=status.HTTP_201_CREATED)


@api_view(["PATCH", "DELETE"])
@permission_classes([IsAdminUser])
def admin_manage_product_image(request, slug, image_id):
    product = get_object_or_404(Product, slug=slug)
    img = get_object_or_404(ProductImage, id=image_id, product=product)

    if request.method == "DELETE":
        img.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    if "is_primary" in request.data:
        is_primary = request.data["is_primary"]
        if is_primary:
            product.gallery_images.filter(is_primary=True).update(is_primary=False)
        img.is_primary = is_primary

    if "order" in request.data:
        img.order = request.data["order"]

    if "alt_text" in request.data:
        img.alt_text = request.data["alt_text"]

    img.save()
    return Response(ProductImageSerializer(img).data)


@api_view(["PATCH"])
@permission_classes([IsAdminUser])
def admin_update_product(request, pk):
    product = get_object_or_404(Product, pk=pk)

    allowed_fields = [
        "name", "slug", "description", "card_count", "price", "features", "is_active"
    ]
    for field in allowed_fields:
        if field in request.data:
            setattr(product, field, request.data[field])

    if "image" in request.FILES:
        product.image = request.FILES["image"]

    product.save()
    return Response(ProductSerializer(product).data)
