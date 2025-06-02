import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LogBox } from 'react-native';

// Importar o Provider do usuário
import { UserProvider } from './src/contexts/UserContext';

// Importar o navegador principal
import AppNavigator from './src/navigation/AppNavigator';

// Ignorar warnings específicos
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
  'VirtualizedLists should never be nested',
  'Warning: Cannot update a component',
]);

// Componente principal do App
export default function App() {
  return (
    <SafeAreaProvider>
      <UserProvider>
        <StatusBar style="light" />
        <AppNavigator />
      </UserProvider>
    </SafeAreaProvider>
  );
}