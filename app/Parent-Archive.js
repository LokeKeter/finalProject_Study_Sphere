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

const classesData = ["כל המכתבים", "מכתבים שנשלחו"];

const messagesData = [
    { id: "1", title: "אסיפת הורים", sender: "יוסי כהן", date: "10.03", type: "התקבלו" },
    { id: "2", title: "תזכורת", sender: "רונית לוי", date: "09.03", type: "נשלחו" },
    { id: "3", title: "מערכת שעות", sender: "משה ישראלי", date: "08.03", type: "התקבלו" },
    { id: "4", title: "טיול שנתי", sender: "שרה דויד", date: "07.03", type: "נשלחו" },
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
        (classesData[selectedClassIndex] === "כל המכתבים" || msg.type === "נשלחו") &&
      (msg.sender.includes(searchQuery) || msg.title.includes(searchQuery))
  );

  // 🔹 חישוב מספר הדפים
  const totalPages = Math.ceil(filteredMessages.length / PAGE_SIZE);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const displayedMessages = filteredMessages.slice(startIndex, startIndex + PAGE_SIZE);

  //פתיחת הודעה
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const handleOpenMessage = (msg) => {
    setSelectedMessage(msg);
    setModalVisible(true);

    //שליחת הודעה
    const handleSendMessage = (msg) => {
        // כאן תוכל לכתוב את הלוגיקה של שליחת ההודעה.
        // לדוגמה: להעביר לדף של שליחת הודעות עם פרטי הנמען:
        console.log("שליחת הודעה ל: ", msg.sender);
        setModalVisible(false);
        router.push("/SendMessage", { recipient: msg.sender });
      };
      
  };
  
  //שלח הודעה
  const [isLetterModalVisible, setLetterModalVisible] = useState(false);
  const [letterSubject, setLetterSubject] = useState(""); // כותרת המכתב - תקבל את שם ההודעה המקורית
  const [letterRecipient, setLetterRecipient] = useState(""); // מקבל ההודעה
  const [letterContent, setLetterContent] = useState(""); // תוכן ההודעה


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
                        <TouchableOpacity onPress={() => { router.push("/UserProfile"); setSidebarVisible(false); }}>
                          <Text style={styles.sidebarUser}>👤 הורה</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity onPress={() => setSidebarVisible(false)}>
                          <Text style={styles.closeButton}>✖</Text>
                        </TouchableOpacity>
                      </View>
          
          
                      <TouchableOpacity style={styles.sidebarItem} onPress={() => { router.push("/Parent-Dashboard"); setSidebarVisible(false); }}>
                        <Text style={styles.sidebarText}>📊 כללי</Text>
                      </TouchableOpacity>
          
                      <TouchableOpacity style={styles.sidebarItem} onPress={() => { router.push("/Parent-Homework"); setSidebarVisible(false); }}>
                        <Text style={styles.sidebarText}>📚 שיעורי בית</Text>
                      </TouchableOpacity>

                      <TouchableOpacity style={styles.sidebarItem} onPress={() => { router.push("/Parent-Contacts"); setSidebarVisible(false); }}>
                        <Text style={styles.sidebarText}>👥 אנשי קשר</Text>
                      </TouchableOpacity>
          
                      <TouchableOpacity style={styles.sidebarItem} onPress={() => { router.push("/Parent-Archive"); setSidebarVisible(false); }}>
                        <Text style={styles.sidebarText}>📁 ארכיון</Text>
                      </TouchableOpacity>
          
                      <TouchableOpacity style={styles.sidebarItem} onPress={() => { router.push("/"); setSidebarVisible(false); }}>
                        <Text style={styles.sidebarText}>🚪 התנתקות</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </Modal>
                <Modal visible={modalVisible} transparent animationType="fade">
                    <View style={styles.modalBackground}>
                        <View style={styles.messageModal}>
                            <ScrollView style={{ width: "100%" }}>
                                <Text style={styles.messageTitle}>{selectedMessage?.title}</Text>
                                <Text style={styles.messageSender}>נשלח על ידי: {selectedMessage?.sender}</Text>
                                <Text style={styles.messageDate}>תאריך: {selectedMessage?.date}</Text>

                                <Text style={styles.messageContent}>
                                תוכן ההודעה
                                </Text>
                            </ScrollView>

                            <View style={styles.modalButtonsContainer}>
                                <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeMessageButton}>
                                    <Text style={styles.closeMessageButtonText}>סגור</Text>
                                </TouchableOpacity>

                                {classesData[selectedClassIndex] !== "מכתבים שנשלחו" && (
                                    <TouchableOpacity 
                                    onPress={() => {
                                      setLetterSubject(selectedMessage?.title); // הגדרת כותרת המכתב כשם ההודעה
                                      setLetterRecipient(selectedMessage?.sender); // שליחת המכתב לשולח המקורי
                                      setLetterModalVisible(true);
                                    }} 
                                    style={styles.sendMessageButton}
                                  >
                                    <Text style={styles.sendMessageButtonText}>שלח</Text>
                                  </TouchableOpacity>
                                  
                                )}
                            </View>

                        </View>
                    </View>
                </Modal>
                <Modal visible={isLetterModalVisible} transparent animationType="slide">
  <View style={styles.overlay}>
    <View style={styles.popup}>
      {/* 🔹 Header */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <View style={styles.iconBox}>
            <Text style={styles.icon}>✉️</Text>
          </View>
          <Text style={styles.title}>שליחת הודעה</Text>
        </View>
        <TouchableOpacity onPress={() => setLetterModalVisible(false)}>
          <Text style={styles.closeButton}>✖</Text>
        </TouchableOpacity>
      </View>

      {/* 🔹 נמען */}
      <TextInput
        style={styles.input}
        placeholder="👤 נמען"
        value={letterRecipient}
        editable={false} // לא ניתן לשנות את המקבל
      />

      {/* 🔹 נושא (שכבר הוזן אוטומטית) */}
      <TextInput
        style={styles.input}
        placeholder="📌 נושא ההודעה"
        value={letterSubject}
        editable={false} // לא ניתן לשנות את הכותרת
      />

      {/* 🔹 תוכן ההודעה */}
      <TextInput
        style={styles.textArea}
        placeholder="✍️ תוכן ההודעה..."
        value={letterContent}
        onChangeText={setLetterContent}
        multiline
      />

      {/* 🔹 Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => setLetterModalVisible(false)}
        >
          <Text style={styles.cancelButtonText}>ביטול</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.sendButton} onPress={() => {
          if (!letterContent.trim()) {
            Alert.alert("❌ שגיאה", "נא להזין תוכן להודעה.");
            return;
          }
          Alert.alert("✅ הצלחה", "ההודעה נשלחה בהצלחה!");
          setLetterModalVisible(false);
        }}>
          <Text style={styles.sendButtonText}>📨 שלח</Text>
        </TouchableOpacity>
      </View>
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
        placeholder="חפש לפי שם שולח או כותרת 🔍"
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
        <TouchableOpacity
            key={msg.id}
            style={styles.tableRow}
            onPress={() => handleOpenMessage(msg)}
        >
            <Text style={styles.cell}>{msg.title}</Text>
            <Text style={styles.cell}>{msg.sender}</Text>
            <Text style={styles.cell}>{msg.date}</Text>
        </TouchableOpacity>
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
  username: { color: "white", fontSize: 18, fontWeight: "bold" },
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


  
  headerContainer: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginVertical: 10 },
  headerText: { fontSize: 18, fontWeight: "bold" },
  arrow: { fontSize: 22, paddingHorizontal: 10 },
  table: { backgroundColor: "#fff", borderRadius: 10, padding: 10, marginTop: 10 },
  tableHeader: { flexDirection: "row", backgroundColor: "#ddd", padding: 10, borderRadius: 5 },
  headerCell: { flex: 1, fontWeight: "bold", textAlign: "center" },

  tableRow: {
    flexDirection: "row", // ✅ סידור שורות לרוחב
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    paddingVertical: 10,
    alignItems: "center",
  },
  cell: { flex: 1, textAlign: "center" },

  switchContainer: { flex: 1, alignItems: "center" }, // ✅ סידור הכפתורים

  updateButton: {
    backgroundColor: "black",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 20,
    marginTop: 20,
  },
  updateButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },

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
    textAlign: "right",
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

  //עיצוב מכתב
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  
  messageModal: {
    width: "85%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  
  messageTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "right"
  },
  
  messageSender: {
    fontSize: 16,
    marginBottom: 5,
    textAlign: "right"
  },
  
  messageDate: {
    fontSize: 14,
    color: "#777",
    marginBottom: 15,
    textAlign: "right"
  },
  
  messageContent: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
    textAlign: "right"
  },
  
  closeMessageButton: {
    backgroundColor: "#000",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  
  closeMessageButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 15,
  },
  
  closeMessageButton: {
    backgroundColor: "#ccc",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    alignItems: "center",
    marginRight: 5,
  },
  
  closeMessageButtonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "bold",
  },
  
  sendMessageButton: {
    backgroundColor: "#000",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    alignItems: "center",
    marginLeft: 5,
  },
  
  sendMessageButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  
  //שלח הודעה
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  
  popup: {
    width: "90%",
    maxWidth: 500,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
  },
  
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    paddingBottom: 10,
  },
  
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  
  iconBox: {
    backgroundColor: "#EAEAEA",
    padding: 10,
    borderRadius: 8,
    marginRight: 10,
  },
  
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
    backgroundColor: "#F9F9F9",
  },
  
  textArea: {
    height: 100,
    textAlignVertical: "top",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
    backgroundColor: "#F9F9F9",
  },
  
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
  },
  
  cancelButton: {
    flex: 1,
    backgroundColor: "#ddd",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginRight: 10,
  },
  
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  
  sendButton: {
    flex: 1,
    backgroundColor: "black",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  
  sendButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
  },
  
});



export default ArchiveScreen;
