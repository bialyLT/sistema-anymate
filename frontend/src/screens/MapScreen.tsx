import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { MapContainer, Marker, Popup, TileLayer, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Plus, Save, Trash2 } from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { getApiBaseUrl } from '../lib/api';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Buenos Aires coordinates default
const DEFAULT_REGION = {
  lat: -34.6037,
  lng: -58.3816,
  zoom: 13,
};

type DispenserDto = {
  codigo_dispenser: number;
  nombre_dispenser: string;
  estado: boolean;
  permanencia: boolean;
  ubicacion: { codigo_ubicacion: number; latitud: number; longitud: number };
  imagenes: { codigo_imagen: number; ruta_imagen: string }[];
};

function ClickToSelect({ enabled, onSelect }: { enabled: boolean; onSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      if (!enabled) return;
      onSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function MapScreen() {
  const { token } = useAuth();
  const baseURL = getApiBaseUrl();

  const [isAdmin, setIsAdmin] = useState(false);
  const [dispensers, setDispensers] = useState<DispenserDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const [selecting, setSelecting] = useState(false);
  const [selectedLat, setSelectedLat] = useState<number | null>(null);
  const [selectedLng, setSelectedLng] = useState<number | null>(null);

  const [nombre, setNombre] = useState('');
  const [estado, setEstado] = useState(false);
  const [permanencia, setPermanencia] = useState(false);
  const [foto, setFoto] = useState<File | null>(null);

  const [editingId, setEditingId] = useState<number | null>(null);

  const headers = useMemo(() => {
    if (!token) return {};
    return { Authorization: `Token ${token}` };
  }, [token]);

  const fetchDispensers = async () => {
    setLoading(true);
    try {
      // GET es público (sin sesión) y también funciona con token.
      const res = await axios.get(`${baseURL}/api/dispensers/`, { headers });
      setDispensers(res.data || []);
    } catch (e: any) {
      console.error(e);
      setError('No se pudieron cargar los dispensers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Siempre: cargar dispensers para verlos en el mapa (sin sesión también).
    fetchDispensers();

    // Si hay sesión: determinar rol para habilitar CRUD.
    if (!token) {
      setIsAdmin(false);
      return;
    }

    (async () => {
      try {
        const profileRes = await axios.get(`${baseURL}/api/users/profile/`, { headers });
        const grupos: string[] = profileRes.data?.grupos || [];
        const ok = grupos.includes('Administrador') || grupos.includes('Administrador Empleado');
        setIsAdmin(ok);
      } catch (e) {
        console.error(e);
        setIsAdmin(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, baseURL]);

  const resetForm = () => {
    setNombre('');
    setEstado(false);
    setPermanencia(false);
    setFoto(null);
    setEditingId(null);
    setSelectedLat(null);
    setSelectedLng(null);
    setSelecting(false);
  };

  const startEdit = (d: DispenserDto) => {
    setEditingId(d.codigo_dispenser);
    setNombre(d.nombre_dispenser);
    setEstado(Boolean(d.estado));
    setPermanencia(Boolean(d.permanencia));
    setSelectedLat(d.ubicacion?.latitud ?? null);
    setSelectedLng(d.ubicacion?.longitud ?? null);
    setFoto(null);
  };

  const submit = async () => {
    setError('');
    if (!token) return;
    if (!nombre.trim()) {
      setError('El nombre es obligatorio');
      return;
    }
    if (selectedLat == null || selectedLng == null) {
      setError('Seleccioná una ubicación en el mapa');
      return;
    }

    const form = new FormData();
    form.append('nombre_dispenser', nombre.trim());
    form.append('estado', String(estado));
    form.append('permanencia', String(permanencia));
    form.append('latitud', String(selectedLat));
    form.append('longitud', String(selectedLng));
    if (foto) form.append('foto', foto);

    setLoading(true);
    try {
      if (editingId) {
        await axios.put(`${baseURL}/api/dispensers/${editingId}/`, form, {
          headers: { ...headers, 'Content-Type': 'multipart/form-data' },
        });
      } else {
        await axios.post(`${baseURL}/api/dispensers/`, form, {
          headers: { ...headers, 'Content-Type': 'multipart/form-data' },
        });
      }
      await fetchDispensers();
      resetForm();
    } catch (e: any) {
      console.error(e);
      const details = e?.response?.data;
      if (details) {
        try {
          setError(`No se pudo guardar el dispenser: ${JSON.stringify(details)}`);
        } catch {
          setError('No se pudo guardar el dispenser (error de validación)');
        }
      } else {
        setError('No se pudo guardar el dispenser');
      }
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id: number) => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      await axios.delete(`${baseURL}/api/dispensers/${id}/`, { headers });
      await fetchDispensers();
      if (editingId === id) resetForm();
    } catch (e: any) {
      console.error(e);
      setError('No se pudo eliminar el dispenser');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div
        className={
          isAdmin
            ? 'grid gap-4 lg:grid-cols-[360px_1fr]'
            : 'grid gap-4'
        }
      >
        {isAdmin ? (
          <Card className="h-[calc(100vh-7.5rem)] overflow-hidden">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-emerald-700" />
                Dispensers
              </CardTitle>
              <CardDescription>Creá, editá o eliminá dispensers desde el panel.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 overflow-auto h-[calc(100%-5.5rem)]">
              {error ? (
                <Alert variant="destructive">
                  <AlertDescription className="break-words">{error}</AlertDescription>
                </Alert>
              ) : null}

              {loading ? <div className="text-sm text-gray-500">Cargando…</div> : null}

              <div className="space-y-2">
                <Label htmlFor="nombre_dispenser">Nombre</Label>
                <Input
                  id="nombre_dispenser"
                  placeholder="Ej: Dispenser Plaza" 
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-600"
                    checked={estado}
                    onChange={(e) => setEstado(e.target.checked)}
                  />
                  Estado
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-600"
                    checked={permanencia}
                    onChange={(e) => setPermanencia(e.target.checked)}
                  />
                  Permanencia
                </label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="foto">Foto (opcional)</Label>
                <Input id="foto" type="file" accept="image/*" onChange={(e) => setFoto(e.target.files?.[0] || null)} />
              </div>

              <div className="rounded-lg border border-gray-200 p-3">
                <div className="text-sm font-medium text-gray-900">Ubicación</div>
                <div className="mt-1 text-sm text-gray-600">
                  {selectedLat != null && selectedLng != null
                    ? `Lat ${selectedLat.toFixed(6)}, Lng ${selectedLng.toFixed(6)}`
                    : 'No seleccionada'}
                </div>
                {selecting ? (
                  <div className="mt-2 text-xs text-emerald-700">Hacé click en el mapa para seleccionar.</div>
                ) : null}
                <div className="mt-3 flex gap-2">
                  <Button type="button" variant={selecting ? 'secondary' : 'outline'} onClick={() => setSelecting((s) => !s)}>
                    {selecting ? 'Cancelar' : 'Seleccionar'}
                  </Button>
                  <Button type="button" variant="secondary" onClick={resetForm} disabled={!editingId && !nombre && selectedLat == null && selectedLng == null}>
                    Limpiar
                  </Button>
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="button" className="flex-1" onClick={submit} disabled={loading}>
                  {editingId ? (
                    <>
                      <Save className="h-4 w-4" /> Guardar
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" /> Crear
                    </>
                  )}
                </Button>
                {editingId ? (
                  <Button type="button" variant="outline" onClick={resetForm} disabled={loading}>
                    Cancelar
                  </Button>
                ) : null}
              </div>

              <div className="space-y-2">
                <div className="text-sm font-semibold text-gray-900">Lista</div>
                <div className="space-y-2">
                  {dispensers.map((d) => (
                    <div key={d.codigo_dispenser} className="rounded-lg border border-gray-200 p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-medium text-gray-900">{d.nombre_dispenser}</div>
                          <div className="text-xs text-gray-500">
                            ({d.ubicacion.latitud.toFixed(5)}, {d.ubicacion.longitud.toFixed(5)})
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button type="button" size="sm" variant="outline" onClick={() => startEdit(d)}>
                            Editar
                          </Button>
                          <Button type="button" size="sm" variant="destructive" onClick={() => remove(d.codigo_dispenser)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ) : null}

        <Card className="overflow-hidden">
          <CardHeader className="pb-4">
            <CardTitle>Mapa de dispensers</CardTitle>
            <CardDescription>Explorá los dispensers disponibles.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-[calc(100vh-11rem)] min-h-[420px] w-full">
              <MapContainer
                center={[DEFAULT_REGION.lat, DEFAULT_REGION.lng]}
                zoom={DEFAULT_REGION.zoom}
                scrollWheelZoom={true}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <ClickToSelect
                  enabled={isAdmin && selecting}
                  onSelect={(lat, lng) => {
                    setSelectedLat(lat);
                    setSelectedLng(lng);
                    setSelecting(false);
                  }}
                />

                {isAdmin && selectedLat != null && selectedLng != null ? (
                  <Marker position={[selectedLat, selectedLng]}>
                    <Popup>Ubicación seleccionada</Popup>
                  </Marker>
                ) : null}

                {dispensers.map((d) => (
                  <Marker key={d.codigo_dispenser} position={[d.ubicacion.latitud, d.ubicacion.longitud]}>
                    <Popup>{d.nombre_dispenser}</Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
