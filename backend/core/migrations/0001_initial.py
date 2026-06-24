# Generated manually for YESAYA MINISTRY v3.0

import django.contrib.auth.models
import django.contrib.auth.validators
from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ("auth", "0012_alter_user_first_name_max_length"),
    ]

    operations = [
        migrations.CreateModel(
            name="User",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("password", models.CharField(max_length=128, verbose_name="password")),
                ("last_login", models.DateTimeField(blank=True, null=True, verbose_name="last login")),
                ("is_superuser", models.BooleanField(default=False, help_text="Designates that this user has all permissions without explicitly assigning them.", verbose_name="superuser status")),
                ("username", models.CharField(error_messages={"unique": "A user with that username already exists."}, help_text="Required. 150 characters or fewer. Letters, digits and @/./+/-/_ only.", max_length=150, unique=True, validators=[django.contrib.auth.validators.UnicodeUsernameValidator()], verbose_name="username")),
                ("first_name", models.CharField(blank=True, max_length=150, verbose_name="first name")),
                ("last_name", models.CharField(blank=True, max_length=150, verbose_name="last name")),
                ("email", models.EmailField(blank=True, max_length=254, verbose_name="email address")),
                ("is_staff", models.BooleanField(default=False, help_text="Designates whether the user can log into this admin site.", verbose_name="staff status")),
                ("is_active", models.BooleanField(default=True, help_text="Designates whether this user should be treated as active. Unselect this instead of deleting accounts.", verbose_name="active")),
                ("date_joined", models.DateTimeField(default=django.utils.timezone.now, verbose_name="date joined")),
                ("role", models.CharField(choices=[("super_admin", "Super Admin"), ("jimbo_admin", "Jimbo Admin"), ("mtaa_leader", "Mtaa Leader"), ("church_leader", "Church Leader"), ("viewer", "Viewer")], default="viewer", max_length=20)),
                ("phone", models.CharField(blank=True, default="", max_length=20)),
                ("full_name", models.CharField(blank=True, default="", max_length=255)),
                ("last_login_ip", models.GenericIPAddressField(blank=True, null=True)),
                ("last_login_latitude", models.DecimalField(blank=True, decimal_places=6, max_digits=9, null=True)),
                ("last_login_longitude", models.DecimalField(blank=True, decimal_places=6, max_digits=9, null=True)),
                ("use_location", models.BooleanField(default=True, help_text="Ruhusu mfumo kukusanya location")),
                ("groups", models.ManyToManyField(blank=True, help_text="The groups this user belongs to. A user will get all permissions granted to each of their groups.", related_name="user_set", related_query_name="user", to="auth.group", verbose_name="groups")),
                ("user_permissions", models.ManyToManyField(blank=True, help_text="Specific permissions for this user.", related_name="user_set", related_query_name="user", to="auth.permission", verbose_name="user permissions")),
            ],
            options={
                "db_table": "ym_user",
            },
            managers=[
                ("objects", django.contrib.auth.models.UserManager()),
            ],
        ),
        migrations.CreateModel(
            name="Jimbo",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("name", models.CharField(max_length=255)),
                ("district", models.CharField(blank=True, default="", max_length=255)),
                ("region", models.CharField(blank=True, default="", max_length=255)),
                ("address", models.TextField(blank=True, default="")),
                ("phone", models.CharField(blank=True, default="", max_length=50)),
                ("email", models.EmailField(blank=True, default="")),
                ("logo", models.ImageField(blank=True, null=True, upload_to="logos/")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
            options={
                "db_table": "ym_jimbo",
            },
        ),
        migrations.CreateModel(
            name="Mtaa",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("name", models.CharField(max_length=255)),
                ("leader_name", models.CharField(blank=True, default="", max_length=255)),
                ("phone", models.CharField(blank=True, default="", max_length=50)),
                ("location", models.CharField(blank=True, default="", max_length=255)),
                ("is_active", models.BooleanField(default=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("jimbo", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="mitaa", to="core.jimbo")),
            ],
            options={
                "db_table": "ym_mtaa",
                "verbose_name_plural": "Mitaa",
            },
        ),
        migrations.CreateModel(
            name="Church",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("name", models.CharField(max_length=255)),
                ("pastor_name", models.CharField(blank=True, default="", max_length=255)),
                ("phone", models.CharField(blank=True, default="", max_length=50)),
                ("address", models.TextField(blank=True, default="")),
                ("member_count", models.PositiveIntegerField(default=0)),
                ("is_active", models.BooleanField(default=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("mtaa", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="churches", to="core.mtaa")),
            ],
            options={
                "db_table": "ym_church",
                "verbose_name_plural": "Churches",
            },
        ),
        migrations.CreateModel(
            name="OfferingType",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("name", models.CharField(max_length=255)),
                ("slug", models.SlugField(max_length=50, unique=True)),
                ("kind", models.CharField(choices=[("zaka", "Zaka"), ("shukrani", "Sadaka ya Shukrani"), ("kambi", "Sadaka ya Kambi"), ("ujenzi_jimbo", "Sadaka ya Ujenzi wa Jimbo"), ("majengo_kanisa", "Sadaka ya Majengo ya Kanisa"), ("custom", "Custom")], default="custom", max_length=20)),
                ("church_percentage", models.DecimalField(decimal_places=2, default=0, max_digits=5)),
                ("field_percentage", models.DecimalField(decimal_places=2, default=0, max_digits=5)),
                ("description", models.TextField(blank=True, default="")),
                ("is_active", models.BooleanField(default=True)),
            ],
            options={
                "db_table": "ym_offering_type",
            },
        ),
        migrations.CreateModel(
            name="Offering",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("amount", models.DecimalField(decimal_places=2, max_digits=15)),
                ("church_share", models.DecimalField(decimal_places=2, default=0, max_digits=15)),
                ("field_share", models.DecimalField(decimal_places=2, default=0, max_digits=15)),
                ("month", models.PositiveSmallIntegerField(validators=[django.core.validators.MinValueValidator(1), django.core.validators.MaxValueValidator(12)])),
                ("year", models.PositiveIntegerField()),
                ("notes", models.TextField(blank=True, default="")),
                ("latitude", models.DecimalField(blank=True, decimal_places=6, max_digits=9, null=True)),
                ("longitude", models.DecimalField(blank=True, decimal_places=6, max_digits=9, null=True)),
                ("location_accuracy", models.DecimalField(blank=True, decimal_places=2, max_digits=9, null=True)),
                ("location_captured_at", models.DateTimeField(blank=True, null=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("church", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="offerings", to="core.church")),
                ("offering_type", models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name="offerings", to="core.offeringtype")),
                ("recorded_by", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to="core.user")),
            ],
            options={
                "db_table": "ym_offering",
            },
        ),
        migrations.CreateModel(
            name="EvangelismRecord",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("month", models.PositiveSmallIntegerField(validators=[django.core.validators.MinValueValidator(1), django.core.validators.MaxValueValidator(12)])),
                ("year", models.PositiveIntegerField()),
                ("baptized", models.PositiveIntegerField(default=0)),
                ("converted", models.PositiveIntegerField(default=0)),
                ("visited", models.PositiveIntegerField(default=0)),
                ("supported", models.PositiveIntegerField(default=0)),
                ("comments", models.TextField(blank=True, default="")),
                ("evidence", models.FileField(blank=True, null=True, upload_to="evidence/%Y/%m/")),
                ("latitude", models.DecimalField(blank=True, decimal_places=6, max_digits=9, null=True)),
                ("longitude", models.DecimalField(blank=True, decimal_places=6, max_digits=9, null=True)),
                ("location_accuracy", models.DecimalField(blank=True, decimal_places=2, max_digits=9, null=True)),
                ("location_captured_at", models.DateTimeField(blank=True, null=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("church", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="evangelism_records", to="core.church")),
                ("recorded_by", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to="core.user")),
            ],
            options={
                "db_table": "ym_evangelism_record",
                "unique_together": {("church", "month", "year")},
            },
        ),
        migrations.CreateModel(
            name="EvangelismCustomField",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("label", models.CharField(max_length=255)),
                ("value", models.CharField(max_length=255)),
                ("record", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="custom_fields", to="core.evangelismrecord")),
            ],
            options={
                "db_table": "ym_evangelism_custom_field",
            },
        ),
        migrations.CreateModel(
            name="AuditLog",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("action", models.CharField(max_length=20)),
                ("path", models.CharField(max_length=500)),
                ("ip_address", models.GenericIPAddressField(blank=True, null=True)),
                ("latitude", models.DecimalField(blank=True, decimal_places=6, max_digits=9, null=True)),
                ("longitude", models.DecimalField(blank=True, decimal_places=6, max_digits=9, null=True)),
                ("description", models.TextField(blank=True, default="")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("user", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to="core.user")),
            ],
            options={
                "db_table": "ym_audit_log",
                "ordering": ["-created_at"],
            },
        ),
        migrations.CreateModel(
            name="SystemSetting",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("key", models.CharField(max_length=100, unique=True)),
                ("value", models.TextField()),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
            options={
                "db_table": "ym_system_setting",
            },
        ),
        migrations.CreateModel(
            name="Report",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("title", models.CharField(max_length=255)),
                ("file", models.FileField(upload_to="reports/%Y/%m/")),
                ("filters", models.JSONField(default=dict)),
                ("generated_at", models.DateTimeField(auto_now_add=True)),
                ("generated_by", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to="core.user")),
            ],
            options={
                "db_table": "ym_report",
            },
        ),
        migrations.AddField(
            model_name="user",
            name="assigned_church",
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="leaders", to="core.church"),
        ),
        migrations.AddField(
            model_name="user",
            name="assigned_mtaa",
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="leaders", to="core.mtaa"),
        ),
    ]
