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
]
