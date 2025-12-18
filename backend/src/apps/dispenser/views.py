import os
from django.conf import settings
from django.core.files.storage import default_storage
from django.db.models.deletion import ProtectedError
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework.views import APIView

from core.models import Imagen, Ubicacion
from .models import Dispenser, DispenserImagen
from .permissions import IsAdminOrEmpleado
from .serializers import DispenserSerializer, DispenserCreateUpdateSerializer


def _save_uploaded_file(file_obj) -> str:
    # Guarda en MEDIA_ROOT/dispensers/ y devuelve la ruta relativa.
    folder = "dispensers"
    name = file_obj.name
    path = os.path.join(folder, name)
    saved_path = default_storage.save(path, file_obj)
    return saved_path


class DispenserListCreateView(APIView):
    permission_classes = [IsAdminOrEmpleado]
    parser_classes = [MultiPartParser, FormParser]

    def get(self, request):
        qs = Dispenser.objects.select_related("ubicacion").prefetch_related("imagenes").all().order_by("codigo_dispenser")
        return Response(DispenserSerializer(qs, many=True).data)

    def post(self, request):
        serializer = DispenserCreateUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        ubicacion = Ubicacion.objects.create(
            latitud=data["latitud"],
            longitud=data["longitud"],
        )

        dispenser = Dispenser.objects.create(
            nombre_dispenser=data["nombre_dispenser"],
            estado=data.get("estado", False),
            permanencia=data.get("permanencia", False),
            ubicacion=ubicacion,
        )

        foto = data.get("foto")
        if foto:
            ruta = _save_uploaded_file(foto)
            imagen = Imagen.objects.create(ruta_imagen=ruta)
            DispenserImagen.objects.create(dispenser=dispenser, imagen=imagen)

        return Response(DispenserSerializer(dispenser).data, status=status.HTTP_201_CREATED)


class DispenserDetailView(APIView):
    permission_classes = [IsAdminOrEmpleado]
    parser_classes = [MultiPartParser, FormParser]

    def get_object(self, codigo_dispenser: int) -> Dispenser:
        return Dispenser.objects.select_related("ubicacion").prefetch_related("imagenes").get(codigo_dispenser=codigo_dispenser)

    def get(self, request, codigo_dispenser: int):
        dispenser = self.get_object(codigo_dispenser)
        return Response(DispenserSerializer(dispenser).data)

    def put(self, request, codigo_dispenser: int):
        dispenser = self.get_object(codigo_dispenser)
        serializer = DispenserCreateUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        dispenser.nombre_dispenser = data["nombre_dispenser"]
        dispenser.estado = data.get("estado", dispenser.estado)
        dispenser.permanencia = data.get("permanencia", dispenser.permanencia)
        dispenser.save()

        dispenser.ubicacion.latitud = data["latitud"]
        dispenser.ubicacion.longitud = data["longitud"]
        dispenser.ubicacion.save()

        foto = data.get("foto")
        if foto:
            ruta = _save_uploaded_file(foto)
            imagen = Imagen.objects.create(ruta_imagen=ruta)
            DispenserImagen.objects.create(dispenser=dispenser, imagen=imagen)

        return Response(DispenserSerializer(dispenser).data)

    def delete(self, request, codigo_dispenser: int):
        dispenser = self.get_object(codigo_dispenser)
        ubicacion = dispenser.ubicacion
        dispenser.delete()
        try:
            ubicacion.delete()
        except ProtectedError:
            pass
        return Response(status=status.HTTP_204_NO_CONTENT)
