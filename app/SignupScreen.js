import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, useColorScheme } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "./_layout"; // ✅ Import authentication hook
import AsyncStorage from "@react-native-async-storage/async-storage"; // ✅ Import storage
import axios from 'axios';
import Toast from 'react-native-toast-message';
import { API_BASE_URL } from "../config";

const SignupScreen = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    studentName: "",
    studentId: "",
    username: "",
    password: "",
    grade:"",
    role: "הורה", // ברירת מחדל
  });

  const [errors, setErrors] = useState({});
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";
  const router = useRouter();
  const { setIsLoggedIn } = useAuth(); // ✅ Authentication Context

 const handleSignup = async () => {
  try {
    console.log('🔍 Current form state:', form);
    
    const payload = {
      name: form.name,
      email: form.email,
      username: form.username,
      password: form.password,
      role: form.role === "מורה" ? "teacher" : "parent",
    };

    // ✅ Add student info ONLY if role is "הורה"
    console.log('🔍 Checking parent condition:', {
      formRole: form.role,
      isParent: form.role === "הורה",
      studentName: form.studentName,
      studentId: form.studentId,
      grade: form.grade
    });
    
    if (form.role === "הורה") {
      payload.studentName = form.studentName;
      payload.studentId = form.studentId;
      payload.grade = form.grade;
      console.log('✅ Added student data to payload');
    } else {
      console.log('❌ Parent condition not met, student data not added');
    }

    console.log('📤 Sending registration payload:', payload);
    const response = await axios.post(`${API_BASE_URL}/api/users/register`, payload);
    console.log('✅ Registration response:', response.data);

    // ✅ Handle token response from registration
    const { token, user } = response.data;
    if (token && user) {
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('user', JSON.stringify(user));
      setIsLoggedIn(true);

      Toast.show({
        type: "success",
        text1: "נרשמת בהצלחה 🎉",
        text2: "מועבר לדשבורד..."
      });

      // Redirect based on role
      if (user.role === 'teacher') {
        router.push('/dashboard');
      } else if (user.role === 'parent') {
        router.push('/Parent-Dashboard');
      } else if (user.role === 'admin') {
        router.push('/Admin-Users');
      }
    } else {
      Toast.show({
        type: "success",
        text1: "נרשמת בהצלחה 🎉",
        text2: "עבור להתחברות"
      });
      router.push("/");
    }

    setErrors({});
  } catch (error) {
      console.error('❌ Registration error:', error);
      console.error('❌ Error response:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
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
      value={form.studentId}
      onChangeText={(text) => setForm({ ...form, studentId: text })}
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

    {/* 🔹 שדות תלמיד - רק אם נבחר הורה */}
    {form.role === "הורה" && (
      <View style={[
        styles.studentFieldsContainer,
        { 
          backgroundColor: isDarkMode ? "#333" : "#fff",
          borderColor: isDarkMode ? "#fff" : "#000"
        }
      ]}>
        <Text style={[styles.sectionTitle, { color: isDarkMode ? "#fff" : "#000" }]}>פרטי התלמיד</Text>
        
        <TextInput
          placeholder="שם התלמיד"
          value={form.studentName}
          onChangeText={(text) => setForm({ ...form, studentName: text })}
          style={[styles.input, { backgroundColor: isDarkMode ? "#333" : "#fff", color: isDarkMode ? "#fff" : "#000", borderColor: isDarkMode ? "#fff" : "#000" }]}
          placeholderTextColor={isDarkMode ? "#ccc" : "#666"}
        />
        
        <TextInput
          placeholder="תעודת זהות של התלמיד"
          value={form.studentId}
          onChangeText={(text) => setForm({ ...form, studentId: text })}
          style={[styles.input, { backgroundColor: isDarkMode ? "#333" : "#fff", color: isDarkMode ? "#fff" : "#000", borderColor: isDarkMode ? "#fff" : "#000" }]}
          placeholderTextColor={isDarkMode ? "#ccc" : "#666"}
          keyboardType="numeric"
        />
        
        <Text style={[styles.label, { color: isDarkMode ? "#fff" : "#000" }]}>בחר שכבה:</Text>
        <View style={styles.gradeContainer}>
          {["א", "ב", "ג", "ד", "ה", "ו", "ז", "ח", "ט", "י", "יא", "יב"].map((gradeOption) => (
            <TouchableOpacity
              key={gradeOption}
              onPress={() => setForm({ ...form, grade: gradeOption })}
              style={[
                styles.gradeButton,
                { 
                  backgroundColor: form.grade === gradeOption ? (isDarkMode ? "#fff" : "black") : "transparent",
                  borderColor: isDarkMode ? "#fff" : "#000"
                }
              ]}
            >
              <Text style={{ 
                color: form.grade === gradeOption ? (isDarkMode ? "#000" : "#fff") : (isDarkMode ? "#fff" : "#000"),
                fontSize: 14,
                fontWeight: form.grade === gradeOption ? "bold" : "normal"
              }}>
                {gradeOption}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    )}

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

  // New styles for student fields
  studentFieldsContainer: {
    width: "85%",
    maxWidth: 400,
    marginTop: 20,
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  label: {
    fontSize: 14,
    marginBottom: 5,
    marginTop: 10,
  },
  gradeContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: 5,
  },
  gradeButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    borderWidth: 1,
    marginHorizontal: 5,
    marginVertical: 5,
  },
});

export default SignupScreen;
