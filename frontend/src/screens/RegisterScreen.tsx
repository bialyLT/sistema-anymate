import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import axios from 'axios';
import { styled } from 'nativewind';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTextInput = styled(TextInput);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledScrollView = styled(ScrollView);

const RegisterScreen = ({ navigation }: any) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

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
      const baseURL = Platform.OS === 'web' ? 'http://localhost:8000' : 'http://10.0.2.2:8000';
      
      // Register
      await axios.post(`${baseURL}/api/users/register/`, {
        username: trimmedUsername,
        email: trimmedEmail,
        password: trimmedPassword,
      });

      // Auto Login after register (Optional, generally good UX) or redirect to Login
      setSuccessMessage('Cuenta creada correctamente. Redirigiendo...');
      setTimeout(() => {
        navigation.navigate('Login');
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
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-emerald-50"
    >
      <StyledScrollView contentContainerStyle={{flexGrow: 1, justifyContent: 'center', padding: 24}}>
        <StyledView className="mb-8 items-center">
          <StyledText className="text-3xl font-bold text-emerald-600 mb-2">Crear Cuenta</StyledText>
          <StyledText className="text-gray-500">Únete a nuestra comunidad Matera</StyledText>
        </StyledView>

        <StyledView className="bg-white p-6 rounded-2xl shadow-lg">
          <StyledView className="mb-4">
            <StyledText className="text-sm font-semibold text-emerald-900 mb-1">Usuario</StyledText>
            <StyledTextInput
              className="bg-gray-100 rounded-lg px-4 py-3 text-base border border-gray-200 text-gray-800"
              placeholder="Elige un usuario único"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
          </StyledView>

          <StyledView className="mb-4">
            <StyledText className="text-sm font-semibold text-emerald-900 mb-1">Email</StyledText>
            <StyledTextInput
              className="bg-gray-100 rounded-lg px-4 py-3 text-base border border-gray-200 text-gray-800"
              placeholder="tucorreo@ejemplo.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </StyledView>

          <StyledView className="mb-4">
            <StyledText className="text-sm font-semibold text-emerald-900 mb-1">Contraseña</StyledText>
            <StyledTextInput
              className="bg-gray-100 rounded-lg px-4 py-3 text-base border border-gray-200 text-gray-800"
              placeholder="******"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </StyledView>

          <StyledView className="mb-4">
            <StyledText className="text-sm font-semibold text-emerald-900 mb-1">Confirmar Contraseña</StyledText>
            <StyledTextInput
              className="bg-gray-100 rounded-lg px-4 py-3 text-base border border-gray-200 text-gray-800"
              placeholder="******"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
          </StyledView>

          {errorMessage ? <StyledText className="text-red-500 text-center mb-2 -mt-2">{errorMessage}</StyledText> : null}
          {successMessage ? <StyledText className="text-emerald-600 font-bold text-center mb-2 -mt-2">{successMessage}</StyledText> : null}

          <StyledTouchableOpacity 
            className="bg-emerald-600 rounded-lg py-4 items-center mt-3 active:bg-emerald-700"
            onPress={handleRegister}
            disabled={loading}
          >
            <StyledText className="text-white text-lg font-bold">{loading ? 'Creando cuenta...' : 'Registrarse'}</StyledText>
          </StyledTouchableOpacity>

          <StyledView className="mt-6 flex-row justify-center gap-2">
            <StyledText className="text-gray-500">¿Ya tienes cuenta?</StyledText>
            <StyledTouchableOpacity onPress={() => navigation.navigate('Login')}>
              <StyledText className="text-emerald-600 font-bold">Inicia Sesión</StyledText>
            </StyledTouchableOpacity>
          </StyledView>
        </StyledView>
      </StyledScrollView>
    </KeyboardAvoidingView>
  );
};

export default RegisterScreen;
