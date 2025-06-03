// src/screens/DetailScreen.js - Corrigido para scroll completo
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Share,
  Dimensions,
  Linking,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Importar constantes
import { COLORS, COMMON_STYLES } from '../config/constants';

// Importar funções da API
import { getFavorites, addToFavorites, removeFromFavorites } from '../services/api';

const DetailScreen = ({ route, navigation }) => {
  const { apod } = route.params;
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  useEffect(() => {
    checkIfFavorite();
    
    // Correção específica para scroll da DetailScreen
    const originalStyles = new Map();
    
    const enableScroll = () => {
      // 1. Encontrar elementos que estão bloqueando o scroll especificamente
      const blockers = document.querySelectorAll('*');
      
      blockers.forEach(el => {
        const styles = getComputedStyle(el);
        
        // Focar apenas em elementos que realmente bloqueiam scroll
        if (styles.pointerEvents === 'none' && 
            (styles.position === 'fixed' || styles.position === 'absolute') &&
            (styles.top === '0px' || styles.top === 'auto') &&
            (styles.left === '0px' || styles.left === 'auto') &&
            (styles.right === '0px' || styles.right === 'auto') &&
            (styles.bottom === '0px' || styles.bottom === 'auto')) {
          
          // Salvar estado original
          if (!originalStyles.has(el)) {
            originalStyles.set(el, el.style.pointerEvents);
          }
          
          // Permitir interação apenas se não for um elemento essencial da UI
          if (!el.closest('[role="button"]') && 
              !el.closest('[role="navigation"]') &&
              !el.getAttribute('aria-label')) {
            el.style.pointerEvents = 'auto';
          }
        }
      });
      
      // 2. Garantir que o ScrollView funcione
      const scrollViews = document.querySelectorAll('[style*="overflow"]');
      scrollViews.forEach(sv => {
        if (!originalStyles.has(sv)) {
          originalStyles.set(sv, sv.style.overflow);
        }
        sv.style.overflow = 'auto';
      });
    };
    
    const cleanup = () => {
      originalStyles.forEach((originalValue, el) => {
        if (el && el.style) {
          el.style.pointerEvents = originalValue || '';
        }
      });
      originalStyles.clear();
    };
    
    enableScroll();
    const timeout = setTimeout(enableScroll, 200);
    
    return cleanup;
  }, []);

  const checkIfFavorite = async () => {
    try {
      const favorites = await getFavorites();
      const itemIsFavorite = favorites.some(fav => fav.date === apod.date);
      setIsFavorite(itemIsFavorite);
    } catch (error) {
      console.error('Erro ao verificar favoritos:', error);
    }
  };

  const toggleFavorite = async () => {
    if (favoriteLoading) return;
    
    setFavoriteLoading(true);
    
    try {
      if (isFavorite) {
        await removeFromFavorites(apod.date);
        setIsFavorite(false);
      } else {
        await addToFavorites(apod);
        setIsFavorite(true);
      }
    } catch (error) {
      console.error('Erro ao alterar favorito:', error);
      window.alert('Erro ao salvar favorito. Tente novamente.');
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: apod.title,
          text: apod.explanation,
          url: apod.url
        });
      } else {
        await navigator.clipboard.writeText(`${apod.title}\n\n${apod.explanation}\n\n${apod.url}`);
        window.alert('Link copiado para a área de transferência!');
      }
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
    }
  };

  const formatDate = (dateString) => {
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  const handleVideoPress = () => {
    if (apod.media_type === 'video' && apod.url) {
      window.open(apod.url, '_blank');
    }
  };

  const imageUrl = apod.media_type === 'image' 
    ? apod.hdurl || apod.url 
    : (apod.thumbnail_url || 'https://via.placeholder.com/500x300/121212/6366F1?text=Video');

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <ScrollView 
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={true}
        bounces={true}
        scrollEnabled={true}
        nestedScrollEnabled={true}
      >
        <View style={styles.imageContainer}>
          {imageLoading && !imageError && (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color={COLORS.accent} />
              <Text style={styles.loadingText}>Carregando imagem...</Text>
            </View>
          )}
          
          {imageError && (
            <View style={styles.errorContainer}>
              <Ionicons name="image-outline" size={60} color={COLORS.textSecondary} />
              <Text style={styles.errorText}>Erro ao carregar imagem</Text>
            </View>
          )}
          
          <TouchableOpacity
            activeOpacity={apod.media_type === 'video' ? 0.7 : 1}
            onPress={apod.media_type === 'video' ? handleVideoPress : null}
            style={styles.imageWrapper}
          >
            <Image
              source={{ uri: imageUrl }}
              style={styles.image}
              resizeMode="cover"
              onLoadStart={() => {
                setImageLoading(true);
                setImageError(false);
              }}
              onLoadEnd={() => setImageLoading(false)}
              onError={() => {
                setImageLoading(false);
                setImageError(true);
              }}
            />
            
            {apod.media_type === 'video' && !imageError && (
              <View style={styles.videoOverlay}>
                <Ionicons name="play-circle" size={60} color="white" />
                <Text style={styles.videoText}>Toque para abrir o vídeo</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.contentContainer}>
          <View style={styles.header}>
            <Text style={styles.date}>{formatDate(apod.date)}</Text>
            <View style={styles.actionsContainer}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={toggleFavorite}
                disabled={favoriteLoading}
              >
                {favoriteLoading ? (
                  <ActivityIndicator size="small" color={COLORS.text} />
                ) : (
                  <Ionicons
                    name={isFavorite ? 'heart' : 'heart-outline'}
                    size={24}
                    color={isFavorite ? COLORS.notification : COLORS.text}
                  />
                )}
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleShare}
              >
                <Ionicons name="share-social-outline" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>
          </View>
          
          <Text style={styles.title}>{apod.title}</Text>
          
          {apod.copyright && (
            <Text style={styles.copyright}>© {apod.copyright}</Text>
          )}
          
          <Text style={styles.explanation}>{apod.explanation}</Text>
          
          {apod.media_type === 'video' && (
            <TouchableOpacity
              style={styles.videoButton}
              onPress={handleVideoPress}
            >
              <Ionicons name="videocam-outline" size={20} color={COLORS.text} />
              <Text style={styles.videoButtonText}>Assistir ao vídeo</Text>
            </TouchableOpacity>
          )}
          
          <View style={styles.infoContainer}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Data:</Text>
              <Text style={styles.infoValue}>{formatDate(apod.date)}</Text>
            </View>
            
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Tipo de mídia:</Text>
              <Text style={styles.infoValue}>
                {apod.media_type === 'image' ? 'Imagem' : 'Vídeo'}
              </Text>
            </View>
            
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Fonte:</Text>
              <Text style={styles.infoValue}>NASA APOD</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    // Completamente removido - deixar vazio para teste
  },
  imageContainer: {
    width: width,
    height: width * 0.6, // Altura menor para dar mais espaço ao texto
    position: 'relative',
    backgroundColor: COLORS.primary,
  },
  imageWrapper: {
    width: '100%',
    height: '100%',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  loaderContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    zIndex: 1,
  },
  loadingText: {
    color: COLORS.text,
    marginTop: 10,
    fontSize: 14,
  },
  errorContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    zIndex: 1,
  },
  errorText: {
    color: COLORS.textSecondary,
    marginTop: 10,
    fontSize: 14,
  },
  videoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  videoText: {
    color: 'white',
    marginTop: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  contentContainer: {
    padding: 16,
    // REMOVIDO flex: 1 para permitir expansão natural
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  date: {
    fontSize: 14,
    color: COLORS.accent,
  },
  actionsContainer: {
    flexDirection: 'row',
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
    lineHeight: 32,
  },
  copyright: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 16,
    fontStyle: 'italic',
  },
  explanation: {
    fontSize: 16,
    color: COLORS.text,
    lineHeight: 26, // Melhor espaçamento para leitura
    marginBottom: 30,
    textAlign: 'justify', // Justificar texto para melhor aparência
  },
  videoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.accent,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 20,
    ...COMMON_STYLES.shadow,
  },
  videoButtonText: {
    color: COLORS.text,
    fontWeight: '600',
    marginLeft: 8,
  },
  infoContainer: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20, // Espaço final para o scroll
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  infoLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  infoValue: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500',
  },
});

export default DetailScreen;