import os
import django
import inspect

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'paginacripto.settings')
django.setup()

from wallet.serializers import CrearTransaccionSerializer

print(f"Class: {CrearTransaccionSerializer}")
print(f"File: {inspect.getfile(CrearTransaccionSerializer)}")
if hasattr(CrearTransaccionSerializer, 'run_validation'):
    print("Method 'run_validation' exists.")
    print(inspect.getsource(CrearTransaccionSerializer.run_validation))
else:
    print("Method 'run_validation' DOES NOT EXIST.")
