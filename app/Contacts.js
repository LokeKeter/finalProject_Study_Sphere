import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TextInput,
} from "react-native";
import { Picker } from "@react-native-picker/picker";

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
  const [selectedClass, setSelectedClass] = useState(classesData[0].id);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeParentId, setActiveParentId] = useState(null);

  // סינון לפי כיתה + חיפוש
  const filteredParents = parentsData.filter(
    (p) =>
      p.classId === selectedClass &&
      (p.parentName.includes(searchQuery) || p.studentName.includes(searchQuery))
  );

  // ביצוע פעולה
  const handleAction = (parentId, action) => {
    console.log(`פעולה ${action} עבור ${parentId}`);
    setActiveParentId(null);
  };

  return (
    
    <View style={styles.container}>
      <Text style={styles.title}>אנשי קשר</Text>

      {/* 🔹 Dropdown לבחירת כיתה */}
      <Picker
        selectedValue={selectedClass}
        onValueChange={(itemValue) => setSelectedClass(itemValue)}
        style={styles.picker}
      >
        {classesData.map((classItem) => (
          <Picker.Item key={classItem.id} label={classItem.name} value={classItem.id} />
        ))}
      </Picker>

      {/* 🔹 שורת חיפוש */}
      <TextInput
        style={styles.searchInput}
        placeholder="🔍 חפש לפי שם הורה או תלמיד"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {/* 🔹 טבלה */}
      <ScrollView>
        <View style={styles.table}>
          {/* 🔹 כותרות הטבלה */}
          <View style={styles.tableHeader}>
            <Text style={styles.headerCell}>שם ההורה</Text>
            <Text style={styles.headerCell}>שם התלמיד</Text>
            <Text style={styles.headerCell}>פעולה</Text> {/* כותרת בלתי נראית */}
          </View>

          {/* 🔹 שורות הנתונים */}
          {filteredParents.map((parent) => (
            <View key={parent.id} style={styles.tableRow}>
              <Text style={styles.cell}>{parent.parentName}</Text>
              <Text style={styles.cell}>{parent.studentName}</Text>

              {/* 🔹 כפתור פעולות */}
              <View style={styles.cell}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => setActiveParentId(activeParentId === parent.id ? null : parent.id)}
                >
                  <Text style={styles.actionButtonText}>⋮</Text>
                </TouchableOpacity>

                {/* 🔹 תפריט אפשרויות */}
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
//fzf
// 🎨 **סגנונות**
const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#F4F4F4" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 15, textAlign: "center" },

  picker: { height: 50, backgroundColor: "#fff", borderRadius: 5, marginBottom: 10 },

  searchInput: {
    height: 40,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
    marginBottom: 15,
  },

  table: { backgroundColor: "#fff", borderRadius: 10, padding: 10 },
  tableHeader: { flexDirection: "row", backgroundColor: "#ddd", padding: 10, borderRadius: 5 },
  headerCell: { flex: 1, fontWeight: "bold", textAlign: "center" },
  hiddenHeader: { flex: 1, textAlign: "center", opacity: 0 },

  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    paddingVertical: 10,
    alignItems: "center",
  },
  cell: { flex: 1, textAlign: "center" },

  actionButton: {
    backgroundColor: "#000",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    alignSelf: "center",
  },
  actionButtonText: { color: "white", fontSize: 18, fontWeight: "bold" },

  dropdownMenu: {
    position: "absolute",
    top: 30,
    left: -20,
    backgroundColor: "#fff",
    borderRadius: 5,
    elevation: 10,
    width: 180,
    zIndex: 999,
  },
  menuItem: { paddingVertical: 12, paddingHorizontal: 15, fontSize: 16, borderBottomWidth: 1, borderBottomColor: "#ddd" },
});
//asfa
export default ContactsScreen;
