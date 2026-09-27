import logging
from .models import AuditLog

logger = logging.getLogger(__name__)

METHOD_ACTIONS = {"POST": "CREATE", "PUT": "UPDATE", "PATCH": "UPDATE", "DELETE": "DELETE"}

RESOURCE_LABELS = {
    "jimbo": "Jimbo",
    "mitaa": "Mtaa",
    "churches": "Kanisa",
    "evangelism": "Taarifa ya uinjilisti",
    "offerings": "Toleo",
    "offering-types": "Aina ya toleo",
    "users": "Mtumiaji",
}

ACTION_LABELS = {"CREATE": "ameongeza", "UPDATE": "amehariri", "DELETE": "amefuta"}


class AuditLogMiddleware:
    """Hifadhi kumbukumbu ya kila mabadiliko yaliyofanikiwa kupitia API."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        action = METHOD_ACTIONS.get(request.method)
        if (
            action
            and request.path.startswith("/api/")
            and not request.path.startswith("/api/auth/")
            and not request.path.startswith("/api/change-password/")
            and response.status_code < 400
        ):
            try:
                user = self.get_user(request)
                lat, lng = self.get_client_location(request)
                AuditLog.objects.create(
                    user=user,
                    action=action,
                    path=request.path,
                    ip_address=self.get_client_ip(request),
                    latitude=lat,
                    longitude=lng,
                    description=self.describe(action, request.path),
                )
            except Exception as e:
                logger.warning("Audit log failed: %s", e)
        return response

    @staticmethod
    def describe(action, path):
        parts = [p for p in path.split("/") if p][1:]  # ondoa "api"
        resource = RESOURCE_LABELS.get(parts[0], parts[0]) if parts else path
        ident = f" #{parts[1]}" if len(parts) > 1 and parts[1].isdigit() else ""
        return f"{ACTION_LABELS[action].capitalize()} {resource}{ident}"

    @staticmethod
    def get_user(request):
        if getattr(request, "user", None) is not None and request.user.is_authenticated:
            return request.user
        try:
            from rest_framework_simplejwt.authentication import JWTAuthentication
            result = JWTAuthentication().authenticate(request)
            return result[0] if result else None
        except Exception:
            return None

    @staticmethod
    def get_client_location(request):
        try:
            lat = round(float(request.headers.get("X-Location-Lat", "")), 6)
            lng = round(float(request.headers.get("X-Location-Lng", "")), 6)
            return lat, lng
        except (ValueError, TypeError):
            return None, None

    @staticmethod
    def get_client_ip(request):
        x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
        if x_forwarded_for:
            return x_forwarded_for.split(",")[0].strip()
        return request.META.get("REMOTE_ADDR")
