"""
Admin API views for orders and dashboard statistics.
"""
from datetime import datetime, timedelta
from django.db.models import Sum, Count, Q
from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination

from .models import Order
from .serializers import OrderSerializer


class StandardResultsSetPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_dashboard_stats(request):
    """
    Get dashboard statistics for the admin panel.
    """
    today = timezone.now().date()
    yesterday = today - timedelta(days=1)
    week_start = today - timedelta(days=7)
    month_start = today - timedelta(days=30)
    
    # Revenue stats
    today_revenue = Order.objects.filter(
        created_at__date=today,
        status__in=['paid', 'processing', 'shipped', 'delivered']
    ).aggregate(total=Sum('total'))['total'] or 0
    
    yesterday_revenue = Order.objects.filter(
        created_at__date=yesterday,
        status__in=['paid', 'processing', 'shipped', 'delivered']
    ).aggregate(total=Sum('total'))['total'] or 0
    
    week_revenue = Order.objects.filter(
        created_at__date__gte=week_start,
        status__in=['paid', 'processing', 'shipped', 'delivered']
    ).aggregate(total=Sum('total'))['total'] or 0
    
    month_revenue = Order.objects.filter(
        created_at__date__gte=month_start,
        status__in=['paid', 'processing', 'shipped', 'delivered']
    ).aggregate(total=Sum('total'))['total'] or 0
    
    # Calculate trend (percentage change vs yesterday)
    trend = 0
    if yesterday_revenue > 0:
        trend = ((today_revenue - yesterday_revenue) / yesterday_revenue) * 100
    
    # Order counts by status
    pending_orders = Order.objects.filter(status='pending').count()
    processing_orders = Order.objects.filter(status='processing').count()
    shipped_orders = Order.objects.filter(status='shipped').count()
    today_orders = Order.objects.filter(created_at__date=today).count()
    
    # Product stats (from products app - avoid circular import)
    from products.models import ProductVariant, Occasion, BoxType
    
    active_variants = ProductVariant.objects.filter(is_active=True).count()
    total_occasions = Occasion.objects.filter(is_active=True).count()
    total_box_types = BoxType.objects.filter(is_active=True).count()
    
    # Customer stats
    total_customers = Order.objects.values('email').distinct().count()
    new_customers_this_month = Order.objects.filter(
        created_at__date__gte=month_start
    ).values('email').distinct().count()
    
    # Recent orders (last 5)
    recent_orders = Order.objects.order_by('-created_at')[:5]
    recent_orders_data = [
        {
            'id': order.id,
            'order_number': str(order.order_number),
            'customer_name': f"{order.first_name} {order.last_name}",
            'total': str(order.total),
            'status': order.status,
            'created_at': order.created_at.isoformat(),
        }
        for order in recent_orders
    ]
    
    return Response({
        'revenue': {
            'today': float(today_revenue),
            'thisWeek': float(week_revenue),
            'thisMonth': float(month_revenue),
            'trend': round(trend, 1),
        },
        'orders': {
            'pending': pending_orders,
            'processing': processing_orders,
            'shipped': shipped_orders,
            'totalToday': today_orders,
        },
        'products': {
            'activeVariants': active_variants,
            'totalOccasions': total_occasions,
            'totalBoxTypes': total_box_types,
        },
        'customers': {
            'total': total_customers,
            'newThisMonth': new_customers_this_month,
        },
        'recentOrders': recent_orders_data,
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_orders_list(request):
    """
    List orders with filtering and pagination for admin panel.
    """
    # Get query parameters
    search = request.query_params.get('search', '')
    status = request.query_params.get('status', '')
    date_from = request.query_params.get('date_from', '')
    date_to = request.query_params.get('date_to', '')
    
    # Base queryset
    queryset = Order.objects.all().order_by('-created_at')
    
    # Apply filters
    if search:
        queryset = queryset.filter(
            Q(first_name__icontains=search) |
            Q(last_name__icontains=search) |
            Q(email__icontains=search) |
            Q(order_number__icontains=search)
        )
    
    if status:
        queryset = queryset.filter(status=status)
    
    if date_from:
        try:
            from_date = datetime.strptime(date_from, '%Y-%m-%d').date()
            queryset = queryset.filter(created_at__date__gte=from_date)
        except ValueError:
            pass
    
    if date_to:
        try:
            to_date = datetime.strptime(date_to, '%Y-%m-%d').date()
            queryset = queryset.filter(created_at__date__lte=to_date)
        except ValueError:
            pass
    
    # Pagination
    paginator = StandardResultsSetPagination()
    page = paginator.paginate_queryset(queryset, request)
    serializer = OrderSerializer(page, many=True)
    
    return paginator.get_paginated_response(serializer.data)
