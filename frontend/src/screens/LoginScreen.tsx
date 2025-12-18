import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

import { useAuth } from '../context/AuthContext';
import { getApiBaseUrl } from '../lib/api';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { login, token } = useAuth();
  const navigate = useNavigate();
  const baseURL = getApiBaseUrl();

  // Redirect if already authenticated
  useEffect(() => {
    if (token) {
      navigate('/home', { replace: true });
    }
  }, [token, navigate]);

  const goToInicio = () => {
    navigate('/home');
  };

  const handleLogin = async () => {
    setErrorMessage(''); // Clear previous errors
    
    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();

    if (!trimmedUsername || !trimmedPassword) {
      setErrorMessage('Por favor ingresa usuario y contraseña');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${baseURL}/api-token-auth/`, {
        username: trimmedUsername,
        password: trimmedPassword,
      });

      const { token: authToken } = response.data;
      console.log('Login successful, token:', authToken);
      
      // Save token to AsyncStorage via AuthContext
      await login(authToken);

    } catch (error: any) {
      console.error('Login error:', error);
      
      let msg = 'Error al iniciar sesión';
      if (error.response) {
        if (error.response.status === 400) {
          msg = 'Credenciales no válidas. Revisa tu usuario/contraseña.';
        } else if (error.response.status >= 500) {
          msg = 'Error del servidor. Intenta más tarde.';
        }
      } else if (error.request) {
        msg = 'No se pudo conectar con el servidor. Revisa tu conexión de internet.';
      }
      
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-emerald-50 flex items-center justify-center p-6">
      <div className="absolute top-4 left-4">
        <Button variant="ghost" onClick={goToInicio}>
          Ir al inicio
        </Button>
      </div>

      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle>Iniciar sesión</CardTitle>
            <CardDescription>Bienvenido al mundo del Mate</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {errorMessage ? (
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="username">Usuario</Label>
              <Input
                id="username"
                placeholder="Tu nombre de usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoCapitalize="none"
                autoComplete="username"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                placeholder="******"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>

            <Button className="w-full" onClick={handleLogin} disabled={loading}>
              {loading ? 'Cargando...' : 'Ingresar'}
            </Button>

            <div className="text-center text-sm text-gray-600">
              ¿No tienes cuenta?{' '}
              <Link to="/register" className="font-semibold text-emerald-700 hover:underline">
                Regístrate
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
