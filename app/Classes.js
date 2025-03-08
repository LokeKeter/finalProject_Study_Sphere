import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { Picker } from "@react-native-picker/picker";

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

  // שינוי הכיתה שנבחרה
  const handleClassChange = (classId) => {
    const classObj = classesData.find((c) => c.id === classId);
  
    if (classObj) {
      setSelectedClass(classObj);
      setSelectedSubject(null);
      setHomeworkStatus(classObj.hasHomework);
    }
  };

  // שינוי המקצוע שנבחר
  const handleSubjectChange = (subject) => {
    setSelectedSubject(subject);
  };

  // ביצוע פעולה (שליחת/מחיקת שיעורי בית או שליחת הודעה)
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
      <Text style={styles.title}>ניהול שיעורי בית</Text>

      {/* 🔹 Dropdown לבחירת כיתה */}
      <Text style={styles.label}>בחר כיתה:</Text>
      <Picker
        selectedValue={selectedClass?.id || null}
        onValueChange={(itemValue) => handleClassChange(itemValue)}
        style={styles.picker}
      >
        <Picker.Item label="בחר כיתה..." value={null} />
        {classesData.map((classItem) => (
          <Picker.Item key={classItem.id} label={classItem.name} value={classItem.id} />
        ))}
      </Picker>

      {/* 🔹 Dropdown לבחירת מקצוע (מופיע רק אם נבחרה כיתה) */}
      {selectedClass && (
        <>
          <Text style={styles.label}>בחר מקצוע:</Text>
          <Picker
            selectedValue={selectedSubject}
            onValueChange={(itemValue) => handleSubjectChange(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="בחר מקצוע..." value={null} />
            {selectedClass.subjects.map((subject, index) => (
              <Picker.Item key={index} label={subject} value={subject} />
            ))}
          </Picker>
        </>
      )}

      {/* 🔹 סטטוס שיעורי בית (מופיע רק אם נבחרו כיתה ומקצוע) */}
      {selectedSubject && (
        <Text style={styles.statusText}>
          {homeworkStatus
            ? "✅ כבר נשלחו שיעורי בית למקצוע זה"
            : "❌ לא נשלחו שיעורי בית למקצוע זה"}
        </Text>
      )}

      {/* 🔹 כפתורי פעולות (מופיעים רק אם נבחרו כיתה ומקצוע) */}
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

// 🎨 **סגנונות**
const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#F4F4F4", alignItems: "center" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 15 },

  label: { fontSize: 16, marginTop: 10, marginBottom: 5 },
  picker: {
    width: 250,
    height: 50,
    backgroundColor: "#fff",
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#ccc",
  },

  statusText: {
    fontSize: 16,
    marginTop: 15,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  },

  buttonContainer: { marginTop: 20, width: "100%", alignItems: "center" },
  actionButton: {
    backgroundColor: "black",
    padding: 12,
    borderRadius: 8,
    width: 250,
    alignItems: "center",
    marginBottom: 10,
  },
  deleteButton: {
    backgroundColor: "#d32f2f",
    padding: 12,
    borderRadius: 8,
    width: 250,
    alignItems: "center",
    marginBottom: 10,
  },
  messageButton: {
    backgroundColor: "#1976d2",
    padding: 12,
    borderRadius: 8,
    width: 250,
    alignItems: "center",
  },
  actionButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});

export default ClassesScreen;
