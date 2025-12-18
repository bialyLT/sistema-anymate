from rest_framework import serializers

from core.models import Imagen, Ubicacion
from .models import Dispenser, DispenserImagen


class UbicacionSerializer(serializers.ModelSerializer):
    # Ubicacion usa DecimalField; para el frontend necesitamos números.
    latitud = serializers.FloatField()
    longitud = serializers.FloatField()

    class Meta:
        model = Ubicacion
        fields = ["codigo_ubicacion", "longitud", "latitud"]


class ImagenSerializer(serializers.ModelSerializer):
    class Meta:
        model = Imagen
        fields = ["codigo_imagen", "ruta_imagen"]


class DispenserSerializer(serializers.ModelSerializer):
    ubicacion = UbicacionSerializer(read_only=True)
    imagenes = ImagenSerializer(many=True, read_only=True)

    class Meta:
        model = Dispenser
        fields = [
            "codigo_dispenser",
            "nombre_dispenser",
            "estado",
            "permanencia",
            "ubicacion",
            "imagenes",
        ]


class DispenserCreateUpdateSerializer(serializers.Serializer):
    nombre_dispenser = serializers.CharField(max_length=255)
    estado = serializers.BooleanField(required=False, default=False)
    permanencia = serializers.BooleanField(required=False, default=False)
    latitud = serializers.FloatField()
    longitud = serializers.FloatField()
    foto = serializers.ImageField(required=False, allow_null=True)

    def validate_nombre_dispenser(self, value: str):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("El nombre es obligatorio")
        return value
