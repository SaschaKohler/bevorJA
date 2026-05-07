from django.contrib import admin
from django.utils.html import format_html
from .models import SiteContent, HomeFeature, CustomSection, SectionImage


@admin.register(SiteContent)
class SiteContentAdmin(admin.ModelAdmin):
    list_display = ['section', 'key', 'content_preview', 'image_preview', 'is_active', 'updated_at']
    list_filter = ['section', 'is_active']
    search_fields = ['content', 'key']
    list_editable = ['is_active']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        (None, {
            'fields': ('section', 'key', 'order', 'is_active')
        }),
        ('Inhalte', {
            'fields': ('content', 'content_en')
        }),
        ('Bild', {
            'fields': ('image',),
            'classes': ('collapse',)
        }),
        ('Metadaten', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def content_preview(self, obj):
        if len(obj.content) > 50:
            return obj.content[:50] + '...'
        return obj.content
    content_preview.short_description = 'Vorschau'
    
    def image_preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="max-height: 50px;" />', obj.image.url)
        return '-'
    image_preview.short_description = 'Bild'


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
    list_display = ['title', 'anchor', 'template_type', 'order', 'is_active']
    list_filter = ['template_type', 'is_active']
    list_editable = ['order', 'is_active']
    prepopulated_fields = {'anchor': ('title',)}
    inlines = [SectionImageInline]


@admin.register(SectionImage)
class SectionImageAdmin(admin.ModelAdmin):
    list_display = ['section', 'alt_text', 'order']
    list_filter = ['section']
