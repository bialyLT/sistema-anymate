import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import axios from 'axios';
import { styled } from 'nativewind';
import { useAuth } from '../context/AuthContext';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTextInput = styled(TextInput);
const StyledTouchableOpacity = styled(TouchableOpacity);

const LoginScreen = ({ navigation }: any) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { login, token } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (token) {
      navigation.replace('Main');
    }
  }, [token]);

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
      // NOTE: For Android Emulator use 10.0.2.2, for web localhost, for physical device LAN IP.
      const baseURL = Platform.OS === 'web' ? 'http://localhost:8000' : 'http://10.0.2.2:8000';
      
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
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-emerald-50 justify-center p-6"
    >
      <StyledView className="mb-12 items-center">
        <StyledText className="text-4xl font-bold text-emerald-600 mb-2">Iniciar Sesión</StyledText>
        <StyledText className="text-lg text-gray-500">Bienvenido al mundo del Mate</StyledText>
      </StyledView>

      <StyledView className="bg-white p-6 rounded-2xl shadow-lg">
        <StyledView className="mb-5">
          <StyledText className="text-sm font-semibold text-emerald-900 mb-2">Usuario</StyledText>
          <StyledTextInput
            className="bg-gray-100 rounded-lg px-4 py-3 text-base border border-gray-200 text-gray-800"
            placeholder="Tu nombre de usuario"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
        </StyledView>

        <StyledView className="mb-5">
          <StyledText className="text-sm font-semibold text-emerald-900 mb-2">Contraseña</StyledText>
          <StyledTextInput
            className="bg-gray-100 rounded-lg px-4 py-3 text-base border border-gray-200 text-gray-800"
            placeholder="******"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </StyledView>

        {errorMessage ? <StyledText className="text-red-500 text-center mb-2 -mt-2">{errorMessage}</StyledText> : null}

        <StyledTouchableOpacity 
          className="bg-emerald-600 rounded-lg py-4 items-center mt-3 active:bg-emerald-700"
          onPress={handleLogin}
          disabled={loading}
        >
          <StyledText className="text-white text-lg font-bold">{loading ? 'Cargando...' : 'Ingresar'}</StyledText>
        </StyledTouchableOpacity>

        <StyledView className="mt-6 flex-row justify-center gap-2">
          <StyledText className="text-gray-500">¿No tienes cuenta?</StyledText>
          <StyledTouchableOpacity onPress={() => navigation.navigate('Register')}>
            <StyledText className="text-emerald-600 font-bold">Regístrate</StyledText>
          </StyledTouchableOpacity>
        </StyledView>
      </StyledView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;
