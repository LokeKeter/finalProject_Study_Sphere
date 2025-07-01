import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, useColorScheme } from "react-native";
import { useRouter } from "expo-router";
import axios from 'axios';
import Toast from 'react-native-toast-message';
import { API_BASE_URL } from "../config";

const SignupScreen = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    studentName: "",
    studentID: "",
    username: "",
    password: "",
    grade:"",
    role: "הורה", // ברירת מחדל
  });

  const [errors, setErrors] = useState({});
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";
  const router = useRouter();

 const handleSignup = async () => {
  try {
    const payload = {
      name: form.name,
      email: form.email,
      username: form.username,
      password: form.password,
      role: form.role === "מורה" ? "teacher" : "parent",
    };

    // ✅ Add student info ONLY if role is "הורה"
    if (form.role === "הורה") {
      payload.studentName = form.studentName;
      payload.studentId = form.studentID;
      payload.grade = form.grade;
    }

    const response = await axios.post(`${API_BASE_URL}/api/users/register`, payload);

    Toast.show({
      type: "success",
      text1: "נרשמת בהצלחה 🎉",
    });

    setErrors({});
    router.push("/");
  } catch (error) {
      const serverErrors = error.response?.data?.errors;

      if (serverErrors && Array.isArray(serverErrors)) {
        // הצגת כל השגיאות ב־Toast אחד
        const combinedMessage = serverErrors.map((err) => `• ${err.msg}`).join("\n");

        Toast.show({
          type: "error",
          text2: combinedMessage,
          autoHide: false, // אפשרי אם אתה רוצה שהשגיאה תישאר עד שהמשתמש יסגור אותה
        });

        // ניתן עדיין לשמור את השגיאות למקרה שתרצה להציג גם על השדות
        const formatted = {};
        for (const err of serverErrors) {
          formatted[err.param] = err.msg;
        }
        setErrors(formatted);
      } else {
          Toast.show({
            type: "error",
            text2: error.response?.data?.error || "נסה שוב מאוחר יותר",
          });
        }
    }
};


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
<TextInput
  placeholder="Name"
  value={form.name}
  onChangeText={(text) => setForm({ ...form, name: text })}
  style={[
      styles.input,
      {
        backgroundColor: isDarkMode ? "#333" : "#fff",
        color: isDarkMode ? "#fff" : "#000",
      },
    ]}
  placeholderTextColor={isDarkMode ? "#ccc" : "#666"}
/>

<TextInput
  placeholder="Email"
  value={form.email}
  onChangeText={(text) => setForm({ ...form, email: text })}
  style={[
      styles.input,
      {
        backgroundColor: isDarkMode ? "#333" : "#fff",
        color: isDarkMode ? "#fff" : "#000",
      },
    ]}
    placeholderTextColor={isDarkMode ? "#ccc" : "#666"}
/>

{/* 👇 Only show these if role is "הורה" (parent) */}
{form.role === "הורה" && (
  <>
    <TextInput
      placeholder="Student Name"
      value={form.studentName}
      onChangeText={(text) => setForm({ ...form, studentName: text })}
      style={[styles.input, { backgroundColor: isDarkMode ? "#333" : "#fff", color: isDarkMode ? "#fff" : "#000", borderColor: isDarkMode ? "#fff" : "#000" }]}
      placeholderTextColor={isDarkMode ? "#ccc" : "#666"}
    />
    <TextInput
      placeholder="Grade"
      value={form.grade}
      onChangeText={(text) => setForm({ ...form, grade: text })}
      style={[
          styles.input,
          {
            backgroundColor: isDarkMode ? "#333" : "#fff",
            color: isDarkMode ? "#fff" : "#000",
          },
      ]}
      placeholderTextColor={isDarkMode ? "#ccc" : "#666"}
    />

    <TextInput
      placeholder="Student ID"
      value={form.studentID}
      onChangeText={(text) => setForm({ ...form, studentID: text })}
      style={[styles.input, { backgroundColor: isDarkMode ? "#333" : "#fff", color: isDarkMode ? "#fff" : "#000", borderColor: isDarkMode ? "#fff" : "#000" }]}
      placeholderTextColor={isDarkMode ? "#ccc" : "#666"}
    />
  </>
)}

<TextInput
  placeholder="Username"
  value={form.username}
  onChangeText={(text) => setForm({ ...form, username: text })}
  style={[styles.input, { backgroundColor: isDarkMode ? "#333" : "#fff", color: isDarkMode ? "#fff" : "#000", borderColor: isDarkMode ? "#fff" : "#000" }]}
  placeholderTextColor={isDarkMode ? "#ccc" : "#666"}
/>

<TextInput
  placeholder="Password"
  value={form.password}
  onChangeText={(text) => setForm({ ...form, password: text })}
  secureTextEntry
  style={[styles.input, { backgroundColor: isDarkMode ? "#333" : "#fff", color: isDarkMode ? "#fff" : "#000", borderColor: isDarkMode ? "#fff" : "#000" }]}
  placeholderTextColor={isDarkMode ? "#ccc" : "#666"}
/>


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
      <TouchableOpacity style={styles.signupButton} onPress={handleSignup}>
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

  errorText: {
  color: "red",
  fontSize: 12,
  marginTop: -5,
  marginBottom: 8,
  textAlign: "right",
},

  backButton: { marginTop: 10 },
  backButtonText: { fontSize: 14, textDecorationLine: "underline" },
});

export default SignupScreen;
