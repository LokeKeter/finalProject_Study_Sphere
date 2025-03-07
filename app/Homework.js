import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from "react-native";
import { Picker } from "@react-native-picker/picker";

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
  const [selectedClass, setSelectedClass] = useState(classes[0]);
  const [students, setStudents] = useState(studentsData);
  const [selectedSubject, setSelectedSubject] = useState(classes[0].subjects[0]);

  // שינוי סטטוס שיעורי בית
  const toggleHomework = (id) => {
    setStudents((prev) =>
      prev.map((student) => (student.id === id ? { ...student, hasHomework: !student.hasHomework } : student))
    );
  };

  // שינוי סטטוס נוכחות
  const togglePresence = (id) => {
    setStudents((prev) =>
      prev.map((student) => (student.id === id ? { ...student, present: !student.present } : student))
    );
  };

  // עדכון הנתונים
  const handleUpdate = () => {
    Alert.alert("הצלחה", "הנתונים עודכנו בהצלחה!");
  };

  return (
    <View style={styles.container}>
      {/* 🔹 טאבים של הכיתות */}
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
          {/* כותרות הטבלה */}
          <View style={styles.tableHeader}>
            <Text style={styles.headerCell}>ת.ז</Text>
            <Text style={styles.headerCell}>שם משתמש</Text>
            <Text style={styles.headerCell}>שם מלא</Text>
            <Text style={styles.headerCell}>שיעורי בית</Text>
            <Text style={styles.headerCell}>נוכחות</Text>
          </View>

          {/* שורות הטבלה */}
          {students.map((student) => (
            <View key={student.id} style={styles.tableRow}>
              <Text style={[styles.cell, styles.centeredText]}>{student.id}</Text>
              <Text style={[styles.cell, styles.centeredText]}>{student.username}</Text>
              <Text style={[styles.cell, styles.centeredText]}>{student.fullName}</Text>

              {/* ✅ כפתור שינוי שיעורי בית */}
              <TouchableOpacity onPress={() => toggleHomework(student.id)} style={styles.checkboxContainer}>
                <Text>{student.hasHomework ? "✔️" : "❌"}</Text>
              </TouchableOpacity>

              {/* ✅ כפתור שינוי נוכחות */}
              <TouchableOpacity onPress={() => togglePresence(student.id)} style={styles.checkboxContainer}>
                <Text>{student.present ? "✔️" : "❌"}</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* 🔹 כפתור עדכון כללי */}
      <TouchableOpacity onPress={handleUpdate} style={styles.updateButton}>
        <Text style={styles.updateButtonText}>עדכון</Text>
      </TouchableOpacity>
    </View>
  );
};

// 🎨 **סגנונות מעודכנים**
const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#F4F4F4" },

  tabsContainer: { flexDirection: "row", justifyContent: "center", marginBottom: 10 },
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
});

export default HomeworkScreen;
