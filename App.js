import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LogBox } from 'react-native';
import { KeyboardProvider } from "react-native-keyboard-controller";

// Context Providers
import { AuthProvider } from './src/context/AuthContext';

// Navigation
import Navigation from './src/navigation';

// Ignore specific warnings
LogBox.ignoreLogs([
  'ViewPropTypes will be removed',
  'ColorPropType will be removed',
]);

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <KeyboardProvider>

        <AuthProvider>
          <Navigation />
        </AuthProvider>

      </KeyboardProvider>
    </SafeAreaProvider>
  );
}
