import openpyxl # Importamos la librería para Excel
from django.http import HttpResponse # Para devolver el archivo al navegador
from rest_framework.decorators import action # Para crear la ruta personalizada
from rest_framework import viewsets, permissions
from .models import Wallet, Transaccion, RecoveryRequest
from decimal import Decimal
from .serializers import WalletSerializer, TransaccionSerializer
from rest_framework import generics
from .serializers import UserRegisterSerializer
from rest_framework.permissions import AllowAny
from django.contrib.auth.models import User
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from .serializers import TransaccionAdminSerializer, CrearTransaccionSerializer
import yagmail
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser, IsAuthenticated, AllowAny
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.contrib.auth.tokens import default_token_generator

class CrearTransaccionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = CrearTransaccionSerializer(data=request.data, context={'request': request})
        
        if serializer.is_valid():
            # Guardamos la transacción
            serializer.save(user=request.user)
            return Response({
                "message": "Solicitud creada exitosamente", 
                "data": serializer.data
            }, status=201)
            
        return Response(serializer.errors, status=400)

class AdminTransaccionView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        queryset = Transaccion.objects.all().order_by('-created_at')
        
        # Filtros opcionales
        status = request.query_params.get('status')
        tipo = request.query_params.get('type') # 'buy' o 'sell'

        if status and status != 'all':
            queryset = queryset.filter(status=status)
        
        if tipo and tipo != 'all':
            queryset = queryset.filter(type=tipo)

        serializer = TransaccionAdminSerializer(queryset, many=True)
        return Response(serializer.data)

    def post(self, request, pk):
        accion = request.data.get('accion') # 'aprobar' o 'rechazar'
        
        try:
            # Buscamos la transacción
            tx = Transaccion.objects.get(pk=pk)
        except Transaccion.DoesNotExist:
            return Response({"error": "Transacción no encontrada"}, status=404)

        # Si ya no está pendiente, no la tocamos (Seguridad)
        if tx.status != 'pending':
             return Response({"error": "Esta transacción ya fue procesada anteriormente"}, status=400)

        if accion == 'rechazar':
            tx.status = 'rejected'
            tx.save() # Esto NO dispara la lógica de la wallet porque el status no es approved
            return Response({"message": "Transacción rechazada"})

        if accion == 'aprobar':
            # Solo cambiamos el estado.
            # ALERTA: Al hacer .save(), Django disparará automáticamente 
            # el código que tienes en models.py (actualizar saldo + enviar correo)
            tx.status = 'approved'
            tx.save() 

            return Response({"message": "Transacción aprobada. Saldo actualizado y correo enviado."})

        return Response({"error": "Acción no válida"}, status=400)


# --- VISTA PROTEGIDA (DASHBOARD) ---
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def obtener_dashboard(request):
    user = request.user
    # 1. Obtener las billeteras del usuario con saldo positivo
    wallets = Wallet.objects.filter(user=user, balance__gt=0).select_related('currency')
    
    activos = []
    balance_total = Decimal('0.00')
    
    # 2. Calcular el valor de cada activo y el balance total
    for w in wallets:
        precio_actual = w.currency.preciousd or Decimal('0.00')
        valor_usd = w.balance * precio_actual
        balance_total += valor_usd
        
        activos.append({
            "nombre": w.currency.nombrecripto,
            "simbolo": w.currency.simbolo,
            "cantidad": float(w.balance),
            "valor": float(round(valor_usd, 2)),
            "precio_actual": float(precio_actual),
        })
    
    # 3. Ordenar por valor (mayor a menor)
    activos.sort(key=lambda x: x['valor'], reverse=True)
    
    datos_portafolio = {
        "usuario": user.first_name or user.username,
        "balance_total": float(round(balance_total, 2)),
        "activos": activos
    }
    return Response(datos_portafolio)

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [AllowAny]
    serializer_class = UserRegisterSerializer

class WalletViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = WalletSerializer
    
    def get_queryset(self):
        # El usuario solo ve SUS billeteras, no las de otros
        return Wallet.objects.filter(user=self.request.user)

