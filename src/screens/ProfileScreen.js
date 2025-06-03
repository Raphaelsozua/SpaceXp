import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Importar contexto do usuário
import { useUser } from '../contexts/UserContext';

// Importar função para buscar favoritos
import { getFavorites } from '../services/api'; // Ajuste o caminho conforme sua estrutura

// Importar constantes
import { COLORS, COMMON_STYLES } from '../config/constants';

const ProfileScreen = () => {
  const { 
    userInfo, 
    logout, 
    getDisplayName, 
    getDisplayEmail, 
    getProfilePicture 
  } = useUser();
  
  const [loading, setLoading] = useState(false);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [loadingFavorites, setLoadingFavorites] = useState(true);

  // Carregar contador de favoritos ao iniciar
  useEffect(() => {
    loadFavoritesCount();
  }, []);

  const loadFavoritesCount = async () => {
    try {
      setLoadingFavorites(true);
      const favorites = await getFavorites();
      setFavoritesCount(favorites.length);
    } catch (error) {
      console.error('Erro ao carregar favoritos:', error);
      setFavoritesCount(0);
      
      // Se o erro for de autenticação (401), pode ser que o token expirou
      if (error.response?.status === 401) {
        console.log('Token expirado, fazendo logout...');
        // O contexto deve lidar com isso automaticamente
      }
    } finally {
      setLoadingFavorites(false);
    }
  };

  // Realizar logout usando confirm nativo
  const handleLogout = () => {
    const confirmed = window.confirm('Tem certeza que deseja sair da sua conta?');
    
    if (confirmed) {
      performLogout();
    }
  };

  // Função para executar o logout
  const performLogout = async () => {
    try {
      setLoading(true);
      await logout();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      window.alert('Erro: Não foi possível realizar o logout. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Função para atualizar a contagem (pode ser chamada quando voltar de outras telas)
  const refreshFavoritesCount = () => {
    loadFavoritesCount();
  };

  // Use useFocusEffect se você quiser atualizar sempre que a tela ganhar foco
  // import { useFocusEffect } from '@react-navigation/native';
  // useFocusEffect(
  //   React.useCallback(() => {
  //     loadFavoritesCount();
  //   }, [])
  // );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <ScrollView style={styles.container}>
        {/* Cabeçalho do perfil */}
        <View style={styles.profileHeader}>
          <View style={styles.profileInfo}>
            {getProfilePicture() ? (
              <Image 
                source={{ uri: getProfilePicture() }} 
                style={styles.profileImage}
              />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <Ionicons name="person" size={40} color={COLORS.accent} />
              </View>
            )}
            
            <View style={styles.profileText}>
              <Text style={styles.profileName}>{getDisplayName()}</Text>
              <Text style={styles.profileEmail}>{getDisplayEmail()}</Text>
            </View>
          </View>
        </View>

        {/* Estatística de Favoritos */}
        <View style={styles.statsContainer}>
          <TouchableOpacity 
            style={styles.statItem}
            onPress={refreshFavoritesCount}
          >
            <Ionicons name="heart" size={32} color={COLORS.notification} />
            <Text style={styles.statValue}>
              {loadingFavorites ? '...' : favoritesCount}
            </Text>
            <Text style={styles.statLabel}>Favoritos</Text>
            {loadingFavorites && (
              <Text style={styles.loadingText}>Carregando...</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Informações do aplicativo */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sobre o App</Text>
          
          <View style={styles.aboutContainer}>
            <TouchableOpacity 
              style={styles.aboutItem}
              onPress={() => window.alert('APOD Explorer v1.0.0')}
            >
              <Ionicons name="information-circle-outline" size={22} color={COLORS.text} style={styles.aboutIcon} />
              <Text style={styles.aboutText}>Versão 1.0.0</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.aboutItem}
              onPress={() => window.alert('Este aplicativo utiliza a API APOD (Astronomy Picture of the Day) da NASA.')}
            >
              <Ionicons name="globe-outline" size={22} color={COLORS.text} style={styles.aboutIcon} />
              <Text style={styles.aboutText}>Sobre a API APOD</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.aboutItem}
              onPress={() => window.alert('Os termos de uso deste aplicativo seguem as diretrizes da NASA para uso de suas APIs.')}
            >
              <Ionicons name="document-text-outline" size={22} color={COLORS.text} style={styles.aboutIcon} />
              <Text style={styles.aboutText}>Termos de Uso</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.aboutItem}
              onPress={() => window.alert('Respeitamos sua privacidade. Nenhum dado pessoal é compartilhado com terceiros.')}
            >
              <Ionicons name="shield-checkmark-outline" size={22} color={COLORS.text} style={styles.aboutIcon} />
              <Text style={styles.aboutText}>Política de Privacidade</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Botão de logout */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          disabled={loading}
        >
          <Ionicons name="log-out-outline" size={22} color={COLORS.notification} />
          <Text style={styles.logoutText}>
            {loading ? 'Saindo...' : 'Sair da conta'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    ...COMMON_STYLES.shadow,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  profileImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profileText: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  statsContainer: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    marginBottom: 24,
    padding: 20,
    alignItems: 'center',
    ...COMMON_STYLES.shadow,
  },
  statItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  loadingText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 12,
  },
  aboutContainer: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    overflow: 'hidden',
    ...COMMON_STYLES.shadow,
  },
  aboutItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  aboutIcon: {
    marginRight: 12,
  },
  aboutText: {
    fontSize: 16,
    color: COLORS.text,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 40,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.notification,
    marginLeft: 8,
  },
});

export default ProfileScreen;