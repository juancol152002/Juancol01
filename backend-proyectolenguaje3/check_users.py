import os
import django
from django.conf import settings

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'paginacripto.settings')
django.setup()

from django.contrib.auth import get_user_model

try:
    User = get_user_model()
    users = User.objects.all()
    print(f"Total users: {users.count()}")
    for user in users:
        print(f"ID: {user.id}, Username: {user.username}, Email: {user.email}, Is Superuser: {user.is_superuser}")
except Exception as e:
    print(f"Error: {e}")
