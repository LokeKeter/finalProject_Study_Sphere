import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage"; // ✅ Store user data
import { useRouter } from "expo-router";
import TopSidebar from "../components/TopSidebar";
import { API_BASE_URL } from "../config";
import { getUserFromToken, verifyTokenFields } from "./utils/tokenUtils"; // ✅ JWT utilities

const UserProfile = () => {
  const router = useRouter();
  const [user, setUser] = useState({ fullName: "", studentName: "", parentEmail: "", role: "", subject: "", description: "" });
  const [isEditing, setIsEditing] = useState(false); // ✅ State for edit mode
  const [tokenData, setTokenData] = useState(null); // ✅ For demonstrating token decoding

  // ✅ Fetch User Data from AsyncStorage and Token
  useEffect(() => {
    const getUserData = async () => {
      // Get data from AsyncStorage (traditional way)
      const storedUser = await AsyncStorage.getItem("user");
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        console.log('📥 Stored user data:', parsed);
        setUser({
          fullName: parsed.fullName ?? "",
          studentName: parsed.studentName ?? "",
          parentEmail: parsed.parentEmail ?? parsed.email ?? "",
          role: parsed.role ?? "",
          subject: parsed.subject ?? "",
          description: parsed.description ?? ""
        });
      }

      // ✅ Demonstrate token decoding
      const tokenUser = await getUserFromToken();
      const verification = await verifyTokenFields();
      
      setTokenData({
        fromToken: tokenUser,
        verification: verification
      });

      console.log('🔍 Token Verification Results:', verification);
      console.log('👤 User data from token:', tokenUser);
      
      // 🐞 Debug: Show what's actually stored vs what token contains
      console.log('🔍 Debugging data sources:');
      console.log('  AsyncStorage user:', storedUser ? JSON.parse(storedUser) : 'none');
      console.log('  Token user:', tokenUser);
      
      // If we have token data but not stored data, update from token
      if (tokenUser && (!storedUser || !JSON.parse(storedUser).fullName)) {
        console.log('🔄 Using token data as fallback');
        setUser({
          fullName: tokenUser.fullName ?? "",
          studentName: "", // studentName not in basic token
          parentEmail: tokenUser.email ?? "",
          role: tokenUser.role ?? "",
          subject: "", // Subject not in token, keep existing
          description: "" // Description not in token, keep existing
        });
      }
    };
    getUserData();
  }, []);

  // ✅ Save User Data
  const handleSave = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const storedUser = await AsyncStorage.getItem('user');
      const parsedUser = JSON.parse(storedUser);
      const userId = parsedUser.id || parsedUser._id;
      const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: user.fullName,
          studentName: user.studentName,
          email: user.parentEmail,
          subject: user.subject
        })
      });

      const updatedUser = await response.json();

      // שמור את המשתמש המעודכן
      const userDataToStore = {
        id: updatedUser.id || updatedUser._id,
        fullName: updatedUser.name || user.fullName,
        studentName: updatedUser.studentName || user.studentName,
        parentEmail: updatedUser.email || user.parentEmail,
        email: updatedUser.email || user.parentEmail,
        role: updatedUser.role || user.role,
        subject: updatedUser.subject || user.subject
      };
      
      await AsyncStorage.setItem("user", JSON.stringify(userDataToStore));
      
      // Update local state to reflect changes immediately
      setUser({
        fullName: userDataToStore.fullName,
        studentName: userDataToStore.studentName,
        parentEmail: userDataToStore.parentEmail,
        role: userDataToStore.role,
        subject: userDataToStore.subject,
        description: user.description // Keep description from current state
      });
      
      setIsEditing(false);
      console.log('✅ Profile updated successfully:', userDataToStore);
    } catch (error) {
      console.error("שגיאה בעדכון פרטי המשתמש", error);
    }
  };


  // ✅ Handle Logout (Clear Storage & Redirect)
  const handleLogout = async () => {
    await AsyncStorage.removeItem("user");
    router.push("/");
  };

    return (
      <View style={styles.container}>

        {/* top and side bar */}
          <TopSidebar userRole="teacher" />

      {/* 🔹 User Info */}
      <View style={styles.userInfo}>
        <Text style={styles.label}>שם מלא:</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={user.fullName}
              onChangeText={(text) => setUser({ ...user, fullName: text })}
            />
          ) : (
            <Text style={styles.value}>{user.fullName || "לא ידוע"}</Text>
          )}

        {user.role === 'parent' && (
          <>
            <Text style={styles.label}>שם התלמיד:</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={user.studentName}
                onChangeText={(text) => setUser({ ...user, studentName: text })}
              />
            ) : (
              <Text style={styles.value}>{user.studentName || "לא הוזן"}</Text>
            )}
          </>
        )}

        <Text style={styles.label}>תפקיד:</Text>
        <Text style={styles.value}>{user.role || "לא ידוע"}</Text>

        <Text style={styles.label}>📧 אימייל:</Text>
        {isEditing ? (
          <TextInput style={styles.input} value={user.parentEmail} onChangeText={(text) => setUser({ ...user, parentEmail: text })} />
        ) : (
          <Text style={styles.value}>{user.parentEmail || "לא הוזן"}</Text>
        )}

        <Text style={styles.label}>📚 מקצוע:</Text>
        {isEditing ? (
          <TextInput style={styles.input} value={user.subject} onChangeText={(text) => setUser({ ...user, subject: text })} />
        ) : (
          <Text style={styles.value}>{user.subject || "לא הוזן"}</Text>
        )}
      </View>

      {/* ✅ JWT Token Verification Display (for testing) */}
      {tokenData && (
        <View style={styles.tokenSection}>
          <Text style={styles.sectionTitle}>🔐 JWT Token Verification</Text>
          <Text style={styles.tokenLabel}>Token Valid: {tokenData.verification.valid ? '✅' : '❌'}</Text>
          
                      {tokenData.fromToken && (
              <View style={styles.tokenData}>
                <Text style={styles.tokenLabel}>From Token:</Text>
                <Text style={styles.tokenValue}>ID: {tokenData.fromToken.id}</Text>
                <Text style={styles.tokenValue}>Full Name: {tokenData.fromToken.fullName}</Text>
                <Text style={styles.tokenValue}>Email: {tokenData.fromToken.email}</Text>
                <Text style={styles.tokenValue}>Role: {tokenData.fromToken.role}</Text>
              </View>
            )}
          
          {!tokenData.verification.valid && (
            <Text style={styles.tokenError}>Missing: {tokenData.verification.missing.join(', ')}</Text>
          )}
        </View>
      )}

      {/* 🔹 Edit & Save Buttons */}
      {!isEditing ? (
        <TouchableOpacity onPress={() => setIsEditing(true)} style={styles.editButton}>
          <Text style={styles.editText}>✏️ ערוך פרטים</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
          <Text style={styles.saveText}>💾 שמור שינויים</Text>
        </TouchableOpacity>
      )}

      {/* 🔹 Logout Button */}
      <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
        <Text style={styles.logoutText}>🚪 התנתקות</Text>
      </TouchableOpacity>
    </View>
  );
};

