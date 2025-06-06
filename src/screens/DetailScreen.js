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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, COMMON_STYLES } from '../config/constants';
import { getFavorites, addToFavorites, removeFromFavorites } from '../services/api';

const DetailScreen = ({ route, navigation }) => {
  const { apod } = route.params;
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  useEffect(() => {
    checkIfFavorite();
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
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        title: apod.title,
        message: `${apod.title}\n\n${apod.explanation}\n\n${apod.url}`,
        url: apod.url
      });
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
      Linking.openURL(apod.url);
    }
  };

  const imageUrl = apod.media_type === 'image'
    ? apod.hdurl || apod.url
    : (apod.thumbnail_url || 'https://via.placeholder.com/500x300/121212/6366F1?text=Video');

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      {/* Conteúdo scrollável */}
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Cabeçalho com imagem */}
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
    </View>
  );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  imageContainer: {
    width: width,
    height: height * 0.4,
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
 scrollContent: {
  padding: 16,
  paddingBottom: 40,
},
contentContainer: {
  flex: 1,
},
  contentContainer: {
    flex: 1,
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
    lineHeight: 26,
    marginBottom: 30,
    textAlign: 'justify',
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
