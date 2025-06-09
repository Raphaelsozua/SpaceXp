import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { COLORS, COMMON_STYLES } from '../config/constants';

const { width } = Dimensions.get('window');

const AboutScreen = ({ navigation }) => {
  const authorsInfo = JSON.stringify({
    app: "SpaceXP",
    authors: [
      "Rafael Almeida",
      "Raphael Baruque Souza"
    ],
    year: new Date().getFullYear(),
    description: "Aplicativo desenvolvido para explorar as imagens astronômicas da NASA"
  });

  const handleBackPress = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={handleBackPress}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sobre o App</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.appInfoContainer}>
          <Text style={styles.appTitle}>SpaceXP</Text>
          <Text style={styles.appVersion}>Versão 1.0.0</Text>
          <Text style={styles.appDescription}>
            Explore as maravilhas do universo através das imagens astronômicas 
            diárias fornecidas pela NASA. Descubra planetas, galáxias, nebulosas 
            e outros fenômenos cósmicos incríveis.
          </Text>
        </View>

        <View style={styles.authorsContainer}>
          <Text style={styles.sectionTitle}>Desenvolvido por</Text>
          
          <View style={styles.authorCard}>
            <Ionicons name="person-circle" size={32} color={COLORS.accent} />
            <View style={styles.authorInfo}>
              <Text style={styles.authorName}>Rafael Almeida</Text>
              <Text style={styles.authorRole}>Desenvolvedor</Text>
            </View>
          </View>

          <View style={styles.authorCard}>
            <Ionicons name="person-circle" size={32} color={COLORS.accent} />
            <View style={styles.authorInfo}>
              <Text style={styles.authorName}>Raphael Baruque Souza</Text>
              <Text style={styles.authorRole}>Desenvolvedor</Text>
            </View>
          </View>
        </View>

        <View style={styles.qrContainer}>
          <Text style={styles.sectionTitle}>Informações dos Autores</Text>
          <Text style={styles.qrDescription}>
            Escaneie o QR Code abaixo para ver as informações dos desenvolvedores
          </Text>
          
          <View style={styles.qrContainer}>          
          <View style={styles.qrCodeWrapper}>
            <QRCode
              value={authorsInfo}
              size={200}
              color="#000000"
              backgroundColor="#FFFFFF"
            />
          </View>
        </View>
        </View>

        <View style={styles.featuresContainer}>
          <Text style={styles.sectionTitle}>Funcionalidades</Text>
          
          <View style={styles.featureItem}>
            <Ionicons name="image-outline" size={24} color={COLORS.accent} />
            <Text style={styles.featureText}>Visualize a imagem astronômica do dia</Text>
          </View>
          
          <View style={styles.featureItem}>
            <Ionicons name="calendar-outline" size={24} color={COLORS.accent} />
            <Text style={styles.featureText}>Navegue pelo histórico de imagens</Text>
          </View>
          
          <View style={styles.featureItem}>
            <Ionicons name="heart-outline" size={24} color={COLORS.accent} />
            <Text style={styles.featureText}>Salve suas imagens favoritas</Text>
          </View>
          
          <View style={styles.featureItem}>
            <Ionicons name="information-circle-outline" size={24} color={COLORS.accent} />
            <Text style={styles.featureText}>Leia descrições detalhadas</Text>
          </View>
        </View>

        <View style={styles.creditsContainer}>
          <Text style={styles.sectionTitle}>Créditos</Text>
          <Text style={styles.creditText}>
            • NASA APOD API - Fornecimento das imagens astronômicas{"\n"}
            • Expo - Framework de desenvolvimento{"\n"}
            • React Native - Tecnologia mobile{"\n"}
            • Ionicons - Ícones do aplicativo
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            © {new Date().getFullYear()} SpaceXP
          </Text>
          <Text style={styles.footerSubtext}>
            Feito com ❤️ para os amantes da astronomia
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: COLORS.surface,
    ...COMMON_STYLES.shadow,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  placeholder: {
    width: 34,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  appInfoContainer: {
    alignItems: 'center',
    paddingVertical: 30,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 5,
  },
  appVersion: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 15,
  },
  appDescription: {
    fontSize: 16,
    color: COLORS.text,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 10,
  },
  authorsContainer: {
    paddingVertical: 25,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 15,
  },
  authorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    ...COMMON_STYLES.shadow,
  },
  authorInfo: {
    marginLeft: 15,
  },
  authorName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  authorRole: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  qrContainer: {
    alignItems: 'center',
    paddingVertical: 25,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  qrDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  qrCodeWrapper: {
    // backgroundColor: COLORS.surface,
    padding: 20,
    borderRadius: 12,
    ...COMMON_STYLES.shadow,
  },
  featuresContainer: {
    paddingVertical: 25,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  featureText: {
    fontSize: 16,
    color: COLORS.text,
    marginLeft: 15,
    flex: 1,
  },
  creditsContainer: {
    paddingVertical: 25,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  creditText: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 22,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 25,
  },
  footerText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 5,
  },
  footerSubtext: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
});

export default AboutScreen;