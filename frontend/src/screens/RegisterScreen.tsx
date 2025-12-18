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

export default function RegisterScreen() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const { token } = useAuth();
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

  const handleRegister = async () => {
    setErrorMessage('');
    setSuccessMessage('');

    // Pre-process inputs
    const trimmedUsername = username.trim();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    const trimmedConfirm = confirmPassword.trim();

    // 1. Basic Empty Check
    if (!trimmedUsername || !trimmedEmail || !trimmedPassword || !trimmedConfirm) {
      setErrorMessage('Por favor completa todos los campos');
      return;
    }

    // 2. Email Regex Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setErrorMessage('Por favor ingresa un correo electrónico válido');
      return;
    }

    // 3. Username Regex Validation (Alphanumeric + Underscore, Min 3)
    const usernameRegex = /^[a-zA-Z0-9_]{3,}$/;
    if (!usernameRegex.test(trimmedUsername)) {
        setErrorMessage('El usuario debe tener al menos 3 caracteres y solo puede contener letras, números y guiones bajos.');
        return;
    }

    // 4. Strong Password Validation (Min 8, 1+ Upper, 1+ Number)
    const passwordRegex = /^(?=.*[A-Z])(?=.*[0-9])(?=.{8,})/;
    if (!passwordRegex.test(trimmedPassword)) {
      setErrorMessage('La contraseña debe tener al menos 8 caracteres, una mayúscula y un número.');
      return;
    }

    // 5. Password Match Check
    if (trimmedPassword !== trimmedConfirm) {
      setErrorMessage('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);
    try {
      // Register
      await axios.post(`${baseURL}/api/users/register/`, {
        username: trimmedUsername,
        email: trimmedEmail,
        password: trimmedPassword,
      });

      // Auto Login after register (Optional, generally good UX) or redirect to Login
      setSuccessMessage('Cuenta creada correctamente. Redirigiendo...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (error: any) {
      console.error('Register error:', error.response?.data || error.message);
      
      // 5. Backend Error Handling
      let msg = 'No se pudo crear la cuenta';
      if (error.response?.data) {
        if (error.response.data.username) {
           msg = `Usuario: ${error.response.data.username[0]}`;
        } else if (error.response.data.email) {
           msg = `Email: ${error.response.data.email[0]}`;
        } else if (error.response.data.password) {
           msg = `Contraseña: ${error.response.data.password[0]}`;
        }
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
            <CardTitle>Crear cuenta</CardTitle>
            <CardDescription>Únete a nuestra comunidad matera</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {errorMessage ? (
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            ) : null}

            {successMessage ? (
              <Alert variant="success">
                <AlertTitle>Listo</AlertTitle>
                <AlertDescription>{successMessage}</AlertDescription>
              </Alert>
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="username">Usuario</Label>
              <Input
                id="username"
                placeholder="Elige un usuario único"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoCapitalize="none"
                autoComplete="username"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                placeholder="tucorreo@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                autoCapitalize="none"
                autoComplete="email"
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
                autoComplete="new-password"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
              <Input
                id="confirmPassword"
                placeholder="******"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>

            <Button className="w-full" onClick={handleRegister} disabled={loading}>
              {loading ? 'Creando cuenta...' : 'Registrarse'}
            </Button>

            <div className="text-center text-sm text-gray-600">
              ¿Ya tienes cuenta?{' '}
              <Link to="/login" className="font-semibold text-emerald-700 hover:underline">
                Inicia sesión
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
