import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, useColorScheme } from "react-native";
import { useRouter } from "expo-router";

const SignupScreen = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    studentName: "",
    studentID: "",
    username: "",
    password: "",
    role: "הורה", // ברירת מחדל
  });

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
      <Text style={[styles.title, { color: isDarkMode ? "#fff" : "#000" }]}>הרשמה</Text>
      <Text style={[styles.subtitle, { color: isDarkMode ? "#fff" : "#000" }]}>אנא מלא את הפרטים שלך</Text>

      {/* 🔹 שדות קלט */}
      {["name", "email", "studentName", "studentID", "username", "password"].map((field, index) => (
        <TextInput
          key={index}
          placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
          value={form[field]}
          onChangeText={(text) => setForm({ ...form, [field]: text })}
          secureTextEntry={field === "password"}
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
      ))}

      {/* 🔹 בחירת תפקיד */}
      <View style={styles.roleContainer}>
        {["הורה", "מורה"].map((roleOption) => (
          <TouchableOpacity
            key={roleOption}
            onPress={() => setForm({ ...form, role: roleOption })}
            style={[
              styles.roleButton,
              form.role === roleOption
                ? { backgroundColor: isDarkMode ? "#fff" : "black", borderColor: isDarkMode ? "#fff" : "black" }
                : styles.roleButtonUnselected,
            ]}
          >
            <Text style={{ color: form.role === roleOption ? (isDarkMode ? "#000" : "#fff") : (isDarkMode ? "#fff" : "#000") }}>
              {roleOption}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 🔹 כפתור הרשמה */}
      <TouchableOpacity style={styles.signupButton}>
        <Text style={styles.signupButtonText}>הרשמה</Text>
      </TouchableOpacity>

      {/* 🔹 מעבר למסך התחברות */}
      <TouchableOpacity onPress={() => router.push("/")} style={styles.backButton}>
        <Text style={[styles.backButtonText, { color: isDarkMode ? "#fff" : "#000" }]}>כבר יש לך חשבון? התחבר</Text>
      </TouchableOpacity>
    </View>
  );
};

// 🎨 **סגנונות**
const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 20 },
  lightContainer: { backgroundColor: "#fff" },
  darkContainer: { backgroundColor: "#000" },
  logo: { width: 120, height: 120, marginBottom: 15 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 5 },
  subtitle: { fontSize: 14, marginBottom: 20, textAlign: "center" },

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

  signupButton: {
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
  signupButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },

  backButton: { marginTop: 10 },
  backButtonText: { fontSize: 14, textDecorationLine: "underline" },
});

export default SignupScreen;
