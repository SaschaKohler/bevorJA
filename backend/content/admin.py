from django.contrib import admin
from .models import HomeFeature, CustomSection, SectionImage, Page


@admin.register(Page)
class PageAdmin(admin.ModelAdmin):
    list_display = ['title', 'slug', 'template', 'is_published', 'show_in_nav', 'nav_order']
    list_filter = ['template', 'is_published', 'show_in_nav']
    list_editable = ['is_published', 'show_in_nav', 'nav_order']
    search_fields = ['title', 'slug', 'meta_title', 'meta_description']
    prepopulated_fields = {'slug': ('title',)}
    readonly_fields = ['created_at', 'updated_at', 'published_at']


@admin.register(HomeFeature)
class HomeFeatureAdmin(admin.ModelAdmin):
    list_display = ['title', 'icon', 'order', 'is_active']
    list_editable = ['order', 'is_active']
    search_fields = ['title', 'description']


class SectionImageInline(admin.TabularInline):
    model = SectionImage
    extra = 1


@admin.register(CustomSection)
class CustomSectionAdmin(admin.ModelAdmin):
    list_display = ['title', 'page', 'anchor', 'template_type', 'order', 'is_active']
    list_filter = ['template_type', 'is_active', 'page']
    list_editable = ['order', 'is_active']
    prepopulated_fields = {'anchor': ('title',)}
    inlines = [SectionImageInline]


@admin.register(SectionImage)
class SectionImageAdmin(admin.ModelAdmin):
    list_display = ['section', 'alt_text', 'order']
    list_filter = ['section']
