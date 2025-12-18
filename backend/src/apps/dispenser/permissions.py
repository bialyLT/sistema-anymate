from rest_framework.permissions import SAFE_METHODS, BasePermission


class IsAdminOrEmpleado(BasePermission):
    """Permite lectura (GET/HEAD/OPTIONS) a cualquiera; escritura solo a Admin/Admin Empleado."""

    allowed_groups = {"Administrador", "Administrador Empleado"}

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        user = request.user
        if not user or not user.is_authenticated:
            return False
        return user.groups.filter(name__in=self.allowed_groups).exists() or user.is_superuser


class IsAdministrador(BasePermission):
    def has_permission(self, request, view):
        user = getattr(request, "user", None)
        if not user or not user.is_authenticated:
            return False
        return user.is_superuser or user.groups.filter(name="Administrador").exists()


class IsUsuarioComun(BasePermission):
    """Permite solo al grupo 'Usuario Comun' (excluye admin/empleado/superuser)."""

    def has_permission(self, request, view):
        user = getattr(request, "user", None)
        if not user or not user.is_authenticated:
            return False
        if user.is_superuser:
            return False
        grupos = set(user.groups.values_list("name", flat=True))
        return ("Usuario Comun" in grupos) and ("Administrador" not in grupos) and ("Administrador Empleado" not in grupos)
