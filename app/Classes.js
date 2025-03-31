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

const initialClassesData = [
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

  // ✅ States for adding classes
  const [classes, setClasses] = useState(initialClassesData);
  const [newClassName, setNewClassName] = useState("");
  const [addClassModalVisible, setAddClassModalVisible] = useState(false);

  // ✅ States for sending messages
  const [messageText, setMessageText] = useState("");
  const [messageModalVisible, setMessageModalVisible] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString("he-IL", { hour12: false }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // 🔹 Select a class
  const handleClassSelect = (classObj) => {
    setSelectedClass(classObj);
    setHomeworkList([]); // Reset homework when selecting a class
  };

  // ✅ Add new class (Fully Working)
  const addClass = () => {
    if (!newClassName.trim()) {
      Alert.alert("שגיאה", "שם הכיתה לא יכול להיות ריק!");
      return;
    }
    const newClass = { id: Date.now().toString(), name: newClassName, subjects: [] };
    setClasses([...classes, newClass]);
    setNewClassName("");
    setAddClassModalVisible(false);
  };

  // ✅ Add new homework (Fully Working)
  const addHomework = () => {
    if (!newHomework.trim()) return;
    setHomeworkList([...homeworkList, { id: Date.now().toString(), text: newHomework, completed: false }]);
    setNewHomework("");
  };

  // ✅ Send message (Fully Working)
  const sendMessage = () => {
    if (!messageText.trim()) {
      Alert.alert("שגיאה", "לא ניתן לשלוח הודעה ריקה.");
      return;
    }
    Alert.alert("📢 הודעה נשלחה!", `הודעה נשלחה לכיתה ${selectedClass?.name}: \n\n"${messageText}"`);
    setMessageText("");
    setMessageModalVisible(false);
  };

  return (
    <View style={styles.container}>
      {/* 🔹 Top Bar */}
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

                                <TouchableOpacity style={styles.sidebarItem} onPress={() => { router.push("/TestScore"); setSidebarVisible(false); }}>
                                  <Text style={styles.sidebarText}>📝 ציונים</Text>
                                </TouchableOpacity>
                    
                                <TouchableOpacity style={styles.sidebarItem} onPress={() => { router.push("/"); setSidebarVisible(false); }}>
                                  <Text style={styles.sidebarText}>🚪 התנתקות</Text>
                                </TouchableOpacity>
                              </View>
                            </View>
                          </Modal>

      {/* 🔹 Class Selection */}
      <Text style={styles.title}>בחר כיתה</Text>
      
      <TextInput
        style={styles.searchInput}
        placeholder="🔍 חפש כיתה..."
        placeholderTextColor="black"  // ✅ Makes text black
        textAlign="right"  
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {/* 🔹 Class List */}
      <FlatList
        data={classes}
        keyExtractor={(item) => item.id}
        numColumns={2}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.classCard} onPress={() => handleClassSelect(item)}>
            <Text style={styles.className}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />

 

      {/* ✅ Homework Section */}
      {selectedClass && (
        <>
          <Text style={styles.title}>שיעורי בית ל{selectedClass.name}</Text>
          <TextInput
            style={styles.homeworkInput}
            placeholder="📚 הוסף שיעורי בית..."
            placeholderTextColor="black"  // ✅ Makes the placeholder text black
            textAlign="right"  
            value={newHomework}
            onChangeText={setNewHomework}
          />
          <TouchableOpacity style={styles.addButton} onPress={addHomework}>
            <Text style={styles.addButtonText}>➕ הוספת שיעורי בית</Text>
          </TouchableOpacity>

          {/* ✅ Button to Open Message Modal */}
          <TouchableOpacity style={styles.messageButton} onPress={() => setMessageModalVisible(true)}>
            <Text style={styles.messageButtonText}>📢 שליחת הודעה</Text>
          </TouchableOpacity>
        </>
      )}
           {/* ✅ Button for Adding a Class */}
           <TouchableOpacity style={styles.addClassButton} onPress={() => setAddClassModalVisible(true)}>
        <Text style={styles.addClassButtonText}>➕ הוסף כיתה</Text>
      </TouchableOpacity>

      {/* ✅ Add Class Modal */}
      <Modal visible={addClassModalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>🏫 הוספת כיתה חדשה</Text>
            <TextInput
              style={styles.classInput}
              placeholder="שם הכיתה"
              value={newClassName}
              onChangeText={setNewClassName}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.sendButton} onPress={addClass}>
                <Text style={styles.sendButtonText}> הוסף</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setAddClassModalVisible(false)}>
                <Text style={styles.cancelButtonText}> בטל</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ✅ Send Message Modal */}
      <Modal visible={messageModalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>📩 שליחת הודעה לכיתה {selectedClass?.name}</Text>
            <TextInput
                style={styles.messageInput}
                placeholder="💬 הקלד הודעה לכיתה..."
                placeholderTextColor="black"  // ✅ Makes the placeholder text black
                value={messageText}
                onChangeText={setMessageText}
                multiline
                textAlign="right"  // ✅ Aligns the text and placeholder to the right
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
    </View>
  );
};

