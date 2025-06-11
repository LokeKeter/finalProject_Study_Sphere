import React, { createContext, useContext, useState } from "react";
import { View } from "react-native";
import { Stack } from "expo-router";

// ✅ Create Authentication Context
const AuthContext = createContext();
export function useAuth() {
  return useContext(AuthContext);
}

export default function Layout() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn }}>
      <View style={{ flex: 1 }}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="Dashboard" />
          <Stack.Screen name="Admin-Users" />
        </Stack>
      </View>
    </AuthContext.Provider>
  );
}
