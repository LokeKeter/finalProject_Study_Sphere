import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, useColorScheme } from "react-native";
import { useRouter } from "expo-router";

const ForgotPassword = () => {
  const [username, setUsername] = useState("");
  const colorScheme = useColorScheme(); // מזהה מצב כהה או בהיר
  const isDarkMode = colorScheme === "dark";
  const router = useRouter();

  return (
    <View style={[styles.container, isDarkMode ? styles.darkContainer : styles.lightContainer]}>
      {/* לוגו */}
      <Image source={require("../assets/logo-studyS.png")} style={styles.logo} resizeMode="contain" />

      {/* כותרת */}
      <Text style={[styles.title, isDarkMode ? styles.darkText : styles.lightText]}>Forgot Password</Text>
      <Text style={[styles.subtitle, isDarkMode ? styles.darkText : styles.lightText]}>Please enter your username</Text>

      {/* שדה קלט */}
      <TextInput
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        style={[styles.input, isDarkMode && styles.inputDark]}
        placeholderTextColor={isDarkMode ? "#ccc" : "#666"}
      />

      {/* כפתור איפוס סיסמה */}
      <TouchableOpacity style={styles.resetButton}>
        <Text style={styles.resetButtonText}>איפוס סיסמא</Text>
      </TouchableOpacity>

      {/* כפתור חזרה להתחברות */}
      <TouchableOpacity onPress={() => router.push("/")} style={styles.backButton}>
        <Text style={styles.backButtonText}>חזור</Text>
      </TouchableOpacity>
    </View>
  );
};

// 🎨 **סגנונות מותאמים לפלאפון**
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  lightContainer: {
    backgroundColor: "#fff",
  },
  darkContainer: {
    backgroundColor: "#000",
  },
  logo: {
    width: 120, // מתאים למובייל
    height: 120,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
  },
  darkText: {
    color: "#fff",
  },
  lightText: {
    color: "#000",
  },
  input: {
    width: "100%",
    height: 50,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 10,
    backgroundColor: "#f9f9f9",
  },
  inputDark: {
    backgroundColor: "#333",
    borderColor: "#555",
  },
  resetButton: {
    backgroundColor: "black",
    paddingVertical: 15,
    width: "100%",
    alignItems: "center",
    borderRadius: 10,
    marginBottom: 10,
  },
  resetButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  backButton: {
    marginTop: 10,
  },
  backButtonText: {
    fontSize: 14,
    textDecorationLine: "underline",
  },
});

export default ForgotPassword;
