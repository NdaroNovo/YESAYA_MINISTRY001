from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Jimbo, Mtaa, Church, EvangelismRecord, EvangelismCustomField, OfferingType, Offering

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id", "username", "email", "full_name", "role", "phone",
            "assigned_mtaa", "assigned_church", "is_active", "use_location",
            "last_login_latitude", "last_login_longitude", "last_login_ip",
        ]
        read_only_fields = ["id", "last_login_latitude", "last_login_longitude", "last_login_ip"]


class JimboSerializer(serializers.ModelSerializer):
    class Meta:
        model = Jimbo
        fields = "__all__"


class MtaaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Mtaa
        fields = "__all__"


class ChurchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Church
        fields = "__all__"


class EvangelismCustomFieldSerializer(serializers.ModelSerializer):
    class Meta:
        model = EvangelismCustomField
        fields = ["id", "label", "value"]


class EvangelismRecordSerializer(serializers.ModelSerializer):
    custom_fields = EvangelismCustomFieldSerializer(many=True)

    class Meta:
        model = EvangelismRecord
        fields = [
            "id", "church", "recorded_by", "month", "year",
            "baptized", "converted", "visited", "supported",
            "comments", "evidence", "custom_fields", "created_at", "updated_at",
            "latitude", "longitude", "location_accuracy", "location_captured_at",
        ]
        read_only_fields = [
            "recorded_by", "created_at", "updated_at", "location_captured_at",
        ]

    def _set_location_timestamp(self, validated_data):
        if validated_data.get("latitude") and validated_data.get("longitude"):
            from django.utils import timezone
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
        cp = data.get("church_percentage", 0)
        fp = data.get("field_percentage", 0)
        if cp + fp != 100:
            raise serializers.ValidationError("Asilimia za Kanisa na Jimbo lazima ziwe jumla 100%.")
        return data


class OfferingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Offering
        fields = "__all__"
        read_only_fields = [
            "church_share", "field_share", "recorded_by", "created_at", "updated_at", "location_captured_at",
        ]

    def create(self, validated_data):
        validated_data["recorded_by"] = self.context["request"].user
        if validated_data.get("latitude") and validated_data.get("longitude"):
            from django.utils import timezone
            validated_data["location_captured_at"] = timezone.now()
        return super().create(validated_data)

    def update(self, instance, validated_data):
        if validated_data.get("latitude") and validated_data.get("longitude"):
            from django.utils import timezone
            validated_data["location_captured_at"] = timezone.now()
        return super().update(instance, validated_data)
