import { Stack } from "expo-router";

export default function Layout() {
  return (
    <Stack screenOptions={{ headerShown: false }}> {/* 👈 מסתיר את הסרגל */}
      <Stack.Screen name="index" />
      <Stack.Screen name="SignupScreen" />
    </Stack>
  );
}
