from django.db.models.signals import post_save, post_delete
from .models import (
    AuditLog,
    User,
    Jimbo,
    Mtaa,
    Church,
    EvangelismRecord,
    OfferingType,
    Offering,
    Report,
)


AUDITED_SENDERS = [
    User,
    Jimbo,
    Mtaa,
    Church,
    EvangelismRecord,
    OfferingType,
    Offering,
    Report,
]


def log_create_update(sender, instance, created, **kwargs):
    try:
        action = "CREATE" if created else "UPDATE"
        AuditLog.objects.create(
            action=action,
            path=f"{sender.__name__}:{instance.pk}",
            description=f"{action} {sender.__name__} #{instance.pk}",
        )
    except Exception:
        pass


def log_delete(sender, instance, **kwargs):
    try:
        AuditLog.objects.create(
            action="DELETE",
            path=f"{sender.__name__}:{instance.pk}",
            description=f"DELETE {sender.__name__} #{instance.pk}",
        )
    except Exception:
        pass


for _sender in AUDITED_SENDERS:
    post_save.connect(log_create_update, sender=_sender)
    post_delete.connect(log_delete, sender=_sender)
