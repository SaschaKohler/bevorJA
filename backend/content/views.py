from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import SiteContent, HomeFeature, CustomSection, SectionImage
from .serializers import (
    SiteContentSerializer,
    HomeFeatureSerializer,
    CustomSectionSerializer,
    SectionImageSerializer,
)


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


# --- CustomSection endpoints ---

@api_view(['GET'])
@permission_classes([AllowAny])
def list_sections(request):
    sections = CustomSection.objects.filter(is_active=True)
    return Response(CustomSectionSerializer(sections, many=True).data)


@api_view(['POST'])
@permission_classes([IsAdminUser])
def admin_create_section(request):
    serializer = CustomSectionSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['PATCH', 'DELETE'])
@permission_classes([IsAdminUser])
def admin_manage_section(request, pk):
    section = get_object_or_404(CustomSection, pk=pk)

    if request.method == 'DELETE':
        section.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    allowed_fields = ['title', 'anchor', 'template_type', 'content', 'order', 'is_active']
    for field in allowed_fields:
        if field in request.data:
            setattr(section, field, request.data[field])

    section.save()
    return Response(CustomSectionSerializer(section).data)


@api_view(['POST'])
@permission_classes([IsAdminUser])
@parser_classes([MultiPartParser, FormParser])
def admin_upload_section_image(request, pk):
    section = get_object_or_404(CustomSection, pk=pk)
    image_file = request.FILES.get('image')
    if not image_file:
        return Response(
            {'error': 'Kein Bild hochgeladen'}, status=status.HTTP_400_BAD_REQUEST
        )

    alt_text = request.data.get('alt_text', '')
    order = int(request.data.get('order', 0))

    img = SectionImage.objects.create(
        section=section,
        image=image_file,
        alt_text=alt_text,
        order=order,
    )
    return Response(SectionImageSerializer(img).data, status=status.HTTP_201_CREATED)


@api_view(['DELETE'])
@permission_classes([IsAdminUser])
def admin_delete_section_image(request, pk, image_id):
    section = get_object_or_404(CustomSection, pk=pk)
    img = get_object_or_404(SectionImage, id=image_id, section=section)
    img.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)
