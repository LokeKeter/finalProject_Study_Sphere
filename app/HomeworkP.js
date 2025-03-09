import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
} from "react-native";

const homeworkData = [
  { id: "1", teacher: "יוסי כהן", subject: "מתמטיקה", dueDate: "12-03-2024", details: "עמוד 45 תרגילים 1-5" },
  { id: "2", teacher: "רונית לוי", subject: "אנגלית", dueDate: "10-03-2024", details: "לקרוא את פרק 3 ולסכם" },
  { id: "3", teacher: "משה ישראלי", subject: "מדעים", dueDate: "15-03-2024", details: "ללמוד על מחזור המים" },
  { id: "4", teacher: "שרה דויד", subject: "היסטוריה", dueDate: "18-03-2024", details: "לכתוב חיבור על מלחמת העצמאות" },
];

const HomeworkScreen = () => {
  const [selectedHomework, setSelectedHomework] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const openPopup = (homework) => {
    setSelectedHomework(homework);
    setModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📚 שיעורי בית</Text>

      {/* 🔹 טבלה של שיעורי בית */}
      <ScrollView>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.headerCell}>מורה</Text>
            <Text style={styles.headerCell}>מקצוע</Text>
            <Text style={styles.headerCell}>תאריך סיום</Text>
            <Text style={styles.headerCell}>ש.ב    </Text>
          </View>

          {homeworkData.map((hw) => (
            <View key={hw.id} style={styles.tableRow}>
              <Text style={styles.cell}>{hw.teacher}</Text>
              <Text style={styles.cell}>{hw.subject}</Text>
              <Text style={styles.cell}>{hw.dueDate}</Text>

              {/* 🔹 כפתור הצגת פרטים */}
              <TouchableOpacity style={styles.button} onPress={() => openPopup(hw)}>
                <Text style={styles.buttonText}>📄 הצג</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* 🔹 POPUP לפרטי שיעורי הבית */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {selectedHomework && (
              <>
                <Text style={styles.modalTitle}>{selectedHomework.subject}</Text>
                <Text style={styles.modalText}>👩‍🏫 מורה: {selectedHomework.teacher}</Text>
                <Text style={styles.modalText}>📅 תאריך סיום: {selectedHomework.dueDate}</Text>
                <Text style={styles.modalText}>📖 פירוט: {selectedHomework.details}</Text>
              </>
            )}
            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>סגור</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// 🎨 **סגנונות**
const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#F4F4F4" },  //עיצוב הדף
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 15, textAlign: "center" }, //עיצוב כותרת

  table: { backgroundColor: "#fff", borderRadius: 10, padding: 10 },  //עיצוב טבלה
  tableHeader: { flexDirection: "row", backgroundColor: "#ddd", padding: 10, borderRadius: 5 },   //עיצוב הכותרות
  headerCell: { flex: 1, fontWeight: "bold", textAlign: "center" }, //עיצוב התאים של הכותרות

  //עיצוב שורות הטבלה
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    paddingVertical: 10,
    alignItems: "center",
  },

  //עיצוב תאי הטבלה
  cell: { flex: 1, textAlign: "center" },

  //עיצוב הכפתורים
  button: {
    backgroundColor: "#000",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    alignSelf: "center",
  },

  //עיצוב תא הכפתורים
  buttonText: { color: "white", fontSize: 14, fontWeight: "bold" },

  //
  modalContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" },
  modalContent: { width: 300, backgroundColor: "#fff", padding: 20, borderRadius: 10, alignItems: "center" },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  modalText: { fontSize: 16, marginBottom: 10, textAlign: "center" },
  closeButton: { marginTop: 10, backgroundColor: "#d32f2f", padding: 10, borderRadius: 5 },
  closeButtonText: { color: "white", fontSize: 14, fontWeight: "bold" },
});

export default HomeworkScreen;
