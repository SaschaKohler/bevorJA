from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'content', views.SiteContentViewSet, basename='content')
router.register(r'features', views.HomeFeatureViewSet, basename='features')

urlpatterns = [
    path('', include(router.urls)),
    path('home/', views.get_home_content, name='home-content'),
    path('admin/content/<int:pk>/', views.update_content, name='update-content'),
    path('sections/', views.list_sections, name='list-sections'),
    # Admin endpoints for sections
    path('admin/sections/', views.admin_create_section, name='admin-create-section'),
    path('admin/sections/<int:pk>/', views.admin_manage_section, name='admin-manage-section'),
    path('admin/sections/<int:pk>/images/', views.admin_upload_section_image, name='admin-upload-section-image'),
    path('admin/sections/<int:pk>/images/<int:image_id>/', views.admin_delete_section_image, name='admin-delete-section-image'),
]
