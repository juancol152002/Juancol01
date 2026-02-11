from django.urls import path
# Agregamos ContactoView a la lista de importación
from .views import obtener_dashboard, ContactoView, UserBalanceView, CrearTransaccionView, AdminTransaccionView, CrearRetiroView

urlpatterns = [
    path('dashboard/', obtener_dashboard),
    # Ahora Django sí encontrará la clase aquí abajo
    path('api/contacto/', ContactoView.as_view(), name='contacto'),
    path('balance/', UserBalanceView.as_view(), name='user-balance'),
    path('transaccion/', CrearTransaccionView.as_view(), name='crear-transaccion'),
    path('admin/transacciones/', AdminTransaccionView.as_view(), name='admin-transacciones'),
    path('transacciones/retirar/', CrearRetiroView.as_view(), name='retirar'),

]