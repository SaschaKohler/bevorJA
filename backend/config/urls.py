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
from content.auth_views import admin_login
from products.admin_views import (
    admin_occasions_list,
    admin_occasion_detail,
    admin_boxtypes_list,
    admin_cardpackages_list,
    admin_variants_list,
)
from orders.admin_views import (
    admin_dashboard_stats,
    admin_orders_list,
)

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("rest_framework.urls")),
    path("api/admin/login/", admin_login, name="admin-login"),
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
    # Admin dashboard & stats
    path("api/admin/stats/", admin_dashboard_stats, name="admin-stats"),
    path("api/admin/orders/", admin_orders_list, name="admin-orders-list"),
    # Admin product management
    path("api/admin/occasions/", admin_occasions_list, name="admin-occasions-list"),
    path("api/admin/occasions/<int:pk>/", admin_occasion_detail, name="admin-occasion-detail"),
    path("api/admin/box-types/", admin_boxtypes_list, name="admin-boxtypes-list"),
    path("api/admin/card-packages/", admin_cardpackages_list, name="admin-cardpackages-list"),
    path("api/admin/variants/", admin_variants_list, name="admin-variants-list"),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
