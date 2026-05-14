from rest_framework import serializers
from .models import HomeFeature, CustomSection, SectionImage, Page


class HomeFeatureSerializer(serializers.ModelSerializer):
    class Meta:
        model = HomeFeature
        fields = ['id', 'icon', 'title', 'description', 'order', 'is_active']


class SectionImageSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = SectionImage
        fields = ['id', 'image', 'image_url', 'alt_text', 'order']

    def get_image_url(self, obj):
        if obj.image:
            return obj.image.url
        return None


class CustomSectionSerializer(serializers.ModelSerializer):
    images = SectionImageSerializer(many=True, read_only=True)
    template_type_display = serializers.CharField(
        source='get_template_type_display', read_only=True
    )
    page_id = serializers.PrimaryKeyRelatedField(
        queryset=Page.objects.all(),
        source='page',
        required=True
    )
    page_title = serializers.CharField(source='page.title', read_only=True)

    class Meta:
        model = CustomSection
        fields = [
            'id', 'page_id', 'page_title', 'title', 'anchor', 'template_type',
            'template_type_display', 'content', 'order', 'is_active', 'images', 'created_at',
        ]
