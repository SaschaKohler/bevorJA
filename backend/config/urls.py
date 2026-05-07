from django.contrib import admin
from django.urls import include, path
from django.conf import settings
from django.conf.urls.static import static

from products.views import (
    admin_upload_product_image,
    admin_manage_product_image,
    admin_update_product,
)
from orders.views import order_lookup, orders_by_email
from content.views import (
    admin_create_section,
    admin_manage_section,
    admin_upload_section_image,
    admin_delete_section_image,
)

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("rest_framework.urls")),
    path("api/products/", include("products.urls")),
    path("api/orders/", include("orders.urls")),
    path("api/payments/", include("payments.urls")),
    path("api/content/", include("content.urls")),
    # Admin product endpoints
    path("api/admin/products/<int:pk>/", admin_update_product, name="admin-update-product"),
    path("api/admin/products/<slug:slug>/images/", admin_upload_product_image, name="admin-upload-product-image"),
    path("api/admin/products/<slug:slug>/images/<int:image_id>/", admin_manage_product_image, name="admin-manage-product-image"),
    # Order lookup endpoints
    path("api/orders/lookup/", order_lookup, name="order-lookup"),
    path("api/orders/by-email/", orders_by_email, name="orders-by-email"),
    # Admin section endpoints
    path("api/admin/sections/", admin_create_section, name="admin-create-section"),
    path("api/admin/sections/<int:pk>/", admin_manage_section, name="admin-manage-section"),
    path("api/admin/sections/<int:pk>/images/", admin_upload_section_image, name="admin-upload-section-image"),
    path("api/admin/sections/<int:pk>/images/<int:image_id>/", admin_delete_section_image, name="admin-delete-section-image"),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
