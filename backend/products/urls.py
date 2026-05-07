from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    ProductViewSet,
    product_images,
    admin_upload_product_image,
    admin_manage_product_image,
    admin_update_product,
)

router = DefaultRouter()
router.register("", ProductViewSet)

urlpatterns = [
    path("<slug:slug>/images/", product_images, name="product-images"),
    path("", include(router.urls)),
]
