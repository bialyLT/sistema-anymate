import React from 'react';
import { BrowserRouter, Navigate, NavLink, Route, Routes } from 'react-router-dom';

import { AuthProvider, useAuth } from './context/AuthContext';

import HomeScreen from './screens/HomeScreen';
import MapScreen from './screens/MapScreen';
import PublishScreen from './screens/PublishScreen';
import CommunityScreen from './screens/CommunityScreen';
import ProfileScreen from './screens/ProfileScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { token, isLoading } = useAuth();
  if (isLoading) return null;
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function BottomNav() {
  const { token } = useAuth();

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    [
      'px-3 py-2 text-sm font-semibold',
      isActive ? 'text-emerald-700' : 'text-gray-600 hover:text-emerald-700',
    ].join(' ');

  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t bg-white/95 backdrop-blur sm:static sm:border-t-0">
      <div className="mx-auto flex max-w-5xl justify-around sm:justify-start sm:gap-4 px-3">
        <NavLink to="/home" className={linkClass}>
          Inicio
        </NavLink>
        <NavLink to="/map" className={linkClass}>
          Mapa
        </NavLink>
        <NavLink to="/publish" className={linkClass}>
          Publicar
        </NavLink>
        <NavLink to="/community" className={linkClass}>
          Comunidad
        </NavLink>
        {token ? (
          <NavLink to="/profile" className={linkClass}>
            Perfil
          </NavLink>
        ) : (
          <NavLink to="/login" className={linkClass}>
            Iniciar sesión
          </NavLink>
        )}
      </div>
    </nav>
  );
}

function Shell() {
  return (
    <div className="h-full">
      <div className="mx-auto max-w-5xl h-full pb-14 sm:pb-0">
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/register" element={<RegisterScreen />} />
          <Route path="/home" element={<HomeScreen />} />
          <Route path="/map" element={<MapScreen />} />
          <Route path="/publish" element={<PublishScreen />} />
          <Route path="/community" element={<CommunityScreen />} />
          <Route
            path="/profile"
            element={
              <RequireAuth>
                <ProfileScreen />
              </RequireAuth>
            }
          />
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </div>
      <BottomNav />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Shell />
      </BrowserRouter>
    </AuthProvider>
  );
}
