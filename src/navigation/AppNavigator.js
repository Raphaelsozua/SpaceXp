// src/navigation/AppNavigator.js - Versão corrigida com navegação automática
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, View } from 'react-native';

// Importar contexto do usuário
import { useUser } from '../contexts/UserContext';

// Importar telas
import HomeScreen from '../screens/HomeScreen';
import DetailScreen from '../screens/DetailScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import ProfileScreen from '../screens/ProfileScreen';
import LoginScreen from '../screens/LoginScreen';

// Importar constantes de cores
import { COLORS } from '../config/constants';

// Criar navegadores
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Navegador principal com tabs
const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Favorites') {
            iconName = focused ? 'heart' : 'heart-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.accent,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarStyle: {
          backgroundColor: COLORS.primary,
          borderTopColor: COLORS.border,
        },
        headerStyle: {
          backgroundColor: COLORS.primary,
          shadowColor: COLORS.border,
        },
        headerTintColor: COLORS.text,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ title: 'APOD' }}
      />
      <Tab.Screen 
        name="Favorites" 
        component={FavoritesScreen} 
        options={{ title: 'Favoritos' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ title: 'Perfil' }}
      />
    </Tab.Navigator>
  );
};

// Navegador principal do aplicativo
const AppNavigator = () => {
  const { isAuthenticated, isLoading, userToken } = useUser();

  // Debug logs
  console.log('🔍 AppNavigator Debug:', {
    isAuthenticated,
    isLoading,
    hasToken: !!userToken
  });

  // Mostrar loading enquanto carrega dados do usuário
  if (isLoading) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        backgroundColor: COLORS.background 
      }}>
        <ActivityIndicator size="large" color={COLORS.accent} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: COLORS.primary,
          },
          headerTintColor: COLORS.text,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          cardStyle: { backgroundColor: COLORS.background }
        }}
      >
        {/* Verificar tanto isAuthenticated quanto userToken para garantir */}
        {(isAuthenticated && userToken) ? (
          <>
            <Stack.Screen 
              name="Main" 
              component={MainTabNavigator}
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="Detail" 
              component={DetailScreen} 
              options={{ title: 'Detalhe da APOD' }}
            />
          </>
        ) : (
          <Stack.Screen 
            name="Login" 
            component={LoginScreen} 
            options={{ headerShown: false }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;