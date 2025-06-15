import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, useColorScheme } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "./_layout";  // ✅ Import authentication hook
import AsyncStorage from "@react-native-async-storage/async-storage"; // ✅ Import storage
import axios from 'axios';
import Toast from 'react-native-toast-message';

export default function LoginScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("הורה");  // ✅ Default: הורה
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";
  const router = useRouter();
  const { setIsLoggedIn } = useAuth();  // ✅ Authentication Context

  // 🔑 **Handle Login**
  const handleLogin = async () => {
  try {
    console.log("📤 Sending login request", { username, password, role });
    const response = await axios.post('http://localhost:5000/api/users/login', {
      username,
      password,
      role: role === 'מורה' ? 'teacher' : 'parent', // המרה לעברית->אנגלית
    });

    const { token, user } = response.data;
    await AsyncStorage.setItem('token', token);
    await AsyncStorage.setItem('user', JSON.stringify(user));

    setIsLoggedIn(true);

    if (user.role === 'teacher') {
      router.push('/Dashboard');
    } else if (user.role === 'parent') {
      router.push('/Parent-Dashboard');
    } else if (user.role === 'admin') {
      router.push('/Admin-Users');
    }
  } catch (error) {
    const message = error.response?.data?.error || "⚠️ שגיאה לא צפויה בשרת";
    Toast.show({
      type: "error",
      text1: message,
    });
  }
};

  return (
    <View style={[styles.container, isDarkMode ? styles.darkContainer : styles.lightContainer]}>
      
      {/* 🔹 **Logo** */}
      <Image
        source={isDarkMode ? require("../assets/logo-studyS.png") : require("../assets/logo-studyS2.png")}
        style={styles.logo}
        resizeMode="contain"
      />

      <Text style={[styles.title, { color: isDarkMode ? "#fff" : "#000" }]}>Welcome Back !!</Text>

      {/* 📝 **Input Fields** */}
      <TextInput
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        style={[styles.input, { backgroundColor: isDarkMode ? "#333" : "#fff", color: isDarkMode ? "#fff" : "#000" }]}
        placeholderTextColor={isDarkMode ? "#ccc" : "#666"}
      />

      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={[styles.input, { backgroundColor: isDarkMode ? "#333" : "#fff", color: isDarkMode ? "#fff" : "#000" }]}
        placeholderTextColor={isDarkMode ? "#ccc" : "#666"}
      />

      {/* 🏷️ **Role Selection** */}
      <View style={styles.roleContainer}>
        {["הורה", "מורה"].map((roleOption) => (
          <TouchableOpacity
            key={roleOption}
            onPress={() => setRole(roleOption)}
            style={[
              styles.roleButton,
              role === roleOption ? { backgroundColor: isDarkMode ? "#fff" : "black" } : styles.roleButtonUnselected,
            ]}
          >
            <Text style={{ color: role === roleOption ? (isDarkMode ? "#000" : "#fff") : (isDarkMode ? "#fff" : "#000") }}>
              {roleOption}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 🔘 **Login Button** */}
      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginText}>🚀 התחברות</Text>
      </TouchableOpacity>

      {/* 🔗 **Navigation Links** */}
      <TouchableOpacity onPress={() => router.push("/ForgotPassword")}>
        <Text style={[styles.signupLink, { color: isDarkMode ? "#fff" : "#000" }]}>🔑 שכחת סיסמה?</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/SignupScreen")}>
        <Text style={[styles.signupLink, { color: isDarkMode ? "#fff" : "#000" }]}>📝 הרשמה</Text>
      </TouchableOpacity>
    </View>
  );
}

// 🎨 **Styles**
const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 20 },
  lightContainer: { backgroundColor: "#fff" },
  darkContainer: { backgroundColor: "#000" },
  logo: { width: 150, height: 150, marginBottom: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
  errorText: { color: "red", fontSize: 14, marginBottom: 10 },

  input: {
    width: "85%",
    maxWidth: 400,
    height: 50,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 10,
  },

  roleContainer: { flexDirection: "row", justifyContent: "center", marginBottom: 15 },
  roleButton: { paddingVertical: 10, paddingHorizontal: 20, marginHorizontal: 5, borderRadius: 10, borderWidth: 1 },
  roleButtonUnselected: { backgroundColor: "transparent", borderColor: "black" },

  loginButton: {
    backgroundColor: "#1F1F1F",
    paddingVertical: 12,
    paddingHorizontal: 30,
    alignItems: "center",
    borderRadius: 8,
    marginBottom: 15,
  },
  loginText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  signupLink: { fontSize: 14, textDecorationLine: "underline", marginTop: 10 },
});
