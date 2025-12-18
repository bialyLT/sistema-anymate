import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { styled } from 'nativewind';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledScrollView = styled(ScrollView);
const StyledTouchableOpacity = styled(TouchableOpacity);

interface PersonaData {
  codigo_persona: number;
  nombre: string;
  apellido: string;
  direccion: string;
  telefono: string;
  fecha_nacimiento: string;
}

interface UserProfileData {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  persona: PersonaData | null;
}

const ProfileScreen = () => {
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { token, logout } = useAuth();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    if (!token) {
      setError('No hay sesión activa');
      setLoading(false);
      return;
    }

    try {
      const baseURL = Platform.OS === 'web' ? 'http://localhost:8000' : 'http://10.0.2.2:8000';
      const response = await axios.get(`${baseURL}/api/users/profile/`, {
        headers: {
          'Authorization': `Token ${token}`
        }
      });
      setProfile(response.data);
      setError('');
    } catch (err: any) {
      console.error('Error fetching profile:', err);
      setError('Error al cargar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  if (loading) {
    return (
      <StyledView className="flex-1 justify-center items-center bg-emerald-50">
        <ActivityIndicator size="large" color="#059669" />
        <StyledText className="text-gray-500 mt-4">Cargando perfil...</StyledText>
      </StyledView>
    );
  }

  if (error) {
    return (
      <StyledView className="flex-1 justify-center items-center bg-emerald-50 p-6">
        <StyledText className="text-red-500 text-center mb-4">{error}</StyledText>
        <StyledTouchableOpacity 
          className="bg-emerald-600 rounded-lg py-3 px-6"
          onPress={fetchProfile}
        >
          <StyledText className="text-white font-bold">Reintentar</StyledText>
        </StyledTouchableOpacity>
      </StyledView>
    );
  }

  return (
    <StyledScrollView className="flex-1 bg-emerald-50">
      <StyledView className="p-6">
        {/* Header */}
        <StyledView className="mb-6 items-center">
          <StyledText className="text-3xl font-bold text-emerald-600 mb-2">Mi Perfil</StyledText>
          <StyledText className="text-gray-500">Información de tu cuenta</StyledText>
        </StyledView>

        {/* User Data Section */}
        <StyledView className="bg-white rounded-2xl p-6 mb-4 shadow-lg">
          <StyledText className="text-xl font-bold text-emerald-800 mb-4">Datos de Usuario</StyledText>
          
          <StyledView className="mb-3">
            <StyledText className="text-sm font-semibold text-gray-500 mb-1">Usuario</StyledText>
            <StyledText className="text-base text-gray-800">{profile?.username || 'N/A'}</StyledText>
          </StyledView>

          <StyledView className="mb-3">
            <StyledText className="text-sm font-semibold text-gray-500 mb-1">Email</StyledText>
            <StyledText className="text-base text-gray-800">{profile?.email || 'N/A'}</StyledText>
          </StyledView>

          <StyledView className="mb-3">
            <StyledText className="text-sm font-semibold text-gray-500 mb-1">Nombre</StyledText>
            <StyledText className="text-base text-gray-800">{profile?.first_name || 'No especificado'}</StyledText>
          </StyledView>

          <StyledView className="mb-3">
            <StyledText className="text-sm font-semibold text-gray-500 mb-1">Apellido</StyledText>
            <StyledText className="text-base text-gray-800">{profile?.last_name || 'No especificado'}</StyledText>
          </StyledView>
        </StyledView>

        {/* Persona Data Section */}
        <StyledView className="bg-white rounded-2xl p-6 mb-4 shadow-lg">
          <StyledText className="text-xl font-bold text-emerald-800 mb-4">Datos Personales</StyledText>
          
          {profile?.persona ? (
            <>
              <StyledView className="mb-3">
                <StyledText className="text-sm font-semibold text-gray-500 mb-1">Nombre</StyledText>
                <StyledText className="text-base text-gray-800">{profile.persona.nombre || 'No especificado'}</StyledText>
              </StyledView>

              <StyledView className="mb-3">
                <StyledText className="text-sm font-semibold text-gray-500 mb-1">Apellido</StyledText>
                <StyledText className="text-base text-gray-800">{profile.persona.apellido || 'No especificado'}</StyledText>
              </StyledView>

              <StyledView className="mb-3">
                <StyledText className="text-sm font-semibold text-gray-500 mb-1">Dirección</StyledText>
                <StyledText className="text-base text-gray-800">{profile.persona.direccion || 'No especificado'}</StyledText>
              </StyledView>

              <StyledView className="mb-3">
                <StyledText className="text-sm font-semibold text-gray-500 mb-1">Teléfono</StyledText>
                <StyledText className="text-base text-gray-800">{profile.persona.telefono || 'No especificado'}</StyledText>
              </StyledView>

              <StyledView className="mb-3">
                <StyledText className="text-sm font-semibold text-gray-500 mb-1">Fecha de Nacimiento</StyledText>
                <StyledText className="text-base text-gray-800">{profile.persona.fecha_nacimiento || 'No especificado'}</StyledText>
              </StyledView>
            </>
          ) : (
            <StyledView className="items-center py-4">
              <StyledText className="text-gray-500 text-center">No hay datos personales registrados</StyledText>
            </StyledView>
          )}
        </StyledView>

        {/* Logout Button */}
        <StyledTouchableOpacity 
          className="bg-red-500 rounded-lg py-4 items-center active:bg-red-600"
          onPress={handleLogout}
        >
          <StyledText className="text-white text-lg font-bold">Cerrar Sesión</StyledText>
        </StyledTouchableOpacity>
      </StyledView>
    </StyledScrollView>
  );
};

export default ProfileScreen;
