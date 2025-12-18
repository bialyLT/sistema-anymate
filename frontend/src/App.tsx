import React from 'react';
import { BrowserRouter, Link, Navigate, NavLink, Route, Routes, useNavigate } from 'react-router-dom';
import { Leaf, Menu } from 'lucide-react';

import { AuthProvider, useAuth } from './context/AuthContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

import HomeScreen from './screens/HomeScreen';
import MapScreen from './screens/MapScreen';
import PublishScreen from './screens/PublishScreen';
import CommunityScreen from './screens/CommunityScreen';
import ProfileScreen from './screens/ProfileScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import AdminDashboardScreen from './screens/AdminDashboardScreen';

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { token, isLoading } = useAuth();
  if (isLoading) return null;
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { token, isLoading, isProfileLoading, isAdmin } = useAuth();
  if (isLoading || isProfileLoading) return null;
  if (!token) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/home" replace />;
  return <>{children}</>;
}

function Navbar() {
  const { token, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { to: '/home', label: 'Inicio' },
    { to: '/map', label: 'Mapa' },
    { to: '/publish', label: 'Publicar' },
    { to: '/community', label: 'Comunidad' },
  ];

  const adminItems = isAdmin ? [{ to: '/admin', label: 'Panel' }] : [];

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'px-3 py-2 rounded-md text-sm font-medium transition-colors',
      isActive ? 'text-emerald-700 bg-emerald-50' : 'text-gray-600 hover:text-emerald-700 hover:bg-emerald-50'
    );

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl px-4">
        <div className="flex h-14 w-full items-center gap-3">
          <Link to="/home" className="flex items-center gap-2 text-emerald-700 font-semibold">
            <Leaf className="h-5 w-5" />
            <span className="hidden sm:inline">Mate Social</span>
          </Link>

          <nav className="hidden md:flex flex-1 items-center gap-1">
            {[...navItems, ...adminItems].map((item) => (
              <NavLink key={item.to} to={item.to} className={linkClass}>
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-2">
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

          {/* Mobile: el navbar “se va” y queda un ícono */}
          <div className="ml-auto md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" aria-label="Abrir menú">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="p-4">
                <SheetHeader className="pr-8">
                  <SheetTitle className="flex items-center gap-2">
                    <Leaf className="h-5 w-5 text-emerald-700" />
                    Menú
                  </SheetTitle>
                </SheetHeader>

                <div className="mt-4 space-y-2">
                  {[...navItems, ...adminItems].map((item) => (
                    <SheetClose key={item.to} asChild>
                      <NavLink
                        to={item.to}
                        className={({ isActive }) =>
                          cn(
                            'block rounded-md px-3 py-2 text-sm font-medium',
                            isActive ? 'bg-emerald-50 text-emerald-700' : 'text-gray-700 hover:bg-gray-100'
                          )
                        }
                      >
                        {item.label}
                      </NavLink>
                    </SheetClose>
                  ))}
                </div>

                <div className="mt-6 space-y-2 border-t pt-4">
                  {token ? (
                    <>
                      {isAdmin ? (
                        <SheetClose asChild>
                          <Button variant="outline" className="w-full" onClick={() => navigate('/admin')}>
                            Panel de control
                          </Button>
                        </SheetClose>
                      ) : null}
                      <SheetClose asChild>
                        <Button variant="secondary" className="w-full" onClick={() => navigate('/profile')}>
                          Perfil
                        </Button>
                      </SheetClose>
                      <Button
                        variant="destructive"
                        className="w-full"
                        onClick={() => {
                          logout();
                        }}
                      >
                        Cerrar sesión
                      </Button>
                    </>
                  ) : (
                    <>
                      <SheetClose asChild>
                        <Button variant="secondary" className="w-full" onClick={() => navigate('/login')}>
                          Iniciar sesión
                        </Button>
                      </SheetClose>
                      <SheetClose asChild>
                        <Button className="w-full" onClick={() => navigate('/register')}>
                          Registrarse
                        </Button>
                      </SheetClose>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
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
            path="/admin"
            element={
              <RequireAdmin>
                <AdminDashboardScreen />
              </RequireAdmin>
            }
          />
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
