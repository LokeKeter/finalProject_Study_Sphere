import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  TextInput,
  FlatList,
} from "react-native";
import { useRouter } from "expo-router";

const classesData = [
  { id: "1", name: "כיתה א'", subjects: ["מתמטיקה", "אנגלית", "עברית"] },
  { id: "2", name: "כיתה ב'", subjects: ["מתמטיקה", "מדעים", "היסטוריה"] },
  { id: "3", name: "כיתה ג'", subjects: ["אנגלית", "מדעים", "גיאוגרפיה"] },
];

const ClassesScreen = () => {
  const router = useRouter();
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [homeworkList, setHomeworkList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [newHomework, setNewHomework] = useState("");
  const [currentTime, setCurrentTime] = useState("");

  // ✅ Added missing states for message input and modal visibility
  const [messageText, setMessageText] = useState(""); 
  const [messageModalVisible, setMessageModalVisible] = useState(false); 

  // 🔹 Update current time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString("he-IL", { hour12: false }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // 🔹 Select a class and load homework
  const handleClassSelect = (classObj) => {
    setSelectedClass(classObj);
    setHomeworkList([]);
  };

  // 🔹 Add new homework
  const addHomework = () => {
    if (!newHomework.trim()) return;
    setHomeworkList([...homeworkList, { id: Date.now().toString(), text: newHomework, completed: false }]);
    setNewHomework("");
  };

  // 🔹 Toggle homework completion
  const toggleHomeworkCompletion = (id) => {
    setHomeworkList((prev) =>
      prev.map((hw) => (hw.id === id ? { ...hw, completed: !hw.completed } : hw))
    );
  };

  // 🔹 Delete homework with confirmation
  const deleteHomework = (id) => {
    Alert.alert("אישור מחיקה", "האם אתה בטוח שברצונך למחוק את שיעורי הבית?", [
      { text: "ביטול", style: "cancel" },
      {
        text: "מחק",
        onPress: () => {
          setHomeworkList((prev) => prev.filter((hw) => hw.id !== id));
        },
      },
    ]);
  };

  // ✅ Function to send message
  const sendMessage = () => {
    if (!messageText.trim()) {
      Alert.alert("שגיאה", "לא ניתן לשלוח הודעה ריקה.");
      return;
    }

    Alert.alert("📢 הודעה נשלחה!", `הודעה נשלחה לכיתה ${selectedClass?.name}: \n\n"${messageText}"`);
    setMessageText(""); // ✅ Clear input after sending
    setMessageModalVisible(false); // ✅ Close modal after sending
  };

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
              
              
                          <TouchableOpacity style={styles.sidebarItem} onPress={() => { router.push("/dashboard"); setSidebarVisible(false); }}>
                            <Text style={styles.sidebarText}>📊 כללי</Text>
                          </TouchableOpacity>
              
                          <TouchableOpacity style={styles.sidebarItem} onPress={() => { router.push("/Homework"); setSidebarVisible(false); }}>
                            <Text style={styles.sidebarText}>📚 שיעורי בית</Text>
                          </TouchableOpacity>
    
                          <TouchableOpacity style={styles.sidebarItem} onPress={() => { router.push("/Classes"); setSidebarVisible(false); }}>
                                <Text style={styles.sidebarText}>🏫 כיתות</Text>
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

      {/* 🔹 SEARCH & CLASS SELECTION */}
      <Text style={styles.title}>בחר כיתה</Text>
      <TextInput
        style={styles.searchInput}
        placeholder="🔍 חפש כיתה..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {/* 🔹 CLASS INFOCARDS */}
      <FlatList
        data={classesData}
        keyExtractor={(item) => item.id}
        numColumns={2}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.classCard} onPress={() => handleClassSelect(item)}>
            <Text style={styles.className}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />

      {/* 🔹 HOMEWORK SECTION */}
      {selectedClass && (
        <>
          <Text style={styles.title}>שיעורי בית ל{selectedClass.name}</Text>
          <TextInput
            style={styles.homeworkInput}
            placeholder="📚 הוסף שיעורי בית..."
            value={newHomework}
            onChangeText={setNewHomework}
          />
          <TouchableOpacity style={styles.addButton} onPress={addHomework}>
            <Text style={styles.addButtonText}>➕ הוסף</Text>
          </TouchableOpacity>

          {/* 🔹 HOMEWORK LIST */}
          <FlatList
            data={homeworkList}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.homeworkItem, item.completed && styles.completedHomework]}
                onPress={() => toggleHomeworkCompletion(item.id)}
              >
                <Text style={styles.homeworkText}>{item.text}</Text>
                <TouchableOpacity onPress={() => deleteHomework(item.id)}>
                  <Text style={styles.deleteIcon}>🗑️</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            )}
          />

          {/* ✅ BUTTON FOR OPENING MESSAGE MODAL */}
          <TouchableOpacity style={styles.messageButton} onPress={() => setMessageModalVisible(true)}>
            <Text style={styles.messageButtonText}>📢 שליחת הודעה</Text>
          </TouchableOpacity>

          {/* ✅ MODAL FOR SENDING MESSAGE */}
          <Modal visible={messageModalVisible} animationType="slide" transparent>
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>📩 שליחת הודעה לכיתה {selectedClass?.name}</Text>
                <TextInput
                  style={styles.messageInput}
                  placeholder="💬 הקלד הודעה לכיתה..."
                  value={messageText}
                  onChangeText={setMessageText}
                  multiline
                />
                <View style={styles.modalButtons}>
                  <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
                    <Text style={styles.sendButtonText}>📨 שלח</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.cancelButton} onPress={() => setMessageModalVisible(false)}>
                    <Text style={styles.cancelButtonText}>❌ בטל</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </>
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
  // 🔹 CLASSES
  title: { fontSize: 22, fontWeight: "bold", marginVertical: 10 },
  searchInput: { padding: 10, borderWidth: 1, borderRadius: 5, marginBottom: 10 },
  classCard: { flex: 1, margin: 5, padding: 20, backgroundColor: "lightblue", alignItems: "center", borderRadius: 10 },
  className: { fontSize: 18, fontWeight: "bold" },

  // 🔹 HOMEWORK
  homeworkInput: { padding: 10, borderWidth: 1, borderRadius: 5, marginBottom: 10 },
  addButton: { backgroundColor: "black", padding: 10, borderRadius: 5 },
  addButtonText: { color: "white", textAlign: "center" },
  homeworkItem: { flexDirection: "row", justifyContent: "space-between", padding: 10, backgroundColor: "white", marginVertical: 5 },
  completedHomework: { backgroundColor: "lightgreen" },
  deleteIcon: { color: "red" },


    // ✅ NEW STYLE FOR "SEND MESSAGE" BUTTON
  messageButton: {
    backgroundColor: "black",
    padding: 15,
    borderRadius: 5,
    marginTop: 15,
  },
  messageButtonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
  // ✅ MODAL STYLES
