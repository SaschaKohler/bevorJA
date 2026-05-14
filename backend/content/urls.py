from django.urls import path
from . import views

urlpatterns = [
    path('home/', views.get_home_content, name='home-content'),
    path('sections/', views.list_sections, name='list-sections'),
    # Admin endpoints for sections
    path('admin/sections/list/', views.admin_list_sections, name='admin-list-sections'),
    path('admin/sections/', views.admin_create_section, name='admin-create-section'),
    path('admin/sections/<int:pk>/', views.admin_manage_section, name='admin-manage-section'),
    path('admin/sections/<int:pk>/images/', views.admin_upload_section_image, name='admin-upload-section-image'),
    path('admin/sections/<int:pk>/images/<int:image_id>/', views.admin_delete_section_image, name='admin-delete-section-image'),
]
