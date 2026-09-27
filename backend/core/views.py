from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db.models import Sum, Count
from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import Jimbo, Mtaa, Church, EvangelismRecord, OfferingType, Offering, AuditLog
from .serializers import (
    UserSerializer,
    JimboSerializer,
    MtaaSerializer,
    ChurchSerializer,
    EvangelismRecordSerializer,
    OfferingTypeSerializer,
    OfferingSerializer,
    AuditLogSerializer,
)
from .permissions import IsSuperAdmin, IsJimboAdmin, read_or_role, role_at_least
from .middleware import AuditLogMiddleware

User = get_user_model()


def user_payload(user):
    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "full_name": user.full_name,
        "role": "super_admin" if user.is_superuser else user.role,
        "phone": user.phone,
        "assigned_mtaa": user.assigned_mtaa_id,
        "assigned_church": user.assigned_church_id,
        "use_location": user.use_location,
    }


def scope_churches(user, qs):
    """Punguza queryset ya Church kulingana na role ya mtumiaji."""
    if user.is_superuser or user.role in ("super_admin", "jimbo_admin", "viewer"):
        return qs
    if user.role == "mtaa_leader":
        return qs.filter(mtaa_id=user.assigned_mtaa_id) if user.assigned_mtaa_id else qs.none()
    if user.role == "church_leader":
        return qs.filter(id=user.assigned_church_id) if user.assigned_church_id else qs.none()
    return qs.none()


def scope_records(user, qs):
    """Punguza taarifa (uinjilisti/matoleo) kulingana na makanisa mtumiaji anayoruhusiwa."""
    qs = qs.filter(church__is_active=True)
    allowed = scope_churches(user, Church.objects.filter(is_active=True))
    return qs.filter(church__in=allowed)


def filter_by_params(request, qs):
    params = request.query_params
    if params.get("church"):
        qs = qs.filter(church_id=params["church"])
    if params.get("mtaa"):
        qs = qs.filter(church__mtaa_id=params["mtaa"])
    if params.get("jimbo"):
        qs = qs.filter(church__mtaa__jimbo_id=params["jimbo"])
    if params.get("year"):
        qs = qs.filter(year=params["year"])
    if params.get("month"):
        qs = qs.filter(month=params["month"])
    return qs


class LocationTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        request = self.context.get("request")
        user = self.user
        if request:
            ip = AuditLogMiddleware.get_client_ip(request)
            lat, lng = AuditLogMiddleware.get_client_location(request)
            user.last_login_ip = ip
            user.last_login_latitude = lat
            user.last_login_longitude = lng
            user.last_login = timezone.now()
            user.save(update_fields=["last_login_ip", "last_login_latitude", "last_login_longitude", "last_login"])
            AuditLog.objects.create(
                user=user,
                action="LOGIN",
                path="/api/auth/login/",
                ip_address=ip,
                latitude=lat,
                longitude=lng,
                description="Ameingia kwenye mfumo",
            )
        data["user"] = user_payload(user)
        return data


class LocationTokenObtainPairView(TokenObtainPairView):
    serializer_class = LocationTokenObtainPairSerializer


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.select_related("assigned_mtaa", "assigned_church").order_by("username")
    serializer_class = UserSerializer

    def get_permissions(self):
        if self.action == "me":
            return [IsAuthenticated()]
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [IsSuperAdmin()]
        return [IsJimboAdmin()]

    def perform_destroy(self, instance):
        if instance == self.request.user:
            raise PermissionDenied("Huwezi kufuta akaunti yako mwenyewe.")
        instance.is_active = False
        instance.save(update_fields=["is_active"])

    @action(detail=False, methods=["get"], url_path="me")
    def me(self, request):
        data = self.get_serializer(request.user).data
        data["role"] = user_payload(request.user)["role"]
        return Response(data)


class JimboViewSet(viewsets.ModelViewSet):
    queryset = Jimbo.objects.all().order_by("name")
    serializer_class = JimboSerializer
    permission_classes = [read_or_role("jimbo_admin")]

    def perform_destroy(self, instance):
        if instance.mitaa.filter(is_active=True).exists():
            raise PermissionDenied("Jimbo hili lina mitaa. Ondoa mitaa yake kwanza kabla ya kulifuta.")
        instance.delete()


