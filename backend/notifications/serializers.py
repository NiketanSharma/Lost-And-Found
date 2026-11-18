from rest_framework import serializers
from .models import Notification

class NotificationSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.display_name', read_only=True)
    item_title = serializers.CharField(source='item.title', read_only=True)

    class Meta:
        model = Notification
        fields = (
            'id',
            'recipient',
            'sender',
            'sender_name',
            'item',
            'item_title',
            'claim',
            'title',
            'message',
            'notification_type',
            'is_read',
            'created_at',
        )
        read_only_fields = (
            'id',
            'recipient',
            'sender',
            'sender_name',
            'item',
            'item_title',
            'claim',
            'title',
            'message',
            'notification_type',
            'created_at',
        )
