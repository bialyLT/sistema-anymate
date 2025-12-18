from django.db import models


class Imagen(models.Model):
    codigo_imagen = models.BigAutoField(primary_key=True)
    ruta_imagen = models.CharField(max_length=500)


class Ubicacion(models.Model):
    codigo_ubicacion = models.BigAutoField(primary_key=True)
    # Guardamos coordenadas normalizadas para evitar micro-diferencias.
    # Se escribe siempre con lógica de redondeo desde los endpoints.
    longitud = models.DecimalField(max_digits=9, decimal_places=6)
    latitud = models.DecimalField(max_digits=9, decimal_places=6)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["latitud", "longitud"], name="uniq_ubicacion_lat_lon"),
        ]
