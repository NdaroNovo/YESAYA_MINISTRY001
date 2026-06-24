from rest_framework.permissions import BasePermission


class IsSuperAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "super_admin"


class IsJimboAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ("super_admin", "jimbo_admin")


class IsMtaaLeader(BasePermission):
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        return request.user.role in ("super_admin", "jimbo_admin", "mtaa_leader")


class IsChurchLeader(BasePermission):
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        return request.user.role in ("super_admin", "jimbo_admin", "mtaa_leader", "church_leader")


class IsViewer(BasePermission):
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        return request.user.role in ("super_admin", "jimbo_admin", "mtaa_leader", "church_leader", "viewer")

    def has_object_permission(self, request, view, obj):
        return request.method in ("GET", "HEAD", "OPTIONS")
