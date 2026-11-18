from rest_framework import generics, permissions, status, filters
from rest_framework.views import APIView
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q

from .models import Item, Claim
from .serializers import (
    ItemSerializer,
    ClaimSerializer,
    ClaimStatusUpdateSerializer,
)
from .filters import ItemFilter
from .permissions import IsOwnerOrReadOnly
from notifications.models import Notification


class ItemListCreateView(generics.ListCreateAPIView):
    serializer_class = ItemSerializer
    filter_backends = (DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter)
    filterset_class = ItemFilter
    search_fields = ('title', 'description', 'location', 'category')
    ordering_fields = ('created_at', 'date_lost_or_found', 'title')
    ordering = ('-created_at',)

    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def get_queryset(self):
        queryset = Item.objects.select_related('user').prefetch_related('claims')
        
        # Optional filter for user's own items
        mine = self.request.query_params.get('mine')
        if mine and mine.lower() in ('true', '1') and self.request.user.is_authenticated:
            queryset = queryset.filter(user=self.request.user)

        return queryset

    def perform_create(self, serializer):
        user = self.request.user
        contact_email = serializer.validated_data.get('contact_email') or user.email
        contact_phone = serializer.validated_data.get('contact_phone') or user.phone_number
        serializer.save(user=user, contact_email=contact_email, contact_phone=contact_phone)


class ItemDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Item.objects.select_related('user').prefetch_related('claims')
    serializer_class = ItemSerializer
    permission_classes = (IsOwnerOrReadOnly,)


class ItemResolveView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def patch(self, request, pk):
        try:
            item = Item.objects.get(pk=pk)
        except Item.DoesNotExist:
            return Response({'error': 'Item not found.'}, status=status.HTTP_404_NOT_FOUND)

        if item.user != request.user and not request.user.is_staff:
            return Response({'error': 'You do not have permission to resolve this item.'}, status=status.HTTP_403_FORBIDDEN)

        # Toggle or set resolved
        target_status = request.data.get('status', 'resolved')
        if target_status not in ['active', 'claimed', 'resolved']:
            target_status = 'resolved'

        item.status = target_status
        item.save()

        # Notify active claimants
        for claim in item.claims.filter(status='accepted'):
            Notification.objects.create(
                recipient=claim.claimant,
                sender=request.user,
                item=item,
                claim=claim,
                title=f"Item Status Updated: {item.title}",
                message=f"The reported item '{item.title}' was marked as {item.status.upper()} by {request.user.display_name}.",
                notification_type='item_resolved'
            )

        return Response(ItemSerializer(item, context={'request': request}).data)


# CLAIMS VIEWS
class ClaimListCreateView(generics.ListCreateAPIView):
    serializer_class = ClaimSerializer
    permission_classes = (permissions.IsAuthenticated,)
    filter_backends = (filters.OrderingFilter,)
    ordering = ('-created_at',)

    def get_queryset(self):
        user = self.request.user
        claim_type = self.request.query_params.get('type')
        item_id = self.request.query_params.get('item_id')

        queryset = Claim.objects.select_related('item', 'claimant', 'item__user')

        if item_id:
            queryset = queryset.filter(item_id=item_id)

        if claim_type == 'received':
            return queryset.filter(item__user=user)
        elif claim_type == 'sent':
            return queryset.filter(claimant=user)
        else:
            return queryset.filter(Q(item__user=user) | Q(claimant=user))

    def perform_create(self, serializer):
        user = self.request.user
        claim = serializer.save(claimant=user)

        # Create notification for item owner
        item = claim.item
        Notification.objects.create(
            recipient=item.user,
            sender=user,
            item=item,
            claim=claim,
            title=f"New Claim Request for '{item.title}'",
            message=f"{user.display_name} sent a claim for your {item.get_item_type_display().lower()} '{item.title}': \"{claim.message[:120]}\"",
            notification_type='claim_received'
        )


class ClaimDetailView(generics.RetrieveUpdateAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    queryset = Claim.objects.select_related('item', 'claimant', 'item__user')

    def get_serializer_class(self):
        if self.request.method in ('PUT', 'PATCH'):
            return ClaimStatusUpdateSerializer
        return ClaimSerializer

    def get_object(self):
        obj = super().get_object()
        user = self.request.user
        # Only item owner or claimant can view
        if obj.claimant != user and obj.item.user != user and not user.is_staff:
            self.permission_denied(self.request, message="You do not have permission to view this claim.")
        return obj

    def patch(self, request, *args, **kwargs):
        claim = self.get_object()
        user = request.user

        # Only the item owner can accept or reject a claim
        if claim.item.user != user and not user.is_staff:
            return Response(
                {"error": "Only the item owner can update the claim status."},
                status=status.HTTP_403_FORBIDDEN
            )

        new_status = request.data.get('status')
        if new_status not in ['accepted', 'rejected', 'pending']:
            return Response({"error": "Invalid status value."}, status=status.HTTP_400_BAD_REQUEST)

        claim.status = new_status
        claim.save()

        # Update item status if accepted (optional indicator)
        if new_status == 'accepted' and claim.item.status == 'active':
            claim.item.status = 'claimed'
            claim.item.save()

        # Create notification for claimant
        notif_type = 'claim_accepted' if new_status == 'accepted' else 'claim_rejected'
        action_verb = "ACCEPTED" if new_status == 'accepted' else "REJECTED"
        Notification.objects.create(
            recipient=claim.claimant,
            sender=user,
            item=claim.item,
            claim=claim,
            title=f"Claim {action_verb.title()} for '{claim.item.title}'",
            message=(
                f"Your claim for '{claim.item.title}' was {action_verb.lower()} by {user.display_name}. "
                f"{'Contact details: ' + (claim.item.contact_email or claim.item.contact_phone) if new_status == 'accepted' else ''}"
            ),
            notification_type=notif_type
        )

        return Response(ClaimSerializer(claim, context={'request': request}).data)


# DASHBOARD STATS VIEW
class DashboardStatsView(APIView):
    def get_permissions(self):
        # Allow any so home page can display platform statistics without crashing if unauthenticated
        return [permissions.AllowAny()]

    def get(self, request):
        # Platform-wide statistics (always available)
        total_platform_items = Item.objects.count()
        total_platform_lost = Item.objects.filter(item_type='lost').count()
        total_platform_found = Item.objects.filter(item_type='found').count()
        total_platform_resolved = Item.objects.filter(status='resolved').count()
        total_platform_active = Item.objects.filter(status='active').count()

        data = {
            'platform': {
                'total_items': total_platform_items,
                'total_lost': total_platform_lost,
                'total_found': total_platform_found,
                'total_resolved': total_platform_resolved,
                'total_active': total_platform_active,
            }
        }

        # User-specific statistics (when authenticated)
        if request.user.is_authenticated:
            user = request.user
            user_items = Item.objects.filter(user=user)
            data['user'] = {
                'total_reported': user_items.count(),
                'total_lost': user_items.filter(item_type='lost').count(),
                'total_found': user_items.filter(item_type='found').count(),
                'total_resolved': user_items.filter(status='resolved').count(),
                'total_active': user_items.filter(status='active').count(),
                'pending_received_claims': Claim.objects.filter(item__user=user, status='pending').count(),
                'pending_sent_claims': Claim.objects.filter(claimant=user, status='pending').count(),
            }

        return Response(data)
