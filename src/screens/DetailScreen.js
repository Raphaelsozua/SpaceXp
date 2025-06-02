// src/screens/DetailScreen.js - Completo e corrigido para web
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

// Chave para armazenar favoritos
const FAVORITES_STORAGE_KEY = 'apod_favorites';

const DetailScreen = ({ route, navigation }) => {
  const { apod } = route.params;
  const [imageLoading, setImageLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const [isFavorite, setIsFavorite] = useState(false);

  // Verificar se a imagem é um favorito ao carregar a tela
  useEffect(() => {
    loadFavorites();
  }, []);

  // Carregar favoritos do armazenamento - CORRIGIDO PARA WEB
  const loadFavorites = async () => {
    try {
      // Usar localStorage para web
      const storedFavorites = localStorage.getItem(FAVORITES_STORAGE_KEY);
      if (storedFavorites) {
        const favoritesData = JSON.parse(storedFavorites);
        setFavorites(favoritesData);
        
        // Verificar se o item atual está nos favoritos
        const itemIsFavorite = favoritesData.some(fav => fav.date === apod.date);
        setIsFavorite(itemIsFavorite);
      }
    } catch (err) {
      console.error('Erro ao carregar favoritos:', err);
    }
  };

  // Salvar favoritos no armazenamento - CORRIGIDO PARA WEB
  const saveFavorites = async (newFavorites) => {
    try {
      // Usar localStorage para web
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(newFavorites));
    } catch (err) {
      console.error('Erro ao salvar favoritos:', err);
    }
  };

  // Toggle favorito
  const toggleFavorite = () => {
    let newFavorites;

    if (isFavorite) {
      // Remover dos favoritos
      newFavorites = favorites.filter(fav => fav.date !== apod.date);
    } else {
      // Adicionar aos favoritos
      newFavorites = [...favorites, apod];
    }

    setFavorites(newFavorites);
    setIsFavorite(!isFavorite);
    saveFavorites(newFavorites);
  };

  // Compartilhar a APOD
  const handleShare = async () => {
    try {
      await Share.share({
        message: `${apod.title} - ${apod.explanation}\n\nConfira esta incrível imagem astronômica da NASA: ${apod.url}`,
        title: 'Astronomy Picture of the Day',
      });
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
    }
  };

  // Formatar a data (YYYY-MM-DD para DD/MM/YYYY)
  const formatDate = (dateString) => {
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  // Abrir URL do vídeo se for um vídeo
  const handleVideoPress = () => {
    if (apod.media_type === 'video' && apod.url) {
      Linking.openURL(apod.url).catch((err) => 
        console.error('Erro ao abrir URL do vídeo:', err)
      );
    }
  };

  // Determinar URL da imagem
  const imageUrl = apod.media_type === 'image' 
    ? apod.url 
    : (apod.thumbnail_url || 'https://via.placeholder.com/500x300/121212/6366F1?text=Video');

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          {imageLoading && (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color={COLORS.accent} />
            </View>
          )}
          
          <TouchableOpacity
            activeOpacity={apod.media_type === 'video' ? 0.7 : 1}
            onPress={apod.media_type === 'video' ? handleVideoPress : null}
          >
            <Image
              source={{ uri: imageUrl }}
              style={styles.image}
              onLoadStart={() => setImageLoading(true)}
              onLoadEnd={() => setImageLoading(false)}
            />
            
            {apod.media_type === 'video' && (
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
              >
                <Ionicons
                  name={isFavorite ? 'heart' : 'heart-outline'}
                  size={24}
                  color={isFavorite ? COLORS.notification : COLORS.text}
                />
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
  },
  imageContainer: {
    width: width,
    height: width * 0.75, // Proporção 4:3
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
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
    opacity: 0.7,
    zIndex: 1,
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
    lineHeight: 24,
    marginBottom: 20,
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
    marginBottom: 20,
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