modalContainer: { 
  flex: 1, 
  justifyContent: "center", 
  alignItems: "center", 
  backgroundColor: "rgba(0,0,0,0.5)" 
},
modalContent: { 
  width: "80%", 
  backgroundColor: "#FFF", 
  padding: 20, 
  borderRadius: 10 
},
modalTitle: { 
  fontSize: 18, 
  fontWeight: "bold", 
  marginBottom: 10, 
  textAlign: "center" 
},
messageInput: { 
  height: 100, 
  borderWidth: 1, 
  borderColor: "#ddd", 
  padding: 10, 
  borderRadius: 5, 
  marginBottom: 10, 
  textAlignVertical: "top" 
},
modalButtons: { 
  flexDirection: "row", 
  justifyContent: "space-between" 
},

// ✅ BUTTONS
sendButton: { 
  backgroundColor: "green", 
  padding: 10, 
  borderRadius: 5, 
  flex: 1, 
  marginRight: 5 
},
sendButtonText: { 
  color: "white", 
  textAlign: "center", 
  fontWeight: "bold" 
},
cancelButton: { 
  backgroundColor: "red", 
  padding: 10, 
  borderRadius: 5, 
  flex: 1, 
  marginLeft: 5 
},
cancelButtonText: { 
  color: "white", 
  textAlign: "center", 
  fontWeight: "bold" 
},



});



export default ClassesScreen;
