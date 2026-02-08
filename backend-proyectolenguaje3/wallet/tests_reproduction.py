from django.test import TestCase, override_settings
from django.contrib.auth.models import User
from wallet.models import Wallet, Transaccion
from catalogo.models import Criptos
from wallet.serializers import CrearTransaccionSerializer
from rest_framework.request import Request
from rest_framework.test import APIRequestFactory
from decimal import Decimal

@override_settings(REST_FRAMEWORK={
    'DEFAULT_AUTHENTICATION_CLASSES': [],
    'DEFAULT_PERMISSION_CLASSES': []
})
class SellRequestBugTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', email='test@example.com', password='password')
        self.cripto = Criptos.objects.create(nombrecripto='Bitcoin', simbolo='BTC', preciousd=50000)
        self.wallet = Wallet.objects.create(user=self.user, currency=self.cripto, balance=Decimal('1.0'))
        self.factory = APIRequestFactory()

    def test_concurrent_sell_requests_exceed_balance(self):
        """
        Test that a user can create multiple sell requests that arguably exceed their balance
        if the pending requests are not accounted for.
        """
        # 1. Create first sell request for 0.8 BTC (Valid)
        data1 = {
            'currency': self.cripto.id,
            'type': 'sell',
            'amount_crypto': '0.8'
        }
        request = self.factory.post('/fake-url')
        request.user = self.user
        
        serializer1 = CrearTransaccionSerializer(data=data1, context={'request': request})
        self.assertTrue(serializer1.is_valid(), "First request should be valid")
        serializer1.save(user=self.user)
        
        # Verify transaction created
        self.assertEqual(Transaccion.objects.count(), 1)
        self.assertEqual(Transaccion.objects.first().status, 'pending')

        # 2. Create second sell request for 0.8 BTC 
        # Total pending: 0.8. Balance: 1.0. 
        # If we allow this new 0.8, total potential sell = 1.6 > 1.0. 
        # This SHOULD fail, but currently passes (bug).
        data2 = {
            'currency': self.cripto.id,
            'type': 'sell',
            'amount_crypto': '0.8'
        }
        serializer2 = CrearTransaccionSerializer(data=data2, context={'request': request})
        
        # ASSERT: This used to be a bug, now it should be correctly rejected.
        print("DEBUG: CALLING is_valid() FOR SERIALIZER 2")
        try:
             is_valid = serializer2.is_valid()
        except Exception as e:
             print(f"DEBUG: EXCEPTION IN is_valid: {e}")
             raise e

        print(f"DEBUG: is_valid result: {is_valid}")
        
        if not is_valid:
            print("\n[SUCCESS] System correctly rejected the request exceeding balance.")
            print("Errors:", serializer2.errors)
        else:
            print("\n[FAILURE] System allowed the request despite insufficient balance.")
            
        self.assertFalse(is_valid, "Regression Test: The second request should be rejected due to insufficient balance (including pending).")
