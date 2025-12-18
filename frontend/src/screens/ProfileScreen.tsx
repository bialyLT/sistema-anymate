import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import { getApiBaseUrl } from '../lib/api';

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
  grupos?: string[];
}

export default function ProfileScreen() {
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const baseURL = getApiBaseUrl();

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
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-emerald-50 px-6">
        <div className="text-gray-500">Cargando perfil...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-emerald-50 p-6">
        <div className="text-red-500 text-center mb-4">{error}</div>
        <button className="bg-emerald-600 rounded-lg py-3 px-6 text-white font-bold" onClick={fetchProfile}>
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-emerald-50">
      <div className="mx-auto max-w-3xl p-6">
        {/* Header */}
        <div className="mb-6 text-center">
          <div className="text-3xl font-bold text-emerald-600 mb-2">Mi Perfil</div>
          <div className="text-gray-500">Información de tu cuenta</div>
        </div>

        {/* User Data Section */}
        <div className="bg-white rounded-2xl p-6 mb-4 shadow-lg">
          <div className="text-xl font-bold text-emerald-800 mb-4">Datos de Usuario</div>
          
          <div className="mb-3">
            <div className="text-sm font-semibold text-gray-500 mb-1">Usuario</div>
            <div className="text-base text-gray-800">{profile?.username || 'N/A'}</div>
          </div>

          <div className="mb-3">
            <div className="text-sm font-semibold text-gray-500 mb-1">Email</div>
            <div className="text-base text-gray-800">{profile?.email || 'N/A'}</div>
          </div>

          <div className="mb-3">
            <div className="text-sm font-semibold text-gray-500 mb-1">Nombre</div>
            <div className="text-base text-gray-800">{profile?.first_name || 'No especificado'}</div>
          </div>

          <div className="mb-3">
            <div className="text-sm font-semibold text-gray-500 mb-1">Apellido</div>
            <div className="text-base text-gray-800">{profile?.last_name || 'No especificado'}</div>
          </div>
        </div>

        {/* Persona Data Section */}
        <div className="bg-white rounded-2xl p-6 mb-4 shadow-lg">
          <div className="text-xl font-bold text-emerald-800 mb-4">Datos Personales</div>
          
          {profile?.persona ? (
            <>
              <div className="mb-3">
                <div className="text-sm font-semibold text-gray-500 mb-1">Nombre</div>
                <div className="text-base text-gray-800">{profile.persona.nombre || 'No especificado'}</div>
              </div>

              <div className="mb-3">
                <div className="text-sm font-semibold text-gray-500 mb-1">Apellido</div>
                <div className="text-base text-gray-800">{profile.persona.apellido || 'No especificado'}</div>
              </div>

              <div className="mb-3">
                <div className="text-sm font-semibold text-gray-500 mb-1">Dirección</div>
                <div className="text-base text-gray-800">{profile.persona.direccion || 'No especificado'}</div>
              </div>

              <div className="mb-3">
                <div className="text-sm font-semibold text-gray-500 mb-1">Teléfono</div>
                <div className="text-base text-gray-800">{profile.persona.telefono || 'No especificado'}</div>
              </div>

              <div className="mb-3">
                <div className="text-sm font-semibold text-gray-500 mb-1">Fecha de Nacimiento</div>
                <div className="text-base text-gray-800">{profile.persona.fecha_nacimiento || 'No especificado'}</div>
              </div>
            </>
          ) : (
            <div className="items-center py-4">
              <div className="text-gray-500 text-center">No hay datos personales registrados</div>
            </div>
          )}
        </div>

        {/* Logout Button */}
        <button className="w-full bg-red-500 rounded-lg py-4 text-white text-lg font-bold" onClick={handleLogout}>
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
}
