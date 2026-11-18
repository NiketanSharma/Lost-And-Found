from django.db import models
from django.conf import settings

class Item(models.Model):
    ITEM_TYPES = (
        ('lost', 'Lost Item'),
        ('found', 'Found Item'),
    )

    CATEGORY_CHOICES = (
        ('Electronics', 'Electronics'),
        ('Mobile Phones', 'Mobile Phones'),
        ('Wallets', 'Wallets'),
        ('Documents', 'Documents'),
        ('Bags', 'Bags'),
        ('Books', 'Books'),
        ('Clothing', 'Clothing'),
        ('Jewellery', 'Jewellery'),
        ('Keys', 'Keys'),
        ('Other', 'Other'),
    )

    STATUS_CHOICES = (
        ('active', 'Active'),
        ('claimed', 'Claimed'),
        ('resolved', 'Resolved'),
    )

    title = models.CharField(max_length=200)
    item_type = models.CharField(max_length=10, choices=ITEM_TYPES, db_index=True)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, db_index=True)
    description = models.TextField()
    image = models.ImageField(upload_to='items/', blank=True, null=True)
    location = models.CharField(max_length=255, db_index=True)
    date_lost_or_found = models.DateField(db_index=True)
    contact_phone = models.CharField(max_length=25, blank=True)
    contact_email = models.EmailField(blank=True)
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='active', db_index=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='items')
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"[{self.get_item_type_display()}] {self.title} ({self.status})"


class Claim(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
    )

    item = models.ForeignKey(Item, on_delete=models.CASCADE, related_name='claims')
    claimant = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='submitted_claims')
    message = models.TextField(help_text="Describe proof of ownership or additional details")
    proof_details = models.TextField(blank=True, help_text="Serial numbers, distinctive marks, or receipts")
    contact_phone = models.CharField(max_length=25, blank=True)
    contact_email = models.EmailField(blank=True)
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='pending', db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Claim by {self.claimant.username} on '{self.item.title}' ({self.status})"
