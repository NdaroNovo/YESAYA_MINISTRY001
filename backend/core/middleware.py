import logging
from .models import AuditLog

logger = logging.getLogger(__name__)


class AuditLogMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        if request.method in ("POST", "PUT", "PATCH", "DELETE"):
            try:
                user = request.user if request.user.is_authenticated else None
                lat, lng = self.get_client_location(request)
                AuditLog.objects.create(
                    user=user,
                    action=request.method,
                    path=request.path,
                    ip_address=self.get_client_ip(request),
                    latitude=lat,
                    longitude=lng,
                    description=f"{request.method} {request.path}",
                )
            except Exception as e:
                logger.warning("Audit log failed: %s", e)
        return response

    @staticmethod
    def get_client_location(request):
        try:
            lat = float(request.headers.get("X-Location-Lat", ""))
            lng = float(request.headers.get("X-Location-Lng", ""))
            return lat, lng
        except (ValueError, TypeError):
            return None, None

    @staticmethod
    def get_client_ip(request):
        x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
        if x_forwarded_for:
            return x_forwarded_for.split(",")[0].strip()
        return request.META.get("REMOTE_ADDR")
