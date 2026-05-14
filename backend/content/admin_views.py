"""Admin API views for content management."""
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone

from .models import CustomSection, Page
from .serializers import CustomSectionSerializer


# === CUSTOM SECTION ADMIN VIEWS ===

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_sections_list(request):
    """List all sections with full data, optionally filtered by page."""
    page_id = request.query_params.get('page')
    queryset = CustomSection.objects.prefetch_related('images')
    if page_id:
        queryset = queryset.filter(page_id=page_id)
    sections = queryset.all()
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


# === PAGE ADMIN VIEWS ===

def _serialize_page(page):
    """Helper to serialize a page object."""
    return {
        'id': page.id,
        'title': page.title,
        'slug': page.slug,
        'template': page.template,
        'meta_title': page.meta_title,
        'meta_description': page.meta_description,
        'is_published': page.is_published,
        'published_at': page.published_at.isoformat() if page.published_at else None,
        'show_in_nav': page.show_in_nav,
        'nav_order': page.nav_order,
        'sections_count': page.sections_count,
    }


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def admin_pages_list(request):
    """List all pages or create a new page."""
    if request.method == 'GET':
        pages = Page.objects.all().order_by('nav_order', 'title')
        data = [_serialize_page(page) for page in pages]
        return Response({'results': data, 'count': len(data)})

    elif request.method == 'POST':
        data = request.data
        page = Page.objects.create(
            title=data.get('title', ''),
            slug=data.get('slug', ''),
            template=data.get('template', 'default'),
            meta_title=data.get('meta_title', ''),
            meta_description=data.get('meta_description', ''),
            is_published=data.get('is_published', False),
            show_in_nav=data.get('show_in_nav', False),
            nav_order=data.get('nav_order', 0),
        )
        if page.is_published:
            page.published_at = timezone.now()
            page.save()
        return Response(_serialize_page(page), status=status.HTTP_201_CREATED)


@api_view(['GET', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def admin_page_detail(request, pk):
    """Retrieve, update or delete a page."""
    page = get_object_or_404(Page, pk=pk)

    if request.method == 'GET':
        return Response(_serialize_page(page))

    elif request.method == 'PATCH':
        allowed_fields = ['title', 'slug', 'template', 'meta_title', 'meta_description',
                         'is_published', 'show_in_nav', 'nav_order']
        for field in allowed_fields:
            if field in request.data:
                setattr(page, field, request.data[field])

        # Update published_at when publishing
        if 'is_published' in request.data:
            if request.data['is_published'] and not page.published_at:
                page.published_at = timezone.now()
            elif not request.data['is_published']:
                page.published_at = None

        page.save()
        return Response(_serialize_page(page))

    elif request.method == 'DELETE':
        page.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# === MEDIA ADMIN VIEWS ===

from .models import SectionImage


def _serialize_media(img):
    """Helper to serialize a media object."""
    return {
        'id': img.id,
        'file': img.image.name if img.image else '',
        'file_url': img.image.url if img.image else None,
        'title': img.alt_text or '',
        'alt_text': img.alt_text or '',
        'tags': '',
        'uploaded_at': img.section.created_at.isoformat() if hasattr(img, 'section') and img.section else None,
    }


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_media_list(request):
    """List all media images with pagination."""
    search = request.query_params.get('search', '')
    page = int(request.query_params.get('page', 1))
    page_size = 20

    queryset = SectionImage.objects.all().order_by('-id')
    if search:
        queryset = queryset.filter(alt_text__icontains=search)

    total = queryset.count()
    start = (page - 1) * page_size
    end = start + page_size
    images = queryset[start:end]

    data = [_serialize_media(img) for img in images]
    return Response({'results': data, 'count': total})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def admin_media_upload(request):
    """Upload a new media file."""
    file = request.FILES.get('file')
    if not file:
        return Response({'error': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)

    # Create a placeholder section for the image
    placeholder_section = CustomSection.objects.create(
        page_id=1,  # Use first page as placeholder
        title=f'Media-{timezone.now().timestamp()}',
        anchor=f'media-{timezone.now().timestamp()}',
        template_type='text_image_left',
        content={},
    )

    img = SectionImage.objects.create(
        section=placeholder_section,
        image=file,
        alt_text=request.data.get('alt_text', ''),
    )

    return Response(_serialize_media(img), status=status.HTTP_201_CREATED)


@api_view(['PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def admin_media_detail(request, pk):
    """Update or delete a media item."""
    img = get_object_or_404(SectionImage, pk=pk)

    if request.method == 'PATCH':
        if 'alt_text' in request.data:
            img.alt_text = request.data['alt_text']
        if 'title' in request.data:
            img.alt_text = request.data['title']  # Use title as alt_text
        img.save()
        return Response(_serialize_media(img))

    elif request.method == 'DELETE':
        img.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
