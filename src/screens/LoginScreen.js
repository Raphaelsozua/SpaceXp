// src/screens/LoginScreen.js - Versão final integrada com backend
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StatusBar,
  SafeAreaView,
  Dimensions,
  ImageBackground,
  Alert,
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { makeRedirectUri } from 'expo-auth-session';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// Importar contexto do usuário
import { useUser } from '../contexts/UserContext';

// Importar serviços
import { authenticateWithGoogle, testApiConnection } from '../services/api';

// Importar constantes
import { COLORS, COMMON_STYLES } from '../config/constants';

// Garantir que as sessões de autenticação sejam concluídas corretamente
WebBrowser.maybeCompleteAuthSession();

const screenDimensions = Dimensions.get('window');

const LoginScreen = ({ navigation }) => {
  const { login } = useUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [apiStatus, setApiStatus] = useState('checking'); // 'checking', 'connected', 'error'

  // Configurar solicitação de autenticação do Google
  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: '22332176985-o1m31q76l9psr0o4gep64msps583lnhj.apps.googleusercontent.com',
    redirectUri: makeRedirectUri({
      useProxy: true,
    }),
  });

  // Testar conexão com API ao carregar a tela
  useEffect(() => {
    checkApiConnection();
  }, []);

  // Tratar resposta da autenticação
  useEffect(() => {
    console.log('📱 Resposta da autenticação Google:', response?.type);

    if (response?.type === 'success') {
      setLoading(true);
      const { authentication } = response;
      handleGoogleAuth(authentication.accessToken);
    } else if (response?.type === 'error') {
      setError('Falha na autenticação. Tente novamente.');
      setLoading(false);
    }
  }, [response]);

  // Verificar conexão com a API
  const checkApiConnection = async () => {
    try {
      console.log('🔍 Verificando conexão com API...');
      setApiStatus('checking');
      
      const result = await testApiConnection();
      
      if (result.success) {
        console.log('✅ API conectada:', result.data.status);
        setApiStatus('connected');
      } else {
        console.log('❌ API desconectada:', result.error);
        setApiStatus('error');
        setError('Não foi possível conectar com o servidor. Verifique se o Flask está rodando.');
      }
    } catch (error) {
      console.error('❌ Erro ao testar API:', error);
      setApiStatus('error');
      setError('Erro de conexão com o servidor.');
    }
  };

  // Autenticar com Google através do backend
  const handleGoogleAuth = async (googleToken) => {
    try {
      console.log('🔑 Autenticando com backend Flask...');
      
      // Verificar se API está disponível
      if (apiStatus !== 'connected') {
        throw new Error('API não está disponível. Verifique a conexão.');
      }
      
      // Enviar token do Google para o backend Flask
      const authResult = await authenticateWithGoogle(googleToken);
      
      console.log('✅ Autenticação bem-sucedida:', authResult.user);
      
      // Fazer login no contexto local
      await login(authResult.token, authResult.user);
      
      // Mostrar feedback de sucesso
      Alert.alert(
        'Login realizado!',
        `Bem-vindo, ${authResult.user.name}!`,
        [{ text: 'Continuar', style: 'default' }]
      );
      
    } catch (error) {
      console.error('❌ Erro na autenticação:', error);
      
      let errorMessage = 'Erro ao conectar com o servidor.';
      
      if (error.response?.status === 401) {
        errorMessage = 'Token do Google inválido. Tente novamente.';
      } else if (error.message?.includes('Network Error')) {
        errorMessage = 'Sem conexão com o servidor. Verifique se o Flask está rodando.';
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      
      setError(errorMessage);
      
      Alert.alert(
        'Erro na autenticação',
        errorMessage,
        [
          { text: 'Tentar novamente', onPress: () => setError(null) },
          { text: 'Verificar conexão', onPress: checkApiConnection }
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLoginPress = async () => {
    setError(null);
    
    // Verificar conexão com API antes de tentar login
    if (apiStatus === 'error') {
      Alert.alert(
        'Sem conexão',
        'Não foi possível conectar com o servidor. Deseja verificar a conexão novamente?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Verificar', onPress: checkApiConnection }
        ]
      );
      return;
    }
    
    try {
      console.log('🚀 Iniciando autenticação Google...');
      const result = await promptAsync();
      console.log('📱 Resultado do Google OAuth:', result.type);
    } catch (e) {
      console.error('❌ Erro ao iniciar autenticação:', e);
      setError('Erro ao iniciar autenticação');
    }
  }

  // Renderizar indicador de status da API
  const renderApiStatus = () => {
    let statusColor, statusIcon, statusText;
    
    switch (apiStatus) {
      case 'checking':
        statusColor = COLORS.textSecondary;
        statusIcon = 'time-outline';
        statusText = 'Verificando conexão...';
        break;
      case 'connected':
        statusColor = '#10B981'; // verde
        statusIcon = 'checkmark-circle';
        statusText = 'Servidor conectado';
        break;
      case 'error':
        statusColor = COLORS.notification;
        statusIcon = 'alert-circle';
        statusText = 'Servidor desconectado';
        break;
    }
    
    return (
      <View style={styles.statusContainer}>
        <Ionicons name={statusIcon} size={16} color={statusColor} />
        <Text style={[styles.statusText, { color: statusColor }]}>
          {statusText}
        </Text>
        {apiStatus === 'error' && (
          <TouchableOpacity onPress={checkApiConnection} style={styles.retryButton}>
            <Ionicons name="refresh" size={16} color={COLORS.accent} />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <ImageBackground
        source={require('../../public/images/image.jpg')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <LinearGradient
          colors={['rgba(0,0,0,0.4)', 'rgba(0,0,0,0.7)']}
          style={styles.overlay}
        >
          <View style={styles.logoContainer}>
            <Text style={styles.appTitle}>APOD Explorer</Text>
            <Text style={styles.subtitle}>
              Descubra a imagem astronômica do dia da NASA
            </Text>
            {renderApiStatus()}
          </View>

          <View style={styles.contentContainer}>
            <View style={styles.infoContainer}>
              <View style={styles.infoItem}>
                <Ionicons name="planet-outline" size={24} color={COLORS.accent} style={styles.infoIcon} />
                <Text style={styles.infoText}>Explore imagens astronômicas incríveis</Text>
              </View>
              <View style={styles.infoItem}>
                <Ionicons name="calendar-outline" size={24} color={COLORS.accent} style={styles.infoIcon} />
                <Text style={styles.infoText}>Acesse o arquivo de imagens da NASA</Text>
              </View>
              <View style={styles.infoItem}>
                <Ionicons name="heart-outline" size={24} color={COLORS.accent} style={styles.infoIcon} />
                <Text style={styles.infoText}>Salve suas imagens favoritas</Text>
              </View>
            </View>

            {error && (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={20} color="#fff" style={styles.errorIcon} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <TouchableOpacity
              style={[
                styles.loginButton, 
                (!request || loading || apiStatus !== 'connected') && styles.buttonDisabled
              ]}
              onPress={handleLoginPress}
              disabled={!request || loading || apiStatus !== 'connected'}
            >
              {loading ? (
                <View style={styles.buttonContent}>
                  <ActivityIndicator color={COLORS.text} size="small" />
                  <Text style={[styles.loginButtonText, { marginLeft: 10 }]}>
                    Conectando...
                  </Text>
                </View>
              ) : (
                <View style={styles.buttonContent}>
                  <Image 
                    source={require('../../public/images/google.webp')}
                    style={styles.buttonIcon} 
                  />
                  <Text style={styles.loginButtonText}>Continuar com Google</Text>
                </View>
              )}
            </TouchableOpacity>

            <Text style={styles.disclaimerText}>
              Este aplicativo utiliza a API APOD da NASA.
              Ao fazer login, você concorda com os termos e condições.
            </Text>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              © {new Date().getFullYear()} APOD Explorer • Todos os direitos reservados
            </Text>
          </View>
        </LinearGradient>
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  appTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 20,
    maxWidth: '80%',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 10,
  },
  statusText: {
    fontSize: 12,
    marginLeft: 6,
    fontWeight: '500',
  },
  retryButton: {
    marginLeft: 8,
    padding: 2,
  },
  contentContainer: {
    width: '100%',
    maxWidth: 400,
    marginBottom: 40,
  },
  infoContainer: {
    marginBottom: 40,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoIcon: {
    marginRight: 12,
  },
  infoText: {
    fontSize: 16,
    color: COLORS.text,
    flex: 1,
  },
  errorContainer: {
    backgroundColor: 'rgba(231, 76, 60, 0.9)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 20,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorIcon: {
    marginRight: 8,
  },
  errorText: {
    color: '#fff',
    fontSize: 14,
    flex: 1,
    lineHeight: 18,
  },
  loginButton: {
    backgroundColor: COLORS.accent,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    ...COMMON_STYLES.shadow,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIcon: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  loginButtonText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
  },
  disclaimerText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  footer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  footerText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
  },
});


export default LoginScreen;