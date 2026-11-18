from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),
    path('api/items/', include('items.urls')),
    path('api/claims/', include('items.claims_urls')),
    path('api/dashboard/', include('items.dashboard_urls')),
    path('api/notifications/', include('notifications.urls')),
]

# Serve media files in development / local mode
if settings.DEBUG or not getattr(settings, 'DEFAULT_FILE_STORAGE', '').startswith('cloudinary'):
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
