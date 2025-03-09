import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";

const classesData = ["כל המכתבים", "כיתה א'", "כיתה ב'", "כיתה ג'"];

const messagesData = [
  { id: "1", title: "אסיפת הורים", sender: "יוסי כהן", date: "10-03", classId: "כיתה א'" },
  { id: "2", title: "תזכורת", sender: "רונית לוי", date: "09-03", classId: "כיתה ב'" },
  { id: "3", title: "מערכת שעות", sender: "משה ישראלי", date: "08-03", classId: "כיתה א'" },
  { id: "4", title: "טיול שנתי", sender: "שרה דויד", date: "07-03", classId: "כיתה ג'" },
];

const PAGE_SIZE = 20;

const ArchiveScreen = () => {
  const [selectedClassIndex, setSelectedClassIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // 🔹 שינוי הסינון בכותרת עם חצים
  const handleChangeClass = (direction) => {
    let newIndex = selectedClassIndex + direction;
    if (newIndex >= 0 && newIndex < classesData.length) {
      setSelectedClassIndex(newIndex);
      setCurrentPage(1);
    }
  };

  // 🔹 סינון לפי כיתה ושם שולח/כותרת
  const filteredMessages = messagesData.filter(
    (msg) =>
      (classesData[selectedClassIndex] === "כל המכתבים" ||
        msg.classId === classesData[selectedClassIndex]) &&
      (msg.sender.includes(searchQuery) || msg.title.includes(searchQuery))
  );

  // 🔹 חישוב מספר הדפים
  const totalPages = Math.ceil(filteredMessages.length / PAGE_SIZE);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const displayedMessages = filteredMessages.slice(startIndex, startIndex + PAGE_SIZE);

  return (
    <View style={styles.container}>
      {/* 🔹 כותרת עם חצים לסינון */}
      <View style={styles.headerContainer}>
        {selectedClassIndex > 0 && (
          <TouchableOpacity onPress={() => handleChangeClass(-1)}>
            <Text style={styles.arrow}>⬅️</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.headerText}>{classesData[selectedClassIndex]}</Text>

        {selectedClassIndex < classesData.length - 1 && (
          <TouchableOpacity onPress={() => handleChangeClass(1)}>
            <Text style={styles.arrow}>➡️</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* 🔹 תיבת חיפוש */}
      <TextInput
        style={styles.searchInput}
        placeholder="🔍 חפש לפי שם שולח או כותרת"
        value={searchQuery}
        onChangeText={(text) => {
          setSearchQuery(text);
          setCurrentPage(1);
        }}
      />

      {/* 🔹 רשימת הודעות */}
      <ScrollView>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.headerCell}>כותרת</Text>
            <Text style={styles.headerCell}>שם שולח</Text>
            <Text style={styles.headerCell}>תאריך</Text>
          </View>

          {displayedMessages.map((msg) => (
            <View key={msg.id} style={styles.tableRow}>
              <Text style={styles.cell}>{msg.title}</Text>
              <Text style={styles.cell}>{msg.sender}</Text>
              <Text style={styles.cell}>{msg.date}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* 🔹 ניווט בין עמודים */}
      {totalPages > 1 && (
        <View style={styles.pagination}>
          <TouchableOpacity
            onPress={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            style={[styles.pageButton, currentPage === 1 && styles.disabledButton]}
          >
            <Text style={styles.pageButtonText}>⬅️</Text>
          </TouchableOpacity>

          <Text style={styles.pageText}>
            עמוד {currentPage} מתוך {totalPages}
          </Text>

          <TouchableOpacity
            onPress={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            style={[styles.pageButton, currentPage === totalPages && styles.disabledButton]}
          >
            <Text style={styles.pageButtonText}>➡️</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

// 🎨 **סגנונות**
const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#F4F4F4" },
  
  // 🔹 כותרת עם חצים
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
  },
  headerText: { fontSize: 22, fontWeight: "bold", marginHorizontal: 15 },
  arrow: { fontSize: 22, color: "#000" },

  // 🔹 תיבת חיפוש
  searchInput: {
    height: 40,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
    marginBottom: 15,
  },

  // 🔹 טבלה של הודעות
  table: { backgroundColor: "#fff", borderRadius: 10, padding: 10 },
  tableHeader: { flexDirection: "row", backgroundColor: "#ddd", padding: 10, borderRadius: 5 },
  headerCell: { flex: 1, fontWeight: "bold", textAlign: "center" },

  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    paddingVertical: 10,
    alignItems: "center",
  },
  cell: { flex: 1, textAlign: "center" },

  // 🔹 ניווט בין עמודים
  pagination: { flexDirection: "row", justifyContent: "center", marginTop: 10 },
  pageButton: {
    backgroundColor: "#000",
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 10,
  },
  pageButtonText: { color: "white", fontSize: 16 },
  disabledButton: { backgroundColor: "#888" }, // עיצוב כפתור לא פעיל
  pageText: { fontSize: 16, fontWeight: "bold" },
});

export default ArchiveScreen;
