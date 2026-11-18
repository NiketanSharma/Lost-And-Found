from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from items.models import Item, Claim
from notifications.models import Notification
from datetime import date

User = get_user_model()

class ItemsAndClaimsAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Create two distinct users
        self.user1 = User.objects.create_user(
            username='alice',
            email='alice@example.com',
            password='Password123!',
            full_name='Alice Wonderland'
        )
        self.user2 = User.objects.create_user(
            username='bob',
            email='bob@example.com',
            password='Password123!',
            full_name='Bob Builder'
        )

        self.items_url = reverse('item_list_create')
        self.claims_url = reverse('claim_list_create')

        # Create sample item owned by user1
        self.item1 = Item.objects.create(
            title='Blue Leather Wallet',
            item_type='lost',
            category='Wallets',
            description='Lost near the library reading hall. Contains student ID.',
            location='University Central Library',
            date_lost_or_found=date(2026, 11, 15),
            user=self.user1,
            contact_email='alice@example.com'
        )

    def test_item_listing_public(self):
        # Public listing should work without auth
        response = self.client.get(self.items_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(response.data['count'], 1)
        self.assertEqual(response.data['results'][0]['title'], 'Blue Leather Wallet')

    def test_item_creation_unauthenticated(self):
        # Creating an item without auth should be rejected
        item_data = {
            'title': 'iPhone 15 Pro',
            'item_type': 'found',
            'category': 'Mobile Phones',
            'description': 'Found near cafeteria bench.',
            'location': 'Student Union Cafeteria',
            'date_lost_or_found': '2026-11-16',
        }
        response = self.client.post(self.items_url, item_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_item_creation_authenticated(self):
        self.client.force_authenticate(user=self.user2)
        item_data = {
            'title': 'Sony WH-1000XM5 Headphones',
            'item_type': 'found',
            'category': 'Electronics',
            'description': 'Black headphones left on study table 4.',
            'location': 'Science Building 3rd Floor',
            'date_lost_or_found': '2026-11-17',
        }
        response = self.client.post(self.items_url, item_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['title'], 'Sony WH-1000XM5 Headphones')
        self.assertEqual(response.data['user']['username'], 'bob')

    def test_item_update_by_owner(self):
        self.client.force_authenticate(user=self.user1)
        detail_url = reverse('item_detail', kwargs={'pk': self.item1.pk})
        update_data = {
            'title': 'Blue Leather Wallet (Updated with reward)',
            'description': 'Cash reward offered for return.'
        }
        response = self.client.patch(detail_url, update_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.item1.refresh_from_db()
        self.assertEqual(self.item1.title, 'Blue Leather Wallet (Updated with reward)')

    def test_item_update_unauthorized_by_other_user(self):
        # user2 tries to edit user1's item
        self.client.force_authenticate(user=self.user2)
        detail_url = reverse('item_detail', kwargs={'pk': self.item1.pk})
        update_data = {'title': 'Malicious Edit'}
        response = self.client.patch(detail_url, update_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_claim_submission(self):
        # user2 submits claim for user1's item
        self.client.force_authenticate(user=self.user2)
        claim_data = {
            'item': self.item1.pk,
            'message': 'This is my wallet! It has a driver license under name Bob.',
            'proof_details': 'DL number ends in 4821',
            'contact_phone': '+1987654321',
        }
        response = self.client.post(self.claims_url, claim_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['status'], 'pending')

        # Check notification created for item owner (user1)
        notif = Notification.objects.filter(recipient=self.user1).first()
        self.assertIsNotNone(notif)
        self.assertIn("New Claim Request", notif.title)

    def test_cannot_claim_own_item(self):
        # user1 tries to claim their own item
        self.client.force_authenticate(user=self.user1)
        claim_data = {
            'item': self.item1.pk,
            'message': 'Claiming my own wallet',
        }
        response = self.client.post(self.claims_url, claim_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_claim_approval_and_rejection(self):
        # user2 submits claim
        claim = Claim.objects.create(
            item=self.item1,
            claimant=self.user2,
            message='I believe this is mine.',
            status='pending'
        )

        claim_detail_url = reverse('claim_detail', kwargs={'pk': claim.pk})

        # user2 cannot approve their own claim
        self.client.force_authenticate(user=self.user2)
        response = self.client.patch(claim_detail_url, {'status': 'accepted'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # user1 (the owner) approves claim
        self.client.force_authenticate(user=self.user1)
        response = self.client.patch(claim_detail_url, {'status': 'accepted'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        claim.refresh_from_db()
        self.assertEqual(claim.status, 'accepted')

        # Check notification created for claimant (user2)
        notif = Notification.objects.filter(recipient=self.user2, notification_type='claim_accepted').first()
        self.assertIsNotNone(notif)
        self.assertIn("Accepted", notif.title)
