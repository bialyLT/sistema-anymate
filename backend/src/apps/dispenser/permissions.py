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
