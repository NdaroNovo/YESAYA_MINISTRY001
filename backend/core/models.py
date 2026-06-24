from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import MinValueValidator, MaxValueValidator


class User(AbstractUser):
    ROLE_CHOICES = [
        ("super_admin", "Super Admin"),
        ("jimbo_admin", "Jimbo Admin"),
        ("mtaa_leader", "Mtaa Leader"),
        ("church_leader", "Church Leader"),
        ("viewer", "Viewer"),
    ]
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="viewer")
    phone = models.CharField(max_length=20, blank=True, default="")
    full_name = models.CharField(max_length=255, blank=True, default="")
    assigned_mtaa = models.ForeignKey(
        "Mtaa", null=True, blank=True, on_delete=models.SET_NULL, related_name="leaders"
    )
    assigned_church = models.ForeignKey(
        "Church", null=True, blank=True, on_delete=models.SET_NULL, related_name="leaders"
    )
    last_login_ip = models.GenericIPAddressField(null=True, blank=True)
    last_login_latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    last_login_longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    use_location = models.BooleanField(default=True, help_text="Ruhusu mfumo kukusanya location")

    def __str__(self):
        return self.username

    class Meta:
        db_table = "ym_user"


class LocationMixin(models.Model):
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    location_accuracy = models.DecimalField(max_digits=9, decimal_places=2, null=True, blank=True)
    location_captured_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        abstract = True


class Jimbo(models.Model):
    name = models.CharField(max_length=255)
    district = models.CharField(max_length=255, blank=True, default="")
    region = models.CharField(max_length=255, blank=True, default="")
    address = models.TextField(blank=True, default="")
    phone = models.CharField(max_length=50, blank=True, default="")
    email = models.EmailField(blank=True, default="")
    logo = models.ImageField(upload_to="logos/", blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    class Meta:
        db_table = "ym_jimbo"


class Mtaa(models.Model):
    jimbo = models.ForeignKey(Jimbo, on_delete=models.CASCADE, related_name="mitaa")
    name = models.CharField(max_length=255)
    leader_name = models.CharField(max_length=255, blank=True, default="")
    phone = models.CharField(max_length=50, blank=True, default="")
    location = models.CharField(max_length=255, blank=True, default="")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    class Meta:
        db_table = "ym_mtaa"
        verbose_name_plural = "Mitaa"


class Church(models.Model):
    mtaa = models.ForeignKey(Mtaa, on_delete=models.CASCADE, related_name="churches")
    name = models.CharField(max_length=255)
    pastor_name = models.CharField(max_length=255, blank=True, default="")
    phone = models.CharField(max_length=50, blank=True, default="")
    address = models.TextField(blank=True, default="")
    member_count = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    class Meta:
        db_table = "ym_church"
        verbose_name_plural = "Churches"


class EvangelismRecord(LocationMixin, models.Model):
    church = models.ForeignKey(Church, on_delete=models.CASCADE, related_name="evangelism_records")
    recorded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    month = models.PositiveSmallIntegerField(validators=[MinValueValidator(1), MaxValueValidator(12)])
    year = models.PositiveIntegerField()
    baptized = models.PositiveIntegerField(default=0)
    converted = models.PositiveIntegerField(default=0)
    visited = models.PositiveIntegerField(default=0)
    supported = models.PositiveIntegerField(default=0)
    comments = models.TextField(blank=True, default="")
    evidence = models.FileField(upload_to="evidence/%Y/%m/", blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "ym_evangelism_record"
        unique_together = [["church", "month", "year"]]


class EvangelismCustomField(models.Model):
    record = models.ForeignKey(EvangelismRecord, on_delete=models.CASCADE, related_name="custom_fields")
    label = models.CharField(max_length=255)
    value = models.CharField(max_length=255)

    class Meta:
        db_table = "ym_evangelism_custom_field"


class OfferingType(models.Model):
    TYPE_CHOICES = [
        ("zaka", "Zaka"),
        ("shukrani", "Sadaka ya Shukrani"),
        ("kambi", "Sadaka ya Kambi"),
        ("ujenzi_jimbo", "Sadaka ya Ujenzi wa Jimbo"),
        ("majengo_kanisa", "Sadaka ya Majengo ya Kanisa"),
        ("custom", "Custom"),
    ]
    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=50, unique=True)
    kind = models.CharField(max_length=20, choices=TYPE_CHOICES, default="custom")
    church_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    field_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    description = models.TextField(blank=True, default="")
    is_active = models.BooleanField(default=True)

    def clean(self):
        from django.core.exceptions import ValidationError
        if self.church_percentage + self.field_percentage != 100:
            raise ValidationError("Asilimia za Kanisa na Jimbo lazima ziwe jumla 100%.")

    def __str__(self):
        return self.name

    class Meta:
        db_table = "ym_offering_type"


class Offering(LocationMixin, models.Model):
    church = models.ForeignKey(Church, on_delete=models.CASCADE, related_name="offerings")
    offering_type = models.ForeignKey(OfferingType, on_delete=models.PROTECT, related_name="offerings")
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    church_share = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    field_share = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    month = models.PositiveSmallIntegerField(validators=[MinValueValidator(1), MaxValueValidator(12)])
    year = models.PositiveIntegerField()
    notes = models.TextField(blank=True, default="")
    recorded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        self.church_share = self.amount * (self.offering_type.church_percentage / 100)
        self.field_share = self.amount * (self.offering_type.field_percentage / 100)
        super().save(*args, **kwargs)

    class Meta:
        db_table = "ym_offering"


class AuditLog(models.Model):
    ACTION_CHOICES = [
        ("LOGIN", "Login"),
        ("LOGOUT", "Logout"),
        ("CREATE", "Create"),
        ("UPDATE", "Update"),
        ("DELETE", "Delete"),
        ("EXPORT", "Export"),
        ("PRINT", "Print"),
        ("SHARE", "Share"),
    ]
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    action = models.CharField(max_length=20)
    path = models.CharField(max_length=500)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    description = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "ym_audit_log"
        ordering = ["-created_at"]


class SystemSetting(models.Model):
    key = models.CharField(max_length=100, unique=True)
    value = models.TextField()
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "ym_system_setting"

    def __str__(self):
        return self.key


class Report(models.Model):
    title = models.CharField(max_length=255)
    file = models.FileField(upload_to="reports/%Y/%m/")
    generated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    generated_at = models.DateTimeField(auto_now_add=True)
    filters = models.JSONField(default=dict)

    class Meta:
        db_table = "ym_report"
