from django.urls import path
from wallet.views import obtener_dashboard, ContactoView, PasswordResetRequestView, ResetPasswordConfirmView

urlpatterns = [
    path('dashboard/', obtener_dashboard),
    path('contacto/', ContactoView.as_view(), name='contacto'),
    path('recuperar-password/', PasswordResetRequestView.as_view(), name='recuperar-password'),
    path('confirmar-password/', ResetPasswordConfirmView.as_view(), name='confirmar-password'),
]