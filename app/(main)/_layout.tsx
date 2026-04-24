import { Stack } from 'expo-router';

export default function MainLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="home" />
      <Stack.Screen name="horarios" />
      <Stack.Screen name="horarios/[date]" />
      <Stack.Screen name="llamar" />
      <Stack.Screen name="llamar/agregar" />
      <Stack.Screen name="llamar/editar" />
      <Stack.Screen name="articulos" />
      <Stack.Screen name="articulos/[id]" />
      <Stack.Screen name="asistente" />
      <Stack.Screen name="mas" />
      <Stack.Screen name="juegos" />
      <Stack.Screen name="juegos/memotest" />
      <Stack.Screen name="clima" />
      <Stack.Screen name="radio" />
    </Stack>
  );
}
