import { Stack } from "expo-router";

export default function Layout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="SignupScreen" />
      <Stack.Screen name="ForgotPassword" />
      <Stack.Screen name="Homework" />
      <Stack.Screen name="Classes" />
    </Stack>
  );
}
