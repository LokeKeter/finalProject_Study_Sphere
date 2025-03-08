import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
} from "react-native";
import { Picker } from "@react-native-picker/picker"; 
import { useRouter } from "expo-router"; // ✅ Import router

const classesData = [
  { id: "1", name: "כיתה א'", subjects: ["מתמטיקה", "אנגלית", "עברית"], hasHomework: false },
  { id: "2", name: "כיתה ב'", subjects: ["מתמטיקה", "מדעים", "היסטוריה"], hasHomework: false },
  { id: "3", name: "כיתה ג'", subjects: ["אנגלית", "מדעים", "גיאוגרפיה"], hasHomework: false },
];

const ClassesScreen = () => {
  const router = useRouter(); // ✅ Initialize router
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [homeworkStatus, setHomeworkStatus] = useState(null);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  // ⏳ Update current time every second
  useState(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleClassChange = (classId) => {
    const classObj = classesData.find((c) => c.id === classId);
    setSelectedClass(classObj);
    setSelectedSubject(null);
    setHomeworkStatus(classObj.hasHomework);
  };

  const handleSubjectChange = (subject) => {
    setSelectedSubject(subject);
  };

  const handleAction = (action) => {
    if (!selectedClass || !selectedSubject) {
      Alert.alert("שגיאה", "אנא בחר כיתה ומקצוע לפני ביצוע פעולה.");
      return;
    }

    let message = "";
    switch (action) {
      case "assign":
        setHomeworkStatus(true);
        message = `✅ שיעורי בית נשלחו למקצוע ${selectedSubject} בכיתה ${selectedClass.name}!`;
        break;
      case "delete":
        setHomeworkStatus(false);
        message = `🗑️ שיעורי הבית נמחקו עבור מקצוע ${selectedSubject} בכיתה ${selectedClass.name}!`;
        break;
      case "message":
        message = `📢 הודעה נשלחה לכיתה ${selectedClass.name} עבור מקצוע ${selectedSubject}!`;
        break;
      default:
        break;
    }

    Alert.alert("הצלחה", message);
  };

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

          <TouchableOpacity style={styles.sidebarItem} onPress={() => { router.push("/contacts"); setSidebarVisible(false); }}>
            <Text style={styles.sidebarText}>👥 אנשי קשר</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.sidebarItem} onPress={() => { router.push("/archive"); setSidebarVisible(false); }}>
            <Text style={styles.sidebarText}>📁 ארכיון</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.sidebarItem} onPress={() => { router.push("/"); setSidebarVisible(false); }}>
            <Text style={styles.sidebarText}>🚪 התנתקות</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      <Text style={styles.title}>ניהול שיעורי בית</Text>

      {/* 🔹 Dropdown לבחירת כיתה */}
      <Text style={styles.label}>בחר כיתה:</Text>
      <Picker
        selectedValue={selectedClass?.id || ""}
        onValueChange={(itemValue) => handleClassChange(itemValue)}
        style={styles.picker}
      >
        <Picker.Item label="בחר כיתה..." value="" />
        {classesData.map((classItem) => (
          <Picker.Item key={classItem.id} label={classItem.name} value={classItem.id} />
        ))}
      </Picker>

      {selectedClass && (
        <>
          <Text style={styles.label}>בחר מקצוע:</Text>
          <Picker
            selectedValue={selectedSubject}
            onValueChange={(itemValue) => handleSubjectChange(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="בחר מקצוע..." value="" />
            {selectedClass.subjects.map((subject, index) => (
              <Picker.Item key={index} label={subject} value={subject} />
            ))}
          </Picker>
        </>
      )}

      {selectedSubject && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.actionButton} onPress={() => handleAction("assign")}>
            <Text style={styles.actionButtonText}>📚 שליחת שיעורי בית</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteButton} onPress={() => handleAction("delete")}>
            <Text style={styles.actionButtonText}>🗑️ מחיקת שיעורי בית</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.messageButton} onPress={() => handleAction("message")}>
            <Text style={styles.actionButtonText}>📢 שליחת הודעה לכיתה</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

// 🎨 **Styles**
const styles = StyleSheet.create({
   // 🔹 TOP BAR
   topBar: {
    height: 115,
    backgroundColor: "black",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingTop: 55,
  },
  menuButton: { padding: 10 },
  menuIcon: { color: "white", fontSize: 26 },
  username: { color: "white", fontSize: 18, fontWeight: "bold" },
  dateTime: { color: "white", fontSize: 16, fontWeight: "bold" },

  // 🔹 SIDEBAR
  sidebar: { position: "absolute", left: -45, width: 225, height: "100%", backgroundColor: "black", padding: 60 },
  closeButton: { color: "white", fontSize: 20, marginBottom: 20 },
  sidebarItem: { paddingVertical: 15 },
  sidebarText: { color: "white", fontSize: 18 },
});

export default ClassesScreen;
