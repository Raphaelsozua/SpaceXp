import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  Switch,
  ScrollView,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';

// Importar constantes
import { COLORS, COMMON_STYLES } from '../config/constants';

// Chave para armazenar o token do usuário e informações
const USER_TOKEN_KEY = 'user_token';
const USER_INFO_KEY = 'user_info';
const SETTINGS_STORAGE_KEY = 'app_settings';

const ProfileScreen = ({ navigation, route }) => {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    darkMode: true,
    notifications: true,
    highQualityImages: true,
    autoPlay: false,
  });

  // Carregar informações do usuário e configurações ao iniciar o componente
  useEffect(() => {
    const loadUserInfo = async () => {
      try {
        setLoading(true);
        
        // Tentar obter do parâmetro de rota, se disponível
        let user = route.params?.user;
        
        // Se não tiver na rota, tentar buscar do armazenamento
        if (!user) {
          const storedUserInfo = await SecureStore.getItemAsync(USER_INFO_KEY);
          if (storedUserInfo) {
            user = JSON.parse(storedUserInfo);
          }
        } else {
          // Se receber da rota, salvar no SecureStore
          await SecureStore.setItemAsync(USER_INFO_KEY, JSON.stringify(user));
        }
        
        setUserInfo(user);
        
        // Carregar configurações
        const storedSettings = await SecureStore.getItemAsync(SETTINGS_STORAGE_KEY);
        if (storedSettings) {
          setSettings(JSON.parse(storedSettings));
        }
      } catch (error) {
        console.error('Erro ao carregar informações do perfil:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserInfo();
  }, [route.params]);

  // Salvar configurações no armazenamento
  const saveSettings = async (newSettings) => {
    try {
      await SecureStore.setItemAsync(SETTINGS_STORAGE_KEY, JSON.stringify(newSettings));
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

  // Realizar logout
  const handleLogout = () => {
    Alert.alert(
      'Sair',
      'Tem certeza que deseja sair da sua conta?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            try {
              // Remover token e informações do usuário
              await SecureStore.deleteItemAsync(USER_TOKEN_KEY);
              await SecureStore.deleteItemAsync(USER_INFO_KEY);
              
              // Redirecionar para a tela de login
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            } catch (error) {
              console.error('Erro ao fazer logout:', error);
              Alert.alert('Erro', 'Não foi possível realizar o logout. Tente novamente.');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <ScrollView style={styles.container}>
        {/* Cabeçalho do perfil */}
        <View style={styles.profileHeader}>
          <View style={styles.profileInfo}>
            {userInfo?.picture ? (
              <Image 
                source={{ uri: userInfo.picture }} 
                style={styles.profileImage}
              />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <Ionicons name="person" size={40} color={COLORS.accent} />
              </View>
            )}
            
            <View style={styles.profileText}>
              <Text style={styles.profileName}>{userInfo?.name || 'Usuário'}</Text>
              <Text style={styles.profileEmail}>{userInfo?.email || 'email@exemplo.com'}</Text>
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => Alert.alert('Informação', 'Edição de perfil não disponível nesta versão.')}
          >
            <Ionicons name="pencil-outline" size={20} color={COLORS.text} />
          </TouchableOpacity>
        </View>

        {/* Estatísticas */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>32</Text>
            <Text style={styles.statLabel}>Visualizações</Text>
          </View>
          <View style={[styles.statItem, styles.statBorder]}>
            <Text style={styles.statValue}>16</Text>
            <Text style={styles.statLabel}>Favoritos</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>8</Text>
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
              onPress={() => Alert.alert('Versão', 'APOD Explorer v1.0.0')}
            >
              <Ionicons name="information-circle-outline" size={22} color={COLORS.text} style={styles.aboutIcon} />
              <Text style={styles.aboutText}>Versão 1.0.0</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.aboutItem}
              onPress={() => Alert.alert('Sobre a API', 'Este aplicativo utiliza a API APOD (Astronomy Picture of the Day) da NASA.')}
            >
              <Ionicons name="globe-outline" size={22} color={COLORS.text} style={styles.aboutIcon} />
              <Text style={styles.aboutText}>Sobre a API APOD</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.aboutItem}
              onPress={() => Alert.alert('Termos de Uso', 'Os termos de uso deste aplicativo seguem as diretrizes da NASA para uso de suas APIs.')}
            >
              <Ionicons name="document-text-outline" size={22} color={COLORS.text} style={styles.aboutIcon} />
              <Text style={styles.aboutText}>Termos de Uso</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.aboutItem}
              onPress={() => Alert.alert('Política de Privacidade', 'Respeitamos sua privacidade. Nenhum dado pessoal é compartilhado com terceiros.')}
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
        >
          <Ionicons name="log-out-outline" size={22} color={COLORS.notification} />
          <Text style={styles.logoutText}>Sair da conta</Text>
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