from django.urls import path
# Agregamos ContactoView a la lista de importación
from wallet.views import obtener_dashboard, ContactoView 

urlpatterns = [
    path('dashboard/', obtener_dashboard),
    # Ahora Django sí encontrará la clase aquí abajo
    path('api/contacto/', ContactoView.as_view(), name='contacto'),
]