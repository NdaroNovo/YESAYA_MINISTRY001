from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.http import FileResponse, HttpResponseNotFound


def spa_index(request):
    """Rudisha index.html ya React (frontend/dist) kwa njia zote zisizo za API."""
    index = settings.FRONTEND_DIST / "index.html"
    if not index.exists():
        return HttpResponseNotFound("Frontend haijajengwa. Endesha: cd frontend && npm run build")
    return FileResponse(open(index, "rb"), content_type="text/html")


urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("core.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

urlpatterns += [
    re_path(r"^(?!api/|admin/|static/|media/).*$", spa_index),
]