class MtaaViewSet(viewsets.ModelViewSet):
    queryset = Mtaa.objects.filter(is_active=True).select_related("jimbo").order_by("name")
    serializer_class = MtaaSerializer
    permission_classes = [read_or_role("jimbo_admin")]

    def get_queryset(self):
        qs = self.queryset
        user = self.request.user
        if user.role == "mtaa_leader" and not user.is_superuser:
            qs = qs.filter(id=user.assigned_mtaa_id)
        elif user.role == "church_leader" and not user.is_superuser:
            qs = qs.filter(churches__id=user.assigned_church_id)
        if self.request.query_params.get("jimbo"):
            qs = qs.filter(jimbo_id=self.request.query_params["jimbo"])
        return qs

    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save(update_fields=["is_active"])
        instance.churches.update(is_active=False)


class ChurchViewSet(viewsets.ModelViewSet):
    queryset = Church.objects.filter(is_active=True, mtaa__is_active=True).select_related("mtaa").order_by("name")
    serializer_class = ChurchSerializer
    permission_classes = [read_or_role("mtaa_leader")]

    def get_queryset(self):
        qs = scope_churches(self.request.user, self.queryset)
        mtaa_id = self.request.query_params.get("mtaa")
        if mtaa_id:
            qs = qs.filter(mtaa_id=mtaa_id)
        return qs

    def _check_mtaa(self, serializer):
        user = self.request.user
        mtaa = serializer.validated_data.get("mtaa")
        if mtaa and user.role == "mtaa_leader" and not user.is_superuser and mtaa.id != user.assigned_mtaa_id:
            raise PermissionDenied("Unaweza kusimamia makanisa ya mtaa wako tu.")

    def perform_create(self, serializer):
        self._check_mtaa(serializer)
        serializer.save()

    def perform_update(self, serializer):
        self._check_mtaa(serializer)
        serializer.save()

    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save(update_fields=["is_active"])


class ScopedRecordViewSet(viewsets.ModelViewSet):
    permission_classes = [read_or_role("church_leader")]

    def get_queryset(self):
        qs = scope_records(self.request.user, self.queryset)
        return filter_by_params(self.request, qs).order_by("-year", "-month", "church__name")

    def _check_church(self, serializer):
        church = serializer.validated_data.get("church")
        if church is None:
            return
        allowed = scope_churches(self.request.user, Church.objects.filter(is_active=True))
        if not allowed.filter(id=church.id).exists():
            raise PermissionDenied("Huna ruhusa ya kuingiza taarifa za kanisa hili.")

    def perform_create(self, serializer):
        self._check_church(serializer)
        serializer.save()

    def perform_update(self, serializer):
        self._check_church(serializer)
        serializer.save()


class EvangelismRecordViewSet(ScopedRecordViewSet):
    queryset = EvangelismRecord.objects.select_related("church", "church__mtaa", "recorded_by")
    serializer_class = EvangelismRecordSerializer


class OfferingViewSet(ScopedRecordViewSet):
    queryset = Offering.objects.select_related("church", "church__mtaa", "offering_type")
    serializer_class = OfferingSerializer


class OfferingTypeViewSet(viewsets.ModelViewSet):
    queryset = OfferingType.objects.filter(is_active=True).order_by("id")
    serializer_class = OfferingTypeSerializer
    permission_classes = [read_or_role("jimbo_admin")]

    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save(update_fields=["is_active"])


