from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from django.urls import reverse

User = get_user_model()

class AuthFixesTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.superuser = User.objects.create_superuser(
            username='admin',
            email='admin@test.com',
            password='password123'
        )

    def test_superuser_login_with_email(self):
        # Test login via CustomTokenObtainPairView
        url = reverse('token_obtain_pair')
        data = {
            'username': 'admin@test.com',
            'password': 'password123'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, 200, f"Login failed: {response.data}")
        self.assertIn('access', response.data)

    def test_register_duplicate_email_users_view(self):
        # Test users.views.registrar_usuario
        url = '/api/users/registro/' 
        data = {
            'email': 'admin@test.com',
            'password': 'password123',
            'nombre': 'Fake Admin'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, 400, "Should have failed with duplicate email")
        # Check that error is in response
        self.assertTrue('error' in response.data)

    def test_register_duplicate_email_wallet_view(self):
        # Test wallet.views.RegisterView
        url = reverse('register') # /api/register/
        data = {
            'username': 'newuser',
            'email': 'admin@test.com',
            'password': 'password123'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, 400, "Should have failed with duplicate email")
        # Serializer error format
        print(f"RegisterView error response: {response.data}")
        self.assertTrue('email' in response.data or 'non_field_errors' in response.data)
