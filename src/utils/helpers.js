// src/utils/helpers.js
import { Dimensions, Platform } from 'react-native';

// Obter dimensões da tela
export const screenWidth = Dimensions.get('window').width;
export const screenHeight = Dimensions.get('window').height;

// Verificar se o dispositivo é um iPhone com notch
export const isIphoneX = () => {
  const { width, height } = Dimensions.get('window');
  return (
    Platform.OS === 'ios' &&
    !Platform.isPad &&
    !Platform.isTV &&
    ((height === 780 || width === 780)
      || (height === 812 || width === 812)
      || (height === 844 || width === 844)
      || (height === 896 || width === 896)
      || (height === 926 || width === 926))
  );
};

// Formatar data no formato DD/MM/YYYY
export const formatDate = (dateString) => {
  if (!dateString) return '';
  
  try {
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  } catch (error) {
    console.error('Erro ao formatar data:', error);
    return dateString;
  }
};

// Truncar texto com número máximo de caracteres
export const truncateText = (text, maxLength) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  
  return text.substring(0, maxLength) + '...';
};

// Verificar se a URL é uma imagem
export const isImageUrl = (url) => {
  if (!url) return false;
  
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
  const extension = url.split('.').pop().toLowerCase();
  
  return imageExtensions.includes(extension);
};

// Verificar se a URL é um vídeo
export const isVideoUrl = (url) => {
  if (!url) return false;
  
  const videoExtensions = ['mp4', 'webm', 'ogg', 'mov', 'avi'];
  const extension = url.split('.').pop().toLowerCase();
  
  return videoExtensions.includes(extension) || url.includes('youtube.com') || url.includes('vimeo.com');
};

// Gerar um ID único
export const generateUniqueId = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// Pegar data atual no formato YYYY-MM-DD
export const getCurrentDate = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

// Obter data passada a partir de dias (hoje - dias)
export const getDateMinusDays = (days) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

// Calcular o tempo decorrido entre duas datas em dias
export const getDaysBetweenDates = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

// Converter 'media_type' da API APOD para texto legível
export const getMediaTypeLabel = (mediaType) => {
  switch (mediaType) {
    case 'image':
      return 'Imagem';
    case 'video':
      return 'Vídeo';
    default:
      return mediaType || 'Desconhecido';
  }
};

// Formatar para mostar data relativa (hoje, ontem, etc.)
export const getRelativeDate = (dateString) => {
  const today = new Date();
  const date = new Date(dateString);
  
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  
  const diffTime = today.getTime() - date.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return 'Hoje';
  } else if (diffDays === 1) {
    return 'Ontem';
  } else if (diffDays <= 7) {
    return `${diffDays} dias atrás`;
  } else {
    return formatDate(dateString);
  }
};

export default {
  screenWidth,
  screenHeight,
  isIphoneX,
  formatDate,
  truncateText,
  isImageUrl,
  isVideoUrl,
  generateUniqueId,
  getCurrentDate,
  getDateMinusDays,
  getDaysBetweenDates,
  getMediaTypeLabel,
  getRelativeDate
};