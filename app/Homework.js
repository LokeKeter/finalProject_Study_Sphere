import React, { useState } from "react";
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  StyleSheet, 
  Alert, 
  Modal 
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router"; // ✅ Import router

const classes = [
  { id: "1", name: "כיתה א'", subjects: ["מתמטיקה", "אנגלית", "עברית"] },
  { id: "2", name: "כיתה ב'", subjects: ["מתמטיקה", "מדעים", "היסטוריה"] },
  { id: "3", name: "כיתה ג'", subjects: ["אנגלית", "מדעים", "גיאוגרפיה"] },
];

const studentsData = [
  { id: "122345678", username: "001", fullName: "יוסי כהן", hasHomework: false, present: true },
  { id: "112345678", username: "002", fullName: "דנה לוי", hasHomework: true, present: false },
  { id: "111234567", username: "003", fullName: "אבי ישראלי", hasHomework: false, present: true },
];

const HomeworkScreen = () => {
  const router = useRouter(); // ✅ Initialize router
  const [selectedClass, setSelectedClass] = useState(classes[0]);
  const [students, setStudents] = useState(studentsData);
  const [selectedSubject, setSelectedSubject] = useState(classes[0].subjects[0]);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  // ⏳ Update time every second
  useState(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleHomework = (id) => {
    setStudents((prev) =>
      prev.map((student) => (student.id === id ? { ...student, hasHomework: !student.hasHomework } : student))
    );
  };

  const togglePresence = (id) => {
    setStudents((prev) =>
      prev.map((student) => (student.id === id ? { ...student, present: !student.present } : student))
    );
  };

  const handleUpdate = () => {
    Alert.alert("הצלחה", "הנתונים עודכנו בהצלחה!");
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

      {/* 🔹 כיתות - טאבים */}
      <View style={styles.tabsContainer}>
        {classes.map((classItem) => (
          <TouchableOpacity
            key={classItem.id}
            style={[styles.tab, selectedClass.id === classItem.id && styles.activeTab]}
            onPress={() => {
              setSelectedClass(classItem);
              setSelectedSubject(classItem.subjects[0]);
            }}
          >
            <Text style={[styles.tabText, selectedClass.id === classItem.id && styles.activeTabText]}>
              {classItem.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 🔹 Dropdown לבחירת מקצוע */}
      <View style={styles.dropdownContainer}>
        <Text style={styles.dropdownLabel}>בחר מקצוע:</Text>
        <Picker
          selectedValue={selectedSubject}
          onValueChange={(itemValue) => setSelectedSubject(itemValue)}
          style={styles.picker}
        >
          {selectedClass.subjects.map((subject, index) => (
            <Picker.Item key={index} label={subject} value={subject} />
          ))}
        </Picker>
      </View>

      {/* 🔹 טבלה של הסטודנטים */}
      <ScrollView>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.headerCell}>ת.ז</Text>
            <Text style={styles.headerCell}>שם משתמש</Text>
            <Text style={styles.headerCell}>שם מלא</Text>
            <Text style={styles.headerCell}>שיעורי בית</Text>
            <Text style={styles.headerCell}>נוכחות</Text>
          </View>

          {students.map((student) => (
            <View key={student.id} style={styles.tableRow}>
              <Text style={[styles.cell, styles.centeredText]}>{student.id}</Text>
              <Text style={[styles.cell, styles.centeredText]}>{student.username}</Text>
              <Text style={[styles.cell, styles.centeredText]}>{student.fullName}</Text>

              <TouchableOpacity onPress={() => toggleHomework(student.id)} style={styles.checkboxContainer}>
                <Text>{student.hasHomework ? "✔️" : "❌"}</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => togglePresence(student.id)} style={styles.checkboxContainer}>
                <Text>{student.present ? "✔️" : "❌"}</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>

      <TouchableOpacity onPress={handleUpdate} style={styles.updateButton}>
        <Text style={styles.updateButtonText}>עדכון</Text>
      </TouchableOpacity>
    </View>
  );
};

// 🎨 **סגנונות מעודכנים**
const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#F4F4F4" },

  tabsContainer: { flexDirection: "row", justifyContent: "center", margin: 95 },
  tab: { padding: 10, marginHorizontal: 5, backgroundColor: "#ddd", borderRadius: 5 },
  activeTab: { backgroundColor: "black" },
  tabText: { fontSize: 16 },
  activeTabText: { color: "white" },

  dropdownContainer: { marginBottom: 10, alignItems: "center" },
  dropdownLabel: { fontSize: 16, marginBottom: 5 },
  picker: { height: 50, width: 200, backgroundColor: "#fff", borderRadius: 5 },

  table: { backgroundColor: "#fff", borderRadius: 10, padding: 10 },
  tableHeader: { flexDirection: "row", backgroundColor: "#ddd", padding: 10, borderRadius: 5 },
  headerCell: { flex: 1, fontWeight: "bold", textAlign: "center" },

  tableRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#ccc", paddingVertical: 10 },

  cell: { flex: 1, padding: 5 },
  centeredText: { textAlign: "center" }, // ✅ כל הטקסטים מיושרים לאמצע

  checkboxContainer: {
    flex: 1,
    alignItems: "center", // ✅ ממרכז את ה-Checkbox תחת העמודות
    justifyContent: "center",
  },

  updateButton: { marginTop: 15, backgroundColor: "black", padding: 12, borderRadius: 8, alignItems: "center" },
  updateButtonText: { color: "white", fontSize: 16, fontWeight: "bold" },
 // 🔹 TOP BAR
 topBar: {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,  // ✅ Ensures full width
  height: 85,
  backgroundColor: "black",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  paddingHorizontal: 15,
  paddingTop: 30,
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
export default HomeworkScreen;
