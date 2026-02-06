import openpyxl # Importamos la librería para Excel
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework.exceptions import ValidationError as DRFValidationError
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

class CrearTransaccionView(APIView):
    permission_classes = [IsAuthenticated] 

    def post(self, request):
        # Pasamos el contexto del request para poder acceder a request.user dentro del serializer
        serializer = CrearTransaccionSerializer(data=request.data, context={'request': request})
        
        if serializer.is_valid():
            # El método .save() del serializer llamará automáticamente a nuestro método .create()
            # que acabamos de programar arriba con los cálculos matemáticos.
            serializer.save(user=request.user)
            
            return Response({
                "message": "Solicitud creada exitosamente", 
                "data": serializer.data
            }, status=201)
            
        # Si falla la validación (saldo insuficiente, falta de datos, etc.), devolvemos el error
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
        queryset = Transaccion.objects.filter(user=self.request.user)
        queryset = queryset.order_by('-created_at')
        tipo = self.request.query_params.get('type')
        if tipo:
            queryset = queryset.filter(type=tipo)
        return queryset

    def perform_create(self, serializer):
        try:
            # 1. Obtenemos datos básicos
            user = self.request.user
            cripto = serializer.validated_data['currency']
            precio_actual = cripto.preciousd
            tipo = serializer.validated_data['type']
            
            # Entradas del usuario (puede venir una, la otra, o ninguna)
            input_usd = serializer.validated_data.get('amount_usd')
            input_crypto = serializer.validated_data.get('amount_crypto')

            # 2. CÁLCULO MAESTRO: ¿Cuánta Cripto se está moviendo realmente?
            cantidad_final_crypto = 0
            cantidad_final_usd = 0

            if input_usd:
                # Si puso USD, calculamos la cripto
                cantidad_final_usd = float(input_usd)
                cantidad_final_crypto = cantidad_final_usd / float(precio_actual)
            elif input_crypto:
                # Si puso Cripto, calculamos el USD
                cantidad_final_crypto = float(input_crypto)
                cantidad_final_usd = cantidad_final_crypto * float(precio_actual)
            else:
                # Si no puso nada
                raise DRFValidationError({"error": "Debes ingresar un monto en USD o en Criptomonedas."})

            # Imprimimos en consola para depurar (míralo en tu terminal al probar)
            print(f"DEBUG: Usuario {user} intenta {tipo} {cantidad_final_crypto} {cripto.simbolo}")

            # 3. 🛡️ VALIDACIÓN DE VENTA (EL FILTRO DE SEGURIDAD)
            if tipo == 'sell':
                # Buscamos la billetera de forma segura
                wallet = Wallet.objects.filter(user=user, currency=cripto).first()

                # CASO 1: No tiene billetera (Nunca ha comprado esa moneda)
                if not wallet:
                    raise DRFValidationError({
                        "error": f"No puedes vender {cripto.simbolo} porque no tienes una billetera de esta moneda. ¡Primero debes comprar!"
                    })
                
                # CASO 2: Tiene billetera pero no le alcanza el saldo
                # Convertimos a float para asegurar la comparación matemática
                if float(wallet.balance) < cantidad_final_crypto:
                    raise DRFValidationError({
                        "error": f"Saldo insuficiente. Tienes {wallet.balance:.8f} {cripto.simbolo} y quieres vender {cantidad_final_crypto:.8f}."
                    })

            # 4. SI PASÓ TODAS LAS PRUEBAS -> GUARDAMOS
            serializer.save(
                user=user, 
                status='pending',
                amount_crypto=cantidad_final_crypto,
                amount_usd=cantidad_final_usd
            )

        except DjangoValidationError as e:
            # Error del modelo (ej. compra mínima)
            raise DRFValidationError(e.message_dict)
        except Exception as e:
            # Si el error ya es nuestro (DRF), lo lanzamos. Si es otro, lo convertimos.
            if isinstance(e, DRFValidationError):
                raise e
            raise DRFValidationError({"error": str(e)})

    # --- EXPORTAR A EXCEL (Déjalo igual) ---
    @action(detail=False, methods=['get'])
    def exportar_excel(self, request):
        transacciones = self.get_queryset()
        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = "Historial de Transacciones"
        headers = ['ID', 'Fecha', 'Tipo', 'Moneda', 'Cantidad', 'Total USD', 'Estado']
        ws.append(headers)
        for t in transacciones:
            fecha_simple = t.created_at.strftime('%Y-%m-%d %H:%M:%S')
            fila = [
                t.id,
                fecha_simple,
                t.get_type_display(),
                t.currency.simbolo,
                float(t.amount_crypto) if t.amount_crypto else 0,
                float(t.amount_usd) if t.amount_usd else 0,
                t.get_status_display()
            ]
            ws.append(fila)
        response = HttpResponse(
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        response['Content-Disposition'] = 'attachment; filename="historial_transacciones.xlsx"'
        wb.save(response)
        return response

