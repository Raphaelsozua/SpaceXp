// src/services/api.js
import axios from 'axios';
import { NASA_API_KEY, NASA_APOD_URL } from '../config/constants';

// Cliente Axios básico para a API da NASA
const apiClient = axios.create({
  baseURL: NASA_APOD_URL,
  params: {
    api_key: NASA_API_KEY,
  },
});

// Obter a imagem astronômica do dia
export const getAPOD = async (date = null) => {
  try {
    const params = date ? { date } : {};
    const response = await apiClient.get('', { params });
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar APOD:', error);
    throw error;
  }
};

// Obter imagens astronômicas de um período
export const getAPODRange = async (startDate, endDate) => {
  try {
    const params = {
      start_date: startDate,
      end_date: endDate,
    };
    const response = await apiClient.get('', { params });
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar range de APODs:', error);
    throw error;
  }
};

// Obter imagens aleatórias
export const getRandomAPODs = async (count = 5) => {
  try {
    const params = {
      count,
      thumbs: true,
    };
    const response = await apiClient.get('', { params });
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar APODs aleatórias:', error);
    throw error;
  }
};

export default {
  getAPOD,
  getAPODRange,
  getRandomAPODs,
};