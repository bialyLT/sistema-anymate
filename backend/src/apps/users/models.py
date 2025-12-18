from django.conf import settings
from django.db import models


class Persona(models.Model):
	codigo_persona = models.BigAutoField(primary_key=True)
	user = models.OneToOneField(
		settings.AUTH_USER_MODEL,
		on_delete=models.CASCADE,
		related_name="persona",
	)
	nombre = models.CharField(max_length=150)
	apellido = models.CharField(max_length=150)
	direccion = models.CharField(max_length=255)
	telefono = models.CharField(max_length=50)
	fecha_nacimiento = models.DateField()
