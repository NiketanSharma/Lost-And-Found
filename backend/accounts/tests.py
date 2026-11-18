from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth import get_user_model

User = get_user_model()

class AccountsAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.register_url = reverse('register')
        self.login_url = reverse('login')
        self.profile_url = reverse('profile')
        self.change_password_url = reverse('change_password')

        self.user_data = {
            'username': 'john_doe',
            'email': 'john@example.com',
            'full_name': 'John Doe',
            'phone_number': '+1234567890',
            'password': 'SecurePassword123!',
            'confirm_password': 'SecurePassword123!',
        }

    def test_user_registration_success(self):
        response = self.client.post(self.register_url, self.user_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertEqual(response.data['user']['username'], 'john_doe')
        self.assertTrue(User.objects.filter(username='john_doe').exists())

    def test_registration_password_mismatch(self):
        data = self.user_data.copy()
        data['confirm_password'] = 'Mismatch123!'
        response = self.client.post(self.register_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('confirm_password', response.data)

    def test_user_login_success(self):
        # Create user
        User.objects.create_user(
            username='jane_doe',
            email='jane@example.com',
            password='SecurePassword123!',
            full_name='Jane Doe'
        )
        login_data = {
            'username': 'jane_doe',
            'password': 'SecurePassword123!'
        }
        response = self.client.post(self.login_url, login_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertEqual(response.data['user']['email'], 'jane@example.com')

    def test_profile_unauthorized_access(self):
        response = self.client.get(self.profile_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_profile_retrieve_and_update(self):
        user = User.objects.create_user(
            username='mark_smith',
            email='mark@example.com',
            password='SecurePassword123!',
            full_name='Mark Smith'
        )
        self.client.force_authenticate(user=user)

        # Retrieve profile
        response = self.client.get(self.profile_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], 'mark_smith')

        # Update profile
        update_data = {
            'full_name': 'Mark A. Smith',
            'phone_number': '+987654321',
            'bio': 'Software developer looking for my lost keys.'
        }
        response = self.client.patch(self.profile_url, update_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        user.refresh_from_db()
        self.assertEqual(user.full_name, 'Mark A. Smith')
        self.assertEqual(user.bio, 'Software developer looking for my lost keys.')
