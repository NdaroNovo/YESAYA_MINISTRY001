from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model
from django.db.models import Sum, Count
from .models import Jimbo, Mtaa, Church, EvangelismRecord, OfferingType, Offering, AuditLog
from .serializers import (
    UserSerializer,
    JimboSerializer,
    MtaaSerializer,
    ChurchSerializer,
    EvangelismRecordSerializer,
    OfferingTypeSerializer,
    OfferingSerializer,
)
from .permissions import IsSuperAdmin, IsJimboAdmin, IsMtaaLeader, IsChurchLeader, IsViewer
from .middleware import AuditLogMiddleware

User = get_user_model()


def read_only_or(permission_class):
    """Return IsViewer for safe actions, otherwise the supplied role permission."""
    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [IsViewer()]
        return [permission_class()]
    return get_permissions


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
            user.save(update_fields=["last_login_ip", "last_login_latitude", "last_login_longitude"])
            AuditLog.objects.create(
                user=user,
                action="LOGIN",
                path="/api/auth/login/",
                ip_address=ip,
                latitude=lat,
                longitude=lng,
                description="User logged in",
            )
        data["user"] = {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role,
            "phone": user.phone,
            "assigned_mtaa": user.assigned_mtaa_id,
            "assigned_church": user.assigned_church_id,
            "use_location": user.use_location,
        }
        return data


class LocationTokenObtainPairView(TokenObtainPairView):
    serializer_class = LocationTokenObtainPairSerializer


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsJimboAdmin]

    def get_permissions(self):
        if self.action in ["retrieve", "me"]:
            return [IsAuthenticated()]
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [IsSuperAdmin()]
        return super().get_permissions()

    @action(detail=False, methods=["get"], url_path="me")
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)


class JimboViewSet(viewsets.ModelViewSet):
    queryset = Jimbo.objects.all()
    serializer_class = JimboSerializer
    permission_classes = [IsMtaaLeader]
    get_permissions = read_only_or(IsMtaaLeader)


class MtaaViewSet(viewsets.ModelViewSet):
    queryset = Mtaa.objects.filter(is_active=True)
    serializer_class = MtaaSerializer
    permission_classes = [IsMtaaLeader]
    get_permissions = read_only_or(IsMtaaLeader)

    def get_queryset(self):
        user = self.request.user
        if user.role == "mtaa_leader" and user.assigned_mtaa:
            return self.queryset.filter(id=user.assigned_mtaa_id)
        return self.queryset


class ChurchViewSet(viewsets.ModelViewSet):
    queryset = Church.objects.filter(is_active=True)
    serializer_class = ChurchSerializer
    permission_classes = [IsChurchLeader]
    get_permissions = read_only_or(IsChurchLeader)

    def get_queryset(self):
        user = self.request.user
        qs = self.queryset
        if user.role == "church_leader" and user.assigned_church:
            return qs.filter(id=user.assigned_church_id)
        if user.role == "mtaa_leader" and user.assigned_mtaa:
            return qs.filter(mtaa_id=user.assigned_mtaa_id)
        mtaa_id = self.request.query_params.get("mtaa")
        if mtaa_id:
            qs = qs.filter(mtaa_id=mtaa_id)
        return qs


class EvangelismRecordViewSet(viewsets.ModelViewSet):
    queryset = EvangelismRecord.objects.all()
    serializer_class = EvangelismRecordSerializer
    permission_classes = [IsChurchLeader]
    get_permissions = read_only_or(IsChurchLeader)

    def get_queryset(self):
        user = self.request.user
        qs = self.queryset
        if user.role == "church_leader" and user.assigned_church:
            return qs.filter(church_id=user.assigned_church_id)
        if user.role == "mtaa_leader" and user.assigned_mtaa:
            return qs.filter(church__mtaa_id=user.assigned_mtaa_id)
        church_id = self.request.query_params.get("church")
        if church_id:
            qs = qs.filter(church_id=church_id)
        return qs


class OfferingTypeViewSet(viewsets.ModelViewSet):
    queryset = OfferingType.objects.filter(is_active=True)
    serializer_class = OfferingTypeSerializer
    permission_classes = [IsJimboAdmin]
    get_permissions = read_only_or(IsJimboAdmin)


class OfferingViewSet(viewsets.ModelViewSet):
    queryset = Offering.objects.all()
    serializer_class = OfferingSerializer
    permission_classes = [IsChurchLeader]
    get_permissions = read_only_or(IsChurchLeader)

    def get_queryset(self):
        user = self.request.user
        qs = self.queryset
        if user.role == "church_leader" and user.assigned_church:
            return qs.filter(church_id=user.assigned_church_id)
        if user.role == "mtaa_leader" and user.assigned_mtaa:
            return qs.filter(church__mtaa_id=user.assigned_mtaa_id)
        church_id = self.request.query_params.get("church")
        if church_id:
            qs = qs.filter(church_id=church_id)
        return qs


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def change_password(request):
    user = request.user
    current = request.data.get("current_password")
    new = request.data.get("new_password")
    if not user.check_password(current):
        return Response({"detail": "Nenosiri la sasa si sahihi."}, status=status.HTTP_400_BAD_REQUEST)
    user.set_password(new)
    user.save()
    AuditLog.objects.create(user=user, action="UPDATE", path="/api/change-password", description="Password changed")
    return Response({"detail": "Nenosiri limebadilishwa."})


APP_LATEST_VERSION = "1.1.0"


@api_view(["GET"])
def health_check(request):
    return Response({
        "status": "ok",
        "service": "YESAYA MINISTRY API",
        "latest_app_version": APP_LATEST_VERSION,
    })


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    church_stats = Church.objects.filter(is_active=True).aggregate(
        total_members=Sum("member_count"),
        total_churches=Count("id"),
    )
    evangelism_stats = EvangelismRecord.objects.aggregate(
        total_baptized=Sum("baptized"),
        total_converted=Sum("converted"),
        total_visited=Sum("visited"),
        total_supported=Sum("supported"),
    )
    offering_stats = Offering.objects.aggregate(
        total_offerings=Sum("amount"),
        church_share=Sum("church_share"),
        field_share=Sum("field_share"),
    )

    return Response({
        "total_mitaa": Mtaa.objects.filter(is_active=True).count(),
        "total_churches": church_stats["total_churches"] or 0,
        "total_members": church_stats["total_members"] or 0,
        "total_baptized": evangelism_stats["total_baptized"] or 0,
        "total_converted": evangelism_stats["total_converted"] or 0,
        "total_visited": evangelism_stats["total_visited"] or 0,
        "total_supported": evangelism_stats["total_supported"] or 0,
        "total_offerings": offering_stats["total_offerings"] or 0,
        "church_share": offering_stats["church_share"] or 0,
        "field_share": offering_stats["field_share"] or 0,
    })
