from django.db.models.signals import post_delete, pre_save
from django.dispatch import receiver
from .models import Review, Notification1

@receiver(pre_save, sender=Review)
def notify_review_approval(sender, instance, **kwargs):
    if instance.pk:
        try:
            previous = Review.objects.get(pk=instance.pk)
            print("🚨 إشارات المراجعات (signals.py) تم تحميلها")

            if not previous.is_visible and instance.is_visible:
                print(f"✅ تمت الموافقة على مراجعة رقم {instance.pk} - إرسال إشعار")
                Notification1.objects.get_or_create(
                    user=instance.user,
                    related_review=instance,
                    defaults={'message': "تمت الموافقة على مراجعتك."}
                )
        except Review.DoesNotExist:
            print("❌ المراجعة غير موجودة - جديدة؟")
            pass

@receiver(post_delete, sender=Review)
def review_delete_handler(sender, instance, **kwargs):
    Notification1.objects.create(
        user=instance.user,
        related_review=instance,
        message="تم رفض مراجعتك وحذفها."
    )
