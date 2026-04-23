import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '@/context/AuthContext';
import { ContactsProvider } from '@/context/ContactsContext';

export default function RootLayout() {
  return (
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
  );
}
