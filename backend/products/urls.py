from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    # Legacy
    ProductViewSet,
    product_images,
    admin_upload_product_image,
    admin_manage_product_image,
    admin_update_product,
    # NEW: Flexible Framework
    OccasionViewSet,
    BoxTypeViewSet,
    CardPackageViewSet,
    ProductVariantViewSet,
    variant_images,
    admin_upload_variant_image,
    admin_manage_variant_image,
    admin_update_variant,
    configurator_data,
)

router = DefaultRouter()
# NEW: Flexible Framework endpoints first (before legacy ProductViewSet)
router.register("occasions", OccasionViewSet, basename="occasion")
router.register("box-types", BoxTypeViewSet, basename="box-type")
router.register("card-packages", CardPackageViewSet, basename="card-package")
router.register("variants", ProductVariantViewSet, basename="product-variant")
# Legacy ProductViewSet last (matches empty string and slugs)
router.register("", ProductViewSet, basename="product")

urlpatterns = [
    # Legacy endpoints
    path("<slug:slug>/images/", product_images, name="product-images"),
    # NEW: Configurator data
    path("configurator/", configurator_data, name="configurator-data"),
    # NEW: Variant images
    path("variants/<slug:slug>/images/", variant_images, name="variant-images"),
    # NEW: Admin variant endpoints
    path("admin/variants/<int:pk>/", admin_update_variant, name="admin-update-variant"),
    path("admin/variants/<slug:slug>/images/", admin_upload_variant_image, name="admin-upload-variant-image"),
    path("admin/variants/<slug:slug>/images/<int:image_id>/", admin_manage_variant_image, name="admin-manage-variant-image"),
    path("", include(router.urls)),
]
