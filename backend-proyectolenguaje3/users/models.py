from django.db import models
from django.contrib.auth.models import User

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    image = models.ImageField(upload_to='profiles/', null=True, blank=True)
    last_profile_update = models.DateTimeField(null=True, blank=True)
    
    def __str__(self):
        return f"Perfil de {self.user.username}"