// 🎨 **Styles**
const styles = StyleSheet.create({
    userInfo: { 
      width: "100%", 
      marginTop: 0, 
      padding: 20, 
      backgroundColor: "#FFF", 
      borderRadius: 10 
    },
    
    label: { 
      fontSize: 18, 
      fontWeight: "bold", 
      color: "#333", 
      marginTop: 10,
      textAlign: "right", // ✅ Align labels to the right
    },
  
    value: { 
      fontSize: 18, 
      color: "#666", 
      marginBottom: 10,
      textAlign: "right", // ✅ Align values to the right
    },
  
    input: { 
      fontSize: 18, 
      borderWidth: 1, 
      borderColor: "#ddd", 
      padding: 10, 
      borderRadius: 5, 
      marginBottom: 10,
      textAlign: "right", // ✅ Align input text to the right
    },
  
    textArea: { 
      height: 60, 
      textAlignVertical: "top",
      textAlign: "right", // ✅ Align multi-line input to the right
    },
  
    editButton: { 
      marginTop: 20, 
      padding: 15, 
      backgroundColor: "black", 
      borderRadius: 5 
    },
    editText: { 
      fontSize: 18, 
      color: "white", 
      fontWeight: "bold",
      textAlign: "center" // ✅ Keep button text centered
    },
  
    saveButton: { 
      marginTop: 20, 
      padding: 15, 
      backgroundColor: "green", 
      borderRadius: 5 
    },
    saveText: { 
      fontSize: 18, 
      color: "white", 
      fontWeight: "bold",
      textAlign: "center" // ✅ Keep button text centered
    },
  
    logoutButton: { 
      marginTop: 30, 
      padding: 15, 
      backgroundColor: "red", 
      borderRadius: 5 
    },
    logoutText: { 
      fontSize: 18, 
      color: "white", 
      fontWeight: "bold",
      textAlign: "center" // ✅ Keep button text centered
    },
  container: { flex: 1, paddingTop: 85, backgroundColor: "#F4F4F4" },
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
  },

  sidebarHeader: {
    flexDirection: "row", 
    justifyContent: "space-between", // מרווח בין שם המשתמש לכפתור הסגירה
    alignItems: "center",
    width: "100%",
    paddingBottom: 10,
    borderBottomWidth: 1, 
    borderBottomColor: "#fff", 
    paddingHorizontal: 5, // מרווח פנימי מהצדדים
  },
  menuButton: { padding: 4 },
  menuIcon: { color: "white", fontSize: 26 },
  username: { color: "white", fontSize: 18, fontWeight: "bold" },
  dateTime: { color: "white", fontSize: 16, fontWeight: "bold" },

  modalBackground: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)" },
  sidebar: { position: "absolute", left: 0, width: 250, height: "100%", backgroundColor: "black", padding: 50 },
  sidebarUser: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 15, 
  },
  
  closeButton: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
  },
  sidebarItem: { paddingVertical: 15 },
  sidebarText: { color: "white", fontSize: 18 },


  
  headerContainer: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginVertical: 10 },
  headerText: { fontSize: 18, fontWeight: "bold" },
  arrow: { fontSize: 22, paddingHorizontal: 10 },
  table: { backgroundColor: "#fff", borderRadius: 10, padding: 10, marginTop: 10 },
  tableHeader: { flexDirection: "row", backgroundColor: "#ddd", padding: 10, borderRadius: 5 },
  headerCell: { flex: 1, fontWeight: "bold", textAlign: "center" },

  tableRow: {
    flexDirection: "row", // ✅ סידור שורות לרוחב
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    paddingVertical: 10,
    alignItems: "center",
  },
  cell: { flex: 1, textAlign: "center" },

  switchContainer: { flex: 1, alignItems: "center" }, // ✅ סידור הכפתורים

  updateButton: {
    backgroundColor: "black",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 20,
    marginTop: 20,
  },
  updateButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
    closeButton: { color: "white", fontSize: 20, marginBottom: 20 },
    sidebarItem: { paddingVertical: 15 },
    sidebarText: { color: "white", fontSize: 18 },
    
    // ✅ JWT Token Verification Styles
    tokenSection: {
      backgroundColor: "#f0f8ff",
      borderRadius: 10,
      padding: 15,
      marginVertical: 10,
      borderWidth: 1,
      borderColor: "#007AFF",
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: "bold",
      marginBottom: 10,
      color: "#007AFF",
    },
    tokenData: {
      backgroundColor: "#fff",
      padding: 10,
      borderRadius: 5,
      marginTop: 5,
    },
    tokenLabel: {
      fontSize: 14,
      fontWeight: "bold",
      marginBottom: 5,
      color: "#333",
    },
    tokenValue: {
      fontSize: 13,
      color: "#666",
      marginLeft: 10,
      marginBottom: 3,
    },
    tokenError: {
      fontSize: 12,
      color: "#FF3B30",
      fontStyle: "italic",
      marginTop: 5,
    },
  });
  

export default UserProfile;
