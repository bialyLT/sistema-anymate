import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

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
      <button onClick={goToInicio} className="absolute top-6 left-4 z-10 text-emerald-700 font-bold">
        Ir al inicio
      </button>

      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-emerald-600 mb-2">Crear Cuenta</h1>
          <p className="text-gray-500">Únete a nuestra comunidad Matera</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <div className="mb-4">
            <label className="block text-sm font-semibold text-emerald-900 mb-1">Usuario</label>
            <input
              className="w-full bg-gray-100 rounded-lg px-4 py-3 text-base border border-gray-200 text-gray-800"
              placeholder="Elige un usuario único"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoCapitalize="none"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold text-emerald-900 mb-1">Email</label>
            <input
              className="w-full bg-gray-100 rounded-lg px-4 py-3 text-base border border-gray-200 text-gray-800"
              placeholder="tucorreo@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              autoCapitalize="none"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold text-emerald-900 mb-1">Contraseña</label>
            <input
              className="w-full bg-gray-100 rounded-lg px-4 py-3 text-base border border-gray-200 text-gray-800"
              placeholder="******"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold text-emerald-900 mb-1">Confirmar Contraseña</label>
            <input
              className="w-full bg-gray-100 rounded-lg px-4 py-3 text-base border border-gray-200 text-gray-800"
              placeholder="******"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          {errorMessage ? <div className="text-red-500 text-center mb-2 -mt-2">{errorMessage}</div> : null}
          {successMessage ? <div className="text-emerald-600 font-bold text-center mb-2 -mt-2">{successMessage}</div> : null}

          <button
            className="w-full bg-emerald-600 rounded-lg py-4 mt-3 text-white text-lg font-bold disabled:opacity-60"
            onClick={handleRegister}
            disabled={loading}
          >
            {loading ? 'Creando cuenta...' : 'Registrarse'}
          </button>

          <div className="mt-6 flex justify-center gap-2">
            <span className="text-gray-500">¿Ya tienes cuenta?</span>
            <Link to="/login" className="text-emerald-600 font-bold">
              Inicia Sesión
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
