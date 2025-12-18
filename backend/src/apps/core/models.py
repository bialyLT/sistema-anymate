from django.db import models


class Imagen(models.Model):
    codigo_imagen = models.BigAutoField(primary_key=True)
    ruta_imagen = models.CharField(max_length=500)


class Ubicacion(models.Model):
    codigo_ubicacion = models.BigAutoField(primary_key=True)
    longitud = models.IntegerField()
    latitud = models.IntegerField()
