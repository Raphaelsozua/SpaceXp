// src/screens/LoginScreen.js - Versão limpa e corrigida
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
  Platform,
  ImageBackground,
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { makeRedirectUri } from 'expo-auth-session';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// Importar contexto do usuário
import { useUser } from '../contexts/UserContext';

// Importar constantes
import { COLORS, COMMON_STYLES } from '../config/constants';

// Garantir que as sessões de autenticação sejam concluídas corretamente
WebBrowser.maybeCompleteAuthSession();

const screenDimensions = Dimensions.get('window');

const LoginScreen = ({ navigation }) => {
  const { login } = useUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dimensions, setDimensions] = useState({
    width: screenDimensions.width,
    height: screenDimensions.height,
  });

  // Configurar listener de dimensões da tela para responsividade
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions({
        width: window.width,
        height: window.height,
      });
    });
    
    return () => subscription?.remove();
  }, []);

  // Configurar solicitação de autenticação do Google
  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: '22332176985-o1m31q76l9psr0o4gep64msps583lnhj.apps.googleusercontent.com',
    redirectUri: makeRedirectUri({
      useProxy: true,
    }),
  });

  // Tratar resposta da autenticação
  useEffect(() => {
    console.log('Resposta da autenticação:', response);

    if (response?.type === 'success') {
      setLoading(true);
      const { authentication } = response;
      getUserInfo(authentication.accessToken);
    } else if (response?.type === 'error') {
      setError('Falha na autenticação. Tente novamente.');
      setLoading(false);
    }
  }, [response]);

  // Obter informações do usuário após autenticação bem-sucedida
  const getUserInfo = async (token) => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('https://www.googleapis.com/userinfo/v2/me', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Falha ao obter informações do usuário');
      }

      const user = await response.json();
      console.log('Login bem-sucedido:', user);

      // Usar o contexto para fazer login
      await login(token, user);
      
      // A navegação será automática através do AppNavigator quando isAuthenticated mudar
    } catch (error) {
      console.error('Erro ao obter informações do usuário:', error);
      setError('Erro ao obter informações do usuário.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginPress = async () => {
    setError(null);
    try {
      const result = await promptAsync();
      console.log('Resultado do promptAsync:', result);
    } catch (e) {
      setError('Erro ao iniciar autenticação');
      console.error(e);
    }
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
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <TouchableOpacity
              style={[styles.loginButton, (!request || loading) && styles.buttonDisabled]}
              onPress={handleLoginPress}
              disabled={!request || loading}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.text} />
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
    backgroundColor: 'rgba(231, 76, 60, 0.8)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 20,
    width: '100%',
  },
  errorText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
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