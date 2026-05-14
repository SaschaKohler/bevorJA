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
    admin_boxtype_detail,
    admin_cardpackages_list,
    admin_cardpackage_detail,
    admin_variants_list,
    admin_variant_detail,
)
from orders.admin_views import (
    admin_dashboard_stats,
    admin_orders_list,
    admin_order_detail,
    admin_order_status_update,
    admin_charts_data,
    admin_customers_list,
    admin_customer_detail,
)
from content.admin_views import (
    admin_sections_list,
    admin_section_reorder,
    admin_pages_list,
    admin_page_detail,
    admin_media_list,
    admin_media_upload,
    admin_media_detail,
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
    path("api/admin/variants/<int:pk>/", admin_variant_detail, name="admin-variant-detail"),
    # Admin box types detail
    path("api/admin/box-types/<int:pk>/", admin_boxtype_detail, name="admin-boxtype-detail"),
    # Admin card packages detail
    path("api/admin/card-packages/<int:pk>/", admin_cardpackage_detail, name="admin-cardpackage-detail"),
    # Admin orders detail & status workflow
    path("api/admin/orders/<int:pk>/", admin_order_detail, name="admin-order-detail"),
    path("api/admin/orders/<int:pk>/status/", admin_order_status_update, name="admin-order-status"),
    # Admin charts
    path("api/admin/charts/", admin_charts_data, name="admin-charts"),
    # Admin customers
    path("api/admin/customers/", admin_customers_list, name="admin-customers-list"),
    path("api/admin/customers/<str:email>/", admin_customer_detail, name="admin-customer-detail"),
    # Admin sections
    path("api/admin/sections/list/", admin_sections_list, name="admin-sections-list"),
    path("api/admin/sections/reorder/", admin_section_reorder, name="admin-sections-reorder"),
    # Admin media/mediathek
    path("api/admin/media/", admin_media_list, name="admin-media-list"),
    path("api/admin/media/upload/", admin_media_upload, name="admin-media-upload"),
    path("api/admin/media/<int:pk>/", admin_media_detail, name="admin-media-detail"),
    # Admin pages
    path("api/admin/pages/", admin_pages_list, name="admin-pages-list"),
    path("api/admin/pages/<int:pk>/", admin_page_detail, name="admin-page-detail"),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
