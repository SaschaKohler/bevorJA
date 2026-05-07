from rest_framework import serializers
from .models import SiteContent, HomeFeature


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
