import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  Image, 
  ImageBackground,
  Dimensions,
  ActivityIndicator,
  StatusBar,
  Platform,
  SafeAreaView
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { makeRedirectUri } from 'expo-auth-session';
import { LinearGradient } from 'expo-linear-gradient';

WebBrowser.maybeCompleteAuthSession();

const { width, height } = Dimensions.get('window');

export default function LoginScreen({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [animating, setAnimating] = useState(true);

  const [screenDimensions, setScreenDimensions] = useState({
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  });

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreenDimensions({
        width: window.width,
        height: window.height,
      });
    });
    
    return () => subscription?.remove();
  }, []);

  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: '22332176985-o1m31q76l9psr0o4gep64msps583lnhj.apps.googleusercontent.com',
    redirectUri: makeRedirectUri({
      useProxy: true,
    }),
  });

  useEffect(() => {
    console.log('Resposta', response);

    if (response?.type === 'success') {
      setLoading(true);
      const { authentication } = response;
      getUserInfo(authentication.accessToken);
    } else if (response?.type === 'error') {
      setError('Falha na autenticação. Tente novamente.');
      setLoading(false);
    }
  }, [response]);

  const handleSobre = () => {
    navigation.navigate('Sobre'); // Alterado de replace para navigate
  };

const getUserInfo = async (token) => {
  if (!token) {
    setLoading(false);
    return;
  }

  try {
    const response = await fetch('https://www.googleapis.com/userinfo/v2/me', {
      headers: { Authorization: `Bearer ${token}` },
    });

    const user = await response.json();
    console.log('Login bem-sucedido:', user.name);

    // Salvar o token para uso posterior (opcional)
    try {
      await SecureStore.setItemAsync(USER_TOKEN_KEY, token);
    } catch (e) {
      console.log('Erro ao salvar token:', e);
    }

    // Navegar para a tela Main que contém o TabNavigator
    navigation.replace('Main', { user });
  } catch (error) {
    console.log('Erro ao obter informações do usuário:', error);
    setError('Erro ao obter informações do usuário.');
  } finally {
    setLoading(false);
  }
};


  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <ImageBackground
        // Caminho ajustado para as imagens
        source={require('../../public/images/image.jpg')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <LinearGradient
          colors={['rgba(0,0,0,0.4)', 'rgba(0,0,0,0.7)']}
          style={styles.overlay}
        >
          <View style={styles.logoContainer}>
            <Text style={styles.title}>SpaceXp</Text>
            <Text style={styles.subtitle}>Explore o universo com um simples login</Text>
          </View>

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.googleButton}
            onPress={async () => {
              setError(null);
              try {
                const result = await promptAsync();
                console.log('Resultado do promptAsync:', result);
              } catch (e) {
                setError('Erro ao iniciar autenticação');
                console.error(e);
              }
            }}
            disabled={!request || loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#3498db" />
                <Text style={styles.loadingText}>Conectando...</Text>
              </View>
            ) : (
              <>
                <Image
                  // Caminho ajustado para as imagens
                  source={require('../../public/images/google.webp')}
                  style={styles.googleIcon}
                />
                <Text style={styles.buttonText}>Entrar com Google</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.aboutButton} 
            onPress={handleSobre}
            activeOpacity={0.7}
          >
            <Text style={styles.aboutText}>Sobre o SpaceXp</Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              © {new Date().getFullYear()} SpaceXp • Todos os direitos reservados
            </Text>
          </View>
        </LinearGradient>
      </ImageBackground>
    </SafeAreaView>
  );
}

// Estilos permanecem os mesmos

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000',
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  logoInner: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    overflow: 'hidden',
  },
  appLogo: {
    width: 60,
    height: 60,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
  },
  subtitle: {
    fontSize: 18,
    color: '#eee',
    textAlign: 'center',
    marginBottom: 20,
    maxWidth: '80%',
    lineHeight: 24,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  errorContainer: {
    backgroundColor: 'rgba(231, 76, 60, 0.8)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 20,
    width: '90%',
    maxWidth: 400,
  },
  errorText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 30,
    paddingVertical: 14,
    paddingHorizontal: 25,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    width: '85%',
    maxWidth: 350,
    marginBottom: 20,
    borderWidth: 0,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: '600',
    color: '#3498db',
  },
  buttonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#333',
    marginLeft: 15,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
  },
  googleIcon: {
    width: 28,
    height: 28,
    resizeMode: 'contain',
  },
  aboutButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginTop: 10,
  },
  aboutText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textDecorationLine: 'underline',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  footer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 40 : 30,
    width: '100%',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
  }
});