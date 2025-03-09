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
import { useRouter } from "expo-router"; // ✅ Router for navigation
import { useNavigation } from "@react-navigation/native";

const classesData = ["כל המכתבים", "כיתה א'", "כיתה ב'", "כיתה ג'"];

const messagesData = [
  { id: "1", title: "אסיפת הורים", sender: "יוסי כהן", date: "10-03", classId: "כיתה א'" },
  { id: "2", title: "תזכורת", sender: "רונית לוי", date: "09-03", classId: "כיתה ב'" },
  { id: "3", title: "מערכת שעות", sender: "משה ישראלי", date: "08-03", classId: "כיתה א'" },
  { id: "4", title: "טיול שנתי", sender: "שרה דויד", date: "07-03", classId: "כיתה ג'" },
];

const PAGE_SIZE = 20;

const ArchiveScreen = () => {
  const router = useRouter(); // ✅ Initialize router
  const [selectedClassIndex, setSelectedClassIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sidebarVisible, setSidebarVisible] = useState(false); // ✅ Sidebar state
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString()); // ✅ Current time state

  // ⏳ ✅ Update time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

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
                        <Text style={styles.sidebarUser}>👤 מורה</Text>
                        <TouchableOpacity onPress={() => setSidebarVisible(false)}>
                          <Text style={styles.closeButton}>✖</Text>
                        </TouchableOpacity>
                      </View>
          
          
                      <TouchableOpacity style={styles.sidebarItem} onPress={() => { router.push("/dashboard"); setSidebarVisible(false); }}>
                        <Text style={styles.sidebarText}>📊 כללי</Text>
                      </TouchableOpacity>
          
                      <TouchableOpacity style={styles.sidebarItem} onPress={() => { router.push("/Homework"); setSidebarVisible(false); }}>
                        <Text style={styles.sidebarText}>📚 שיעורי בית</Text>
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
                  </View>
                </Modal>

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
      {/* 🔹 טבלה של המכתבים */}
<ScrollView>
  <View style={styles.tableContainer}>
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
{/* 🔹 חצים למעבר בין דפים */}
{totalPages > 1 && (
  <View style={styles.pagination}>
    {currentPage > 1 && (
      <TouchableOpacity
        onPress={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
        style={styles.pageButton}
      >
        <Text style={styles.pageButtonText}>⬅️</Text>
      </TouchableOpacity>
    )}

    <Text style={styles.pageText}>
      עמוד {currentPage} מתוך {totalPages}
    </Text>

    {currentPage < totalPages && (
      <TouchableOpacity
        onPress={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
        style={styles.pageButton}
      >
        <Text style={styles.pageButtonText}>➡️</Text>
      </TouchableOpacity>
    )}
  </View>
)}

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

  sidebarHeader: {
    flexDirection: "row", 
    justifyContent: "space-between", // מרווח בין שם המשתמש לכפתור הסגירה
    alignItems: "center",
    width: "100%",
    paddingBottom: 10,
    borderBottomWidth: 1, 
    borderBottomColor: "#fff", 
    paddingHorizontal: 10, // מרווח פנימי מהצדדים
  },
  menuButton: { padding: 10 },
  menuIcon: { color: "white", fontSize: 26 },
  username: { color: "white", fontSize: 18, fontWeight: "bold" },
  dateTime: { color: "white", fontSize: 16, fontWeight: "bold" },

  modalBackground: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)" },
  sidebar: { position: "absolute", left: 0, width: 250, height: "100%", backgroundColor: "black", padding: 30 },
  sidebarUser: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  
  closeButton: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
  },
  sidebarItem: { paddingVertical: 15 },
  sidebarText: { color: "white", fontSize: 18 },

  /* 🔹 עיצוב ה-SIDEBAR */
  sidebar: { 
    position: "absolute", 
    left: 0, 
    width: 250, 
    height: "100%", 
    backgroundColor: "black", 
    padding: 30, 
    zIndex: 20 // ✅ ה-SIDEBAR תמיד מעל התוכן
  },

  sidebarItem: { paddingVertical: 15 },
  sidebarText: { color: "white", fontSize: 18 },
  closeButton: { color: "white", fontSize: 20, marginBottom: 20 },



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

  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#ddd",
    padding: 10,
    borderRadius: 5,
  },

  headerCell: { 
    flex: 1, 
    fontWeight: "bold", 
    textAlign: "center" 
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
  disabledButton: { backgroundColor: "#ccc" },
  pageText: { 
    fontSize: 16, 
    fontWeight: "bold" 
  },
});



export default ArchiveScreen;
