from django.db import models
from django.conf import settings

class Notification(models.Model):
    TYPE_CHOICES = (
        ('claim_received', 'New Claim Request'),
        ('claim_accepted', 'Claim Accepted'),
        ('claim_rejected', 'Claim Rejected'),
        ('item_resolved', 'Item Resolved'),
        ('general', 'General Notification'),
    )

    recipient = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='sent_notifications')
    item = models.ForeignKey('items.Item', on_delete=models.SET_NULL, null=True, blank=True, related_name='notifications')
    claim = models.ForeignKey('items.Claim', on_delete=models.SET_NULL, null=True, blank=True, related_name='notifications')
    title = models.CharField(max_length=200)
    message = models.TextField()
    notification_type = models.CharField(max_length=25, choices=TYPE_CHOICES, default='general')
    is_read = models.BooleanField(default=False, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Notification for {self.recipient.username}: {self.title}"
