from rest_framework.permissions import BasePermission, SAFE_METHODS

ROLE_LEVELS = {
    "viewer": 0,
    "church_leader": 1,
    "mtaa_leader": 2,
    "jimbo_admin": 3,
    "super_admin": 4,
}


def role_at_least(user, role):
    if not user or not user.is_authenticated:
        return False
    if user.is_superuser:
        return True
    return ROLE_LEVELS.get(user.role, -1) >= ROLE_LEVELS[role]


class IsSuperAdmin(BasePermission):
    def has_permission(self, request, view):
        return role_at_least(request.user, "super_admin")


class IsJimboAdmin(BasePermission):
    def has_permission(self, request, view):
        return role_at_least(request.user, "jimbo_admin")


class IsMtaaLeader(BasePermission):
    def has_permission(self, request, view):
        return role_at_least(request.user, "mtaa_leader")


class IsChurchLeader(BasePermission):
    def has_permission(self, request, view):
        return role_at_least(request.user, "church_leader")


class IsViewer(BasePermission):
    def has_permission(self, request, view):
        return role_at_least(request.user, "viewer")


def read_or_role(role):
    """Kila mtumiaji aliyeingia anaweza kusoma; kuandika kunahitaji role iliyotajwa au zaidi."""

    class ReadOrRole(BasePermission):
        def has_permission(self, request, view):
            if not request.user or not request.user.is_authenticated:
                return False
            if request.method in SAFE_METHODS:
                return True
            return role_at_least(request.user, role)

    return ReadOrRole
