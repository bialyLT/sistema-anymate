import React from 'react';
import { BrowserRouter, Link, Navigate, NavLink, Route, Routes, useNavigate } from 'react-router-dom';
import { Leaf } from 'lucide-react';

import { AuthProvider, useAuth } from './context/AuthContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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

function Navbar() {
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { to: '/home', label: 'Inicio' },
    { to: '/map', label: 'Mapa' },
    { to: '/publish', label: 'Publicar' },
    { to: '/community', label: 'Comunidad' },
  ];

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'px-3 py-2 rounded-md text-sm font-medium transition-colors',
      isActive ? 'text-emerald-700 bg-emerald-50' : 'text-gray-600 hover:text-emerald-700 hover:bg-emerald-50'
    );

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4">
        <div className="flex h-14 items-center gap-4">
          <Link to="/home" className="flex items-center gap-2 text-emerald-700 font-semibold">
            <Leaf className="h-5 w-5" />
            <span>Mate Social</span>
          </Link>

          <nav className="hidden md:flex flex-1 items-center gap-1">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} className={linkClass}>
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {token ? (
              <>
                <Button variant="ghost" size="sm" onClick={() => navigate('/profile')}>
                  Perfil
                </Button>
                <Button variant="outline" size="sm" onClick={() => logout()}>
                  Cerrar sesión
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
                  Iniciar sesión
                </Button>
                <Button size="sm" onClick={() => navigate('/register')}>
                  Registrarse
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="md:hidden flex gap-2 pb-2 overflow-x-auto">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={linkClass}>
              {item.label}
            </NavLink>
          ))}
        </div>
      </div>
    </header>
  );
}

function Shell() {
  return (
    <div className="h-full">
      <Navbar />
      <div className="mx-auto max-w-5xl h-full pt-20 sm:pt-16 px-4">
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
