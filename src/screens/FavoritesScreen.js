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

import APODCard from '../components/APODCard';

import { getFavorites, removeFromFavorites, testApiConnection } from '../services/api';

import { COLORS } from '../config/constants';

const FavoritesScreen = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [apiConnected, setApiConnected] = useState(true);

  const normalizeDate = (date) => {
    if (!date) return '';
    if (typeof date !== 'string') return String(date);
    
    try {
      if (date.includes('GMT')) {
        const dateObj = new Date(date);
        if (!isNaN(dateObj.getTime())) {
          return dateObj.toISOString().split('T')[0];
        }
      }
      
      if (date.includes('T')) {
        const dateObj = new Date(date);
        if (!isNaN(dateObj.getTime())) {
          return dateObj.toISOString().split('T')[0];
        }
      }
      
      if (date.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return date;
      }
      
      const dateObj = new Date(date);
      if (!isNaN(dateObj.getTime())) {
        return dateObj.toISOString().split('T')[0];
      }
      
      return date;
    } catch (error) {
      console.error('Erro ao normalizar data:', error);
      return date;
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadFavorites();
    }, [])
  );

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

  const loadFavorites = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const isConnected = await checkApiStatus();
      if (!isConnected) {
        throw new Error('Servidor não está disponível.');
      }

      const favoritesData = await getFavorites();
      
      const normalizedFavorites = Array.isArray(favoritesData) 
        ? favoritesData.map(fav => ({
            ...fav,
            date: normalizeDate(fav.date)
          }))
        : [];
      
      setFavorites(normalizedFavorites);
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
              
              const normalizedDate = normalizeDate(apod.date);
              await removeFromFavorites(normalizedDate);
              
              const newFavorites = favorites.filter(fav => normalizeDate(fav.date) !== normalizedDate);
              setFavorites(newFavorites);
              
              
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

  const clearAllFavorites = () => {


    if (favorites.length === 0) {
      return;
    }

    if (!apiConnected) {
      console.log('API desconectada');
      Alert.alert(
        'Sem conexão',
        'Não foi possível conectar com o servidor.',
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      'Limpar favoritos',
      `Tem certeza que deseja remover todos os ${favorites.length} favoritos?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
          onPress: () => console.log('Usuário cancelou')
        },
        {
          text: 'Limpar tudo',
          style: 'destructive',
          onPress: async () => {
            
            try {
              setLoading(true);
              
              let successCount = 0;
              let errorCount = 0;
              
              for (let i = 0; i < favorites.length; i++) {
                const fav = favorites[i];
                try {
                  const normalizedDate = normalizeDate(fav.date);
                  console.log(`[${i+1}/${favorites.length}] Removendo: ${fav.title} - Data: ${normalizedDate}`);
                  
                  await removeFromFavorites(normalizedDate);
                  successCount++;
                  console.log(`[${i+1}/${favorites.length}] Removido com sucesso`);
                } catch (error) {
                  errorCount++;
                  console.error(`❌ [${i+1}/${favorites.length}] Erro ao remover:`, error);
                }
              }
              
              
              if (errorCount === 0) {
                setFavorites([]);
                Alert.alert('Sucesso!', 'Todos os favoritos foram removidos.');
              } else if (successCount > 0) {
                Alert.alert(
                  'Parcialmente concluído',
                  `${successCount} favoritos removidos, ${errorCount} falharam. Recarregando lista...`
                );
                await loadFavorites();
              } else {
                throw new Error('Nenhum favorito pôde ser removido.');
              }
              
            } catch (err) {
              console.error('❌ Erro geral:', err);
              Alert.alert('Erro', err.message || 'Não foi possível limpar os favoritos.');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadFavorites();
  };

  const handleRetry = () => {
    setError(null);
    loadFavorites();
  };

  const renderItem = ({ item }) => (
    <APODCard
      item={item}
      onAddFavorite={removeFavorite}
      isFavorite={true}
    />
  );

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
    </View>
  );

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
        }}
      >
        <Ionicons name="planet-outline" size={20} color={COLORS.text} style={{ marginRight: 8 }} />
        <Text style={styles.exploreButtonText}>Explorar imagens</Text>
      </TouchableOpacity>
    </View>
  );

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
        keyExtractor={(item) => normalizeDate(item.date)}
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