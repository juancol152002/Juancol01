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

def run_manual_test():
    print("--- START MANUAL TEST ---")
    
    # 1. Setup
    user, _ = User.objects.get_or_create(username='testuser_manual', email='manual@example.com')
    cripto, _ = Criptos.objects.get_or_create(nombre='Bitcoin', simbolo='BTC', preciousd=50000)
    
    # Clean up
    Transaccion.objects.filter(user=user).delete()
    Wallet.objects.filter(user=user).delete()
    
    # Balance 1.0
    wallet = Wallet.objects.create(user=user, currency=cripto, balance=Decimal('1.0'))
    print(f"User Balance: {wallet.balance}")
    
    # 2. First Request (Valid)
    factory = APIRequestFactory()
    request = factory.post('/fake-url')
    request.user = user
    
    data1 = {'currency': cripto.id, 'type': 'sell', 'amount_crypto': '0.8'}
    s1 = CrearTransaccionSerializer(data=data1, context={'request': request})
    if s1.is_valid():
        s1.save(user=user)
        print("First request created (0.8). Pending.")
    else:
        print("First request FAILED:", s1.errors)
        return

    # Check pending
    pending_count = Transaccion.objects.filter(user=user, status='pending').count()
    print(f"Pending transactions in DB: {pending_count}")

    # 3. Second Request (Should Fail)
    data2 = {'currency': cripto.id, 'type': 'sell', 'amount_crypto': '0.8'}
    s2 = CrearTransaccionSerializer(data=data2, context={'request': request})
    
    print("Validating second request...")
    try:
        is_valid = s2.is_valid()
        print(f"is_valid result: {is_valid}")
        if not is_valid:
            print("Errors:", s2.errors)
    except Exception as e:
        print(f"CRASHED DURING VALIDATION: {e}")

    print("--- END MANUAL TEST ---")

if __name__ == '__main__':
    run_manual_test()
