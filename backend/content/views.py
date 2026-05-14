from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import HomeFeature, CustomSection, SectionImage, Page
from .serializers import (
    HomeFeatureSerializer,
    CustomSectionSerializer,
    SectionImageSerializer,
)


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
    features = HomeFeature.objects.filter(is_active=True).order_by('order')

    # Get home page sections (page with slug 'home', empty slug, or first published page)
    home_page = Page.objects.filter(slug='home', is_published=True).first()
    if not home_page:
        home_page = Page.objects.filter(slug='', is_published=True).first()
    if not home_page:
        home_page = Page.objects.filter(is_published=True).first()

    page_sections = []
    if home_page:
        page_sections = CustomSection.objects.filter(
            page=home_page, is_active=True
        ).order_by('order')

    return Response({
        'hero_features': HomeFeatureSerializer(features, many=True).data,
        'page': {
            'id': home_page.id if home_page else None,
            'title': home_page.title if home_page else None,
            'slug': home_page.slug if home_page else None,
        } if home_page else None,
        'sections': CustomSectionSerializer(page_sections, many=True).data,
    })


# --- CustomSection endpoints ---

@api_view(['GET'])
@permission_classes([AllowAny])
def list_sections(request):
    sections = CustomSection.objects.filter(is_active=True)
    return Response(CustomSectionSerializer(sections, many=True).data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_list_sections(request):
    page_id = request.query_params.get('page')
    qs = CustomSection.objects.all().order_by('order')
    if page_id:
        qs = qs.filter(page_id=page_id)
    return Response(CustomSectionSerializer(qs, many=True).data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def admin_create_section(request):
    print(f"DEBUG: User={request.user}, Auth={request.auth}, Headers={request.headers.get('Authorization', 'NONE')}")
    serializer = CustomSectionSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['GET', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def admin_manage_section(request, pk):
    section = get_object_or_404(CustomSection, pk=pk)

    if request.method == 'GET':
        return Response(CustomSectionSerializer(section).data)

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
@permission_classes([IsAuthenticated])
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
@permission_classes([IsAuthenticated])
def admin_delete_section_image(request, pk, image_id):
    section = get_object_or_404(CustomSection, pk=pk)
    img = get_object_or_404(SectionImage, id=image_id, section=section)
    img.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)
