from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password, check_password
from .serializers import UserSerializer, UserProfileSerializer, ChangePasswordSerializer

# --- VISTA DE REGISTRO ---
@api_view(['POST'])
@permission_classes([AllowAny])
def registrar_usuario(request):
    data = request.data
    try:
        if User.objects.filter(email=data['email']).exists():
            return Response({'error': 'El correo electrónico ya está registrado.'}, status=400)

        user = User.objects.create(
            username=data['email'],
            email=data['email'],
            password=make_password(data['password']),
            first_name=data.get('nombre') or data.get('first_name', '')
        )
        return Response({'mensaje': 'Usuario creado exitosamente'}, status=201)
    except Exception as e:
        return Response({'error': str(e)}, status=400)

# --- OBTENER PERFIL ---
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def obtener_perfil(request):
    serializer = UserSerializer(request.user)
    return Response(serializer.data)

# --- ACTUALIZAR PERFIL (NOMBRE E IMAGEN) ---
from django.utils import timezone
from datetime import timedelta

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def actualizar_perfil(request):
    user = request.user
    profile = user.profile
    
    nombre = request.data.get('nombre')
    imagen = request.FILES.get('image')
    
    # Solo bloquear si se está intentando cambiar nombre o imagen
    if nombre or imagen:
        if profile.last_profile_update:
            tiempo_transcurrido = timezone.now() - profile.last_profile_update
            if tiempo_transcurrido < timedelta(hours=72):
                horas_restantes = int((timedelta(hours=72) - tiempo_transcurrido).total_seconds() // 3600)
                return Response({
                    'error': f'Debes esperar 72 horas para cambiar tus datos de perfil nuevamente. Faltan aproximadamente {horas_restantes} horas.'
                }, status=403)

    if nombre:
        user.first_name = nombre
        user.save()
        
    if imagen:
        profile.image = imagen
        
    if nombre or imagen:
        profile.last_profile_update = timezone.now()
        profile.save()
        
    return Response({
        'mensaje': 'Perfil actualizado correctamente',
        'user': UserSerializer(user).data
    })

# --- CAMBIAR CONTRASEÑA ---
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def cambiar_password(request):
    user = request.user
    serializer = ChangePasswordSerializer(data=request.data)
    
    if serializer.is_valid():
        if not check_password(serializer.data.get('old_password'), user.password):
            return Response({'error': 'La contraseña actual es incorrecta.'}, status=400)
            
        user.set_password(serializer.data.get('new_password'))
        user.save()
        return Response({'mensaje': 'Contraseña actualizada correctamente'})
        
    return Response(serializer.errors, status=400)

# --- VISTA PROTEGIDA (DASHBOARD) - Mantener para compatibilidad ---
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def obtener_dashboard(request):
    user = request.user
    datos_portafolio = {
        "usuario": user.first_name or user.username,
        "email": user.email,
        "avatar": request.build_absolute_uri(user.profile.image.url) if user.profile.image else None,
        "balance_total": 0, # Implementar lógica de balance si es necesario
        "activos": []
    }
    return Response(datos_portafolio)
