// src/screens/HomeScreen.js - Corrigido para web
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

// Importar componentes
import APODCard from '../components/APODCard';

// Importar serviços
import { getAPOD, getRandomAPODs } from '../services/api';

// Importar constantes
import { COLORS } from '../config/constants';

// Chave para armazenamento de favoritos
const FAVORITES_STORAGE_KEY = 'apod_favorites';

const HomeScreen = () => {
  const [data, setData] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('today'); // 'today' ou 'random'

  // Carregar dados ao iniciar o componente
  useEffect(() => {
    loadData();
    loadFavorites();
  }, []);

  // Recarregar favoritos quando a tela receber foco
  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [])
  );

  // Carregar dados da API APOD
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      let result;
      if (viewMode === 'today') {
        // Buscar APOD do dia
        result = await getAPOD();
        setData([result]); // Converter em array para usar com FlatList
      } else {
        // Buscar APODs aleatórias
        result = await getRandomAPODs(10);
        setData(result);
      }
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError('Não foi possível carregar os dados. Tente novamente.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Carregar favoritos do armazenamento - CORRIGIDO PARA WEB
  const loadFavorites = async () => {
    try {
      // Usar localStorage para web
      const storedFavorites = localStorage.getItem(FAVORITES_STORAGE_KEY);
      if (storedFavorites) {
        setFavorites(JSON.parse(storedFavorites));
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

  // Adicionar ou remover favorito
  const toggleFavorite = (apod) => {
    const isFavorite = favorites.some(fav => fav.date === apod.date);
    let newFavorites;

    if (isFavorite) {
      // Remover dos favoritos
      newFavorites = favorites.filter(fav => fav.date !== apod.date);
    } else {
      // Adicionar aos favoritos
      newFavorites = [...favorites, apod];
    }

    setFavorites(newFavorites);
    saveFavorites(newFavorites);
  };

  // Verificar se um item é favorito
  const isFavorite = (item) => {
    return favorites.some(fav => fav.date === item.date);
  };

  // Recarregar dados ao puxar para baixo
  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  // Alternar entre os modos de visualização
  const toggleViewMode = () => {
    const newMode = viewMode === 'today' ? 'random' : 'today';
    setViewMode(newMode);
    setData([]);
    setTimeout(() => {
      loadData();
    }, 100);
  };

  // Renderizar item da lista
  const renderItem = ({ item }) => (
    <APODCard
      item={item}
      onAddFavorite={toggleFavorite}
      isFavorite={isFavorite(item)}
    />
  );

  // Renderizar cabeçalho da lista
  const renderListHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>
        {viewMode === 'today' ? 'Imagem Astronômica do Dia' : 'Imagens Aleatórias'}
      </Text>
      <TouchableOpacity
        style={styles.viewModeButton}
        onPress={toggleViewMode}
      >
        <Ionicons
          name={viewMode === 'today' ? 'shuffle' : 'today-outline'}
          size={24}
          color={COLORS.text}
        />
      </TouchableOpacity>
    </View>
  );

  // Renderizar estado de carregamento
  if (loading && !refreshing && data.length === 0) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
        <ActivityIndicator size="large" color={COLORS.accent} />
        <Text style={styles.loadingText}>Carregando imagens astronômicas...</Text>
      </SafeAreaView>
    );
  }

  // Renderizar mensagem de erro
  if (error && !refreshing && data.length === 0) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
        <Ionicons name="alert-circle-outline" size={60} color={COLORS.notification} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadData}>
          <Text style={styles.retryButtonText}>Tentar novamente</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => item.date}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={renderListHeader}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.accent]}
            tintColor={COLORS.accent}
          />
        }
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
  viewModeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.text,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: 20,
  },
  errorText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: COLORS.text,
    fontWeight: 'bold',
  },
});

export default HomeScreen;