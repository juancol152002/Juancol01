from django.db.models.signals import pre_save
from django.dispatch import receiver
from wallet.models import Transaccion, Wallet, Criptos

@receiver(pre_save, sender=Transaccion)
def procesar_transaccion(sender, instance, **kwargs):
    # Verificamos si es una actualización (ya existía)
    if instance.pk:
        old_instance = Transaccion.objects.get(pk=instance.pk)
        
        # Si el estado cambió de 'pending' a 'approved'
        if old_instance.status == 'pending' and instance.status == 'approved':
            
            # Buscar billeteras
            try:
                usdt_currency = Criptos.objects.get(simbolo='USDT')
                wallet_usdt, _ = Wallet.objects.get_or_create(user=instance.user, currency=usdt_currency)
                wallet_cripto, _ = Wallet.objects.get_or_create(user=instance.user, currency=instance.currency)
            except Criptos.DoesNotExist:
                return # Si no hay configuración, no hacemos nada (o logueamos error)

            # --- LÓGICA DE APROBACIÓN ---
            
            if instance.type == 'buy':
                # COMPRA APROBADA:
                # El USDT ya se restó al crearla. Solo falta ENTREGAR LA CRIPTO.
                wallet_cripto.balance += instance.amount_crypto
                wallet_cripto.save()

            elif instance.type == 'sell':
                # VENTA APROBADA:
                # ENTREGAR EL USDT al usuario.
                wallet_usdt.balance += instance.amount_usd
                wallet_usdt.save()
                # (Opcional: Si no restaste la cripto al crear, réstala aquí)
                # wallet_cripto.balance -= instance.amount_crypto
                # wallet_cripto.save()

        # --- LÓGICA DE RECHAZO (REFUND) ---
        elif old_instance.status == 'pending' and instance.status == 'rejected':
            # Si rechazamos una COMPRA, hay que DEVOLVER los USDT que congelamos
            if instance.type == 'buy':
                 wallet_usdt, _ = Wallet.objects.get_or_create(user=instance.user, currency=Criptos.objects.get(simbolo='USDT'))
                 wallet_usdt.balance += instance.amount_usd
                 wallet_usdt.save()
                 
            # Si era un RETIRO ('withdrawal') y se rechazó, devolvemos las monedas
            elif instance.type == 'withdrawal':
                 wallet_cripto, _ = Wallet.objects.get_or_create(user=instance.user, currency=instance.currency)
                 wallet_cripto.balance += instance.amount_crypto
                 wallet_cripto.save()