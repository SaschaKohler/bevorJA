from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes, parser_classes, action
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.response import Response
from django.db import models
from django.shortcuts import get_object_or_404
from django_filters.rest_framework import DjangoFilterBackend

from .models import (
    Product, ProductImage,
    Occasion, BoxType, CardPackage, ProductVariant, ProductVariantImage
)
from .serializers import (
    ProductSerializer, ProductImageSerializer,
    OccasionSerializer, OccasionDetailSerializer,
    BoxTypeSerializer, CardPackageSerializer,
    ProductVariantSerializer, ProductVariantListSerializer,
    ProductVariantImageSerializer
)


# NEW: Occasion ViewSet
class OccasionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Occasion.objects.filter(is_active=True)
    serializer_class = OccasionSerializer
    lookup_field = "slug"

    def get_serializer_class(self):
        if self.action == "retrieve":
            return OccasionDetailSerializer
        return OccasionSerializer

    @action(detail=True, methods=["get"])
    def content(self, request, slug=None):
        occasion = self.get_object()
        contents = occasion.contents.all()
        from .serializers import OccasionContentSerializer
        return Response(OccasionContentSerializer(contents, many=True).data)


# NEW: BoxType ViewSet
class BoxTypeViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = BoxType.objects.filter(is_active=True)
    serializer_class = BoxTypeSerializer
    lookup_field = "slug"


# NEW: CardPackage ViewSet
class CardPackageViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = CardPackage.objects.filter(is_active=True)
    serializer_class = CardPackageSerializer
    lookup_field = "slug"

    def get_queryset(self):
        queryset = super().get_queryset()
        occasion = self.request.query_params.get("occasion")
        if occasion:
            queryset = queryset.filter(occasions__slug=occasion)
        return queryset


# NEW: ProductVariant ViewSet
class ProductVariantViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ProductVariant.objects.filter(is_active=True)
    serializer_class = ProductVariantSerializer
    lookup_field = "slug"

    def get_serializer_class(self):
        if self.action == "list":
            return ProductVariantListSerializer
        return ProductVariantSerializer

    def get_queryset(self):
        queryset = super().get_queryset()

        occasion = self.request.query_params.get("occasion")
        box_type = self.request.query_params.get("box_type")
        card_count = self.request.query_params.get("card_count")
        is_default = self.request.query_params.get("is_default")

        if occasion:
            # Filter by occasion OR universal (no occasion)
            queryset = queryset.filter(
                models.Q(occasion__slug=occasion) | models.Q(occasion__isnull=True)
            )
        elif is_default:
            # If no occasion specified and default requested, show all defaults
            pass

        if box_type:
            queryset = queryset.filter(box_type__slug=box_type)

        if card_count:
            queryset = queryset.filter(card_package__card_count=card_count)

        if is_default:
            queryset = queryset.filter(is_default=True)

        return queryset.select_related("box_type", "card_package", "occasion")


# Legacy Product ViewSet (keep for backward compatibility)
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


# NEW: Product Variant Images
@api_view(["GET"])
@permission_classes([AllowAny])
def variant_images(request, slug):
    variant = get_object_or_404(ProductVariant, slug=slug)
    images = variant.gallery_images.all()
    return Response(ProductVariantImageSerializer(images, many=True).data)


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


# NEW: Admin endpoints for Product Variants
@api_view(["POST"])
@permission_classes([IsAdminUser])
@parser_classes([MultiPartParser, FormParser])
def admin_upload_variant_image(request, slug):
    variant = get_object_or_404(ProductVariant, slug=slug)
    image_file = request.FILES.get("image")
    if not image_file:
        return Response(
            {"error": "Kein Bild hochgeladen"}, status=status.HTTP_400_BAD_REQUEST
        )

    alt_text = request.data.get("alt_text", "")
    is_primary = request.data.get("is_primary", "false").lower() == "true"
    order = int(request.data.get("order", 0))

    if is_primary:
        variant.gallery_images.filter(is_primary=True).update(is_primary=False)

    img = ProductVariantImage.objects.create(
        variant=variant,
        image=image_file,
        alt_text=alt_text,
        is_primary=is_primary,
        order=order,
    )
    return Response(ProductVariantImageSerializer(img).data, status=status.HTTP_201_CREATED)


@api_view(["PATCH", "DELETE"])
@permission_classes([IsAdminUser])
def admin_manage_variant_image(request, slug, image_id):
    variant = get_object_or_404(ProductVariant, slug=slug)
    img = get_object_or_404(ProductVariantImage, id=image_id, variant=variant)

    if request.method == "DELETE":
        img.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    if "is_primary" in request.data:
        is_primary = request.data["is_primary"]
        if is_primary:
            variant.gallery_images.filter(is_primary=True).update(is_primary=False)
        img.is_primary = is_primary

    if "order" in request.data:
        img.order = request.data["order"]

    if "alt_text" in request.data:
        img.alt_text = request.data["alt_text"]

    img.save()
    return Response(ProductVariantImageSerializer(img).data)


@api_view(["PATCH"])
@permission_classes([IsAdminUser])
def admin_update_variant(request, pk):
    variant = get_object_or_404(ProductVariant, pk=pk)

    allowed_fields = [
        "name", "slug", "description", "is_active", "is_default",
        "base_price_override", "price_adjustment", "customization_options"
    ]
    for field in allowed_fields:
        if field in request.data:
            setattr(variant, field, request.data[field])

    if "image" in request.FILES:
        variant.image = request.FILES["image"]

    variant.save()
    return Response(ProductVariantSerializer(variant).data)


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


# NEW: Configurator data endpoint
@api_view(["GET"])
@permission_classes([AllowAny])
def configurator_data(request):
    """Returns all data needed for the product configurator"""
    occasions = Occasion.objects.filter(is_active=True)
    box_types = BoxType.objects.filter(is_active=True)
    card_packages = CardPackage.objects.filter(is_active=True)

    return Response({
        "occasions": OccasionSerializer(occasions, many=True).data,
        "box_types": BoxTypeSerializer(box_types, many=True).data,
        "card_packages": CardPackageSerializer(card_packages, many=True).data,
    })