class TransaccionViewSet(viewsets.ModelViewSet):
    serializer_class = TransaccionSerializer

    def get_queryset(self):
        # 1. Filtramos por el usuario logueado
        queryset = Transaccion.objects.filter(user=self.request.user)
        
        # 2. Ordenamos: Lo más nuevo primero (-created_at)
        queryset = queryset.order_by('-created_at')

        # 3. (Opcional) Filtro extra: ?type=buy o ?type=sell
        tipo = self.request.query_params.get('type')
        if tipo:
            queryset = queryset.filter(type=tipo)

        return queryset

    def perform_create(self, serializer):
        # 1. Obtenemos la cripto y su precio actual
        cripto_seleccionada = serializer.validated_data['currency']
        precio_actual = cripto_seleccionada.preciousd
        
        # 2. LOGICA INTELIGENTE: ¿Qué nos envió el usuario?
        
        # OPCIÓN A: El usuario envió DÓLARES (amount_usd)
        # Usamos .get() para verificar si existe sin que dé error
        if serializer.validated_data.get('amount_usd'):
            monto_usd = serializer.validated_data['amount_usd']
            
            # Calculamos cuánta cripto le toca: Dólares / Precio
            cantidad_calculada = monto_usd / precio_actual
            
            # Guardamos calculando la Cripto
            serializer.save(
                user=self.request.user, 
                status='pending',
                amount_crypto=cantidad_calculada 
            )

        # OPCIÓN B: El usuario envió CRIPTO (amount_crypto) - La forma clásica
        elif serializer.validated_data.get('amount_crypto'):
            cantidad = serializer.validated_data['amount_crypto']
            
            # Calculamos cuánto es en Dólares: Cantidad * Precio
            total_calculado = cantidad * precio_actual
            
            # Guardamos calculando el USD
            serializer.save(
                user=self.request.user, 
                status='pending',
                amount_usd=total_calculado
            )

    # --- NUEVA FUNCIONALIDAD: EXPORTAR A EXCEL ---
    @action(detail=False, methods=['get'])
    def exportar_excel(self, request):
        # 1. Obtenemos los datos (reutilizando tu lógica de filtros y orden)
        transacciones = self.get_queryset()

        # 2. Creamos el libro de Excel y la hoja activa
        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = "Historial de Transacciones"

        # 3. Definimos los encabezados de las columnas
        headers = ['ID', 'Fecha', 'Tipo', 'Moneda', 'Cantidad', 'Total USD', 'Estado']
        ws.append(headers)

        # 4. Iteramos sobre tus transacciones para llenar las filas
        for t in transacciones:
            # Formateamos la fecha para que se lea bien en Excel
            fecha_simple = t.created_at.strftime('%Y-%m-%d %H:%M:%S')
            
            fila = [
                t.id,
                fecha_simple,
                t.get_type_display(),   # Convierte 'buy' en "Compra" (según tu modelo)
                t.currency.simbolo,     # Accedemos al símbolo de la relación ForeignKey
                float(t.amount_crypto), # Convertimos a float para que Excel lo trate como número
                float(t.amount_usd),
                t.get_status_display()  # Convierte 'approved' en "Aprobado"
            ]
            ws.append(fila)

        # 5. Preparamos la respuesta HTTP tipo archivo
        response = HttpResponse(
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        # Esto le dice al navegador "Descarga este archivo con este nombre":
        response['Content-Disposition'] = 'attachment; filename="historial_transacciones.xlsx"'

        # 6. Guardamos el libro en la respuesta
        wb.save(response)
        return response

    # --- NUEVA FUNCIONALIDAD: EXPORTAR TODO (ADMIN) ---
    @action(detail=False, methods=['get'], permission_classes=[IsAdminUser])
    def exportar_todo_excel(self, request):
        # 1. Obtenemos TODAS las transacciones
        transacciones = Transaccion.objects.all().order_by('-created_at')

        # 2. Creamos el libro de Excel y la hoja activa
        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = "Reporte Global Transacciones"

        # 3. Encabezados (Agregamos Usuario para saber de quien es)
        headers = ['ID', 'Usuario', 'Fecha', 'Tipo', 'Moneda', 'Cantidad', 'Total USD', 'Estado']
        ws.append(headers)

        # 4. Iteramos
        for t in transacciones:
            fecha_simple = t.created_at.strftime('%Y-%m-%d %H:%M:%S')
            
            fila = [
                t.id,
                t.user.email, # Agregamos el email del usuario
                fecha_simple,
                t.get_type_display(),
                t.currency.simbolo,
                float(t.amount_crypto),
                float(t.amount_usd),
                t.get_status_display()
            ]
            ws.append(fila)

        # 5. Respuesta HTTP
        response = HttpResponse(
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        response['Content-Disposition'] = 'attachment; filename="reporte_global_transacciones.xlsx"'

        wb.save(response)
        return response

   # formulario
class ContactoView(APIView):
    permission_classes = [AllowAny] 

    def post(self, request):
        nombre = request.data.get('nombre')
        email_usuario = request.data.get('email')
        asunto_usuario = request.data.get('asunto')
        mensaje = request.data.get('mensaje')

        try:
            # Datos extraídos de tu configuración
            mi_correo = 'josedaniel0908@gmail.com'
            mi_password = 'shuv jsce bvhn eppc' 

            yag = yagmail.SMTP(user=mi_correo, password=mi_password)
            asunto_correo = f"NUEVO MENSAJE DE CONTACTO: {asunto_usuario}"
            
            contenido = [
                f"Nombre: <b>{nombre}</b>",
                f"Correo: {email_usuario}",
                "<hr>",
                f"Mensaje:",
                mensaje
            ]

            # Envío del correo
            yag.send(to=mi_correo, subject=asunto_correo, contents=contenido)
            return Response({"status": "ok"}, status=200)
        except Exception as e:
            return Response({"error": str(e)}, status=500)

class PasswordResetRequestView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response({"error": "El correo es obligatorio."}, status=400)

        # Verificar si el usuario existe
        if not User.objects.filter(email=email).exists():
            return Response({"error": "No existe una cuenta asociada a este correo."}, status=404)

        # Registrar la solicitud
        RecoveryRequest.objects.create(email=email)

        # (Opcional) Enviar correo de notificación al administrador o al usuario
        try:
            # Generar token y uid
            user = User.objects.get(email=email)
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)
            
            # URL para el frontend (Vite por defecto usa el puerto 5173)
            reset_link = f"http://localhost:5173/reset-password/{uid}/{token}"

            mi_correo = 'josedaniel0908@gmail.com'
            mi_password = 'shuv jsce bvhn eppc'
            yag = yagmail.SMTP(user=mi_correo, password=mi_password)
            
            yag.send(
                to=email,
                subject="Recuperación de Contraseña - CryptoManager",
                contents=[
                    f"Hola <b>{user.username}</b>,",
                    "Has solicitado restablecer tu contraseña. Haz clic en el siguiente botón para continuar:",
                    f"<a href='{reset_link}' style='display:inline-block;background:#06b6d4;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;font-weight:bold;'>Restablecer Contraseña</a>",
                    "<br><br>",
                    "Si no funciona el botón, copia y pega este enlace en tu navegador:",
                    f"{reset_link}",
                    "<br><hr>",
                    "Si no solicitaste este cambio, puedes ignorar este correo de forma segura."
                ]
            )
        except Exception as e:
            print(f"Error enviando correo de recuperación: {e}")

        return Response({"message": "Se ha enviado un enlace de recuperación a tu correo electrónico."}, status=200)

class ResetPasswordConfirmView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        uidb64 = request.data.get('uid')
        token = request.data.get('token')
        new_password = request.data.get('password')

        if not all([uidb64, token, new_password]):
            return Response({"error": "Faltan datos obligatorios."}, status=400)

        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response({"error": "Enlace de recuperación inválido o expirado."}, status=400)

        if default_token_generator.check_token(user, token):
            user.set_password(new_password)
            user.save()
            return Response({"message": "Contraseña actualizada exitosamente. Ya puedes iniciar sesión."}, status=200)
        else:
            return Response({"error": "El enlace ha expirado o es inválido."}, status=400)
