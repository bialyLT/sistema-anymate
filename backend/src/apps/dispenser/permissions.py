from rest_framework.permissions import BasePermission


class IsAdminOrEmpleado(BasePermission):
    """Permite acceso solo a usuarios en grupos 'Administrador' o 'Administrador Empleado'."""

    allowed_groups = {"Administrador", "Administrador Empleado"}

    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        return user.groups.filter(name__in=self.allowed_groups).exists() or user.is_superuser
