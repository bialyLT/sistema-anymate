import os
from decimal import Decimal, ROUND_HALF_UP
from django.db import IntegrityError
from django.conf import settings
from django.core.files.storage import default_storage
from django.db.models.deletion import ProtectedError
from django.db.models import Count, Max
from django.utils import timezone
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from core.models import Imagen, Ubicacion
from .models import Dispenser, DispenserImagen, Solicitud
from .permissions import IsAdminOrEmpleado, IsAdministrador, IsUsuarioComun
from .serializers import DispenserSerializer, DispenserCreateUpdateSerializer


ROUND_DECIMALS = 4


def _normalize_coord(value: float, decimals: int = ROUND_DECIMALS) -> Decimal:
    step = Decimal("1").scaleb(-decimals)  # e.g. 0.0001
    return Decimal(str(value)).quantize(step, rounding=ROUND_HALF_UP)


def _get_or_create_ubicacion(latitud: float, longitud: float) -> Ubicacion:
    lat = _normalize_coord(latitud)
    lon = _normalize_coord(longitud)
    try:
        ubicacion, _ = Ubicacion.objects.get_or_create(latitud=lat, longitud=lon)
        return ubicacion
    except IntegrityError:
        # En caso de carrera, la constraint única puede fallar; re-leer.
        return Ubicacion.objects.get(latitud=lat, longitud=lon)


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

        ubicacion = _get_or_create_ubicacion(
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

        dispenser.ubicacion = _get_or_create_ubicacion(
            latitud=data["latitud"],
            longitud=data["longitud"],
        )
        dispenser.save()

        foto = data.get("foto")
        if foto:
            ruta = _save_uploaded_file(foto)
            imagen = Imagen.objects.create(ruta_imagen=ruta)
            DispenserImagen.objects.create(dispenser=dispenser, imagen=imagen)

        return Response(DispenserSerializer(dispenser).data)

    def delete(self, request, codigo_dispenser: int):
        dispenser = self.get_object(codigo_dispenser)
        dispenser.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class SolicitudCreateView(APIView):
    permission_classes = [IsAuthenticated, IsUsuarioComun]

    def post(self, request):
        lat = request.data.get("latitud")
        lon = request.data.get("longitud")
        if lat is None or lon is None:
            return Response({"detail": "latitud y longitud son obligatorias"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            lat_f = float(lat)
            lon_f = float(lon)
        except (TypeError, ValueError):
            return Response({"detail": "latitud/longitud inválidas"}, status=status.HTTP_400_BAD_REQUEST)

        ubicacion = _get_or_create_ubicacion(latitud=lat_f, longitud=lon_f)

        # Un usuario solo puede hacer 1 solicitud por coordenada normalizada.
        if Solicitud.objects.filter(user=request.user, ubicacion=ubicacion).exists():
            return Response(
                {"detail": "Ya realizaste una solicitud para estas coordenadas"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        solicitud = Solicitud.objects.create(
            user=request.user,
            ubicacion=ubicacion,
            dispenser=None,
            estado=Solicitud.Estado.PENDIENTE,
        )
        return Response(
            {
                "codigo_solicitud": solicitud.codigo_solicitud,
                "fecha_solicitud": solicitud.fecha_solicitud,
                "ubicacion": {
                    "codigo_ubicacion": ubicacion.codigo_ubicacion,
                    "latitud": str(ubicacion.latitud),
                    "longitud": str(ubicacion.longitud),
                },
            },
            status=status.HTTP_201_CREATED,
        )


class SolicitudesSummaryAdminView(APIView):
    permission_classes = [IsAuthenticated, IsAdministrador]

    def get(self, request):
        qs = (
            Solicitud.objects.select_related("ubicacion")
            .filter(estado=Solicitud.Estado.PENDIENTE)
            .values(
                "ubicacion__codigo_ubicacion",
                "ubicacion__latitud",
                "ubicacion__longitud",
            )
            .annotate(total=Count("codigo_solicitud"), last=Max("fecha_solicitud"))
            .order_by("-total", "-last")
        )

        results = [
            {
                "codigo_ubicacion": row["ubicacion__codigo_ubicacion"],
                "latitud": str(row["ubicacion__latitud"]),
                "longitud": str(row["ubicacion__longitud"]),
                "total": row["total"],
                "ultima": row["last"],
            }
            for row in qs
        ]
        return Response(results)


class SolicitudAcceptAdminView(APIView):
    """Acepta solicitudes pendientes para una ubicación y crea un Dispenser ahí.

    Requiere: codigo_ubicacion, nombre_dispenser, foto (obligatoria).
    """

    permission_classes = [IsAuthenticated, IsAdministrador]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        codigo_ubicacion = request.data.get("codigo_ubicacion")
        nombre_dispenser = request.data.get("nombre_dispenser")
        foto = request.data.get("foto")

        if not codigo_ubicacion:
            return Response({"detail": "codigo_ubicacion es obligatorio"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            codigo_ubicacion_int = int(codigo_ubicacion)
        except (TypeError, ValueError):
            return Response({"detail": "codigo_ubicacion inválido"}, status=status.HTTP_400_BAD_REQUEST)

        if not isinstance(nombre_dispenser, str) or not nombre_dispenser.strip():
            return Response({"detail": "nombre_dispenser es obligatorio"}, status=status.HTTP_400_BAD_REQUEST)
        nombre_dispenser = nombre_dispenser.strip()

        if not foto:
            return Response({"detail": "foto es obligatoria"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            ubicacion = Ubicacion.objects.get(codigo_ubicacion=codigo_ubicacion_int)
        except Ubicacion.DoesNotExist:
            return Response({"detail": "Ubicación no encontrada"}, status=status.HTTP_404_NOT_FOUND)

        pendientes = Solicitud.objects.filter(ubicacion=ubicacion, estado=Solicitud.Estado.PENDIENTE)
        if not pendientes.exists():
            return Response({"detail": "No hay solicitudes pendientes para esta ubicación"}, status=status.HTTP_400_BAD_REQUEST)

        if Dispenser.objects.filter(ubicacion=ubicacion).exists():
            return Response({"detail": "Ya existe un dispenser en estas coordenadas"}, status=status.HTTP_400_BAD_REQUEST)

        # Crear dispenser (por defecto estado/permanencia = False)
        dispenser = Dispenser.objects.create(
            nombre_dispenser=nombre_dispenser,
            ubicacion=ubicacion,
        )

        ruta = _save_uploaded_file(foto)
        imagen = Imagen.objects.create(ruta_imagen=ruta)
        DispenserImagen.objects.create(dispenser=dispenser, imagen=imagen)

        pendientes.update(
            estado=Solicitud.Estado.ACEPTADA,
            aceptada_en=timezone.now(),
            aceptada_por=request.user,
            dispenser=dispenser,
        )

        return Response(DispenserSerializer(dispenser).data, status=status.HTTP_201_CREATED)
