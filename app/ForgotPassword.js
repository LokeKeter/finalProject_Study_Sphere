import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, useColorScheme } from "react-native";
import { useRouter } from "expo-router";

const ForgotPassword = () => {
  const [username, setUsername] = useState("");
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";
  const router = useRouter();

  return (
    <View style={[styles.container, isDarkMode ? styles.darkContainer : styles.lightContainer]}>
      {/* 🔹 לוגו - משתנה לפי מצב כהה/בהיר */}
      <Image
        source={isDarkMode ? require("../assets/logo-studyS.png") : require("../assets/logo-studyS2.png")}
        style={styles.logo}
        resizeMode="contain"
      />

      {/* 🔹 כותרת */}
      <Text style={[styles.title, { color: isDarkMode ? "#fff" : "#000" }]}>שכחת סיסמה?</Text>
      <Text style={[styles.subtitle, { color: isDarkMode ? "#fff" : "#000" }]}>נא להזין שם משתמש</Text>

      {/* 🔹 שדה קלט לשם משתמש */}
      <TextInput
        placeholder="שם משתמש"
        value={username}
        onChangeText={setUsername}
        style={[
          styles.input,
          {
            backgroundColor: isDarkMode ? "#333" : "#fff",
            color: isDarkMode ? "#fff" : "#000",
            borderColor: isDarkMode ? "#fff" : "#000",
          },
        ]}
        placeholderTextColor={isDarkMode ? "#ccc" : "#666"}
      />

      {/* 🔹 כפתור איפוס סיסמה */}
      <TouchableOpacity style={styles.resetButton}>
        <Text style={styles.resetButtonText}>איפוס סיסמא</Text>
      </TouchableOpacity>

      {/* 🔹 כפתור חזרה להתחברות */}
      <TouchableOpacity onPress={() => router.push("/")} style={styles.backButton}>
        <Text style={[styles.backButtonText, { color: isDarkMode ? "#fff" : "#000" }]}>חזור</Text>
      </TouchableOpacity>
    </View>
  );
};

// 🎨 **סגנונות**
const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 20 },
  lightContainer: { backgroundColor: "#fff" },
  darkContainer: { backgroundColor: "#000" },
  logo: { width: 150, height: 150, marginBottom: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 5 },
  subtitle: { fontSize: 16, marginBottom: 20 },

  input: {
    width: "85%", // ✅ התאמה לשדה הקלט
    maxWidth: 400,
    height: 50,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 10,
  },

  resetButton: {
    backgroundColor: "black",
    paddingVertical: 12,
    paddingHorizontal: 30,
    alignItems: "center",
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "white",
    minWidth: 120,
  },
  resetButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },

  backButton: { marginTop: 10 },
  backButtonText: { fontSize: 14, textDecorationLine: "underline" },
});

export default ForgotPassword;
