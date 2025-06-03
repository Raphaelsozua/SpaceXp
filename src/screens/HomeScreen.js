// src/screens/HomeScreen.js - Atualizado para usar backend Flask
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
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

// Importar componentes
import APODCard from '../components/APODCard';

// Importar serviços - ATUALIZADO PARA BACKEND
import { 
  getAPOD, 
  getRandomAPODs, 
  addToFavorites, 
  removeFromFavorites, 
  checkIsFavorite 
} from '../services/api';

// Importar constantes
import { COLORS } from '../config/constants';

const HomeScreen = () => {
  const [data, setData] = useState([]);
  const [favoritesStatus, setFavoritesStatus] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('today'); // 'today' ou 'random'

  // Carregar dados ao iniciar o componente
  useEffect(() => {
    loadData();
  }, [viewMode]);

  // Recarregar ao focar na tela
  useFocusEffect(
    useCallback(() => {
      loadFavoritesStatus();
    }, [data])
  );

  // Carregar dados da API APOD através do backend
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
        setData(Array.isArray(result) ? result : [result]);
      }

      // Carregar status dos favoritos
      await loadFavoritesStatus(Array.isArray(result) ? result : [result]);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError('Não foi possível carregar os dados. Verifique sua conexão.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Carregar status dos favoritos para cada item
  const loadFavoritesStatus = async (items = data) => {
    try {
      const statusPromises = items.map(async (item) => {
        try {
          const isFav = await checkIsFavorite(item.date);
          return { [item.date]: isFav };
        } catch (error) {
          console.error(`Erro ao verificar favorito ${item.date}:`, error);
          return { [item.date]: false };
        }
      });

      const statusResults = await Promise.all(statusPromises);
      const newStatus = statusResults.reduce((acc, curr) => ({ ...acc, ...curr }), {});
      
      setFavoritesStatus(newStatus);
    } catch (err) {
      console.error('Erro ao carregar status dos favoritos:', err);
    }
  };

  // Adicionar ou remover favorito usando o backend
  const toggleFavorite = async (apod) => {
    try {
      const isCurrentlyFavorite = favoritesStatus[apod.date];

      if (isCurrentlyFavorite) {
        // Remover dos favoritos
        await removeFromFavorites(apod.date);
        setFavoritesStatus(prev => ({ ...prev, [apod.date]: false }));
        
        // Feedback visual
        Alert.alert('Removido', 'Item removido dos favoritos', [{ text: 'OK' }]);
      } else {
        // Adicionar aos favoritos
        await addToFavorites(apod);
        setFavoritesStatus(prev => ({ ...prev, [apod.date]: true }));
        
        // Feedback visual
        Alert.alert('Adicionado', 'Item adicionado aos favoritos', [{ text: 'OK' }]);
      }
    } catch (err) {
      console.error('Erro ao toggle favorito:', err);
      Alert.alert('Erro', 'Não foi possível atualizar favoritos. Tente novamente.');
    }
  };

  // Verificar se um item é favorito
  const isFavorite = (item) => {
    return favoritesStatus[item.date] || false;
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
        <Text style={styles.loadingText}>Conectando ao servidor...</Text>
        <Text style={styles.loadingSubtext}>Carregando imagens astronômicas...</Text>
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
        <Text style={styles.errorSubtext}>
          Verifique se o servidor Flask está rodando na porta 5000
        </Text>
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
    flex: 1,
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
    marginTop: 16,
    fontSize: 18,
    color: COLORS.text,
    textAlign: 'center',
    fontWeight: '600',
  },
  loadingSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: COLORS.textSecondary,
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
    marginTop: 16,
    fontSize: 18,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '600',
  },
  errorSubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: COLORS.text,
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default HomeScreen;