class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AuditLog.objects.select_related("user")
    serializer_class = AuditLogSerializer
    permission_classes = [IsJimboAdmin]

    def get_queryset(self):
        qs = self.queryset
        if self.request.query_params.get("action"):
            qs = qs.filter(action=self.request.query_params["action"])
        if self.request.query_params.get("user"):
            qs = qs.filter(user_id=self.request.query_params["user"])
        return qs


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def change_password(request):
    user = request.user
    current = request.data.get("current_password") or ""
    new = request.data.get("new_password") or ""
    if not user.check_password(current):
        return Response({"detail": "Nenosiri la sasa si sahihi."}, status=status.HTTP_400_BAD_REQUEST)
    try:
        validate_password(new, user)
    except DjangoValidationError as e:
        return Response({"detail": " ".join(e.messages)}, status=status.HTTP_400_BAD_REQUEST)
    user.set_password(new)
    user.save()
    AuditLog.objects.create(user=user, action="UPDATE", path="/api/change-password/", description="Amebadilisha nenosiri")
    return Response({"detail": "Nenosiri limebadilishwa."})


APP_LATEST_VERSION = "1.2.0"


@api_view(["GET"])
@permission_classes([AllowAny])
def health_check(request):
    return Response({
        "status": "ok",
        "service": "YESAYA MINISTRY API",
        "latest_app_version": APP_LATEST_VERSION,
    })


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    user = request.user
    now = timezone.localtime()
    year = int(request.query_params.get("year") or now.year)

    churches = scope_churches(user, Church.objects.filter(is_active=True, mtaa__is_active=True))
    evangelism = scope_records(user, EvangelismRecord.objects.all())
    offerings = scope_records(user, Offering.objects.all())

    church_stats = churches.aggregate(total_members=Sum("member_count"), total_churches=Count("id"))
    evangelism_stats = evangelism.aggregate(
        total_baptized=Sum("baptized"),
        total_converted=Sum("converted"),
        total_visited=Sum("visited"),
        total_supported=Sum("supported"),
    )
    offering_stats = offerings.aggregate(
        total_offerings=Sum("amount"),
        church_share=Sum("church_share"),
        field_share=Sum("field_share"),
    )
    year_offerings = offerings.filter(year=year)
    year_total = year_offerings.aggregate(t=Sum("amount"))["t"] or 0
    month_total = offerings.filter(year=now.year, month=now.month).aggregate(t=Sum("amount"))["t"] or 0

    monthly = {m: {"month": m, "offerings": 0, "baptized": 0, "converted": 0} for m in range(1, 13)}
    for row in year_offerings.values("month").annotate(total=Sum("amount")):
        monthly[row["month"]]["offerings"] = float(row["total"] or 0)
    for row in evangelism.filter(year=year).values("month").annotate(b=Sum("baptized"), c=Sum("converted")):
        monthly[row["month"]]["baptized"] = row["b"] or 0
        monthly[row["month"]]["converted"] = row["c"] or 0

    by_type = [
        {"name": row["offering_type__name"], "total": float(row["total"] or 0)}
        for row in year_offerings.values("offering_type__name").annotate(total=Sum("amount")).order_by("-total")
    ]

    mitaa_ids = churches.values_list("mtaa_id", flat=True).distinct()

    recent_qs = AuditLog.objects.select_related("user").exclude(action="LOGIN")
    if not role_at_least(user, "jimbo_admin"):
        recent_qs = recent_qs.filter(user=user)
    recent = AuditLogSerializer(recent_qs[:8], many=True).data

    return Response({
        "year": year,
        "current_month": now.month,
        "total_jimbo": Jimbo.objects.count(),
        "total_mitaa": Mtaa.objects.filter(is_active=True, id__in=mitaa_ids).count()
        if not role_at_least(user, "jimbo_admin") and user.role != "viewer"
        else Mtaa.objects.filter(is_active=True).count(),
        "total_churches": church_stats["total_churches"] or 0,
        "total_members": church_stats["total_members"] or 0,
        "total_baptized": evangelism_stats["total_baptized"] or 0,
        "total_converted": evangelism_stats["total_converted"] or 0,
        "total_visited": evangelism_stats["total_visited"] or 0,
        "total_supported": evangelism_stats["total_supported"] or 0,
        "total_offerings": offering_stats["total_offerings"] or 0,
        "church_share": offering_stats["church_share"] or 0,
        "field_share": offering_stats["field_share"] or 0,
        "month_offerings": month_total,
        "year_offerings": year_total,
        "monthly": list(monthly.values()),
        "offerings_by_type": by_type,
        "recent_activity": recent,
    })
