// src/screens/FavoritesScreen.js - Versão final integrada com backend
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
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

// Importar componentes
import APODCard from '../components/APODCard';

// Importar serviços do backend
import { getFavorites, removeFromFavorites, testApiConnection } from '../services/api';

// Importar constantes
import { COLORS } from '../config/constants';

const FavoritesScreen = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [apiConnected, setApiConnected] = useState(true);

  // Carregar favoritos quando a tela receber foco
  useFocusEffect(
    React.useCallback(() => {
      loadFavorites();
    }, [])
  );

  // Verificar conexão com API
  const checkApiStatus = async () => {
    try {
      const result = await testApiConnection();
      setApiConnected(result.success);
      return result.success;
    } catch (error) {
      setApiConnected(false);
      return false;
    }
  };

  // Carregar favoritos do backend
  const loadFavorites = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Verificar conexão com API primeiro
      const isConnected = await checkApiStatus();
      if (!isConnected) {
        throw new Error('Servidor não está disponível.');
      }

      console.log('💖 Carregando favoritos do backend...');
      const favoritesData = await getFavorites();
      
      console.log(`✅ ${favoritesData.length} favorito(s) carregado(s)`);
      setFavorites(Array.isArray(favoritesData) ? favoritesData : []);
      setApiConnected(true);
    } catch (err) {
      console.error('❌ Erro ao carregar favoritos:', err);
      
      let errorMessage = 'Não foi possível carregar seus favoritos.';
      
      if (err.message?.includes('Network Error') || err.message?.includes('timeout')) {
        errorMessage = 'Sem conexão com o servidor. Verifique se o Flask está rodando.';
      } else if (err.response?.status === 401) {
        errorMessage = 'Sessão expirada. Faça login novamente.';
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      }
      
      setError(errorMessage);
      setFavorites([]);
      setApiConnected(false);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Remover dos favoritos
  const removeFavorite = (apod) => {
    if (!apiConnected) {
      Alert.alert(
        'Sem conexão',
        'Não foi possível conectar com o servidor.',
        [{ text: 'OK' }]
      );
      return;
    }

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
          onPress: async () => {
            try {
              console.log(`💔 Removendo favorito: ${apod.title}`);
              
              await removeFromFavorites(apod.date);
              
              // Atualizar lista local
              const newFavorites = favorites.filter(fav => fav.date !== apod.date);
              setFavorites(newFavorites);
              
              console.log('✅ Favorito removido com sucesso');
              
              // Feedback visual opcional
              if (newFavorites.length === 0) {
                Alert.alert('Lista vazia', 'Você não tem mais favoritos salvos.');
              }
            } catch (error) {
              console.error('❌ Erro ao remover favorito:', error);
              
              let errorMessage = 'Não foi possível remover o favorito.';
              
              if (error.response?.status === 401) {
                errorMessage = 'Sessão expirada. Faça login novamente.';
              } else if (error.message?.includes('Network Error')) {
                errorMessage = 'Sem conexão com o servidor.';
              }
              
              Alert.alert('Erro', errorMessage);
            }
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
              console.log('🗑️ Removendo todos os favoritos...');
              
              // Remover todos os favoritos do backend
              const removePromises = favorites.map(fav => removeFromFavorites(fav.date));
              await Promise.all(removePromises);
              
              setFavorites([]);
              console.log('✅ Todos os favoritos removidos');
              
              Alert.alert('Concluído', 'Todos os favoritos foram removidos.');
            } catch (err) {
              console.error('❌ Erro ao limpar favoritos:', err);
              Alert.alert('Erro', 'Não foi possível limpar todos os favoritos.');
            }
          },
        },
      ]
    );
  };

  // Recarregar favoritos ao puxar para baixo
  const handleRefresh = () => {
    setRefreshing(true);
    loadFavorites();
  };

  // Tentar reconectar
  const handleRetry = () => {
    setError(null);
    loadFavorites();
  };

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
      <View style={styles.headerLeft}>
        <Text style={styles.headerTitle}>
          Seus Favoritos {favorites.length > 0 && `(${favorites.length})`}
        </Text>
        {!apiConnected && (
          <View style={styles.offlineIndicator}>
            <Ionicons name="cloud-offline" size={16} color={COLORS.notification} />
            <Text style={styles.offlineText}>Offline</Text>
          </View>
        )}
      </View>
      {favorites.length > 0 && apiConnected && (
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
        Adicione imagens aos favoritos tocando no ícone de coração na tela inicial.
      </Text>
      <TouchableOpacity 
        style={styles.exploreButton}
        onPress={() => {
          // A navegação será feita automaticamente pelas tabs
        }}
      >
        <Ionicons name="planet-outline" size={20} color={COLORS.text} style={{ marginRight: 8 }} />
        <Text style={styles.exploreButtonText}>Explorar imagens</Text>
      </TouchableOpacity>
    </View>
  );

  // Renderizar estado de carregamento
  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
        <ActivityIndicator size="large" color={COLORS.accent} />
        <Text style={styles.loadingText}>Carregando favoritos...</Text>
        <Text style={styles.loadingSubtext}>Conectando ao servidor...</Text>
      </SafeAreaView>
    );
  }

  // Renderizar estado de erro
  if (error && !refreshing && favorites.length === 0) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
        <Ionicons name="alert-circle-outline" size={60} color={COLORS.notification} />
        <Text style={styles.errorText}>{error}</Text>
        <Text style={styles.errorSubtext}>
          Verifique se o servidor Flask está rodando na porta 5000
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
          <Ionicons name="refresh" size={20} color={COLORS.text} style={{ marginRight: 8 }} />
          <Text style={styles.retryButtonText}>Tentar novamente</Text>
        </TouchableOpacity>
        
        {!apiConnected && (
          <TouchableOpacity 
            style={[styles.retryButton, styles.secondaryButton]} 
            onPress={checkApiStatus}
          >
            <Ionicons name="wifi" size={20} color={COLORS.accent} style={{ marginRight: 8 }} />
            <Text style={[styles.retryButtonText, { color: COLORS.accent }]}>
              Verificar conexão
            </Text>
          </TouchableOpacity>
        )}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <FlatList
        data={favorites}
        renderItem={renderItem}
        keyExtractor={(item) => item.date}
        contentContainerStyle={[
          styles.listContent,
          favorites.length === 0 && styles.emptyListContent,
        ]}
        ListHeaderComponent={renderListHeader}
        ListEmptyComponent={!loading ? renderEmptyContent : null}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.accent]}
            tintColor={COLORS.accent}
          />
        }
        showsVerticalScrollIndicator={false}
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
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  offlineIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  offlineText: {
    fontSize: 12,
    color: COLORS.notification,
    marginLeft: 4,
    fontWeight: '500',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
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
    marginBottom: 24,
  },
  exploreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.accent,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  exploreButtonText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
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
    marginBottom: 24,
    lineHeight: 20,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.accent,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.accent,
  },
  retryButtonText: {
    color: COLORS.text,
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default FavoritesScreen;
