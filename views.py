import decimal
import openpyxl # Importamos la librería para Excel
from django.http import HttpResponse # Para devolver el archivo al navegador
from rest_framework.decorators import action # Para crear la ruta personalizada
from rest_framework import viewsets, permissions
from .models import Wallet, Transaccion
from .serializers import WalletSerializer, TransaccionSerializer, WalletBalanceSerializer
from rest_framework import generics
from .serializers import UserRegisterSerializer
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth.models import User
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .serializers import TransaccionAdminSerializer
from rest_framework.views import APIView
from rest_framework.permissions import IsAdminUser
from .serializers import CrearTransaccionSerializer
from rest_framework import generics, permissions, status 
from rest_framework.response import Response
from django.db import transaction
from catalogo.models import Criptos
import yagmail


class CrearTransaccionView(generics.CreateAPIView):
    serializer_class = TransaccionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        with transaction.atomic():
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            
            usuario = self.request.user
            moneda_id = serializer.validated_data['currency']
            tipo_operacion = serializer.validated_data['type']
            cantidad_usd = serializer.validated_data['amount_usd']
            
            # Buscamos la billetera USDT
            try:
                usdt_currency = Criptos.objects.get(simbolo='USDT')
                wallet_usdt, _ = Wallet.objects.get_or_create(user=usuario, currency=usdt_currency)
            except Criptos.DoesNotExist:
                return Response({"error": "La moneda USDT no está configurada."}, status=status.HTTP_400_BAD_REQUEST)

            # --- LÓGICA DE CONGELAMIENTO (PENDING) ---

            if tipo_operacion == 'buy':
                # Si compra otra moneda, LE QUITAMOS LOS USDT AHORA (Congelados)
                if moneda_id.simbolo != 'USDT':
                    if wallet_usdt.balance < cantidad_usd:
                        return Response({"error": f"Saldo insuficiente en USDT. Tienes {wallet_usdt.balance}"}, status=status.HTTP_400_BAD_REQUEST)
                    
                    wallet_usdt.balance -= cantidad_usd
                    wallet_usdt.save()

            elif tipo_operacion == 'sell':
                # Si vende, NO le damos los USDT todavía. 
                # (Aquí deberías tener lógica para restar la Cripto que vende, para congelarla también)
                pass 
                
            self.perform_create(serializer)
            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def perform_create(self, serializer):
    # Estado 'pending'
     serializer.save(user=self.request.user, status='pending')

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

class UserBalanceView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Traemos solo las billeteras que tengan saldo positivo (> 0) para no ensuciar la gráfica
        wallets = Wallet.objects.filter(user=request.user, balance__gt=0)
        serializer = WalletBalanceSerializer(wallets, many=True)
        return Response(serializer.data)
    
class CrearRetiroView(generics.CreateAPIView):
    serializer_class = TransaccionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        data = request.data
        print("DATOS RECIBIDOS EN BACKEND:", data) #
        
        wallet_id = data.get('wallet_id')
        raw_amount = data.get('amount_crypto')
        direccion = data.get('address')
        red = data.get('network')

        # 1. Validación manual de seguridad
        if not raw_amount or str(raw_amount).strip() == "":
            return Response({"error": "El monto no puede estar vacío"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # 2. Conversión ultra-segura a Decimal
            # Convertimos a string, quitamos espacios y reemplazamos comas
            clean_amount_str = str(raw_amount).strip().replace(',', '.')
            amount_crypto = decimal.Decimal(clean_amount_str)
            
            with transaction.atomic():
                # 3. Buscar la billetera bloqueándola
                wallet = Wallet.objects.select_for_update().get(user=self.request.user, pk=wallet_id)

                # 4. Validar saldo
                if wallet.balance < amount_crypto:
                    return Response({"error": f"Saldo insuficiente. Tienes {wallet.balance}"}, status=status.HTTP_400_BAD_REQUEST)

                # 5. Restar saldo (Congelamiento)
                wallet.balance -= amount_crypto
                wallet.save()

                # 6. Crear la transacción
                Transaccion.objects.create(
                    user=self.request.user,
                    currency=wallet.currency,
                    type='sell', 
                    amount_crypto=amount_crypto,
                    amount_usd=0,
                    status='pending',
                )

            return Response({"message": "Retiro solicitado correctamente."}, status=status.HTTP_201_CREATED)

        except (decimal.InvalidOperation, ValueError, TypeError) as e:
            print(f"ERROR DE CONVERSIÓN: {e}") # Para ver el detalle en consola
            return Response({"error": "El monto ingresado no es un número válido"}, status=status.HTTP_400_BAD_REQUEST)
        except Wallet.DoesNotExist:
            return Response({"error": "Billetera no encontrada"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            print(f"ERROR INESPERADO: {e}")
            return Response({"error": "Ocurrió un error interno en el servidor"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)