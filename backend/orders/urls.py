from django.urls import path

from .views import create_order, order_detail

urlpatterns = [
    path("", create_order, name="order-create"),
    path("<uuid:order_number>/", order_detail, name="order-detail"),
]
