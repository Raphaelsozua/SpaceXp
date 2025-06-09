import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LogBox } from 'react-native';
import { UserProvider } from './src/contexts/UserContext';

import AppNavigator from './src/navigation/AppNavigator';

LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
  'VirtualizedLists should never be nested',
  'Warning: Cannot update a component',
]);

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