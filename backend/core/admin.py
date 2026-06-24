from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import (
    User,
    Jimbo,
    Mtaa,
    Church,
    EvangelismRecord,
    EvangelismCustomField,
    OfferingType,
    Offering,
    AuditLog,
    SystemSetting,
    Report,
)


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ["username", "email", "full_name", "role", "is_active", "use_location"]
    list_filter = ["role", "is_active", "use_location"]
    readonly_fields = UserAdmin.readonly_fields + (
        "last_login_ip", "last_login_latitude", "last_login_longitude",
    )
    fieldsets = UserAdmin.fieldsets + (
        ("Yesaya Ministry", {
            "fields": (
                "role", "phone", "full_name", "assigned_mtaa", "assigned_church",
                "use_location", "last_login_ip", "last_login_latitude", "last_login_longitude",
            )
        }),
    )


@admin.register(Jimbo)
class JimboAdmin(admin.ModelAdmin):
    list_display = ["name", "district", "region", "created_at"]


@admin.register(Mtaa)
class MtaaAdmin(admin.ModelAdmin):
    list_display = ["name", "jimbo", "leader_name", "is_active"]
    list_filter = ["jimbo", "is_active"]


@admin.register(Church)
class ChurchAdmin(admin.ModelAdmin):
    list_display = ["name", "mtaa", "pastor_name", "member_count", "is_active"]
    list_filter = ["mtaa", "is_active"]


@admin.register(EvangelismRecord)
class EvangelismRecordAdmin(admin.ModelAdmin):
    list_display = ["church", "month", "year", "baptized", "converted", "visited", "supported", "latitude", "longitude"]
    list_filter = ["month", "year"]


@admin.register(OfferingType)
class OfferingTypeAdmin(admin.ModelAdmin):
    list_display = ["name", "kind", "church_percentage", "field_percentage", "is_active"]


@admin.register(Offering)
class OfferingAdmin(admin.ModelAdmin):
    list_display = ["church", "offering_type", "amount", "church_share", "field_share", "month", "year", "latitude", "longitude"]
    list_filter = ["month", "year", "offering_type"]


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ["created_at", "user", "action", "path", "ip_address", "latitude", "longitude"]
    list_filter = ["action", "created_at"]
    readonly_fields = ["user", "action", "path", "ip_address", "latitude", "longitude", "description", "created_at"]


@admin.register(SystemSetting)
class SystemSettingAdmin(admin.ModelAdmin):
    list_display = ["key", "updated_at"]


@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = ["title", "generated_by", "generated_at"]
