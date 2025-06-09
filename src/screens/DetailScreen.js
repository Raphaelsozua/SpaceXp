import React, { useState, useEffect, useRef } from 'react';
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
  Modal,
  Animated,
} from 'react-native';
import { PanGestureHandler, PinchGestureHandler, State } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, COMMON_STYLES } from '../config/constants';
import { getFavorites, addToFavorites, removeFromFavorites } from '../services/api';

const DetailScreen = ({ route, navigation }) => {
  const { apod } = route.params;
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const [showImageModal, setShowImageModal] = useState(false);

  const scale = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const pinchRef = useRef(null);
  const panRef = useRef(null);

  const [lastScale, setLastScale] = useState(1);
  const [lastTranslateX, setLastTranslateX] = useState(0);
  const [lastTranslateY, setLastTranslateY] = useState(0);

  useEffect(() => {
    checkIfFavorite();
    getImageDimensions();
  }, []);

  const getImageDimensions = () => {
    const screenWidth = Dimensions.get('window').width;
    
    if (apod.media_type === 'video') {
      setImageDimensions({
        width: screenWidth,
        height: screenWidth * 0.6
      });
      return;
    }

    const imageUrl = apod.hdurl || apod.url;

    Image.getSize(
      imageUrl,
      (width, height) => {
        const aspectRatio = height / width;
        const scaledHeight = screenWidth * aspectRatio;
        
        const maxHeight = Dimensions.get('window').height * 0.6;
        const finalHeight = Math.min(scaledHeight, maxHeight);
        
        setImageDimensions({
          width: screenWidth,
          height: finalHeight
        });
      },
      (error) => {
        console.log('Erro ao obter dimensões da imagem:', error);
        setImageDimensions({
          width: screenWidth,
          height: screenWidth * 0.6
        });
      }
    );
  };

  const checkIfFavorite = async () => {
    try {
      const favorites = await getFavorites();
      const normalizeDate = (date) => {
        if (!date) return '';
        if (typeof date !== 'string') return String(date);
        
        if (date.includes('GMT') || date.includes('T')) {
          const dateObj = new Date(date);
          if (!isNaN(dateObj.getTime())) {
            return dateObj.toISOString().split('T')[0];
          }
        }
        
        if (date.match(/^\d{4}-\d{2}-\d{2}$/)) {
          return date;
        }
        
        return date;
      };
      
      const currentDate = normalizeDate(apod.date);
      const itemIsFavorite = favorites.some(fav => normalizeDate(fav.date) === currentDate);
      setIsFavorite(itemIsFavorite);
    } catch (error) {
      console.error('Erro ao verificar favoritos:', error);
    }
  };

  const toggleFavorite = async () => {
    if (favoriteLoading) return;
    setFavoriteLoading(true);
    try {
      const normalizeDate = (date) => {
        if (!date) return '';
        if (typeof date !== 'string') return String(date);
        
        if (date.includes('GMT') || date.includes('T')) {
          const dateObj = new Date(date);
          if (!isNaN(dateObj.getTime())) {
            return dateObj.toISOString().split('T')[0];
          }
        }
        
        if (date.match(/^\d{4}-\d{2}-\d{2}$/)) {
          return date;
        }
        
        return date;
      };
      
      const normalizedDate = normalizeDate(apod.date);
      
      if (isFavorite) {
        await removeFromFavorites(normalizedDate);
        setIsFavorite(false);
      } else {
        const normalizedApod = {
          ...apod,
          date: normalizedDate
        };
        await addToFavorites(normalizedApod);
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
    try {
      if (dateString.includes('GMT') || dateString.includes('T')) {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
          return 'Data inválida';
        }
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
      }
      
      if (dateString.includes('-') && dateString.split('-').length === 3) {
        const [year, month, day] = dateString.split('-');
        if (year && month && day) {
          return `${day}/${month}/${year}`;
        }
      }
      
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
      }
      
      return dateString || 'Data não disponível';
    } catch (error) {
      console.error('Erro ao formatar data:', error);
      return 'Data inválida';
    }
  };

  const handleImagePress = () => {
    if (apod.media_type === 'image') {
      setShowImageModal(true);
      resetImageTransform();
    }
  };

  const resetImageTransform = () => {
    scale.setValue(1);
    translateX.setValue(0);
    translateY.setValue(0);
    setLastScale(1);
    setLastTranslateX(0);
    setLastTranslateY(0);
  };

  const onPinchEvent = Animated.event(
    [{ nativeEvent: { scale: scale } }],
    { useNativeDriver: true }
  );

  const onPinchStateChange = (event) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      setLastScale(lastScale * event.nativeEvent.scale);
      scale.setValue(1);
    }
  };

  const onPanEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX, translationY: translateY } }],
    { useNativeDriver: true }
  );

  const onPanStateChange = (event) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      setLastTranslateX(lastTranslateX + event.nativeEvent.translationX);
      setLastTranslateY(lastTranslateY + event.nativeEvent.translationY);
      translateX.setValue(0);
      translateY.setValue(0);
    }
  };

  const handleDoubleTap = () => {
    if (lastScale > 1) {
      Animated.parallel([
        Animated.timing(scale, {
          toValue: 1 / lastScale,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(translateX, {
          toValue: -lastTranslateX,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: -lastTranslateY,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        resetImageTransform();
      });
    } else {
      const zoomScale = 2;
      Animated.timing(scale, {
        toValue: zoomScale,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setLastScale(zoomScale);
        scale.setValue(1);
      });
    }
  };

  const handleVideoPress = () => {
    if (apod.media_type === 'video' && apod.url) {
      Linking.openURL(apod.url);
    }
  };

  const imageUrl = apod.media_type === 'image'
    ? apod.hdurl || apod.url
    : apod.thumbnail_url;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.imageContainer, { 
          width: imageDimensions.width, 
          height: imageDimensions.height || 300 
        }]}>
          {imageLoading && !imageError && apod.media_type === 'image' && (
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
          
          {apod.media_type === 'video' ? (
            <TouchableOpacity
              style={styles.videoContainer}
              onPress={handleVideoPress}
              activeOpacity={0.7}
            >
              <View style={styles.videoPlaceholder}>
                <Ionicons name="videocam" size={60} color={COLORS.accent} />
                <Text style={styles.videoPlaceholderText}>Vídeo do YouTube</Text>
                <Text style={styles.videoSubtext}>Toque para assistir</Text>
              </View>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.imageWrapper}
              onPress={handleImagePress}
            >
              <Image
                source={{ uri: imageUrl }}
                style={styles.image}
                resizeMode="contain"
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
              {!imageLoading && !imageError && (
                <View style={styles.imageOverlay}>
                  <Ionicons name="expand-outline" size={40} color="white" />
                  <Text style={styles.imageOverlayText}>Toque para ampliar</Text>
                </View>
              )}
            </TouchableOpacity>
          )}
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

      <Modal
        visible={showImageModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowImageModal(false)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity 
            style={styles.modalCloseArea}
            onPress={() => setShowImageModal(false)}
            activeOpacity={1}
          >
            <View style={styles.modalHeader}>
              <TouchableOpacity 
                style={styles.modalCloseButton}
                onPress={() => setShowImageModal(false)}
              >
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>
              <Text style={styles.modalTitle} numberOfLines={1}>
                {apod.title}
              </Text>
              <TouchableOpacity 
                style={styles.modalShareButton}
                onPress={handleShare}
              >
                <Ionicons name="share-social-outline" size={24} color="white" />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
          
          <View style={styles.modalImageContainer}>
            <PinchGestureHandler
              ref={pinchRef}
              onGestureEvent={onPinchEvent}
              onHandlerStateChange={onPinchStateChange}
            >
              <Animated.View style={styles.modalImageWrapper}>
                <PanGestureHandler
                  ref={panRef}
                  onGestureEvent={onPanEvent}
                  onHandlerStateChange={onPanStateChange}
                  simultaneousHandlers={pinchRef}
                  minPointers={1}
                  maxPointers={1}
                >
                  <Animated.View style={styles.modalImagePanWrapper}>
                    <TouchableOpacity
                      activeOpacity={1}
                      onPress={handleDoubleTap}
                      style={styles.modalImageTouchable}
                    >
                      <Animated.Image
                        source={{ uri: apod.hdurl || apod.url }}
                        style={[
                          styles.modalImage,
                          {
                            transform: [
                              { scale: Animated.multiply(scale, lastScale) },
                              { 
                                translateX: Animated.add(
                                  translateX, 
                                  new Animated.Value(lastTranslateX)
                                ) 
                              },
                              { 
                                translateY: Animated.add(
                                  translateY, 
                                  new Animated.Value(lastTranslateY)
                                ) 
                              },
                            ],
                          },
                        ]}
                        resizeMode="contain"
                      />
                    </TouchableOpacity>
                  </Animated.View>
                </PanGestureHandler>
              </Animated.View>
            </PinchGestureHandler>
          </View>
          
          <View style={styles.modalFooter}>
            <View style={styles.modalControls}>
              <TouchableOpacity 
                style={styles.modalControlButton}
                onPress={resetImageTransform}
              >
                <Ionicons name="contract-outline" size={20} color="white" />
                <Text style={styles.modalControlText}>Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.modalControlButton}
                onPress={handleDoubleTap}
              >
                <Ionicons name="search-outline" size={20} color="white" />
                <Text style={styles.modalControlText}>Zoom</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.modalDate}>{formatDate(apod.date)}</Text>
            {apod.copyright && (
              <Text style={styles.modalCopyright}>© {apod.copyright}</Text>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  imageContainer: {
    backgroundColor: COLORS.primary,
    alignSelf: 'center',
  },
  imageWrapper: {
    width: '100%',
    height: '100%',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageOverlayText: {
    color: 'white',
    fontSize: 12,
    marginLeft: 6,
    fontWeight: '500',
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
  videoContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    width: '90%',
    height: '80%',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.accent,
    borderStyle: 'dashed',
  },
  videoPlaceholderText: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '600',
    marginTop: 10,
  },
  videoSubtext: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginTop: 5,
  },
  contentContainer: {
    flex: 1,
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
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
  },
  modalCloseArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  modalCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    flex: 1,
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginHorizontal: 15,
  },
  modalShareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImageContainer: {
    flex: 1,
    marginTop: 100,
    marginBottom: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImageWrapper: {
    flex: 1,
    width: width,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImagePanWrapper: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImageTouchable: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImage: {
    width: width,
    height: height * 0.6,
  },
  modalFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingBottom: 30,
  },
  modalControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 15,
  },
  modalControlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 10,
  },
  modalControlText: {
    color: 'white',
    fontSize: 12,
    marginLeft: 5,
    fontWeight: '500',
  },
  modalDate: {
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 5,
  },
  modalCopyright: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default DetailScreen;