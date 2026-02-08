import openpyxl # Importamos la librería para Excel
from django.http import HttpResponse # Para devolver el archivo al navegador
from rest_framework.decorators import action # Para crear la ruta personalizada
from rest_framework import viewsets, permissions
from .models import Wallet, Transaccion
from decimal import Decimal
from .serializers import WalletSerializer, TransaccionSerializer
from rest_framework import generics
from .serializers import UserRegisterSerializer
from rest_framework.permissions import AllowAny
from django.contrib.auth.models import User
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from .serializers import TransaccionAdminSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from .serializers import CrearTransaccionSerializer
import yagmail
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny

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
        # Traer solo las pendientes
        pendientes = Transaccion.objects.filter(status='pending').order_by('-created_at')
        serializer = TransaccionAdminSerializer(pendientes, many=True)
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
    # Datos simulados (Mock Data)
    datos_portafolio = {
        "usuario": user.first_name,
        "balance_total": 15400.00,
        "activos": [
            {"nombre": "Bitcoin", "simbolo": "BTC", "cantidad": 0.5, "valor": 22000, "color": "bg-orange-500"},
            {"nombre": "USDT", "simbolo": "USDT", "cantidad": 400, "valor": 400, "color": "bg-emerald-500"},
        ]
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
