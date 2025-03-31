import React, { useState, useEffect } from "react";

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

export default function ParentUserProfile() {
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [relationship, setRelationship] = useState("");
  const [email, setEmail] = useState("");
  const [currentTime, setCurrentTime] = useState(getFormattedDateTime());
  const [sidebarVisible, setSidebarVisible] = useState(false);


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

  const handleSave = () => {
    if (!email.includes("@") || !email.includes(".")) {
      alert("Please enter a valid email address.");
      return;
    }
    alert("Profile saved successfully!");
  };

  return (
    <View style={styles.container}>
          {/* 🔹 TOP BAR */}
                    <View style={styles.topBar}>
                      <TouchableOpacity onPress={() => setSidebarVisible(true)} style={styles.menuButton}>
                        <Text style={styles.menuIcon}>☰</Text>
                      </TouchableOpacity>
                      <Text style={styles.dateTime}>{currentTime}</Text>
                    </View>
              
                    {/* 🔹 SIDEBAR MENU */}
                    <Modal visible={sidebarVisible} animationType="slide" transparent>
                      <View style={styles.modalBackground}>
                        <View style={styles.sidebar}>
                          <View style={styles.sidebarHeader}>
                          {/* Navigate to ParentUserProfile Page */}
                          <TouchableOpacity style={styles.sidebarItem} onPress={() => { router.push("/ParentUserProfile"); setSidebarVisible(false); }}>
                            <Text style={styles.sidebarText}>👤 פרופיל הורה</Text>
                          </TouchableOpacity>
                            <TouchableOpacity onPress={() => setSidebarVisible(false)}>
                              <Text style={styles.closeButton}>✖</Text>
                            </TouchableOpacity>
                          </View>
              
              
                          <TouchableOpacity style={styles.sidebarItem} onPress={() => { router.push("/Parent-Dashboard"); setSidebarVisible(false); }}>
                            <Text style={styles.sidebarText}>📊 כללי</Text>
                          </TouchableOpacity>
              
                          <TouchableOpacity style={styles.sidebarItem} onPress={() => { router.push("/Parent-Homework"); setSidebarVisible(false); }}>
                            <Text style={styles.sidebarText}>📚 שיעורי בית</Text>
                          </TouchableOpacity>
              
                          <TouchableOpacity style={styles.sidebarItem} onPress={() => { router.push("/Parent-Contacts"); setSidebarVisible(false); }}>
                            <Text style={styles.sidebarText}>👥 אנשי קשר</Text>
                          </TouchableOpacity>
              
                          <TouchableOpacity style={styles.sidebarItem} onPress={() => { router.push("/Parent-Archive"); setSidebarVisible(false); }}>
                            <Text style={styles.sidebarText}>📁 ארכיון</Text>
                          </TouchableOpacity>
              
                          <TouchableOpacity style={styles.sidebarItem} onPress={() => { router.push("/"); setSidebarVisible(false); }}>
                            <Text style={styles.sidebarText}>🚪 התנתקות</Text>
                          </TouchableOpacity>
              

                        </View>
                      </View>
                    </Modal>
        
     

      <Text style={styles.label}>שם מלא</Text>
      <TextInput value={fullName} onChangeText={setFullName} style={styles.input} />

      <Text style={styles.label}>טלפון</Text>
      <TextInput value={phoneNumber} onChangeText={setPhoneNumber} style={styles.input} keyboardType="phone-pad" />

      <Text style={styles.label}>מייל</Text>
      <TextInput value={email} onChangeText={setEmail} style={styles.input} keyboardType="email-address" />

      <Text style={styles.label}>בן או בת זוג</Text>
      <Picker selectedValue={relationship} onValueChange={setRelationship} style={styles.input}>
        <Picker.Item label="Mother" value="Mother" />
        <Picker.Item label="Father" value="Father" />
        <Picker.Item label="Guardian" value="Guardian" />
      </Picker>

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
  