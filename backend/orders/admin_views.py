"""
Admin API views for orders and dashboard statistics.
"""
from datetime import datetime, timedelta
from django.db.models import Sum, Count, Max, Q
from django.utils import timezone
from rest_framework import status as drf_status
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


# === ORDER DETAIL ADMIN VIEWS ===

# Valid status transitions: from -> allowed next statuses
_STATUS_TRANSITIONS = {
    Order.Status.PENDING: [Order.Status.PAID, Order.Status.CANCELLED],
    Order.Status.PAID: [Order.Status.PROCESSING, Order.Status.CANCELLED],
    Order.Status.PROCESSING: [Order.Status.SHIPPED, Order.Status.CANCELLED],
    Order.Status.SHIPPED: [Order.Status.DELIVERED],
    Order.Status.DELIVERED: [],
    Order.Status.CANCELLED: [],
}


@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated])
def admin_order_detail(request, pk):
    """
    Retrieve or update a single order.
    PATCH allows updating: status, notes (admin notes).
    """
    order = Order.objects.filter(pk=pk).first()
    if order is None:
        return Response({'detail': 'Not found.'}, status=drf_status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = OrderSerializer(order)
        return Response(serializer.data)

    elif request.method == 'PATCH':
        updatable = ['status', 'notes']
        for field in updatable:
            if field in request.data:
                setattr(order, field, request.data[field])
        order.save()
        serializer = OrderSerializer(order)
        return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def admin_order_status_update(request, pk):
    """
    Update order status via a workflow endpoint.

    Expects: {"status": "shipped", "comment": "...", "tracking_number": "..."}
    Validates that the transition is allowed.
    """
    order = Order.objects.filter(pk=pk).first()
    if order is None:
        return Response({'detail': 'Not found.'}, status=drf_status.HTTP_404_NOT_FOUND)

    new_status = request.data.get('status')
    if not new_status:
        return Response({'detail': 'status is required.'}, status=drf_status.HTTP_400_BAD_REQUEST)

    allowed = _STATUS_TRANSITIONS.get(order.status, [])
    if new_status not in [s.value for s in allowed]:
        allowed_labels = [s.value for s in allowed]
        return Response(
            {
                'detail': (
                    f"Transition from '{order.status}' to '{new_status}' is not allowed. "
                    f"Allowed transitions: {allowed_labels}"
                )
            },
            status=drf_status.HTTP_400_BAD_REQUEST,
        )

    order.status = new_status

    # Append comment/tracking to notes if provided
    comment = request.data.get('comment', '')
    tracking_number = request.data.get('tracking_number', '')
    note_parts = []
    if tracking_number:
        note_parts.append(f"Tracking: {tracking_number}")
    if comment:
        note_parts.append(comment)
    if note_parts:
        extra = ' | '.join(note_parts)
        order.notes = f"{order.notes}\n[{new_status}] {extra}".strip() if order.notes else f"[{new_status}] {extra}"

    order.save()
    serializer = OrderSerializer(order)
    return Response(serializer.data)


# === CHARTS DATA ===

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_charts_data(request):
    """
    GET /api/admin/charts/?days=7
    Returns revenue per day for the last N days and order status distribution.
    """
    try:
        days = int(request.query_params.get('days', 7))
    except (ValueError, TypeError):
        days = 7

    today = timezone.now().date()

    # Revenue per day
    revenue_data = []
    for i in range(days - 1, -1, -1):
        day = today - timedelta(days=i)
        day_revenue = Order.objects.filter(
            created_at__date=day,
            status__in=[
                Order.Status.PAID,
                Order.Status.PROCESSING,
                Order.Status.SHIPPED,
                Order.Status.DELIVERED,
            ],
        ).aggregate(total=Sum('total'))['total'] or 0
        revenue_data.append({
            'date': day.strftime('%a'),  # 'Mo', 'Di', etc. depending on locale
            'amount': float(day_revenue),
        })

    # Order status distribution
    status_colors = {
        Order.Status.PENDING: '#F59E0B',
        Order.Status.PAID: '#3B82F6',
        Order.Status.PROCESSING: '#8B5CF6',
        Order.Status.SHIPPED: '#06B6D4',
        Order.Status.DELIVERED: '#10B981',
        Order.Status.CANCELLED: '#EF4444',
    }
    status_labels = {
        Order.Status.PENDING: 'Ausstehend',
        Order.Status.PAID: 'Bezahlt',
        Order.Status.PROCESSING: 'In Bearbeitung',
        Order.Status.SHIPPED: 'Versendet',
        Order.Status.DELIVERED: 'Zugestellt',
        Order.Status.CANCELLED: 'Storniert',
    }

    status_counts = (
        Order.objects.values('status')
        .annotate(count=Count('id'))
        .order_by('status')
    )

    order_status_data = [
        {
            'name': status_labels.get(row['status'], row['status']),
            'value': row['count'],
            'color': status_colors.get(row['status'], '#6B7280'),
        }
        for row in status_counts
        if row['count'] > 0
    ]

    return Response({
        'revenue': revenue_data,
        'orderStatus': order_status_data,
    })


# === CUSTOMER ADMIN VIEWS ===

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_customers_list(request):
    """List customers aggregated from orders."""
    search = request.query_params.get('search', '')

    customers = Order.objects.values('email', 'first_name', 'last_name').annotate(
        total_orders=Count('id'),
        total_spent=Sum('total'),
        last_order_at=Max('created_at'),
    ).order_by('-total_spent')

    if search:
        customers = customers.filter(
            Q(email__icontains=search) |
            Q(first_name__icontains=search) |
            Q(last_name__icontains=search)
        )

    # Pagination
    paginator = StandardResultsSetPagination()
    customer_list = list(customers)
    for c in customer_list:
        c['id'] = hash(c['email']) & 0x7FFFFFFF
        c['total_spent'] = str(c['total_spent'] or 0)
        c['last_order_at'] = c['last_order_at'].isoformat() if c['last_order_at'] else None
        c['tags'] = []

    page = paginator.paginate_queryset(customer_list, request)
    return paginator.get_paginated_response(page)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_customer_detail(request, email):
    """Get customer detail by email."""
    orders = Order.objects.filter(email=email).order_by('-created_at')
    if not orders.exists():
        return Response({'detail': 'Not found.'}, status=drf_status.HTTP_404_NOT_FOUND)

    first_order = orders.first()
    total_spent = sum(float(o.total) for o in orders)

    return Response({
        'email': email,
        'first_name': first_order.first_name,
        'last_name': first_order.last_name,
        'total_orders': orders.count(),
        'total_spent': str(total_spent),
        'last_order_at': first_order.created_at.isoformat(),
        'tags': [],
        'orders': OrderSerializer(orders, many=True).data,
    })
