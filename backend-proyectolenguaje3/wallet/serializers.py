from rest_framework import serializers
from .models import Wallet, Transaccion
from catalogo.models import Criptos
from decimal import Decimal
from django.contrib.auth.models import User



class CrearTransaccionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaccion
        # 1. AGREGAMOS 'amount_usd' para que no de error 400 si lo envían
        fields = ['currency', 'type', 'amount_crypto', 'amount_usd'] 
        
        # 2. HACEMOS LOS CAMPOS OPCIONALES (Para permitir enviar uno u otro)
        extra_kwargs = {
            'amount_crypto': {'required': False},
            'amount_usd': {'required': False}
        }

    def to_internal_value(self, data):
        # Hacemos una copia para poder modificar
        data = data.copy()

        # Redondeamos amount_crypto a 18 decimales si viene con más
        if data.get('amount_crypto'):
            try:
                valor = Decimal(str(data['amount_crypto']))
                # round funciona bien con Decimal
                data['amount_crypto'] = round(valor, 18)
            except:
                pass # Si no es número, dejamos que falle en la validación normal
        
        # Redondeamos amount_usd a 2 decimales
        if data.get('amount_usd'):
            try:
                valor = Decimal(str(data['amount_usd']))
                data['amount_usd'] = round(valor, 2)
            except:
                pass

        return super().to_internal_value(data)

    def validate(self, data):
        """
        Aquí validamos:
        1. Que hayan enviado al menos un monto.
        2. Que si es VENTA, tengan saldo suficiente.
        """
        user = self.context['request'].user
        
        # Validación A: ¿Envió algo?
        if not data.get('amount_crypto') and not data.get('amount_usd'):
            raise serializers.ValidationError("Error: Debes ingresar un monto en Cripto o en USD.")

        # Validación B: Seguridad para VENTAS
        if data['type'] == 'sell':
            moneda = data['currency']
            
            # Calculamos cuánto cripto intenta vender realmente
            cantidad_a_vender = Decimal(0)
            if data.get('amount_crypto'):
                cantidad_a_vender = Decimal(data['amount_crypto'])
            elif data.get('amount_usd'):
                # Si puso USD, lo convertimos a Cripto para comparar con el saldo
                cantidad_a_vender = Decimal(data['amount_usd']) / moneda.preciousd

            # Verificamos la Billetera
            try:
                wallet = Wallet.objects.get(user=user, currency=moneda)
                
                # BUSCAMOS LAS VENTAS PENDIENTES DE ESTA MONEDA
                ventas_pendientes = Transaccion.objects.filter(
                    user=user,
                    currency=moneda,
                    type='sell',
                    status='pending'
                )
                
                # Sumamos la cantidad de cripto de todas las ventas pendientes
                cantidad_pendientes = sum(t.amount_crypto for t in ventas_pendientes if t.amount_crypto)
                
                # Cantidad total comprometida = Lo que quiere vender AHORA + Lo que YA pidió vender
                total_comprometido = cantidad_a_vender + cantidad_pendientes

                if wallet.balance < total_comprometido:
                    raise serializers.ValidationError(
                        f"Saldo insuficiente. Tienes {wallet.balance:.8f} {moneda.simbolo}. "
                        f"Intento actual: {cantidad_a_vender:.8f}. "
                        f"Pendiente en otras solicitudes: {cantidad_pendientes:.8f}. "
                        f"Total requerido: {total_comprometido:.8f}"
                    )
            except Wallet.DoesNotExist:
                raise serializers.ValidationError(
                    f"No puedes vender {moneda.simbolo} porque no tienes saldo (Billetera inexistente)."
                )

        # Validación C: Monto Mínimo ($1 USD)
        # Esto previene errores 500 en el modelo y da feedback limpio
        moneda_validacion = data['currency']
        monto_usd_estimado = Decimal(0)

        if data.get('amount_usd'):
            monto_usd_estimado = Decimal(data['amount_usd'])
        elif data.get('amount_crypto'):
            # Calculamos aprox cuanto es en USD
            monto_usd_estimado = Decimal(data['amount_crypto']) * moneda_validacion.preciousd
        
        # Usamos un margen pequeño de tolerancia por redondos, pero estricto en 1
        if monto_usd_estimado < 1:
            raise serializers.ValidationError(f"El monto es muy bajo (${monto_usd_estimado:.2f}). El mínimo es de 1 USD.")

        return data

    def create(self, validated_data):
        """
        Aquí hacemos el CÁLCULO FINAL antes de guardar en la BD.
        Si falta un monto, lo calculamos basado en el precio actual.
        """
        moneda = validated_data['currency']
        precio = moneda.preciousd

        # Si tengo Cripto pero falta USD -> Calculo USD
        if validated_data.get('amount_crypto') and not validated_data.get('amount_usd'):
            validated_data['amount_usd'] = validated_data['amount_crypto'] * precio
            
        # Si tengo USD pero falta Cripto -> Calculo Cripto
        elif validated_data.get('amount_usd') and not validated_data.get('amount_crypto'):
            validated_data['amount_crypto'] = validated_data['amount_usd'] / precio

        # Guardamos
        return super().create(validated_data)

