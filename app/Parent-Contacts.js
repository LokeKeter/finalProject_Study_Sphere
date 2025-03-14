import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TextInput,
  Modal,
} from "react-native";
import { useRouter } from "expo-router";

const parentsData = [
  { id: "1", parentName: "יוסי כהן", studentName: "דנה כהן", classId: "כיתה א'" },
  { id: "2", parentName: "רונית לוי", studentName: "איתי לוי", classId: "כיתה ב'" },
  { id: "3", parentName: "משה ישראלי", studentName: "נועה ישראלי", classId: "כיתה א'" },
  { id: "4", parentName: "שרה דויד", studentName: "עומר דויד", classId: "כיתה ג'" },
];

const ContactsScreen = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const [isLetterModalVisible, setLetterModalVisible] = useState(false);
  const [letterSubject, setLetterSubject] = useState("");
  const [letterContent, setLetterContent] = useState("");


  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(interval);
  }, []);


  // 🔹 סינון נתונים לפי כיתה ושם
  const filteredParents = parentsData.filter(
    (parent) =>
      parent.parentName.includes(searchQuery) ||
      parent.studentName.includes(searchQuery)
  );
  
  

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
                                <Text style={styles.sidebarUser}>👤 מורה</Text>
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

      {/* 🔹 חיפוש לפי שם הורה/תלמיד */}
      <TextInput
        style={styles.searchInput}
        placeholder="🔍 חפש לפי שם הורה או תלמיד"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {/* 🔹 טבלה */}
      <ScrollView>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.headerCell}>שם ההורה</Text>
            <Text style={styles.headerCell}>שם התלמיד</Text>
            <Text style={styles.headerCell}>פעולות      </Text>
          </View>

          {filteredParents.map((parent) => (
            <View key={parent.id} style={styles.tableRow}>
              <Text style={styles.cell}>{parent.parentName}</Text>
              <Text style={styles.cell}>{parent.studentName}</Text>

              {/* 🔹 פעולות */}
              <View style={styles.actionsContainer}>
                <TouchableOpacity onPress={() => setLetterModalVisible(true)}>
                  <Text style={styles.actionText}>✉️</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionButton}>
                  <Text style={styles.actionText}>❌</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
      <Modal visible={isLetterModalVisible} transparent animationType="slide">
  <View style={styles.overlay}>
    <View style={styles.popup}>
      {/* 🔹 Header */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <View style={styles.iconBox}>
            <Text style={styles.icon}>✉️</Text>
          </View>
          <Text style={styles.title}>מכתב להורים</Text>
        </View>
        <TouchableOpacity onPress={() => setLetterModalVisible(false)}>
          <Text style={styles.closeButton}>✖</Text>
        </TouchableOpacity>
      </View>

      {/* 🔹 Subject Input */}
      <TextInput
        style={styles.input}
        placeholder="📌 נושא המכתב"
        value={letterSubject}
        onChangeText={setLetterSubject}
      />

      {/* 🔹 Letter Content */}
      <TextInput
        style={styles.textArea}
        placeholder="✍️ תוכן המכתב..."
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
          if (!letterSubject.trim() || !letterContent.trim()) {
            Alert.alert("❌ שגיאה", "יש למלא את כל השדות לפני השליחה.");
            return;
          }
          Alert.alert("✅ הצלחה", "המכתב נשלח בהצלחה!");
          setLetterModalVisible(false);
        }}>
          <Text style={styles.sendButtonText}>📨 שלח</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
</Modal>

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

  
  headerContainer: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginVertical: 10 },
  headerText: { fontSize: 18, fontWeight: "bold" },
  arrow: { fontSize: 22, paddingHorizontal: 10 },

  searchInput: {
    height: 40,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
    marginBottom: 15,
  },

  tableHeader: { flexDirection: "row", backgroundColor: "#ddd", padding: 10, borderRadius: 5 },
  headerCell: { flex: 1, fontWeight: "bold", textAlign: "left", paddingLeft: 10},
  tableRow: { flexDirection: "row", paddingVertical: 10, alignItems: "center", borderBottomWidth: 1, borderBottomColor: "#ccc" },
  cell: { flex: 1, textAlign: "center" },
  actionsContainer: { flexDirection: "row", justifyContent: "center" },
  actionButton: { marginHorizontal: 5, padding: 5 },
  actionText: { fontSize: 18 },

  //המכתב
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
  
  closeButton: {
    fontSize: 22,
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

export default ContactsScreen;
