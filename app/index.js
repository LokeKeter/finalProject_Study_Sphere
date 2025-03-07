import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, useColorScheme, Dimensions } from "react-native";
import { useRouter } from "expo-router";

const validUsers = [
  { username: "Steve", password: "12345", role: "מורה" },
  { username: "loki", password: "12345", role: "מורה" },
];

const LoginScreen = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("הורה"); // ברירת מחדל
  const [errorMessage, setErrorMessage] = useState("");
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";
  const router = useRouter();

  const handleLogin = () => {
    const user = validUsers.find((u) => u.username === username && u.password === password && role === "מורה");

    if (user) {
      router.push("/Classes"); // ✅ מעבר לעמוד Homework לאחר התחברות מוצלחת
    } else {
      setErrorMessage("שם משתמש או סיסמא לא תקינים!");
    }
  };

  return (
    <View style={[styles.container, isDarkMode ? styles.darkContainer : styles.lightContainer]}>
      {/* ✅ שינוי הלוגו לפי מצב כהה/בהיר */}
      <Image
        source={isDarkMode ? require("../assets/logo-studyS.png") : require("../assets/logo-studyS2.png")}
        style={styles.logo}
        resizeMode="contain"
      />

      {/* ✅ שינוי צבע הטקסט לפי מצב כהה/בהיר */}
      <Text style={[styles.title, { color: isDarkMode ? "#fff" : "#000" }]}>Welcome Back !!</Text>

      {/* ✅ שדות קלט */}
      <TextInput
        placeholder="Username"
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

      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
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

      {/* ✅ בחירת תפקיד */}
      <View style={styles.roleContainer}>
        {["הורה", "מורה"].map((roleOption) => (
          <TouchableOpacity
            key={roleOption}
            onPress={() => setRole(roleOption)}
            style={[
              styles.roleButton,
              role === roleOption
                ? { backgroundColor: isDarkMode ? "#fff" : "black", borderColor: isDarkMode ? "#fff" : "black" }
                : styles.roleButtonUnselected,
            ]}
          >
            <Text style={{ color: role === roleOption ? (isDarkMode ? "#000" : "#fff") : (isDarkMode ? "#fff" : "#000") }}>
              {roleOption}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ✅ הצגת שגיאה אם שם משתמש/סיסמא לא נכונים */}
      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

      {/* ✅ כפתור התחברות */}
      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginText}>התחברות</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/ForgotPassword")}>
        <Text style={[styles.signupLink, { color: isDarkMode ? "#fff" : "#000" }]}>שכחת סיסמה?</Text>
      </TouchableOpacity>
      <View style={{ height: 15 }} />

      <TouchableOpacity onPress={() => router.push("/SignupScreen")}>
        <Text style={[styles.signupLink, { color: isDarkMode ? "#fff" : "#000" }]}>הרשמה</Text>
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
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
  errorText: { color: "red", fontSize: 14, marginBottom: 10 }, // ✅ עיצוב שגיאה

  input: {
    width: "85%", // ✅ גודל מותאם לנייד
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
    backgroundColor: "black",
    paddingVertical: 12,
    paddingHorizontal: 30,
    alignItems: "center",
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "white",
    minWidth: 120, // ✅ כמו כפתור "הרשמה"
  },
  loginText: { color: "#fff", fontSize: 16, fontWeight: "bold" },

  forgotPassword: { fontSize: 14, marginBottom: 5 },
  signupLink: { fontSize: 14, textDecorationLine: "underline" },
});

export default LoginScreen;
