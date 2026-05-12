from rest_framework import serializers

from .models import (
    Product, ProductImage,
    Occasion, BoxType, CardPackage, ProductVariant,
    ProductVariantImage, OccasionContent
)


class ProductImageSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = ProductImage
        fields = ["id", "image", "image_url", "alt_text", "is_primary", "order"]

    def get_image_url(self, obj):
        if obj.image:
            return obj.image.url
        return None


class ProductSerializer(serializers.ModelSerializer):
    gallery_images = ProductImageSerializer(many=True, read_only=True)

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
            "gallery_images",
        ]


# NEW: Occasion Serializers
class OccasionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Occasion
        fields = [
            "id", "name", "slug", "description", "icon",
            "color_primary", "color_secondary",
            "sort_order", "is_active", "is_default"
        ]


class OccasionContentSerializer(serializers.ModelSerializer):
    key_display = serializers.CharField(source="get_key_display", read_only=True)

    class Meta:
        model = OccasionContent
        fields = ["id", "key", "key_display", "content", "content_en", "image"]


class OccasionDetailSerializer(serializers.ModelSerializer):
    contents = OccasionContentSerializer(many=True, read_only=True)

    class Meta:
        model = Occasion
        fields = [
            "id", "name", "slug", "description", "icon",
            "color_primary", "color_secondary",
            "sort_order", "is_active", "is_default", "contents"
        ]


# NEW: Box Type Serializers
class BoxTypeSerializer(serializers.ModelSerializer):
    box_type_display = serializers.CharField(source="get_box_type_display", read_only=True)

    class Meta:
        model = BoxType
        fields = [
            "id", "name", "slug", "description",
            "box_type", "box_type_display", "base_price",
            "features", "weight_grams", "dimensions",
            "is_active", "sort_order"
        ]


# NEW: Card Package Serializers
class CardPackageSerializer(serializers.ModelSerializer):
    occasion_slugs = serializers.SlugRelatedField(
        many=True, read_only=True, source="occasions", slug_field="slug"
    )

    class Meta:
        model = CardPackage
        fields = [
            "id", "name", "slug", "card_count", "price",
            "available_designs", "occasion_slugs",
            "is_active", "sort_order"
        ]


# NEW: Product Variant Serializers
class ProductVariantImageSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = ProductVariantImage
        fields = ["id", "image", "image_url", "alt_text", "is_primary", "order"]

    def get_image_url(self, obj):
        if obj.image:
            return obj.image.url
        return None


class ProductVariantSerializer(serializers.ModelSerializer):
    box_type = BoxTypeSerializer(read_only=True)
    card_package = CardPackageSerializer(read_only=True)
    occasion = OccasionSerializer(read_only=True)
    gallery_images = ProductVariantImageSerializer(many=True, read_only=True)
    calculated_price = serializers.DecimalField(
        max_digits=8, decimal_places=2, read_only=True
    )
    card_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = ProductVariant
        fields = [
            "id", "name", "slug", "description",
            "box_type", "card_package", "occasion",
            "calculated_price", "card_count",
            "is_active", "is_default",
            "image", "gallery_images",
            "customization_options",
            "created_at"
        ]


class ProductVariantListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for lists"""
    box_type_name = serializers.CharField(source="box_type.name", read_only=True)
    box_type_slug = serializers.CharField(source="box_type.slug", read_only=True)
    card_count = serializers.IntegerField(source="card_package.card_count", read_only=True)
    occasion_name = serializers.CharField(source="occasion.name", read_only=True, allow_null=True)
    occasion_slug = serializers.CharField(source="occasion.slug", read_only=True, allow_null=True)
    calculated_price = serializers.DecimalField(
        max_digits=8, decimal_places=2, read_only=True
    )

    class Meta:
        model = ProductVariant
        fields = [
            "id", "slug", "name",
            "box_type_name", "box_type_slug", "card_count",
            "occasion_name", "occasion_slug",
            "calculated_price", "is_active", "is_default", "image"
        ]
