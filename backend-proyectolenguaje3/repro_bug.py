import os
import django
from decimal import Decimal

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'paginacripto.settings')
django.setup()

from django.contrib.auth.models import User
from wallet.models import Wallet, Transaccion
from catalogo.models import Criptos
from wallet.serializers import CrearTransaccionSerializer
from rest_framework.request import Request
from rest_framework.test import APIRequestFactory

def run_reproduction():
    # 1. Setup Data
    print("Setting up data...")
    user, _ = User.objects.get_or_create(username='testuser_bug_repro', email='test@example.com')
    cripto, _ = Criptos.objects.get_or_create(nombre='Bitcoin', simbolo='BTC', preciousd=50000)
    
    # Ensure clean state
    Wallet.objects.filter(user=user).delete()
    Transaccion.objects.filter(user=user).delete()

    # 2. Give user balance (simulate approved buy)
    wallet = Wallet.objects.create(user=user, currency=cripto, balance=Decimal('1.0'))
    print(f"User balance: {wallet.balance} {wallet.currency.simbolo}")

    # 3. Create first sell request for 0.8 BTC
    factory = APIRequestFactory()
    request = factory.post('/fake-url')
    request.user = user

    data1 = {
        'currency': cripto.id,
        'type': 'sell',
        'amount_crypto': '0.8'
    }
    
    # Use serializer validation logic which is where the bug resides
    serializer1 = CrearTransaccionSerializer(data=data1, context={'request': request})
    if serializer1.is_valid():
        serializer1.save(user=user)
        print("First sell request (0.8 BTC) created successfully.")
    else:
        print("Failed to create first request:", serializer1.errors)
        return

    # 4. Create second sell request for 0.8 BTC (Should fail if bug is fixed, currently succeeds)
    print("Attempting to create second sell request (0.8 BTC)...")
    data2 = {
        'currency': cripto.id,
        'type': 'sell',
        'amount_crypto': '0.8'
    }

    serializer2 = CrearTransaccionSerializer(data=data2, context={'request': request})
    if serializer2.is_valid():
        serializer2.save(user=user)
        print("BUG REPRODUCED: Second sell request created successfully! Total pending: 1.6 BTC, Balance: 1.0 BTC")
    else:
        print("Second request failed validation (Expected behavior after fix).")
        print("Errors:", serializer2.errors)

if __name__ == '__main__':
    run_reproduction()
