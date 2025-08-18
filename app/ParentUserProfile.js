import React, { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";  // ✅ Use Picker for dropdowns
import {
    View,
    Text,
    FlatList,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Modal,
  } from "react-native";
import TopSidebar from '../components/TopSidebar';
import { API_BASE_URL } from '../config';

export default function ParentUserProfile() {
  const [fullName, setFullName] = useState("");
  const [studentName, setStudentName] = useState("");
  const [email, setEmail] = useState("");
  const [currentTime, setCurrentTime] = useState(getFormattedDateTime());

  //Load user data on component mount
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          console.log('📥 Loading parent profile data:', userData);
          
          setFullName(userData.fullName || "");
          setEmail(userData.parentEmail || userData.email || "");
          setStudentName(userData.studentName || "");
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };
    
    loadUserData();
  }, []);


    useEffect(() => {
      const interval = setInterval(() => {
        setCurrentTime(getFormattedDateTime());
      }, 1000);
      return () => clearInterval(interval);
    }, []);
  
    function getFormattedDateTime() {
      const now = new Date();
      return now.toLocaleString("he-IL", {
        weekday: "short",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });
    }

  const handleSave = async () => {
    try {
      if (!email.includes("@") || !email.includes(".")) {
        alert("Please enter a valid email address.");
        return;
      }

      const token = await AsyncStorage.getItem("token");

      const res = await fetch(`${API_BASE_URL}/api/users/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fullName: (fullName || "").trim(),
          email: (email || "").trim(),
          studentName: (studentName || "").trim(), // להורה
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Update failed");
      }

      // שמירת השינויים ל־AsyncStorage כדי שכל האפליקציה תראה את העדכון
      if (data.user) {
        await AsyncStorage.setItem("user", JSON.stringify(data.user));
        setFullName(data.user.fullName || "");
        setEmail(data.user.email || "");
        setStudentName(data.user.studentName || "");
      }
      if (data.token) {
        await AsyncStorage.setItem("token", data.token);
      }

      alert("Profile saved successfully!");
    } catch (e) {
      alert(`Error: ${e.message}`);
    }
  };

  return (
    <View style={styles.container}>

      {/* top and side bar */}
          <TopSidebar userRole="parent" />
        
     

      <Text style={styles.label}>שם מלא</Text>
      <TextInput value={fullName} onChangeText={setFullName} style={styles.input} />

      <Text style={styles.label}>שם התלמיד</Text>
      <TextInput value={studentName} onChangeText={setStudentName} style={styles.input} />

      <Text style={styles.label}>מייל</Text>
      <TextInput value={email} onChangeText={setEmail} style={styles.input} keyboardType="email-address" />



      <TouchableOpacity onPress={handleSave} style={styles.button}>
        <Text style={styles.buttonText}>Save Changes</Text>
      </TouchableOpacity>
    </View>
  );
}
const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        padding: 20, 
        paddingTop: 100, // Add space below the top bar
        backgroundColor: "#fff",
      },
      

    label: { fontSize: 16, fontWeight: "bold", marginBottom: 5 },
    input: { borderWidth: 1, borderColor: "#ddd", padding: 10, borderRadius: 5, margin: 15, fontSize: 16 },
    button: { backgroundColor: "black", padding: 12, borderRadius: 5, alignItems: "center", marginTop: 10 },
    buttonText: { color: "white", fontWeight: "bold", fontSize: 16 },
  
    // 🔹 TOP BAR
    topBar: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: 80,
      backgroundColor: "black",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 15,
      paddingTop: 30,
      marginBottom:50,
    },
  
    sidebarHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      width: "100%",
      paddingBottom: 10,
      borderBottomWidth: 1,
      borderBottomColor: "#fff",
      paddingHorizontal: 5,
    },
    menuButton: { padding: 4 },
    menuIcon: { color: "white", fontSize: 26 },
    dateTime: { color: "white", fontSize: 16, fontWeight: "bold" },
  
    modalBackground: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)" },
    sidebar: { position: "absolute", left: 0, width: 250, height: "100%", backgroundColor: "black", padding: 50 },
  
    closeButton: {
      color: "white",
      fontSize: 22,
      fontWeight: "bold",
    },
    sidebarItem: { paddingVertical: 15 },
    sidebarText: { color: "white", fontSize: 18 },
  });
  