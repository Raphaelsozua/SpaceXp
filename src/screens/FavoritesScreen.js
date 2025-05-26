// src/screens/FavoritesScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { useFocusEffect } from '@react-navigation/native';

// Importar componentes
import APODCard from '../components/APODCard';

// Importar constantes
import { COLORS } from '../config/constants';

// Chave para armazenar favoritos no SecureStore
const FAVORITES_STORAGE_KEY = 'apod_favorites';

const FavoritesScreen = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  // Carregar favoritos quando a tela receber foco
  useFocusEffect(
    React.useCallback(() => {
      loadFavorites();
    }, [])
  );

  // Carregar favoritos do armazenamento
  const loadFavorites = async () => {
    try {
      setLoading(true);
      const storedFavorites = await SecureStore.getItemAsync(FAVORITES_STORAGE_KEY);
      
      if (storedFavorites) {
        setFavorites(JSON.parse(storedFavorites));
      } else {
        setFavorites([]);
      }
    } catch (err) {
      console.error('Erro ao carregar favoritos:', err);
      Alert.alert('Erro', 'Não foi possível carregar seus favoritos.');
    } finally {
      setLoading(false);
    }
  };

  // Salvar favoritos no armazenamento
  const saveFavorites = async (newFavorites) => {
    try {
      await SecureStore.setItemAsync(FAVORITES_STORAGE_KEY, JSON.stringify(newFavorites));
    } catch (err) {
      console.error('Erro ao salvar favoritos:', err);
    }
  };

  // Remover dos favoritos
  const removeFavorite = (apod) => {
    Alert.alert(
      'Remover favorito',
      `Deseja remover "${apod.title}" dos seus favoritos?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: () => {
            const newFavorites = favorites.filter(fav => fav.date !== apod.date);
            setFavorites(newFavorites);
            saveFavorites(newFavorites);
          },
        },
      ]
    );
  };

  // Limpar todos os favoritos
  const clearAllFavorites = () => {
    if (favorites.length === 0) return;

    Alert.alert(
      'Limpar favoritos',
      'Tem certeza que deseja remover todos os seus favoritos?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Limpar tudo',
          style: 'destructive',
          onPress: async () => {
            try {
              await SecureStore.deleteItemAsync(FAVORITES_STORAGE_KEY);
              setFavorites([]);
            } catch (err) {
              console.error('Erro ao limpar favoritos:', err);
              Alert.alert('Erro', 'Não foi possível limpar seus favoritos.');
            }
          },
        },
      ]
    );
  };

  // Ordenar favoritos por data (mais recentes primeiro)
  const sortedFavorites = [...favorites].sort((a, b) => 
    new Date(b.date) - new Date(a.date)
  );

  // Renderizar item da lista
  const renderItem = ({ item }) => (
    <APODCard
      item={item}
      onAddFavorite={removeFavorite}
      isFavorite={true}
    />
  );

  // Renderizar cabeçalho da lista
  const renderListHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Seus Favoritos</Text>
      {favorites.length > 0 && (
        <TouchableOpacity
          style={styles.clearButton}
          onPress={clearAllFavorites}
        >
          <Ionicons name="trash-outline" size={20} color={COLORS.notification} />
          <Text style={styles.clearButtonText}>Limpar</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  // Renderizar conteúdo vazio
  const renderEmptyContent = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="heart-outline" size={80} color={COLORS.textSecondary} />
      <Text style={styles.emptyTitle}>Sem favoritos</Text>
      <Text style={styles.emptyText}>
        Adicione imagens aos favoritos tocando no ícone de coração.
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <FlatList
        data={sortedFavorites}
        renderItem={renderItem}
        keyExtractor={(item) => item.date}
        contentContainerStyle={[
          styles.listContent,
          favorites.length === 0 && styles.emptyListContent,
        ]}
        ListHeaderComponent={renderListHeader}
        ListEmptyComponent={!loading ? renderEmptyContent : null}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContent: {
    padding: 16,
  },
  emptyListContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  clearButtonText: {
    color: COLORS.notification,
    fontSize: 14,
    marginLeft: 4,
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default FavoritesScreen;