import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Shield, UserCircle } from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { getApiBaseUrl } from '../lib/api';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ProfileScreen() {
  const [error, setError] = useState('');
  const { token, logout, profile, isProfileLoading, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const baseURL = getApiBaseUrl();

  useEffect(() => {
    refreshProfile().catch(() => {
      // refreshProfile already logs; just show friendly UI.
      setError('Error al cargar el perfil');
    });
  }, [refreshProfile]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (isProfileLoading) {
    return (
      <div className="min-h-[calc(100vh-6rem)] flex items-center justify-center px-4">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCircle className="h-5 w-5 text-emerald-700" />
              Mi perfil
            </CardTitle>
            <CardDescription>Cargando información…</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 animate-pulse">
              <div className="h-4 w-2/3 rounded bg-gray-200" />
              <div className="h-4 w-1/2 rounded bg-gray-200" />
              <div className="h-24 w-full rounded bg-gray-100" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-6rem)] flex items-center justify-center px-4">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle>Mi perfil</CardTitle>
            <CardDescription>No se pudo cargar la información.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <div className="flex gap-2">
              <Button onClick={() => refreshProfile()}>Reintentar</Button>
              <Button variant="outline" onClick={() => navigate('/home')}>
                Ir al inicio
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-[calc(100vh-6rem)] flex items-center justify-center px-4">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle>Mi perfil</CardTitle>
            <CardDescription>No hay sesión activa.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/login')}>Iniciar sesión</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mx-auto max-w-3xl space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCircle className="h-5 w-5 text-emerald-700" />
              Mi perfil
            </CardTitle>
            <CardDescription>Información de tu cuenta</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-gray-200 p-3">
              <div className="text-xs font-medium text-gray-500">Usuario</div>
              <div className="mt-1 text-sm font-semibold text-gray-900">{profile?.username || 'N/A'}</div>
            </div>
            <div className="rounded-lg border border-gray-200 p-3">
              <div className="text-xs font-medium text-gray-500">Email</div>
              <div className="mt-1 text-sm font-semibold text-gray-900">{profile?.email || 'N/A'}</div>
            </div>
            <div className="rounded-lg border border-gray-200 p-3">
              <div className="text-xs font-medium text-gray-500">Nombre</div>
              <div className="mt-1 text-sm font-semibold text-gray-900">{profile?.first_name || 'No especificado'}</div>
            </div>
            <div className="rounded-lg border border-gray-200 p-3">
              <div className="text-xs font-medium text-gray-500">Apellido</div>
              <div className="mt-1 text-sm font-semibold text-gray-900">{profile?.last_name || 'No especificado'}</div>
            </div>

            {profile?.grupos?.length ? (
              <div className="sm:col-span-2 rounded-lg border border-gray-200 p-3">
                <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                  <Shield className="h-4 w-4" />
                  Roles
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {profile.grupos.map((g) => (
                    <span key={g} className="rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-800">
                      {g}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Datos personales</CardTitle>
            <CardDescription>Información asociada a tu Persona (si existe).</CardDescription>
          </CardHeader>
          <CardContent>
            {profile?.persona ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-gray-200 p-3">
                  <div className="text-xs font-medium text-gray-500">Nombre</div>
                  <div className="mt-1 text-sm font-semibold text-gray-900">{profile.persona.nombre || 'No especificado'}</div>
                </div>
                <div className="rounded-lg border border-gray-200 p-3">
                  <div className="text-xs font-medium text-gray-500">Apellido</div>
                  <div className="mt-1 text-sm font-semibold text-gray-900">{profile.persona.apellido || 'No especificado'}</div>
                </div>
                <div className="sm:col-span-2 rounded-lg border border-gray-200 p-3">
                  <div className="text-xs font-medium text-gray-500">Dirección</div>
                  <div className="mt-1 text-sm font-semibold text-gray-900">{profile.persona.direccion || 'No especificado'}</div>
                </div>
                <div className="rounded-lg border border-gray-200 p-3">
                  <div className="text-xs font-medium text-gray-500">Teléfono</div>
                  <div className="mt-1 text-sm font-semibold text-gray-900">{profile.persona.telefono || 'No especificado'}</div>
                </div>
                <div className="rounded-lg border border-gray-200 p-3">
                  <div className="text-xs font-medium text-gray-500">Fecha de nacimiento</div>
                  <div className="mt-1 text-sm font-semibold text-gray-900">
                    {profile.persona.fecha_nacimiento || 'No especificado'}
                  </div>
                </div>
              </div>
            ) : (
              <Alert>
                <AlertTitle>Sin datos</AlertTitle>
                <AlertDescription>No hay datos personales registrados.</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button variant="destructive" onClick={handleLogout}>
            Cerrar sesión
          </Button>
        </div>
      </div>
    </div>
  );
}
