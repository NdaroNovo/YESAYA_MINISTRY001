from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from django.utils import timezone
from .models import Jimbo, Mtaa, Church, EvangelismRecord, EvangelismCustomField, OfferingType, Offering, AuditLog

User = get_user_model()

# Simu zinatuma GPS yenye desimali nyingi (mf. -6.7923541234567); zungusha kabla ya validation
# ili zisikataliwe na DecimalField(max_digits=9, decimal_places=6).
LOCATION_PRECISION = {"latitude": 6, "longitude": 6, "location_accuracy": 2}


class RoundLocationMixin:
    def to_internal_value(self, data):
        if hasattr(data, "copy"):
            data = data.copy()
            for field, places in LOCATION_PRECISION.items():
                value = data.get(field)
                if value in (None, ""):
                    continue
                try:
                    data[field] = round(float(value), places)
                except (TypeError, ValueError):
                    pass
        return super().to_internal_value(data)


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)
    assigned_mtaa_name = serializers.CharField(source="assigned_mtaa.name", read_only=True, default="")
    assigned_church_name = serializers.CharField(source="assigned_church.name", read_only=True, default="")

    class Meta:
        model = User
        fields = [
            "id", "username", "email", "full_name", "role", "phone",
            "assigned_mtaa", "assigned_church", "assigned_mtaa_name", "assigned_church_name",
            "is_active", "use_location", "password", "last_login",
            "last_login_latitude", "last_login_longitude", "last_login_ip",
        ]
        read_only_fields = ["id", "last_login", "last_login_latitude", "last_login_longitude", "last_login_ip"]

    def validate(self, data):
        password = data.get("password")
        if not self.instance and not password:
            raise serializers.ValidationError({"password": ["Nenosiri linahitajika kwa mtumiaji mpya."]})
        if password:
            try:
                validate_password(password, self.instance)
            except DjangoValidationError as e:
                raise serializers.ValidationError({"password": list(e.messages)})
        role = data.get("role", self.instance.role if self.instance else "viewer")
        mtaa = data.get("assigned_mtaa", self.instance.assigned_mtaa if self.instance else None)
        church = data.get("assigned_church", self.instance.assigned_church if self.instance else None)
        if role == "mtaa_leader" and not mtaa:
            raise serializers.ValidationError({"assigned_mtaa": ["Chagua mtaa wa kiongozi huyu."]})
        if role == "church_leader" and not church:
            raise serializers.ValidationError({"assigned_church": ["Chagua kanisa la kiongozi huyu."]})
        return data

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop("password", None)
        user = super().update(instance, validated_data)
        if password:
            user.set_password(password)
            user.save()
        return user


class JimboSerializer(serializers.ModelSerializer):
    class Meta:
        model = Jimbo
        fields = "__all__"


class MtaaSerializer(serializers.ModelSerializer):
    jimbo_name = serializers.CharField(source="jimbo.name", read_only=True)
    church_count = serializers.SerializerMethodField()

    class Meta:
        model = Mtaa
        fields = "__all__"

    def get_church_count(self, obj):
        return obj.churches.filter(is_active=True).count()


class ChurchSerializer(serializers.ModelSerializer):
    mtaa_name = serializers.CharField(source="mtaa.name", read_only=True)

    class Meta:
        model = Church
        fields = "__all__"


class EvangelismCustomFieldSerializer(serializers.ModelSerializer):
    class Meta:
        model = EvangelismCustomField
        fields = ["id", "label", "value"]


class EvangelismRecordSerializer(RoundLocationMixin, serializers.ModelSerializer):
    custom_fields = EvangelismCustomFieldSerializer(many=True, required=False, default=[])
    church_name = serializers.CharField(source="church.name", read_only=True)
    mtaa_name = serializers.CharField(source="church.mtaa.name", read_only=True)
    recorded_by_name = serializers.SerializerMethodField()

    class Meta:
        model = EvangelismRecord
        fields = [
            "id", "church", "church_name", "mtaa_name", "recorded_by", "recorded_by_name", "month", "year",
            "baptized", "converted", "visited", "supported",
            "comments", "evidence", "custom_fields", "created_at", "updated_at",
            "latitude", "longitude", "location_accuracy", "location_captured_at",
        ]
        read_only_fields = [
            "recorded_by", "created_at", "updated_at", "location_captured_at",
        ]
        validators = []  # ondoa unique_together validator wa default

    def get_recorded_by_name(self, obj):
        if not obj.recorded_by:
            return ""
        return obj.recorded_by.full_name or obj.recorded_by.username

    def validate(self, data):
        church = data.get("church") or (self.instance.church if self.instance else None)
        month = data.get("month") or (self.instance.month if self.instance else None)
        year = data.get("year") or (self.instance.year if self.instance else None)
        qs = EvangelismRecord.objects.filter(church=church, month=month, year=year)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError(
                {"non_field_errors": [f"Taarifa ya {month}/{year} kwa kanisa hili ipo tayari. Hariri badala ya kuunda mpya."]}
            )
        return data

    def _set_location_timestamp(self, validated_data):
        if validated_data.get("latitude") and validated_data.get("longitude"):
            validated_data["location_captured_at"] = timezone.now()
        return validated_data

    def create(self, validated_data):
        custom_fields_data = validated_data.pop("custom_fields", [])
        validated_data["recorded_by"] = self.context["request"].user
        validated_data = self._set_location_timestamp(validated_data)
        record = super().create(validated_data)
        for field_data in custom_fields_data:
            EvangelismCustomField.objects.create(record=record, **field_data)
        return record

    def update(self, instance, validated_data):
        custom_fields_data = validated_data.pop("custom_fields", None)
        validated_data = self._set_location_timestamp(validated_data)
        record = super().update(instance, validated_data)
        if custom_fields_data is not None:
            record.custom_fields.all().delete()
            for field_data in custom_fields_data:
                EvangelismCustomField.objects.create(record=record, **field_data)
        return record


class OfferingTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = OfferingType
        fields = "__all__"

    def validate(self, data):
        cp = data.get("church_percentage", self.instance.church_percentage if self.instance else 0)
        fp = data.get("field_percentage", self.instance.field_percentage if self.instance else 0)
        if cp + fp != 100:
            raise serializers.ValidationError("Asilimia za Kanisa na Jimbo lazima ziwe jumla 100%.")
        return data


class OfferingSerializer(RoundLocationMixin, serializers.ModelSerializer):
    church_name = serializers.CharField(source="church.name", read_only=True)
    mtaa_name = serializers.CharField(source="church.mtaa.name", read_only=True)
    offering_type_name = serializers.CharField(source="offering_type.name", read_only=True)

    class Meta:
        model = Offering
        fields = "__all__"
        read_only_fields = [
            "church_share", "field_share", "recorded_by", "created_at", "updated_at", "location_captured_at",
        ]

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Kiasi lazima kiwe zaidi ya sifuri.")
        return value

    def create(self, validated_data):
        validated_data["recorded_by"] = self.context["request"].user
        if validated_data.get("latitude") and validated_data.get("longitude"):
            validated_data["location_captured_at"] = timezone.now()
        return super().create(validated_data)

    def update(self, instance, validated_data):
        if validated_data.get("latitude") and validated_data.get("longitude"):
            validated_data["location_captured_at"] = timezone.now()
        return super().update(instance, validated_data)


class AuditLogSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()

    class Meta:
        model = AuditLog
        fields = ["id", "user", "user_name", "action", "path", "ip_address", "latitude", "longitude", "description", "created_at"]

    def get_user_name(self, obj):
        if not obj.user:
            return ""
        return obj.user.full_name or obj.user.username
