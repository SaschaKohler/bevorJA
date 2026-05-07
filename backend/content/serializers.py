from rest_framework import serializers
from .models import SiteContent, HomeFeature, CustomSection, SectionImage


class SiteContentSerializer(serializers.ModelSerializer):
    section_display = serializers.CharField(source='get_section_display', read_only=True)
    key_display = serializers.CharField(source='get_key_display', read_only=True)
    image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = SiteContent
        fields = ['id', 'section', 'section_display', 'key', 'key_display', 
                  'content', 'content_en', 'image', 'image_url', 'order', 'is_active']
    
    def get_image_url(self, obj):
        if obj.image:
            return obj.image.url
        return None


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

    class Meta:
        model = CustomSection
        fields = [
            'id', 'title', 'anchor', 'template_type', 'template_type_display',
            'content', 'order', 'is_active', 'images', 'created_at',
        ]
