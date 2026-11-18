from django.contrib import admin
from .models import Item, Claim

@admin.register(Item)
class ItemAdmin(admin.ModelAdmin):
    list_display = ('title', 'item_type', 'category', 'status', 'location', 'date_lost_or_found', 'user', 'created_at')
    list_filter = ('item_type', 'category', 'status', 'date_lost_or_found', 'created_at')
    search_fields = ('title', 'description', 'location', 'user__username', 'user__email')
    list_editable = ('status',)
    date_hierarchy = 'created_at'


@admin.register(Claim)
class ClaimAdmin(admin.ModelAdmin):
    list_display = ('item', 'claimant', 'status', 'contact_phone', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('item__title', 'claimant__username', 'message', 'proof_details')
    list_editable = ('status',)
