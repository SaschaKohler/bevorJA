from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import SiteContent, HomeFeature
from .serializers import SiteContentSerializer, HomeFeatureSerializer


class SiteContentViewSet(viewsets.ModelViewSet):
    queryset = SiteContent.objects.filter(is_active=True)
    serializer_class = SiteContentSerializer
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAdminUser()]
    
    def get_queryset(self):
        section = self.request.query_params.get('section')
        if section:
            return SiteContent.objects.filter(is_active=True, section=section)
        return SiteContent.objects.filter(is_active=True)


class HomeFeatureViewSet(viewsets.ModelViewSet):
    queryset = HomeFeature.objects.filter(is_active=True).order_by('order')
    serializer_class = HomeFeatureSerializer
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAdminUser()]


@api_view(['GET'])
@permission_classes([AllowAny])
def get_home_content(request):
    """Get all content needed for the home page"""
    content = SiteContent.objects.filter(is_active=True)
    features = HomeFeature.objects.filter(is_active=True).order_by('order')
    
    # Group content by section
    content_by_section = {}
    for item in content:
        if item.section not in content_by_section:
            content_by_section[item.section] = {}
        content_by_section[item.section][item.key] = {
            'content': item.content,
            'content_en': item.content_en,
            'image': item.image.url if item.image else None,
        }
    
    return Response({
        'sections': content_by_section,
        'hero_features': HomeFeatureSerializer(features, many=True).data
    })


@api_view(['PATCH'])
@permission_classes([IsAdminUser])
def update_content(request, pk):
    """Update a specific content item"""
    content = get_object_or_404(SiteContent, pk=pk)
    
    allowed_fields = ['content', 'content_en', 'order', 'is_active']
    for field in allowed_fields:
        if field in request.data:
            setattr(content, field, request.data[field])
    
    if 'image' in request.FILES:
        content.image = request.FILES['image']
    
    content.save()
    return Response(SiteContentSerializer(content).data)
