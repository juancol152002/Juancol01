from rest_framework import serializers
from .models import Criptos
from .models import HistorialPrecio
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from django.contrib.auth import get_user_model

User = get_user_model()

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        # Lógica para permitir login con email o username
        username_or_email = attrs.get('username')
        password = attrs.get('password')

        if username_or_email and password:
            # CAMBIO: Permitir login con Email.
            # Verifica si el input parece un email (tiene '@').
            if '@' in username_or_email:
                try:
                    # Buscamos el usuario por su email.
                    user_obj = User.objects.get(email=username_or_email)
                    # Si existe, reemplazamos el 'username' en los datos
                    # por el username real del usuario, para que el sistema
                    # de autenticación por defecto de Django lo reconozca.
                    attrs['username'] = user_obj.username
                except User.DoesNotExist:
                    # Si no existe usuario con ese email, no hacemos nada.
                    # Dejamos que la validación por defecto falle.
                    pass
        
        # 1. Genera los tokens normales (access y refresh)
        data = super().validate(attrs)

        # 2. Agrega los datos extra que quieras devolver
        # self.user es el usuario que está intentando loguearse
        data['id'] = self.user.id
        data['email'] = self.user.email
        data['username'] = self.user.username
        data['first_name'] = self.user.first_name
        data['is_staff'] = self.user.is_staff  
        data['is_superuser'] = self.user.is_superuser
        
        # Imagen de perfil url absoluta
        request = self.context.get('request')
        if hasattr(self.user, 'profile') and self.user.profile.image:
            if request:
                data['image_url'] = request.build_absolute_uri(self.user.profile.image.url)
            else:
                data['image_url'] = self.user.profile.image.url
        else:
            default_path = '/media/default-avatar.jpg'
            if request:
                data['image_url'] = request.build_absolute_uri(default_path)
            else:
                data['image_url'] = default_path

        return data
    
class CriptosSerializer(serializers.ModelSerializer):
    class Meta:
        model = Criptos
        fields = ['id', 'nombrecripto', 'simbolo', 'preciousd']

class HistorialPrecioSerializer(serializers.ModelSerializer):
    class Meta:
        model = HistorialPrecio
        fields = ['precio', 'fecha_registro']
        