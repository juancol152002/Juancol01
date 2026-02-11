from django.urls import path
from .views import registrar_usuario, obtener_dashboard, obtener_perfil, actualizar_perfil, cambiar_password

urlpatterns = [
    path('registro/', registrar_usuario, name='registro'),
    path('perfil/', obtener_perfil, name='perfil'),
    path('perfil/actualizar/', actualizar_perfil, name='actualizar-perfil'),
    path('perfil/password/', cambiar_password, name='cambiar-password'),
    path('dashboard/', obtener_dashboard, name='dashboard-users'),
]
