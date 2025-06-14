import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { COLORS, COMMON_STYLES } from '../config/constants';

const APODCard = ({ item, onAddFavorite, isFavorite = false }) => {
  const navigation = useNavigation();
  const [imageLoading, setImageLoading] = useState(true);

  const imageUrl = item.media_type === 'image' 
    ? item.url 
    : item.thumbnail_url;

  const handlePress = () => {
    navigation.navigate('Detail', { apod: item });
  };

  const formatDate = (dateString) => {
    try {
      if (!dateString) return 'Data não disponível';
      
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
        if (year && month && day && year.length === 4) {
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
      
      return 'Data inválida';
    } catch (error) {
      console.error('Erro ao formatar data no APODCard:', error, 'Data recebida:', dateString);
      return 'Data inválida';
    }
  };

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.9}
      onPress={handlePress}
    >
      <View style={styles.imageContainer}>
        {imageLoading && (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={COLORS.accent} />
          </View>
        )}
        
        <Image
          source={{ uri: imageUrl }}
          style={styles.image}
          onLoadStart={() => setImageLoading(true)}
          onLoadEnd={() => setImageLoading(false)}
        />
        
        {item.media_type === 'video' && (
          <View style={styles.videoIndicator}>
            <Ionicons name="play-circle" size={40} color="white" />
          </View>
        )}
        
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={() => onAddFavorite(item)}
        >
          <Ionicons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={24}
            color={isFavorite ? COLORS.notification : 'white'}
          />
        </TouchableOpacity>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.date}>{formatDate(item.date)}</Text>
        <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.description} numberOfLines={3}>
          {item.explanation}
        </Text>
      </View>
      
      <View style={styles.footer}>
        <View style={styles.copyright}>
          {item.copyright && (
            <Text style={styles.copyrightText}>
              © {item.copyright}
            </Text>
          )}
        </View>
        
        <View style={styles.readMore}>
          <Text style={styles.readMoreText}>Ver mais</Text>
          <Ionicons name="arrow-forward" size={16} color={COLORS.accent} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    ...COMMON_STYLES.shadow,
  },
  imageContainer: {
    position: 'relative',
    height: 200,
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
  videoIndicator: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -20 }, { translateY: -20 }],
    zIndex: 1,
  },
  favoriteButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  content: {
    padding: 16,
  },
  date: {
    fontSize: 12,
    color: COLORS.accent,
    marginBottom: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  copyright: {
    flex: 1,
  },
  copyrightText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  readMore: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  readMoreText: {
    fontSize: 14,
    color: COLORS.accent,
    marginRight: 4,
  },
});

export default APODCard;