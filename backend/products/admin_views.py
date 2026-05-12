"""
Admin API views for product management.
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404

from .models import Occasion, BoxType, CardPackage, ProductVariant
from .serializers import (
    OccasionSerializer,
    BoxTypeSerializer,
    CardPackageSerializer,
    ProductVariantListSerializer,
)


# === OCCASION ADMIN VIEWS ===

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def admin_occasions_list(request):
    """
    List all occasions or create a new one.
    """
    if request.method == 'GET':
        occasions = Occasion.objects.all().order_by('sort_order', 'name')
        serializer = OccasionSerializer(occasions, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        serializer = OccasionSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def admin_occasion_detail(request, pk):
    """
    Retrieve, update or delete an occasion.
    """
    occasion = get_object_or_404(Occasion, pk=pk)
    
    if request.method == 'GET':
        serializer = OccasionSerializer(occasion)
        return Response(serializer.data)
    
    elif request.method == 'PATCH':
        serializer = OccasionSerializer(occasion, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        occasion.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# === BOX TYPE ADMIN VIEWS ===

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def admin_boxtypes_list(request):
    """
    List all box types or create a new one.
    """
    if request.method == 'GET':
        box_types = BoxType.objects.all().order_by('sort_order', 'name')
        serializer = BoxTypeSerializer(box_types, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        serializer = BoxTypeSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# === CARD PACKAGE ADMIN VIEWS ===

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def admin_cardpackages_list(request):
    """
    List all card packages or create a new one.
    """
    if request.method == 'GET':
        packages = CardPackage.objects.all().order_by('sort_order', 'card_count')
        serializer = CardPackageSerializer(packages, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        serializer = CardPackageSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# === PRODUCT VARIANT ADMIN VIEWS ===

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def admin_variants_list(request):
    """
    List all product variants with filtering or create a new one.
    """
    if request.method == 'GET':
        # Get filter parameters
        occasion_slug = request.query_params.get('occasion', '')
        box_type_slug = request.query_params.get('box_type', '')
        is_active = request.query_params.get('is_active', '')
        
        # Base queryset
        variants = ProductVariant.objects.select_related(
            'box_type', 'card_package', 'occasion'
        ).order_by('box_type__sort_order', 'card_package__card_count')
        
        # Apply filters
        if occasion_slug:
            variants = variants.filter(occasion__slug=occasion_slug)
        
        if box_type_slug:
            variants = variants.filter(box_type__slug=box_type_slug)
        
        if is_active == 'true':
            variants = variants.filter(is_active=True)
        elif is_active == 'false':
            variants = variants.filter(is_active=False)
        
        # Use list serializer for performance
        serializer = ProductVariantListSerializer(variants, many=True)
        
        return Response({'results': serializer.data})
    
    elif request.method == 'POST':
        # Create new variant
        from .serializers import ProductVariantSerializer
        serializer = ProductVariantSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def admin_variant_detail(request, pk):
    """
    Retrieve, update or delete a product variant.
    """
    variant = get_object_or_404(ProductVariant, pk=pk)
    
    if request.method == 'GET':
        from .serializers import ProductVariantSerializer
        serializer = ProductVariantSerializer(variant)
        return Response(serializer.data)
    
    elif request.method == 'PATCH':
        from .serializers import ProductVariantSerializer
        serializer = ProductVariantSerializer(variant, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        variant.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
