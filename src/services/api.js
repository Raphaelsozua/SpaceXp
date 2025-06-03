// src/services/api.js - Atualizado para usar backend Flask
import axios from 'axios';

// URL base da API Flask
// IMPORTANTE: Para testar no dispositivo físico, substitua localhost pelo IP da sua máquina
const BASE_URL = __DEV__ ? 'http://localhost:5000/api' : 'http://localhost:5000/api';

// Para dispositivo físico, descomente e use seu IP local:
// const BASE_URL = 'http://192.168.1.XXX:5000/api';

console.log('🔗 API Base URL:', BASE_URL);

// Cliente Axios configurado
const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token automaticamente
apiClient.interceptors.request.use(
  (config) => {
    // Para web, usar localStorage temporariamente
    const token = localStorage.getItem('user_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    console.log(`📡 ${config.method?.toUpperCase()} ${config.url}`, {
      headers: config.headers.Authorization ? '✅ Com token' : '❌ Sem token'
    });
    
    return config;
  },
  (error) => {
    console.error('❌ Erro no request interceptor:', error);
    return Promise.reject(error);
  }
);

// Interceptor para tratamento de respostas
apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url;
    
    console.error(`❌ ${status || 'Network Error'} ${url}`, {
      message: error.response?.data?.error || error.message,
      data: error.response?.data
    });
    
    // Tratamento específico para diferentes códigos de erro
    if (status === 401) {
      // Token inválido ou expirado - limpar dados de autenticação
      localStorage.removeItem('user_token');
      localStorage.removeItem('user_info');
      // Não redirecionar aqui, deixar o contexto lidar com isso
    }
    
    return Promise.reject(error);
  }
);

// ===================== AUTENTICAÇÃO =====================

export const authenticateWithGoogle = async (googleToken) => {
  try {
    console.log('🔐 Iniciando autenticação com Google...');
    
    const response = await apiClient.post('/auth/google', {
      token: googleToken
    });
    
    console.log('✅ Autenticação bem-sucedida:', response.data.user);
    return response.data;
  } catch (error) {
    console.error('❌ Erro na autenticação:', error.response?.data || error.message);
    throw error;
  }
};

// ===================== USUÁRIO =====================

export const getUserProfile = async () => {
  try {
    const response = await apiClient.get('/user/profile');
    return response.data;
  } catch (error) {
    console.error('❌ Erro ao buscar perfil:', error);
    throw error;
  }
};

export const updateUserSettings = async (settings) => {
  try {
    const response = await apiClient.post('/user/settings', settings);
    return response.data;
  } catch (error) {
    console.error('❌ Erro ao atualizar configurações:', error);
    throw error;
  }
};

// ===================== APOD =====================

export const getAPOD = async (date = null) => {
  try {
    const url = date ? `/apod/${date}` : '/apod';
    const response = await apiClient.get(url);
    return response.data;
  } catch (error) {
    console.error('❌ Erro ao buscar APOD:', error);
    throw error;
  }
};

export const getRandomAPODs = async (count = 5) => {
  try {
    const response = await apiClient.get('/apod/random', {
      params: { count: Math.min(count, 10) }
    });
    
    // Garantir que sempre retorna um array
    const data = response.data;
    return Array.isArray(data) ? data : [data];
  } catch (error) {
    console.error('❌ Erro ao buscar APODs aleatórias:', error);
    throw error;
  }
};

// ===================== FAVORITOS =====================

export const getFavorites = async () => {
  try {
    const response = await apiClient.get('/favorites');
    return response.data || [];
  } catch (error) {
    console.error('❌ Erro ao buscar favoritos:', error);
    // Retornar array vazio em caso de erro para não quebrar a UI
    if (error.response?.status === 401) {
      throw error; // Re-throw para que o contexto possa lidar com logout
    }
    return [];
  }
};

export const addToFavorites = async (apodData) => {
  try {
    console.log('❤️ Adicionando aos favoritos:', apodData.title);
    
    const response = await apiClient.post('/favorites', {
      date: apodData.date,
      apod: apodData
    });
    
    console.log('✅ Favorito adicionado:', response.data.message);
    return response.data;
  } catch (error) {
    console.error('❌ Erro ao adicionar favorito:', error);
    throw error;
  }
};

export const removeFromFavorites = async (date) => {
  try {
    console.log('💔 Removendo dos favoritos:', date);
    
    const response = await apiClient.delete(`/favorites/${date}`);
    
    console.log('✅ Favorito removido:', response.data.message);
    return response.data;
  } catch (error) {
    console.error('❌ Erro ao remover favorito:', error);
    throw error;
  }
};

export const checkIsFavorite = async (date) => {
  try {
    const response = await apiClient.get(`/favorites/check/${date}`);
    return response.data.is_favorite;
  } catch (error) {
    console.error('❌ Erro ao verificar favorito:', error);
    // Retornar false em caso de erro
    return false;
  }
};

// ===================== ESTATÍSTICAS =====================

export const getPopularAPODs = async () => {
  try {
    const response = await apiClient.get('/stats/popular');
    return response.data || [];
  } catch (error) {
    console.error('❌ Erro ao buscar APODs populares:', error);
    return [];
  }
};

// ===================== UTILIDADES =====================

export const testApiConnection = async () => {
  try {
    // Testar endpoint básico (sem autenticação)
    const response = await axios.get(BASE_URL.replace('/api', '/health'), {
      timeout: 5000
    });
    
    console.log('🎯 Teste de conexão:', response.data);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('❌ Falha no teste de conexão:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
};

// Export default com todas as funções
export default {
  authenticateWithGoogle,
  getUserProfile,
  updateUserSettings,
  getAPOD,
  getRandomAPODs,
  getFavorites,
  addToFavorites,
  removeFromFavorites,
  checkIsFavorite,
  getPopularAPODs,
  testApiConnection,
};