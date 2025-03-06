import { Stack } from "expo-router";

export default function Layout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="SignupScreen" />
      <Stack.Screen name="ForgotPassword" /> {/* 👈 הוספת המסך */}
    </Stack>
  );
}
