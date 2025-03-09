import React, { useState, useEffect } from "react"; // ✅ Added useEffect
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TextInput,
  Modal, 
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router"; 
import { useNavigation } from "@react-navigation/native";

const classesData = [
  { id: "1", name: "כיתה א'" },
  { id: "2", name: "כיתה ב'" },
  { id: "3", name: "כיתה ג'" },
];

const parentsData = [
  { id: "1", parentName: "יוסי כהן", studentName: "דנה כהן", classId: "1" },
  { id: "2", parentName: "רונית לוי", studentName: "איתי לוי", classId: "2" },
  { id: "3", parentName: "משה ישראלי", studentName: "נועה ישראלי", classId: "1" },
  { id: "4", parentName: "שרה דויד", studentName: "עומר דויד", classId: "3" },
];

const ContactsScreen = () => {
  const router = useRouter(); 
  const [selectedClass, setSelectedClass] = useState(classesData[0].id);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeParentId, setActiveParentId] = useState(null);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString()); // ✅ Added current time

  // ⏳ ✅ Update time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      
      {/* 🔹 TOP BAR */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => setSidebarVisible(true)} style={styles.menuButton}>
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>
        <Text style={styles.username}>👤 מורה</Text>
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

      <Text style={styles.title}>אנשי קשר</Text>

      {/* 🔹 Class Picker */}
      <Picker
        selectedValue={selectedClass}
        onValueChange={(itemValue) => setSelectedClass(itemValue)}
        style={styles.picker}
      >
        {classesData.map((classItem) => (
          <Picker.Item key={classItem.id} label={classItem.name} value={classItem.id} />
        ))}
      </Picker>

      {/* 🔹 Search Input */}
      <TextInput
        style={styles.searchInput}
        placeholder="🔍 חפש לפי שם הורה או תלמיד"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {/* 🔹 Table */}
      <ScrollView>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.headerCell}>שם ההורה</Text>
            <Text style={styles.headerCell}>שם התלמיד</Text>
            <Text style={styles.headerCell}>פעולה</Text>
          </View>

          {parentsData.map((parent) => (
            <View key={parent.id} style={styles.tableRow}>
              <Text style={styles.cell}>{parent.parentName}</Text>
              <Text style={styles.cell}>{parent.studentName}</Text>

              <View style={styles.cell}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => setActiveParentId(activeParentId === parent.id ? null : parent.id)}
                >
                  <Text style={styles.actionButtonText}>⋮</Text>
                </TouchableOpacity>

                {activeParentId === parent.id && (
                  <View style={styles.dropdownMenu}>
                    <TouchableOpacity onPress={() => handleAction(parent.id, "message")}>
                      <Text style={styles.menuItem}>✉️ כתיבת מכתב</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleAction(parent.id, "meeting")}>
                      <Text style={styles.menuItem}>📅 קביעת פגישה</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleAction(parent.id, "approve")}>
                      <Text style={styles.menuItem}>✅ אישור לחתימה</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleAction(parent.id, "reject")}>
                      <Text style={styles.menuItem}>❌ דחיית פגישה</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

// 🎨 **Updated Styles**
const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 85, backgroundColor: "#F4F4F4" },

  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 85,
    backgroundColor: "black",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingTop: 30,
  },
    // 🔹 SIDEBAR
    sidebar: { position: "absolute", left: -45, width: 225, height: "100%", backgroundColor: "black", padding: 60 },
    closeButton: { color: "white", fontSize: 20, marginBottom: 20 },
    sidebarItem: { paddingVertical: 15 },
    sidebarText: { color: "white", fontSize: 18 },

  menuButton: { padding: 10 },
  menuIcon: { color: "white", fontSize: 26 },
  username: { color: "white", fontSize: 18, fontWeight: "bold" },
  dateTime: { color: "white", fontSize: 16, fontWeight: "bold" },
});

export default ContactsScreen;
