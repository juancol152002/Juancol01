import yagmail
from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import User
from catalogo.models import Criptos
from django.core.exceptions import ValidationError # <--- IMPORTANTE: Para lanzar los errores

class Wallet(models.Model):
    # Almacena información sobre las billeteras de los usuarios
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='wallets')
    currency = models.ForeignKey(Criptos, on_delete=models.CASCADE)
    balance = models.DecimalField(max_digits=30, decimal_places=18, default=0)

    class Meta:
        unique_together = ('user', 'currency')
    
    def __str__(self):
        return f"{self.user.username} - {self.currency.simbolo}: {self.balance}"

class Transaccion(models.Model):
    TYPES = (('buy', 'Compra'), ('sell', 'Venta'))
    STATUS = (('pending', 'Pendiente'), ('approved', 'Aprobado'), ('rejected', 'Rechazado'))

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='transactions')
    currency = models.ForeignKey(Criptos, on_delete=models.CASCADE)
    type = models.CharField(max_length=4, choices=TYPES)
    
    # MODIFICADO: Agregamos null=True y blank=True para permitir el cálculo automático
    amount_crypto = models.DecimalField(max_digits=30, decimal_places=18, null=True, blank=True)
    amount_usd = models.DecimalField(max_digits=20, decimal_places=2, null=True, blank=True)
    
    status = models.CharField(max_length=10, choices=STATUS, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    # 1. EL PORTERO (VALIDACIONES) 🛡️
    def clean(self):
        # Validación A: Nada de números negativos
        if self.amount_crypto is not None and self.amount_crypto <= 0:
            raise ValidationError("La cantidad de criptomonedas debe ser positiva.")
        
        if self.amount_usd is not None and self.amount_usd <= 0:
            raise ValidationError("El monto en USD debe ser positivo.")

        # Validación B: Monto Mínimo de $1 USD (Para evitar problemas de decimales)
        precio_actual = 0
        if self.currency:
            precio_actual = self.currency.preciousd
        
        # Si puso criptos, calculamos cuánto es en USD para ver si llega al dólar
        if self.amount_crypto and not self.amount_usd:
            calculo_usd = self.amount_crypto * precio_actual
            if calculo_usd < 1:
                raise ValidationError(f"El monto es muy bajo (${calculo_usd:.2f}). La compra mínima es de $1 USD.")

        # Si puso USD, revisamos directo
        if self.amount_usd:
            if self.amount_usd < 1:
                raise ValidationError(f"El monto es muy bajo (${self.amount_usd}). La compra mínima es de $1 USD.")

# 2. EL CEREBRO (CÁLCULOS AUTOMÁTICOS) 🧠
    def save(self, *args, **kwargs):
        
        # PASO 1: Hacemos los cálculos PRIMERO (si faltan datos)
        if self.currency and self.currency.preciousd:
            precio = self.currency.preciousd

            # Tengo USD, me falta Cripto -> Divido
            if self.amount_usd and not self.amount_crypto:
                self.amount_crypto = self.amount_usd / precio

            # Tengo Cripto, me falta USD -> Multiplico
            elif self.amount_crypto and not self.amount_usd:
                self.amount_usd = self.amount_crypto * precio

        # PASO 2: REDONDEO OBLIGATORIO (La corrección del error) ✂️
        # Si hay USD, lo forzamos a tener solo 2 decimales para que Django no se queje
        if self.amount_usd:
            self.amount_usd = round(self.amount_usd, 2)
            
        # Si hay Cripto, lo forzamos a 18 decimales (por si acaso)
        if self.amount_crypto:
            self.amount_crypto = round(self.amount_crypto, 18)

        # PASO 3: Ahora sí validamos (El Portero)
        # Esto lanzará el error de "Monto mínimo" si es necesario, pero ya no fallará por dígitos.
        self.full_clean()

        # PASO 4: Guardamos
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.user.username} - {self.type} - {self.currency.simbolo}"


@receiver(post_save, sender=Transaccion)
def actualizar_saldo_wallet(sender, instance, created, **kwargs):
    # Solo actuamos si el status es 'approved'
    if instance.status == 'approved':
        # Buscamos o creamos la billetera
        wallet, _ = Wallet.objects.get_or_create(
            user=instance.user,
            currency=instance.currency
        )

        if instance.type == 'buy':
            wallet.balance += instance.amount_crypto
        elif instance.type == 'sell':
            # Verificamos que tenga saldo suficiente antes de restar (Seguridad extra)
            if wallet.balance >= instance.amount_crypto:
                wallet.balance -= instance.amount_crypto
            
        wallet.save()

        if instance.user.email:
            try:
                mi_correo = 'josedaniel0908@gmail.com'
                mi_password = 'shuv jsce bvhn eppc'

                yag = yagmail.SMTP(user=mi_correo, password=mi_password)

                asunto = f"Transacción aprobada {instance.get_type_display()}"

                contenido = [
                    f"Hola <b>{instance.user.username}</b>,",
                    "Tu transacción ha sido aprobada correctamente!",
                    f"<b>Tipo:</b> {instance.get_type_display()}",
                    f"<b>Moneda:</b> {instance.currency.simbolo}",
                    f"<b>Cantidad:</b> {instance.amount_crypto}",
                    f"<b>Total USD:</b> ${instance.amount_usd}",
                ]
                yag.send(to=instance.user.email, subject=asunto, contents=contenido)
                
                print("Se le notificó al usuario exitosamente por correo electronico.")

            except Exception as e:
                print(f"No se pudo enviar el correo de notificación. Error: {e}")

class RecoveryRequest(models.Model):
    email = models.EmailField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_processed = models.BooleanField(default=False)

    class Meta:
        verbose_name = "Solicitud de Recuperación"
        verbose_name_plural = "Solicitudes de Recuperación"
        ordering = ['-created_at']

    def __str__(self):
        return f"Recuperar: {self.email} ({self.created_at.strftime('%Y-%m-%d %H:%M')})"