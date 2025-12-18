import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { MapContainer, Marker, Popup, TileLayer, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './MapScreen.css';

import { useAuth } from '../context/AuthContext';
import { getApiBaseUrl } from '../lib/api';

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
    <div id="map-root">
      <div id="map-layout">
        {isAdmin ? (
          <div id="dispenser-panel" data-ui="panel">
            <div data-ui="title">Dispenser (Admin)</div>

            {error ? <div data-ui="error">{error}</div> : null}
            {loading ? <div data-ui="muted">Cargando...</div> : null}

            <label>Nombre</label>
            <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} />

            <div data-ui="row">
              <div>
                <label>
                  <input type="checkbox" checked={estado} onChange={(e) => setEstado(e.target.checked)} /> Estado
                </label>
              </div>
              <div>
                <label>
                  <input
                    type="checkbox"
                    checked={permanencia}
                    onChange={(e) => setPermanencia(e.target.checked)}
                  />{' '}
                  Permanencia
                </label>
              </div>
            </div>

            <label>Foto (opcional)</label>
            <input type="file" accept="image/*" onChange={(e) => setFoto(e.target.files?.[0] || null)} />

            <label>Ubicación</label>
            <div data-ui="muted">
              {selectedLat != null && selectedLng != null
                ? `Lat ${selectedLat.toFixed(6)}, Lng ${selectedLng.toFixed(6)}`
                : 'No seleccionada'}
            </div>

            <button data-ui="secondary" onClick={() => setSelecting((s) => !s)}>
              {selecting ? 'Cancelar selección' : 'Seleccionar en el mapa'}
            </button>

            <button data-ui="primary" onClick={submit}>
              {editingId ? 'Guardar cambios' : 'Crear dispenser'}
            </button>

            {editingId ? (
              <button data-ui="secondary" onClick={resetForm}>
                Cancelar edición
              </button>
            ) : null}

            <div data-ui="list">
              {dispensers.map((d) => (
                <div key={d.codigo_dispenser} data-ui="card">
                  <div data-ui="card-title">{d.nombre_dispenser}</div>
                  <div data-ui="muted">
                    ({d.ubicacion.latitud.toFixed(5)}, {d.ubicacion.longitud.toFixed(5)})
                  </div>
                  <div data-ui="card-actions">
                    <button data-ui="secondary" onClick={() => startEdit(d)}>
                      Editar
                    </button>
                    <button data-ui="danger" onClick={() => remove(d.codigo_dispenser)}>
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div id="map-container">
          <MapContainer center={[DEFAULT_REGION.lat, DEFAULT_REGION.lng]} zoom={DEFAULT_REGION.zoom} id="leaflet-map">
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
      </div>
    </div>
  );
}
