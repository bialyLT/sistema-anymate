from django.conf import settings
from django.db import models


class Dispenser(models.Model):
    codigo_dispenser = models.BigAutoField(primary_key=True)
    nombre_dispenser = models.CharField(max_length=255, unique=True)
    estado = models.BooleanField(default=False)
    permanencia = models.BooleanField(default=False)

    ubicacion = models.OneToOneField(
        'core.Ubicacion',
        on_delete=models.PROTECT,
        related_name="dispenser",
    )
    imagenes = models.ManyToManyField(
        'core.Imagen',
        through='DispenserImagen',
        related_name="dispensers",
        blank=True,
    )


class DispenserImagen(models.Model):
    dispenser = models.ForeignKey(Dispenser, on_delete=models.CASCADE)
    imagen = models.ForeignKey('core.Imagen', on_delete=models.CASCADE)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['imagen'], name='uniq_dispenserimagen_imagen'),
        ]


class Solicitud(models.Model):
    codigo_solicitud = models.BigAutoField(primary_key=True)
    fecha_solicitud = models.DateField()

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="solicitudes",
    )
    dispenser = models.ForeignKey(
        Dispenser,
        on_delete=models.CASCADE,
        related_name="solicitudes",
    )
    ubicacion = models.ForeignKey(
        'core.Ubicacion',
        on_delete=models.PROTECT,
        related_name="solicitudes",
    )