class TransaccionAdminSerializer(serializers.ModelSerializer):
    # Campos de lectura para mostrar info de forma agradable en la tabla
    email_usuario = serializers.ReadOnlyField(source='user.email')
    simbolo_moneda = serializers.ReadOnlyField(source='currency.simbolo')

    class Meta:
        model = Transaccion
        fields = ['id', 'email_usuario', 'simbolo_moneda', 'type', 'amount_crypto', 'amount_usd', 'status', 'created_at']


class UserRegisterSerializer(serializers.ModelSerializer):
    class Meta:
        # Serializador para registrar nuevos usuarios
        model = User
        fields = ['username', 'email', 'password']
        extra_kwargs = {
            'password': {'write_only': True}
        }

    # CAMBIO: Agregamos este método para validar que el email no esté repetido.
    # Django Rest Framework llama automáticamente a métodos validate_<nombre_campo>.
    def validate_email(self, value):
        # Verificamos si existe en la BD
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Este correo electrónico ya está registrado.")
        return value

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user


class WalletSerializer(serializers.ModelSerializer):
    currency_simbolo = serializers.CharField(source='currency.simbolo', read_only=True)
    
    class Meta:
        # Serializador para mostrar la información de la billetera
        model = Wallet
        fields = ['id', 'currency', 'currency_simbolo', 'balance']

class TransaccionSerializer(serializers.ModelSerializer):
    currency_simbolo = serializers.CharField(source='currency.simbolo', read_only=True)

    class Meta:
        # Serializador general para transacciones
        model = Transaccion
        fields = '__all__'
        read_only_fields = ['user', 'status', 'created_at']

        extra_kwargs= {
            'amount_usd':{'required': False},
            'amount_crypto':{'required': False}
        }
    def validate(self, data):
        user = self.context['request'].user
        #aca estoy validando que el usuario haya ingresado al menos un monto
        if not data.get('amount_crypto') and not data.get('amount_usd'):
            raise serializers.ValidationError(
                "Error, no has proporcionado ningún valor en cripto o en USD."
            )
        # Validación adicional para ventas
        if data['type'] == 'sell':
            currency_a_vender = data['currency']
            
            cantidad_a_validar = Decimal(0)

            if data.get('amount_crypto'):
                cantidad_a_validar = data['amount_crypto']
            elif data.get('amount_usd'):
                cantidad_a_validar = Decimal(data['amount_usd']) / currency_a_vender.preciousd

            try:
                wallet = Wallet.objects.get(user=user, currency=currency_a_vender)

                # BUSCAMOS LAS VENTAS PENDIENTES DE ESTA MONEDA
                ventas_pendientes = Transaccion.objects.filter(
                    user=user,
                    currency=currency_a_vender,
                    type='sell',
                    status='pending'
                )
                
                # Sumamos la cantidad de cripto de todas las ventas pendientes
                cantidad_pendientes = sum(t.amount_crypto for t in ventas_pendientes if t.amount_crypto)
                
                # Cantidad total comprometida
                total_comprometido = cantidad_a_validar + cantidad_pendientes

                if wallet.balance < total_comprometido:
                    raise serializers.ValidationError(
                         {"error": f"Tu saldo es insuficiente. Saldo: {wallet.balance} {currency_a_vender.simbolo}. "
                                   f"Intentas vender: {cantidad_a_validar:.8f}. "
                                   f"Pendiente: {cantidad_pendientes:.8f}. "
                                   f"Total: {total_comprometido:.8f}"}
                    )
            except Wallet.DoesNotExist:
                raise serializers.ValidationError(
                    {"error": "No tienes saldo de esta criptomoneda para vender."}
                )
        return data