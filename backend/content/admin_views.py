"""Admin API views for content management."""
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from .models import SiteContent, CustomSection
from .serializers import SiteContentSerializer, CustomSectionSerializer


# === SITE CONTENT ADMIN VIEWS ===

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_site_content_list(request):
    """List all site content items."""
    items = SiteContent.objects.all().order_by('section', 'order', 'key')
    data = []
    for item in items:
        data.append({
            'id': item.id,
            'section': item.section,
            'section_display': item.get_section_display(),
            'key': item.key,
            'key_display': item.get_key_display(),
            'content': item.content,
            'content_en': item.content_en,
            'image': item.image.url if item.image else None,
            'order': item.order,
            'is_active': item.is_active,
        })
    return Response(data)


@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated])
def admin_site_content_detail(request, pk):
    """Get or update a site content item."""
    item = get_object_or_404(SiteContent, pk=pk)

    if request.method == 'GET':
        return Response({
            'id': item.id,
            'section': item.section,
            'section_display': item.get_section_display(),
            'key': item.key,
            'key_display': item.get_key_display(),
            'content': item.content,
            'content_en': item.content_en,
            'order': item.order,
            'is_active': item.is_active,
        })

    elif request.method == 'PATCH':
        allowed_fields = ['content', 'content_en', 'is_active']
        for field in allowed_fields:
            if field in request.data:
                setattr(item, field, request.data[field])
        item.save()
        return Response({'id': item.id, 'content': item.content, 'content_en': item.content_en})


# === CUSTOM SECTION ADMIN VIEWS ===

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_sections_list(request):
    """List all sections with full data."""
    sections = CustomSection.objects.prefetch_related('images', 'site_contents').all()
    serializer = CustomSectionSerializer(sections, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def admin_section_reorder(request):
    """Reorder sections by providing list of {id, order} objects."""
    items = request.data.get('items', [])
    for item in items:
        CustomSection.objects.filter(pk=item['id']).update(order=item['order'])
    return Response({'status': 'ok'})
