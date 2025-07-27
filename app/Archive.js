import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
} from "react-native";
import { useRouter } from "expo-router";
import TopSidebar from "../components/TopSidebar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "../config";
import * as Linking from 'expo-linking';
import * as FileSystem from 'expo-file-system';

const PAGE_SIZE = 20;

const ArchiveScreen = () => {
  const router = useRouter();
  const [selectedClassIndex, setSelectedClassIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [messages, setMessages] = useState([]);
  const [classes, setClasses] = useState(["כל המכתבים"]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalData, setModalData] = useState(null);

  const handleChangeClass = (direction) => {
    let newIndex = selectedClassIndex + direction;
    if (newIndex >= 0 && newIndex < classes.length) {
      setSelectedClassIndex(newIndex);
      setCurrentPage(1);
    }
  };

  const downloadFile = async (url, filename = 'downloaded_file') => {
    try {
      const downloadResumable = FileSystem.createDownloadResumable(
        url,
        FileSystem.documentDirectory + filename
      );

      const { uri } = await downloadResumable.downloadAsync();
      console.log('✅ הורדה הושלמה:', uri);
      alert('הקובץ הורד בהצלחה ל-' + uri);
    } catch (e) {
      console.error('❌ שגיאה בהורדה:', e);
      alert('אירעה שגיאה בהורדת הקובץ');
    }
  };

  const filteredMessages = Array.isArray(messages)
  ? messages.filter(
      (msg) =>
        (classes[selectedClassIndex] === "כל המכתבים" ||
          msg.className === classes[selectedClassIndex]) &&
        (msg.sender.includes(searchQuery) || msg.title.includes(searchQuery))
    )
  : [];


  const totalPages = Math.ceil(filteredMessages.length / PAGE_SIZE);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const displayedMessages = filteredMessages.slice(startIndex, startIndex + PAGE_SIZE);


  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const user = await AsyncStorage.getItem("user");
        const parsed = JSON.parse(user);
        const parentId = parsed.id;

        const res = await fetch(`${API_BASE_URL}/api/communication/archive/${parentId}`);
        const data = await res.json();

        const safeData = Array.isArray(data) ? data : [];
        setMessages(safeData);

        const uniqueClasses = Array.from(
          new Set(safeData.map(m => m.className))
        ).filter(c => c !== "כיתה כללית");
        setClasses(["כל המכתבים", ...uniqueClasses]);
      } catch (err) {
        console.error("❌ שגיאה בעת שליפת הודעות:", err);
        setMessages([]); // שים הודעות ריקות במקרה של שגיאה
      }
    };

    fetchMessages();
  }, []);

  return (
    <View style={styles.container}>

      {/* top and side bar */}
      <TopSidebar userRole="teacher" />

      <View style={styles.headerContainer}>
        {selectedClassIndex > 0 && (
          <TouchableOpacity onPress={() => handleChangeClass(-1)}>
            <Text style={styles.arrow}>⬅️</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.headerText}>{classes[selectedClassIndex]}</Text>
        {selectedClassIndex < classes.length - 1 && (
          <TouchableOpacity onPress={() => handleChangeClass(1)}>
            <Text style={styles.arrow}>➡️</Text>
          </TouchableOpacity>
        )}
      </View>

      <TextInput
        style={styles.searchInput}
        placeholder="🔍 חפש לפי שם שולח או כותרת"
        placeholderTextColor="black"
        textAlign="right"
        value={searchQuery}
        onChangeText={(text) => {
          setSearchQuery(text);
          setCurrentPage(1);
        }}
      />

      <ScrollView>
        <View style={styles.tableContainer}>

          {displayedMessages.length === 0 ? (
            <Text style={{ textAlign: "center", marginTop: 20 }}>אין הודעות להצגה</Text>
            ) : (
              displayedMessages.map((msg) => (
                <TouchableOpacity
                  key={msg.id}
                  style={styles.entry}
                  onPress={() => { setModalData(msg); setModalVisible(true); }}
                >
                  <View style={styles.entryHeader}>
                    <Text style={styles.entryTitle}>
                      {msg.type === 'signature' ? "אישור לחתימה" : msg.title}
                    </Text>
                  </View>
                  <View style={styles.entryMeta}>
                    <Text>{msg.sender}</Text>
                    <Text>{msg.date}</Text>
                  </View>
                  <Text style={styles.entryPreview}>
                    {msg.content ? msg.content.slice(0, 40) + "..." : "אין תוכן"}
                  </Text>
                </TouchableOpacity>
              ))
            )}

        </View>
      </ScrollView>
      <Modal visible={modalVisible} transparent animationType="slide">
        <TouchableOpacity
          activeOpacity={1}
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={styles.modalContent}
            onPress={() => setModalVisible(false)}
          >
            <Text style={styles.modalTitle}>
              {modalData?.type === 'signature' ? "אישור לחתימה" : modalData?.title}
            </Text>
            <Text style={styles.modalSender}>שולח: {modalData?.sender}</Text>
            <Text style={styles.modalDate}>תאריך: {modalData?.date}</Text>
            <Text style={styles.modalFullContent}>{modalData?.content}</Text>

            {modalData?.fileUrl && (
              <TouchableOpacity
                onPress={() => {
                  const url = `${API_BASE_URL}/${modalData.fileUrl}`;
                  downloadFile(url, 'downloaded_file.pdf'); // אפשר לשנות את שם הקובץ
                }}
              >
                <Text style={{ color: "blue", marginTop: 10, textAlign: "center" }}>
                  📎 הורד קובץ
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>❌ סגור</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
      {totalPages > 1 && (
        <View style={styles.pagination}>
          {currentPage > 1 && (
            <TouchableOpacity onPress={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} style={styles.pageButton}>
              <Text style={styles.pageButtonText}>⬅️</Text>
            </TouchableOpacity>
          )}

          <Text style={styles.pageText}>עמוד {currentPage} מתוך {totalPages}</Text>

          {currentPage < totalPages && (
            <TouchableOpacity onPress={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} style={styles.pageButton}>
              <Text style={styles.pageButtonText}>➡️</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};
// 🎨 **עיצוב הדף**
const styles = StyleSheet.create({
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

  table: { backgroundColor: "#fff", borderRadius: 10, padding: 10, marginTop: 10 },
  tableHeader: { flexDirection: "row", backgroundColor: "#ddd", padding: 10, borderRadius: 5 },
  headerCell: { flex: 1, fontWeight: "bold", textAlign: "center" },

  /* 🔹 כותרת עם חצים */
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20, // ✅ מרווח אחרי ה-TOPBAR
  },
  arrow: { fontSize: 22, paddingHorizontal: 10 },
  headerText: { fontSize: 20, fontWeight: "bold" },

  /* 🔹 תיבת חיפוש */
  searchInput: {
    height: 40,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
    marginTop: 15, // ✅ הפרדה טובה יותר מתיבת החיפוש לתוכן
    marginHorizontal: 20, // ✅ מוסיף מרווח מהקצוות
  },

  /* 🔹 טבלה */
  tableContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    marginHorizontal: 10, // ✅ שומר שהתוכן לא יגע בקצה המסך
    marginTop: 20, // ✅ מרווח טוב אחרי תיבת החיפוש
  },

  /* 🔹 שורות הטבלה */
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    paddingVertical: 10,
    alignItems: "center",
  },

  /* 🔹 תאים בטבלה */
  cell: { 
    flex: 1, 
    textAlign: "center" 
  },

  /* 🔹 עיצוב העמודים (Pagination) */
  pagination: { 
    flexDirection: "row", 
    justifyContent: "center", 
    marginTop: 10 
  },
  pageButton: {
    backgroundColor: "#000",
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 10,
  },
  pageButtonText: { 
    color: "white", 
    fontSize: 16 
  },
  entry: {
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginBottom: 10,
  },
  entryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  entryTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  entrySender: {
    fontSize: 14,
  },
  entryDate: {
    fontSize: 14,
  },
  entryPreview: {
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: "80%",
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalSender: {
    fontSize: 16,
  },
  modalDate: {
    fontSize: 14,
  },
  modalFullContent: {
    fontSize: 14,
    marginTop: 10,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "red",
    textAlign: "center",
    marginTop: 15,
  },
    entryMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
});

export default ArchiveScreen;
