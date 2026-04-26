import { AuthProvider } from '@/context/AuthContext';
import { ContactsProvider } from '@/context/ContactsContext';
import { FontSizeProvider } from '@/context/FontSizeContext';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <FontSizeProvider>
        <AuthProvider>
          <ContactsProvider>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="auth/login" />
              <Stack.Screen name="auth/register" />
              <Stack.Screen name="auth/recover" />
              <Stack.Screen name="(main)" />
            </Stack>
            <StatusBar style="light" />
          </ContactsProvider>
        </AuthProvider>
      </FontSizeProvider>
    </SafeAreaProvider>
  );
}
