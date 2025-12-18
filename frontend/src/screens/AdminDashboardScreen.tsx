import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Navigate, useNavigate } from 'react-router-dom';
import { Map as MapIcon, Shield, UserPlus } from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { getApiBaseUrl } from '../lib/api';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function AdminDashboardScreen() {
  const navigate = useNavigate();
  const baseURL = getApiBaseUrl();

  const { token, isLoading, isProfileLoading, isAdmin } = useAuth();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [solicitudesLoading, setSolicitudesLoading] = useState(false);
  const [solicitudesError, setSolicitudesError] = useState('');
  const [solicitudes, setSolicitudes] = useState<
    { codigo_ubicacion: number; latitud: string; longitud: string; total: number; ultima: string | null }[]
  >([]);

  const [acceptingUbicacion, setAcceptingUbicacion] = useState<number | null>(null);
  const [acceptNombre, setAcceptNombre] = useState('');
  const [acceptFoto, setAcceptFoto] = useState<File | null>(null);
  const [acceptSubmitting, setAcceptSubmitting] = useState(false);
  const [acceptError, setAcceptError] = useState('');
  const [acceptSuccess, setAcceptSuccess] = useState('');

  const canRender = useMemo(() => {
    if (isLoading || isProfileLoading) return false;
    return true;
  }, [isLoading, isProfileLoading]);

  if (canRender && !token) {
    return <Navigate to="/login" replace />;
  }

  if (canRender && !isAdmin) {
    return <Navigate to="/home" replace />;
  }

  useEffect(() => {
    if (!token || !isAdmin) return;

    (async () => {
      setSolicitudesLoading(true);
      setSolicitudesError('');
      try {
        const res = await axios.get(`${baseURL}/api/solicitudes/summary/`, {
          headers: { Authorization: `Token ${token}` },
        });
        setSolicitudes(Array.isArray(res.data) ? res.data : []);
      } catch (e: any) {
        console.error(e);
        setSolicitudesError('No se pudieron cargar las solicitudes');
      } finally {
        setSolicitudesLoading(false);
      }
    })();
  }, [baseURL, token, isAdmin]);

  const refreshSolicitudes = async () => {
    if (!token) return;
    setSolicitudesLoading(true);
    setSolicitudesError('');
    try {
      const res = await axios.get(`${baseURL}/api/solicitudes/summary/`, {
        headers: { Authorization: `Token ${token}` },
      });
      setSolicitudes(Array.isArray(res.data) ? res.data : []);
    } catch (e: any) {
      console.error(e);
      setSolicitudesError('No se pudieron cargar las solicitudes');
    } finally {
      setSolicitudesLoading(false);
    }
  };

  const startAccept = (codigoUbicacion: number) => {
    setAcceptingUbicacion(codigoUbicacion);
    setAcceptNombre('');
    setAcceptFoto(null);
    setAcceptError('');
    setAcceptSuccess('');
  };

  const cancelAccept = () => {
    setAcceptingUbicacion(null);
    setAcceptNombre('');
    setAcceptFoto(null);
    setAcceptError('');
  };

  const submitAccept = async () => {
    setAcceptError('');
    setAcceptSuccess('');

    if (!token) {
      setAcceptError('No hay sesión activa');
      return;
    }
    if (!acceptingUbicacion) {
      setAcceptError('No hay una ubicación seleccionada');
      return;
    }
    if (!acceptNombre.trim()) {
      setAcceptError('El nombre es obligatorio');
      return;
    }
    if (!acceptFoto) {
      setAcceptError('La imagen es obligatoria');
      return;
    }

    const form = new FormData();
    form.append('codigo_ubicacion', String(acceptingUbicacion));
    form.append('nombre_dispenser', acceptNombre.trim());
    form.append('foto', acceptFoto);

    setAcceptSubmitting(true);
    try {
      await axios.post(`${baseURL}/api/solicitudes/accept/`, form, {
        headers: {
          Authorization: `Token ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      setAcceptSuccess('Solicitud aceptada y dispenser creado.');
      setAcceptingUbicacion(null);
      setAcceptNombre('');
      setAcceptFoto(null);
      await refreshSolicitudes();
    } catch (e: any) {
      console.error(e);
      const msg = e?.response?.data?.detail || 'No se pudo aceptar la solicitud';
      setAcceptError(msg);
    } finally {
      setAcceptSubmitting(false);
    }
  };

  const handleCreateAdminEmployee = async () => {
    setErrorMessage('');
    setSuccessMessage('');

    const trimmedUsername = username.trim();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    const trimmedConfirm = confirmPassword.trim();

    if (!trimmedUsername || !trimmedEmail || !trimmedPassword || !trimmedConfirm) {
      setErrorMessage('Por favor completa todos los campos');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setErrorMessage('Por favor ingresa un correo electrónico válido');
      return;
    }

    if (trimmedPassword !== trimmedConfirm) {
      setErrorMessage('Las contraseñas no coinciden');
      return;
    }

    if (!token) {
      setErrorMessage('No hay sesión activa');
      return;
    }

    setSubmitting(true);
    try {
      await axios.post(
        `${baseURL}/api/users/admin/create-admin-employee/`,
        {
          username: trimmedUsername,
          email: trimmedEmail,
          password: trimmedPassword,
        },
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      );

      setSuccessMessage('Administrador Empleado creado correctamente.');
      setUsername('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      console.error('Create admin employee error:', error);

      let msg = 'No se pudo crear el Administrador Empleado';
      const data = error?.response?.data;
      if (data?.username?.[0]) msg = `Usuario: ${data.username[0]}`;
      else if (data?.email?.[0]) msg = `Email: ${data.email[0]}`;
      else if (data?.password?.[0]) msg = `Contraseña: ${data.password[0]}`;
      else if (error?.response?.status === 403) msg = 'No tienes permisos para realizar esta acción.';

      setErrorMessage(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      <div className="mx-auto max-w-4xl space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-emerald-700" />
              Panel de control
            </CardTitle>
            <CardDescription>Opciones disponibles solo para administradores.</CardDescription>
          </CardHeader>
          <CardContent>
            {errorMessage ? (
              <Alert variant="destructive" className="mb-4">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            ) : null}

            {successMessage ? (
              <Alert variant="success" className="mb-4">
                <AlertTitle>Listo</AlertTitle>
                <AlertDescription>{successMessage}</AlertDescription>
              </Alert>
            ) : null}

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <UserPlus className="h-4 w-4" />
                    Crear Administrador Empleado
                  </CardTitle>
                  <CardDescription>Crea un usuario con rol “Administrador Empleado”.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="ae-username">Usuario</Label>
                    <Input id="ae-username" value={username} onChange={(e) => setUsername(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ae-email">Email</Label>
                    <Input
                      id="ae-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoCapitalize="none"
                      autoComplete="email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ae-password">Contraseña</Label>
                    <Input
                      id="ae-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="new-password"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ae-confirm">Confirmar contraseña</Label>
                    <Input
                      id="ae-confirm"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      autoComplete="new-password"
                    />
                  </div>

                  <Button className="w-full" onClick={handleCreateAdminEmployee} disabled={submitting}>
                    {submitting ? 'Creando…' : 'Crear'}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <MapIcon className="h-4 w-4" />
                    Vista del mapa
                  </CardTitle>
                  <CardDescription>Ir a la vista del MapScreen (con el panel admin existente).</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="secondary" className="w-full" onClick={() => navigate('/map')}>
                    Ir al mapa
                  </Button>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="text-base">Solicitudes</CardTitle>
                  <CardDescription>
                    Lugares sugeridos (coordenadas normalizadas). Se ordena por mayor cantidad.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {acceptError ? (
                    <Alert variant="destructive" className="mb-3">
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>{acceptError}</AlertDescription>
                    </Alert>
                  ) : null}

                  {acceptSuccess ? (
                    <Alert variant="success" className="mb-3">
                      <AlertTitle>Listo</AlertTitle>
                      <AlertDescription>{acceptSuccess}</AlertDescription>
                    </Alert>
                  ) : null}
                  {solicitudesError ? (
                    <Alert variant="destructive" className="mb-3">
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>{solicitudesError}</AlertDescription>
                    </Alert>
                  ) : null}

                  {solicitudesLoading ? <div className="text-sm text-gray-500">Cargando…</div> : null}

                  {!solicitudesLoading && solicitudes.length === 0 ? (
                    <div className="text-sm text-gray-600">Todavía no hay solicitudes.</div>
                  ) : null}

                  <div className="space-y-2">
                    {solicitudes.map((s) => (
                      <div key={s.codigo_ubicacion} className="rounded-lg border border-gray-200 p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="font-medium text-gray-900">Coordenadas</div>
                            <div className="text-xs text-gray-600">
                              ({s.latitud}, {s.longitud})
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-semibold text-gray-900">{s.total}</div>
                            <div className="text-xs text-gray-500">solicitudes</div>
                          </div>
                        </div>

                        {acceptingUbicacion === s.codigo_ubicacion ? (
                          <div className="mt-3 grid gap-3 md:grid-cols-3">
                            <div className="md:col-span-2 space-y-2">
                              <Label htmlFor={`acc-nombre-${s.codigo_ubicacion}`}>Nombre del dispenser</Label>
                              <Input
                                id={`acc-nombre-${s.codigo_ubicacion}`}
                                value={acceptNombre}
                                onChange={(e) => setAcceptNombre(e.target.value)}
                                placeholder="Ej: Dispenser Plaza"
                                disabled={acceptSubmitting}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`acc-foto-${s.codigo_ubicacion}`}>Imagen</Label>
                              <Input
                                id={`acc-foto-${s.codigo_ubicacion}`}
                                type="file"
                                accept="image/*"
                                onChange={(e) => setAcceptFoto(e.target.files?.[0] || null)}
                                disabled={acceptSubmitting}
                              />
                            </div>
                            <div className="md:col-span-3 flex gap-2">
                              <Button type="button" onClick={submitAccept} disabled={acceptSubmitting}>
                                {acceptSubmitting ? 'Aceptando…' : 'Aceptar y crear dispenser'}
                              </Button>
                              <Button type="button" variant="outline" onClick={cancelAccept} disabled={acceptSubmitting}>
                                Cancelar
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="mt-3">
                            <Button type="button" onClick={() => startAccept(s.codigo_ubicacion)}>
                              Aceptar
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
