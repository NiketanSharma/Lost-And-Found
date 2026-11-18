from rest_framework import serializers
from .models import Item, Claim
from accounts.serializers import UserSerializer

class ItemSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = Item
        fields = ('id', 'title', 'item_type', 'category', 'status', 'location', 'date_lost_or_found', 'image')


class ItemSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    is_owner = serializers.SerializerMethodField()
    claims_count = serializers.SerializerMethodField()

    class Meta:
        model = Item
        fields = (
            'id',
            'title',
            'item_type',
            'category',
            'description',
            'image',
            'location',
            'date_lost_or_found',
            'contact_phone',
            'contact_email',
            'status',
            'user',
            'is_owner',
            'claims_count',
            'created_at',
            'updated_at',
        )
        read_only_fields = ('id', 'user', 'is_owner', 'claims_count', 'created_at', 'updated_at')

    def get_is_owner(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.user_id == request.user.id
        return False

    def get_claims_count(self, obj):
        return obj.claims.count()

    def validate_image(self, value):
        if value:
            # Check maximum size (5 MB)
            max_size = 5 * 1024 * 1024
            if value.size > max_size:
                raise serializers.ValidationError("Image file size cannot exceed 5MB.")
            # Check extension
            valid_extensions = ('.jpg', '.jpeg', '.png', '.webp', '.gif')
            if not any(value.name.lower().endswith(ext) for ext in valid_extensions):
                raise serializers.ValidationError("Unsupported image format. Allowed: JPG, PNG, WEBP, GIF.")
        return value


class ClaimSerializer(serializers.ModelSerializer):
    claimant = UserSerializer(read_only=True)
    item_details = ItemSummarySerializer(source='item', read_only=True)
    item_owner_id = serializers.IntegerField(source='item.user_id', read_only=True)
    item_owner_name = serializers.CharField(source='item.user.display_name', read_only=True)

    class Meta:
        model = Claim
        fields = (
            'id',
            'item',
            'item_details',
            'item_owner_id',
            'item_owner_name',
            'claimant',
            'message',
            'proof_details',
            'contact_phone',
            'contact_email',
            'status',
            'created_at',
            'updated_at',
        )
        read_only_fields = (
            'id',
            'claimant',
            'item_details',
            'item_owner_id',
            'item_owner_name',
            'created_at',
            'updated_at',
        )

    def validate(self, attrs):
        request = self.context.get('request')
        item = attrs.get('item')

        if request and item:
            # Prevent claiming own item
            if item.user == request.user:
                raise serializers.ValidationError("You cannot claim an item you reported yourself.")

            # Check if user already submitted a pending or accepted claim for this item
            existing = Claim.objects.filter(
                item=item,
                claimant=request.user,
                status__in=['pending', 'accepted']
            ).exists()
            if existing and self.instance is None:
                raise serializers.ValidationError("You have already submitted an active claim for this item.")

        return attrs


class ClaimStatusUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Claim
        fields = ('status',)

    def validate_status(self, value):
        if value not in ['accepted', 'rejected', 'pending']:
            raise serializers.ValidationError("Status must be 'accepted', 'rejected', or 'pending'.")
        return value
