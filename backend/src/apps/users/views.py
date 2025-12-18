from rest_framework import generics
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import BasePermission

from .serializers import UserSerializer, UserProfileSerializer, AdminEmployeeCreateSerializer
from django.contrib.auth.models import User


class IsAdministrador(BasePermission):
    def has_permission(self, request, view):
        user = getattr(request, 'user', None)
        if not user or not user.is_authenticated:
            return False
        return user.is_superuser or user.groups.filter(name='Administrador').exists()

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = UserSerializer


class AdminCreateEmployeeView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (IsAuthenticated, IsAdministrador)
    serializer_class = AdminEmployeeCreateSerializer


class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data)

