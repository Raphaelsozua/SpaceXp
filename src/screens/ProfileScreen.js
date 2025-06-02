import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Switch,
  ScrollView,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Importar contexto do usuário
import { useUser } from '../contexts/UserContext';

// Importar constantes
import { COLORS, COMMON_STYLES } from '../config/constants';

// Chaves para armazenamento
const SETTINGS_STORAGE_KEY = 'app_settings';
const FAVORITES_STORAGE_KEY = 'apod_favorites';

const ProfileScreen = () => {
  const { 
    userInfo, 
    logout, 
    getDisplayName, 
    getDisplayEmail, 
    getProfilePicture 
  } = useUser();
  
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    visualizations: 0,
    favorites: 0,
    shares: 0,
  });
  const [settings, setSettings] = useState({
    darkMode: true,
    notifications: true,
    highQualityImages: true,
    autoPlay: false,
  });

  // Carregar estatísticas e configurações ao iniciar o componente
  useEffect(() => {
    loadStats();
    loadSettings();
  }, []);

  const loadStats = async () => {
    try {
      // Carregar estatísticas dos favoritos
      const storedFavorites = localStorage.getItem(FAVORITES_STORAGE_KEY);
      const favoritesCount = storedFavorites ? JSON.parse(storedFavorites).length : 0;
      
      // Carregar outras estatísticas (simuladas por enquanto)
      const storedStats = localStorage.getItem('user_stats');
      if (storedStats) {
        const parsedStats = JSON.parse(storedStats);
        setStats({
          ...parsedStats,
          favorites: favoritesCount,
        });
      } else {
        setStats({
          visualizations: Math.floor(Math.random() * 50) + 10,
          favorites: favoritesCount,
          shares: Math.floor(Math.random() * 20) + 1,
        });
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const loadSettings = async () => {
    try {
      const storedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (storedSettings) {
        setSettings(JSON.parse(storedSettings));
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    }
  };

  // Salvar configurações no armazenamento
  const saveSettings = async (newSettings) => {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(newSettings));
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
    }
  };

  // Alterar uma configuração específica
  const handleSettingChange = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  // Realizar logout usando confirm nativo (mais compatível com web)
  const handleLogout = () => {
    // Usar confirm nativo do browser em vez de Alert do React Native
    const confirmed = window.confirm('Tem certeza que deseja sair da sua conta?');
    
    if (confirmed) {
      performLogout();
    }
  };

  // Função para executar o logout
  const performLogout = async () => {
    try {
      setLoading(true);
      
      // Usar o logout do contexto
      await logout();
      
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      // Usar alert nativo do browser
      window.alert('Erro: Não foi possível realizar o logout. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

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
          
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => window.alert('Edição de perfil não disponível nesta versão.')}
          >
            <Ionicons name="pencil-outline" size={20} color={COLORS.text} />
          </TouchableOpacity>
        </View>

        {/* Estatísticas */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.visualizations}</Text>
            <Text style={styles.statLabel}>Visualizações</Text>
          </View>
          <View style={[styles.statItem, styles.statBorder]}>
            <Text style={styles.statValue}>{stats.favorites}</Text>
            <Text style={styles.statLabel}>Favoritos</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.shares}</Text>
            <Text style={styles.statLabel}>Compartilhamentos</Text>
          </View>
        </View>

        {/* Configurações */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Configurações</Text>
          
          <View style={styles.settingsContainer}>
            {/* Modo escuro */}
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Ionicons name="moon-outline" size={22} color={COLORS.text} style={styles.settingIcon} />
                <Text style={styles.settingText}>Modo escuro</Text>
              </View>
              <Switch
                value={settings.darkMode}
                onValueChange={(value) => handleSettingChange('darkMode', value)}
                trackColor={{ false: COLORS.border, true: COLORS.accent }}
                thumbColor={settings.darkMode ? COLORS.text : COLORS.textSecondary}
              />
            </View>
            
            {/* Notificações */}
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Ionicons name="notifications-outline" size={22} color={COLORS.text} style={styles.settingIcon} />
                <Text style={styles.settingText}>Notificações</Text>
              </View>
              <Switch
                value={settings.notifications}
                onValueChange={(value) => handleSettingChange('notifications', value)}
                trackColor={{ false: COLORS.border, true: COLORS.accent }}
                thumbColor={settings.notifications ? COLORS.text : COLORS.textSecondary}
              />
            </View>
            
            {/* Imagens de alta qualidade */}
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Ionicons name="image-outline" size={22} color={COLORS.text} style={styles.settingIcon} />
                <Text style={styles.settingText}>Imagens de alta qualidade</Text>
              </View>
              <Switch
                value={settings.highQualityImages}
                onValueChange={(value) => handleSettingChange('highQualityImages', value)}
                trackColor={{ false: COLORS.border, true: COLORS.accent }}
                thumbColor={settings.highQualityImages ? COLORS.text : COLORS.textSecondary}
              />
            </View>
            
            {/* Auto-reprodução de vídeos */}
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Ionicons name="play-outline" size={22} color={COLORS.text} style={styles.settingIcon} />
                <Text style={styles.settingText}>Auto-reprodução de vídeos</Text>
              </View>
              <Switch
                value={settings.autoPlay}
                onValueChange={(value) => handleSettingChange('autoPlay', value)}
                trackColor={{ false: COLORS.border, true: COLORS.accent }}
                thumbColor={settings.autoPlay ? COLORS.text : COLORS.textSecondary}
              />
            </View>
          </View>
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
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    marginBottom: 24,
    ...COMMON_STYLES.shadow,
  },
  statItem: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statBorder: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: COLORS.border,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
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
  settingsContainer: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    overflow: 'hidden',
    ...COMMON_STYLES.shadow,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    marginRight: 12,
  },
  settingText: {
    fontSize: 16,
    color: COLORS.text,
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