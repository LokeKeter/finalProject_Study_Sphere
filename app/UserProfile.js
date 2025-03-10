import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage"; // ✅ Store user data
import { useRouter } from "expo-router";

const UserProfile = () => {
  const router = useRouter();
  const [user, setUser] = useState({ fullName: "", role: "", email: "", subject: "", description: "" });
  const [isEditing, setIsEditing] = useState(false); // ✅ State for edit mode
  const [sidebarVisible, setSidebarVisible] = useState(false); // ✅ Sidebar state
  const [currentTime, setCurrentTime] = useState(""); // ✅ Add missing currentTime

  // ✅ Fetch User Data from AsyncStorage
  useEffect(() => {
    const getUserData = async () => {
      const storedUser = await AsyncStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    };
    getUserData();
  }, []);

  // ✅ Update Current Time Every Second
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleString("he-IL", {
          weekday: "short",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        })
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // ✅ Save User Data
  const handleSave = async () => {
    await AsyncStorage.setItem("user", JSON.stringify(user));
    setIsEditing(false);
  };

  // ✅ Handle Logout (Clear Storage & Redirect)
  const handleLogout = async () => {
    await AsyncStorage.removeItem("user");
    router.push("/login");
  };

  return (
    <View style={styles.container}>
      {/* 🔹 TOP BAR */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => setSidebarVisible(true)} style={styles.menuButton}>
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>
        <Text style={styles.username}>👤 פרופיל משתמש</Text>
        <Text style={styles.dateTime}>{currentTime}</Text>
      </View>

      {/* 🔹 SIDEBAR MENU */}
      <Modal visible={sidebarVisible} animationType="slide" transparent>
        <View style={styles.sidebar}>
          <TouchableOpacity onPress={() => setSidebarVisible(false)}>
            <Text style={styles.closeButton}>✖ סגור</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.sidebarItem} onPress={() => { router.push("/dashboard"); setSidebarVisible(false); }}>
            <Text style={styles.sidebarText}>📊 כללי</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.sidebarItem} onPress={() => { router.push("/Homework"); setSidebarVisible(false); }}>
            <Text style={styles.sidebarText}>📚 שיעורי בית</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.sidebarItem} onPress={() => { router.push("/Classes"); setSidebarVisible(false); }}>
            <Text style={styles.sidebarText}>🏫 כיתות</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.sidebarItem} onPress={() => { router.push("/Contacts"); setSidebarVisible(false); }}>
            <Text style={styles.sidebarText}>👥 אנשי קשר</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.sidebarItem} onPress={() => { router.push("/Archive"); setSidebarVisible(false); }}>
            <Text style={styles.sidebarText}>📁 ארכיון</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.sidebarItem} onPress={() => { router.push("/"); setSidebarVisible(false); }}>
            <Text style={styles.sidebarText}>🚪 התנתקות</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* 🔹 User Info */}
      <View style={styles.userInfo}>
        <Text style={styles.label}>שם מלא:</Text>
        {isEditing ? (
          <TextInput style={styles.input} value={user.fullName} onChangeText={(text) => setUser({ ...user, fullName: text })} />
        ) : (
          <Text style={styles.value}>{user.fullName || "לא ידוע"}</Text>
        )}

        <Text style={styles.label}>תפקיד:</Text>
        <Text style={styles.value}>{user.role || "לא ידוע"}</Text>

        <Text style={styles.label}>📧 אימייל:</Text>
        {isEditing ? (
          <TextInput style={styles.input} value={user.email} onChangeText={(text) => setUser({ ...user, email: text })} />
        ) : (
          <Text style={styles.value}>{user.email || "לא הוזן"}</Text>
        )}

        <Text style={styles.label}>📚 מקצוע/כיתה:</Text>
        {isEditing ? (
          <TextInput style={styles.input} value={user.subject} onChangeText={(text) => setUser({ ...user, subject: text })} />
        ) : (
          <Text style={styles.value}>{user.subject || "לא הוזן"}</Text>
        )}

        <Text style={styles.label}>📖 תיאור קצר:</Text>
        {isEditing ? (
          <TextInput
            style={[styles.input, styles.textArea]}
            value={user.description}
            onChangeText={(text) => setUser({ ...user, description: text })}
            multiline
          />
        ) : (
          <Text style={styles.value}>{user.description || "לא הוזן"}</Text>
        )}
      </View>

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
      marginTop: 20, 
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
  });
  

export default UserProfile;