// 🎨 **עיצוב הדף**
const styles = StyleSheet.create({
  // 🔹 Main container for the entire screen
  container: { 
    flex: 1, 
    paddingTop: 85, 
    backgroundColor: "#F4F4F4", 
    
  },

  // 🔹 Top navigation bar
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

  // 🔹 Sidebar styling (left-side menu)
  sidebarHeader: {
    flexDirection: "row", 
    justifyContent: "space-between", // Space between user name and close button
    alignItems: "center",
    width: "100%",
    paddingBottom: 10,
    borderBottomWidth: 1, 
    borderBottomColor: "#fff", 
    paddingHorizontal: 5, // Padding from the sides
  },
  menuButton: { 
    padding: 4 
  },
  menuIcon: { 
    color: "white", 
    fontSize: 26 
  },
  dateTime: { 
    color: "white", 
    fontSize: 16, 
    fontWeight: "bold" 
  },

  // 🔹 Modal background styling for popups
  modalBackground: { 
    flex: 1, 
    backgroundColor: "rgba(0,0,0,0.5)" 
  },

  // 🔹 Sidebar (Menu on the left)
  sidebar: { 
    position: "absolute", 
    left: 0, 
    width: 250, 
    height: "100%", 
    backgroundColor: "black", 
    padding: 50 
  },
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
  sidebarItem: { 
    paddingVertical: 15 
  },
  sidebarText: { 
    color: "white", 
    fontSize: 18 
  },

  // 🔹 Class selection section
  title: { 
    fontSize: 22, 
    fontWeight: "bold", 
    marginVertical: 10 ,
    textAlign:"center",
  },
  searchInput: { 
    padding: 10, 
    borderWidth: 1, 
    borderRadius: 5, 
    marginBottom: 10 
  },
  classCard: { 
    flex: 1, 
    margin: 5, 
    padding: 20, 
    backgroundColor: "lightblue", 
    alignItems: "center", 
    borderRadius: 10 
  },
  className: { 
    fontSize: 18, 
    fontWeight: "bold" 
  },

  // 🔹 Homework input and list
  homeworkInput: { 
    padding: 10, 
    borderWidth: 1, 
    borderRadius: 5, 
    marginBottom: 10 
    
  },
  addButton: { 
    backgroundColor: "black",
    padding: 15,
    borderRadius: 5,
    marginTop: 15,
    
  },
  addButtonText: { 
    color: "white", 
    textAlign: "center", 
    fontSize: 16,
    fontWeight: "bold" 
  },

  // ✅ Send Message Button
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

  // ✅ Modal Styles
  modalContainer: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center", 
    backgroundColor: "rgba(0,0,0,0.5)" 
  },
  modalContent: { 
    width: "90%", 
    height: 250,
    borderWidth: 1, 
    backgroundColor: "rgb(255, 255, 255)", 
    padding: 20, 
    borderRadius: 10 ,
    
  },
  modalTitle: { 
    fontSize: 18, 
    fontWeight: "bold", 
    marginBottom: 10, 
    textAlign: "center", 
    margin:5
  },
  
  messageInput: { 
    height: 100, 
    borderWidth: 1, 
    borderColor: "#ddd", 
    padding: 10, 
    borderRadius: 5, 
    marginBottom: 10, 
    textAlignVertical: "top", 
    backgroundColor: "#fff", // ✅ Ensures good contrast
    color: "black", // ✅ Ensures user-typed text is black
  },
  
  modalButtons: { 
    flexDirection: "row", 
    justifyContent: "space-between" 
  },
  classInput: { 
    height: 50, 
    borderWidth: 2, // Make border more visible
    borderColor: "rgba(99, 98, 98, 0.77)", // Blue border to highlight input field
    backgroundColor: "#F8F9FA", // Light gray background for visibility
    padding: 5, 
    borderRadius: 8, // Round the corners
    marginBottom: 10, 
    width: "100%", 
    textAlign: "right", // Aligns text for Hebrew input
    fontSize: 16, // Make text more readable
    color: "#333" // Dark text for contrast
  },
  

  // ✅ Buttons inside the modal (Send & Cancel)
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
    backgroundColor: "rgb(255, 0, 0)", 
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

  // ✅ Add Class Button
  addClassButton: {
    backgroundColor: "black",
    padding: 15,
    borderRadius: 5,
    marginTop: 15,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5, // Adds shadow on Android
    
  },
  addClassButtonText: {
    color: "white",
    fontSize: 15,
    fontWeight: "bold",
    textAlign: "center",
  },

});




export default ClassesScreen;
