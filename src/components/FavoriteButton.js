// src/components/FavoriteButton.js (Corrigido)
import React from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Importar constantes
import { COLORS } from '../config/constants';

// Versão com função componente (hooks) em vez de classe
const FavoriteButton = ({ isFavorite, onPress, style }) => {
  const animatedScale = React.useRef(new Animated.Value(1)).current;

  const animateButton = () => {
    // Sequência de animação para o efeito de pulsar
    Animated.sequence([
      Animated.timing(animatedScale, {
        toValue: 1.3,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(animatedScale, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePress = () => {
    animateButton();
    onPress();
  };

  // Transformação para o efeito de escala
  const animatedStyle = {
    transform: [{ scale: animatedScale }],
  };

  return (
    <TouchableOpacity
      style={[styles.button, style]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <Animated.View style={animatedStyle}>
        <Ionicons
          name={isFavorite ? 'heart' : 'heart-outline'}
          size={24}
          color={isFavorite ? COLORS.notification : COLORS.text}
        />
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default FavoriteButton;