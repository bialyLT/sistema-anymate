import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

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
      <button onClick={goToInicio} className="absolute top-6 left-4 z-10 text-emerald-700 font-bold">
        Ir al inicio
      </button>

      <div className="w-full max-w-md">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-emerald-600 mb-2">Iniciar Sesión</h1>
          <p className="text-lg text-gray-500">Bienvenido al mundo del Mate</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <div className="mb-5">
            <label className="block text-sm font-semibold text-emerald-900 mb-2">Usuario</label>
            <input
              className="w-full bg-gray-100 rounded-lg px-4 py-3 text-base border border-gray-200 text-gray-800"
              placeholder="Tu nombre de usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoCapitalize="none"
            />
          </div>

          <div className="mb-5">
            <label className="block text-sm font-semibold text-emerald-900 mb-2">Contraseña</label>
            <input
              className="w-full bg-gray-100 rounded-lg px-4 py-3 text-base border border-gray-200 text-gray-800"
              placeholder="******"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {errorMessage ? <div className="text-red-500 text-center mb-2 -mt-2">{errorMessage}</div> : null}

          <button
            className="w-full bg-emerald-600 rounded-lg py-4 mt-3 text-white text-lg font-bold disabled:opacity-60"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? 'Cargando...' : 'Ingresar'}
          </button>

          <div className="mt-6 flex justify-center gap-2">
            <span className="text-gray-500">¿No tienes cuenta?</span>
            <Link to="/register" className="text-emerald-600 font-bold">
              Regístrate
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
