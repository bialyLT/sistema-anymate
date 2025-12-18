from django.contrib.auth.models import User, Group
from rest_framework import serializers

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'email', 'password']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        
        try:
            group = Group.objects.get(name='Usuario Comun')
            user.groups.add(group)
        except Group.DoesNotExist:
            pass
            
        return user

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Este correo electrónico ya está registrado.")
        return value

    def validate_username(self, value):
        reserved_names = ['admin', 'administrador', 'soporte', 'root', 'superuser', 'moderador']
        if value.lower() in reserved_names:
            raise serializers.ValidationError("Este nombre de usuario no está disponible.")
        if len(value) < 3:
            raise serializers.ValidationError("El usuario debe tener al menos 3 caracteres.")
        if ' ' in value:
             raise serializers.ValidationError("El usuario no puede contener espacios.")
        return value
