import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, useColorScheme } from "react-native";
import { useRouter } from "expo-router";

const LoginScreen = () => {
  const [role, setRole] = useState("הורה"); // 👈 תיקון ברירת מחדל
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";
  const router = useRouter();

  return (
    <View style={[styles.container, isDarkMode ? styles.darkContainer : styles.lightContainer]}>
      {/* ✅ תיקון גודל הלוגו והוספת `resizeMode` */}
      <Image source={require("../assets/logo-studyS.png")} style={styles.logo} resizeMode="contain" />

      <Text style={[styles.title, isDarkMode ? styles.darkText : styles.lightText]}>Welcome Back !!</Text>

      <TextInput placeholder="Username" style={[styles.input, isDarkMode && styles.inputDark]} placeholderTextColor={isDarkMode ? "#ccc" : "#666"} />
      <TextInput placeholder="Password" secureTextEntry style={[styles.input, isDarkMode && styles.inputDark]} placeholderTextColor={isDarkMode ? "#ccc" : "#666"} />

      {/* ✅ תיקון סדר הכפתורים כך שמסומן נכון */}
      <View style={styles.roleContainer}>
  <TouchableOpacity
    onPress={() => setRole("הורה")}
    style={[styles.roleButton, role === "הורה" ? styles.roleButtonSelected : styles.roleButtonUnselected]} 
  >
    <Text style={[styles.roleText, role === "הורה" ? styles.roleTextSelected : styles.roleTextUnselected]}>
      הורה
    </Text>
  </TouchableOpacity>
  <TouchableOpacity
    onPress={() => setRole("מורה")}
    style={[styles.roleButton, role === "מורה" ? styles.roleButtonSelected : styles.roleButtonUnselected]} 
  >
    <Text style={[styles.roleText, role === "מורה" ? styles.roleTextSelected : styles.roleTextUnselected]}>
      מורה
    </Text>
  </TouchableOpacity>
</View>



      <TouchableOpacity style={styles.loginButton}>
        <Text style={styles.loginText}>התחברות</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.push("/ForgotPassword")}>
        <Text style={[styles.signupLink, isDarkMode ? styles.darkText : styles.lightText]}>שכחת סיסמה?</Text>
      </TouchableOpacity>


      {/* ✅ הוספת כפתור "הרשמה" מתחת ל-Forgot Password */}
      <TouchableOpacity onPress={() => router.push("/SignupScreen")}>
        <Text style={[styles.signupLink, isDarkMode ? styles.darkText : styles.lightText]}>הרשמה</Text>
      </TouchableOpacity>
    </View>
  );
};

// 🎨 **סגנונות מעודכנים**
const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 20 },
  lightContainer: { backgroundColor: "#fff" },
  darkContainer: { backgroundColor: "#000" },
  logo: { width: 150, height: 150, marginBottom: 20 }, // ✅ תיקון גודל הלוגו
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
  darkText: { color: "#fff" },
  lightText: { color: "#000" },
  input: { width: "100%", height: 50, borderWidth: 1, borderColor: "#ccc", borderRadius: 10, paddingHorizontal: 15, marginBottom: 10, backgroundColor: "#f9f9f9" },
  inputDark: { backgroundColor: "#333", borderColor: "#555" },
  roleContainer: { 
    flexDirection: "row", 
    justifyContent: "center", 
    marginBottom: 15 
  },
  roleButton: { 
    paddingVertical: 10, 
    paddingHorizontal: 20, 
    marginHorizontal: 5, 
    borderRadius: 10, 
    borderWidth: 1, // מוסיף קו שחור מסביב לכפתור
    borderColor: "black"
  },
  roleButtonSelected: { 
    backgroundColor: "#fff", // 👈 הכפתור שנבחר יהיה לבן
  },
  roleButtonUnselected: { 
    backgroundColor: "black", // 👈 הכפתור שלא נבחר יהיה שחור
  },
  roleText: {
    fontSize: 16,
  },
  roleTextSelected: { 
    color: "black", // 👈 טקסט שחור לכפתור שנבחר (כי הרקע לבן)
  },
  roleTextUnselected: { 
    color: "#fff", // 👈 טקסט לבן לכפתור שלא נבחר (כי הרקע שחור)
  },  
  loginButton: { backgroundColor: "black", paddingVertical: 15, width: "100%", alignItems: "center", borderRadius: 10, marginBottom: 10 },
  loginText: { color: "#fff", fontSize: 16 },
  forgotPassword: { fontSize: 14, marginBottom: 5 }, // ✅ קצת פחות רווח
  signupLink: { fontSize: 14, textDecorationLine: "underline" }, // ✅ עיצוב הרשמה כקישור
});

export default LoginScreen;
