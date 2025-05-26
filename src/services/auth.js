// src/services/auth.js
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { AUTH_CONFIG } from '../config/constants';

// Registra o WebBrowser para manipular redirecionamentos de autenticação
WebBrowser.maybeCompleteAuthSession();

// Chaves para armazenamento seguro
const AUTH_TOKEN_KEY = 'auth_token';
const USER_INFO_KEY = 'user_info';

// Solicitar o login utilizando OAuth
export const login = async () => {
  try {
    const redirectUri = AuthSession.makeRedirectUri({
      scheme: 'spacexpp',
      path: 'callback',
    });

    // Criar solicitação de autenticação
    const request = new AuthSession.AuthRequest({
      clientId: AUTH_CONFIG.clientId,
      redirectUri,
      responseType: AUTH_CONFIG.responseType,
      scopes: AUTH_CONFIG.scopes,
    });

    // Iniciar o fluxo de autenticação
    const result = await request.promptAsync({
      authorizationEndpoint: AUTH_CONFIG.authorizationEndpoint,
      useProxy: Platform.select({ web: true, default: true }),
    });

    if (result.type === 'success') {
      // Extrair o token de acesso da resposta
      const { access_token } = result.params;
      
      // Armazenar o token de forma segura
      await SecureStore.setItemAsync(AUTH_TOKEN_KEY, access_token);
      
      // Buscar informações do usuário
      const userInfo = await fetchUserInfo(access_token);
      
      // Armazenar informações do usuário
      await SecureStore.setItemAsync(USER_INFO_KEY, JSON.stringify(userInfo));
      
      return { success: true, token: access_token, userInfo };
    } else {
      return { success: false, error: 'Autenticação cancelada ou falhou' };
    }
  } catch (error) {
    console.error('Erro durante login:', error);
    return { success: false, error: error.message };
  }
};

// Buscar informações do usuário usando o token
const fetchUserInfo = async (token) => {
  try {
    // Exemplo para Google OAuth
    const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    if (!response.ok) {
      throw new Error('Falha ao buscar informações do usuário');
    }
    
    const userInfo = await response.json();
    return userInfo;
  } catch (error) {
    console.error('Erro ao buscar informações do usuário:', error);
    throw error;
  }
};

// Verificar se o usuário está autenticado
export const isAuthenticated = async () => {
  try {
    const token = await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
    return !!token;
  } catch (error) {
    console.error('Erro ao verificar autenticação:', error);
    return false;
  }
};

// Obter informações do usuário armazenadas
export const getUserInfo = async () => {
  try {
    const userInfoString = await SecureStore.getItemAsync(USER_INFO_KEY);
    return userInfoString ? JSON.parse(userInfoString) : null;
  } catch (error) {
    console.error('Erro ao obter informações do usuário:', error);
    return null;
  }
};

// Obter o token de autenticação
export const getAuthToken = async () => {
  try {
    return await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
  } catch (error) {
    console.error('Erro ao obter token de autenticação:', error);
    return null;
  }
};

// Fazer logout (remover dados de autenticação)
export const logout = async () => {
  try {
    await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
    await SecureStore.deleteItemAsync(USER_INFO_KEY);
    return true;
  } catch (error) {
    console.error('Erro ao fazer logout:', error);
    return false;
  }
};

export default {
  login,
  logout,
  isAuthenticated,
  getUserInfo,
  getAuthToken,
};