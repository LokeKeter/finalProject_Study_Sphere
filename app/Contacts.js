import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  StyleSheet, 
  TextInput, 
  Modal, 
  Alert
} from "react-native";
import { useRouter } from "expo-router";
import React, { useState, useEffect } from "react";

// 🔹 Class Data
const classesData = ["כיתה א'", "כיתה ב'", "כיתה ג'"];

// 🔹 Default Parents Data
const initialParentsData = [
  { id: "1", parentName: "יוסי כהן", studentName: "דנה כהן", classId: "כיתה א'" },
  { id: "2", parentName: "רונית לוי", studentName: "איתי לוי", classId: "כיתה ב'" },
  { id: "3", parentName: "משה ישראלי", studentName: "נועה ישראלי", classId: "כיתה א'" },
  { id: "4", parentName: "שרה דויד", studentName: "עומר דויד", classId: "כיתה ג'" },
];

const ContactsScreen = () => {
  const router = useRouter();
  const [selectedClassIndex, setSelectedClassIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const [contacts, setContacts] = useState(initialParentsData);

  // ✅ Add missing modal states
  const [isLetterModalVisible, setLetterModalVisible] = useState(false);
  const [isMeetingModalVisible, setMeetingModalVisible] = useState(false);
  const [isSignatureModalVisible, setSignatureModalVisible] = useState(false);

  // ✅ Fix missing meetingType state
  const [meetingType, setMeetingType] = useState("פרונטלי"); // Default to פרונטלי

  // ✅ Fix missing letter modal states
  const [letterSubject, setLetterSubject] = useState("");
  const [letterContent, setLetterContent] = useState("");

  // ✅ Fix missing selectedFile state
  const [selectedFile, setSelectedFile] = useState(null);

  // ✅ Fix missing parentName state
  const [parentName, setParentName] = useState("");

  // ✅ Fix missing fileDescription state
  const [fileDescription, setFileDescription] = useState("");

  // ✅ Fix missing uploadDate state
  const [uploadDate, setUploadDate] = useState(new Date().toLocaleDateString());

  // 🔹 Modal States
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [isMessageModalVisible, setMessageModalVisible] = useState(false);

  // 🔹 Current Contact in Modals
  const [currentContact, setCurrentContact] = useState(null);

  // 🔹 New Contact Modal
  const [addContactModalVisible, setAddContactModalVisible] = useState(false);
  const [newContact, setNewContact] = useState({ parentName: "", studentName: "", classId: classesData[selectedClassIndex] });

  // 🔹 Update Time
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // 🔹 Change Selected Class
  const handleChangeClass = (direction) => {
    let newIndex = selectedClassIndex + direction;
    if (newIndex >= 0 && newIndex < classesData.length) {
      setSelectedClassIndex(newIndex);
    }
  };

  // 🔹 Filter Contacts by Class & Search
  const filteredContacts = contacts.filter(
    (contact) =>
      contact.classId === classesData[selectedClassIndex] &&
      (contact.parentName.includes(searchQuery) || contact.studentName.includes(searchQuery))
  );

  // 🔹 Add New Contact
  const addNewContact = () => {
    if (!newContact.parentName || !newContact.studentName) {
      Alert.alert("❌ שגיאה", "נא למלא את כל השדות.");
      return;
    }

    const newEntry = {
      id: Date.now().toString(),
      parentName: newContact.parentName,
      studentName: newContact.studentName,
      classId: newContact.classId,
    };
    


    setContacts([...contacts, newEntry]);
    setNewContact({ parentName: "", studentName: "", classId: classesData[selectedClassIndex] });
    setAddContactModalVisible(false);
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
                                    <Text style={styles.cButton}>✖</Text>
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
      
      {/* 🔹 Class Selector */}
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

      {/* 🔹 Search Box */}
      <TextInput
        style={styles.searchInput}
        placeholder="🔍 חפש לפי שם הורה או תלמיד"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {/* 🔹 Contacts Table */}
      <ScrollView>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.headerCell}>שם ההורה</Text>
            <Text style={styles.headerCell}>שם התלמיד</Text>
            <Text style={styles.headerCell}>פעולות      </Text>
          </View>
          

          {filteredContacts.map((parent) => (

            <View key={parent.id} style={styles.tableRow}>
              <Text style={styles.cell}>{parent.parentName}</Text>
              <Text style={styles.cell}>{parent.studentName}</Text>

              {/* 🔹 פעולות */}
              <View style={{ flexDirection: "row", gap: 0, padding: 0, margin: 0 }}>
              <TouchableOpacity onPress={() => setSignatureModalVisible(true)}>
                <Text style={styles.actionText}>📝</Text> {/* Upload Icon */}
              </TouchableOpacity>

               <TouchableOpacity onPress={() => setLetterModalVisible(true)}>
                <Text style={styles.actionText}>✉️</Text> {/* You can change the icon */}
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.actionButton} 
                onPress={() => setMeetingModalVisible(true)} // ✅ Open Popup
                >
                  <Text style={styles.actionIcon}>📅</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionButton}>
                  <Text style={styles.actionIcon}>❌</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
          <Modal visible={isMeetingModalVisible} transparent animationType="slide">
  <View style={styles.overlay}>
    <View style={styles.popup}>
      {/* 🔹 Header */}
      <View style={styles.header}>
        <Text style={styles.title}>פגישה</Text>
        <TouchableOpacity onPress={() => setMeetingModalVisible(false)}>
          <Text style={styles.closeButton}>✖</Text>
        </TouchableOpacity>
      </View>

      {/* 🔹 Description Input */}
      <TextInput style={styles.inputLarge} placeholder="נושא" />

      {/* 🔹 Date Picker */}
      <TextInput style={styles.input} placeholder="תאריך ושעה" />

      {/* 🔹 Participants Input */}
      <TextInput style={styles.input} placeholder="בחר משתתפים" />

      <View style={styles.checkboxContainer}>
  <TouchableOpacity 
    style={[styles.checkbox, meetingType === "פרונטלי" && styles.selectedCheckbox]}
    onPress={() => setMeetingType("פרונטלי")}
  >
    <Text style={[styles.checkboxText, meetingType === "פרונטלי" && styles.selectedText]}>פרונטלי</Text>
  </TouchableOpacity>

  <TouchableOpacity 
    style={[styles.checkbox, meetingType === "זום" && styles.selectedCheckbox]}
    onPress={() => setMeetingType("זום")}
  >
    <Text style={[styles.checkboxText, meetingType === "זום" && styles.selectedText]}>זום</Text>
  </TouchableOpacity>
</View>


      {/* 🔹 Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.cancelButton} onPress={() => setMeetingModalVisible(false)}>
          <Text style={styles.cancelButtonText}>ביטול</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.sendButton}>
          <Text style={styles.sendButtonText}>שלח</Text>
        </TouchableOpacity>
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
<Modal visible={isSignatureModalVisible} transparent animationType="slide">
  <View style={styles.overlay}>
    <View style={styles.popup}>
      
      {/* 🔹 Header */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <View style={styles.iconBox}>
            <Text style={styles.icon}>📤</Text>
          </View>
          <Text style={styles.title}>אישור לחתימה</Text>
        </View>
        <TouchableOpacity onPress={() => setSignatureModalVisible(false)}>
          <Text style={styles.closeButton}>✖</Text>
        </TouchableOpacity>
      </View>

      {/* 🔹 File Upload */}
      <TouchableOpacity style={styles.uploadArea} onPress={() => pickFile()}>
  <Text style={styles.uploadText}>
    {selectedFile ? `📎 ${selectedFile.name}` : "📂 העלה קובץ (PDF, DOC, JPG)"}
  </Text>
</TouchableOpacity>

      {/* 🔹 Parent Selection */}
      <TextInput
        style={styles.input}
        placeholder="👤 הורה מקבל"
        value={parentName}
        onChangeText={setParentName}
      />

      {/* 🔹 File Description */}
      <TextInput
        style={styles.textArea}
        placeholder="📝 תיאור הקובץ..."
        value={fileDescription}
        onChangeText={setFileDescription}
        multiline
      />

      {/* 🔹 Auto-filled Date */}
      <Text style={styles.uploadDate}>📅 תאריך שליחה: {uploadDate}</Text>

      {/* 🔹 Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => setSignatureModalVisible(false)}
        >
          <Text style={styles.cancelButtonText}>ביטול</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.sendButton} onPress={() => sendFile()}>
          <Text style={styles.sendButtonText}>📨 אישור ושלח</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
</Modal>
        </View>


        {/* 🔹 Add Contact Button */}
        <TouchableOpacity style={styles.addContactButton} onPress={() => setAddContactModalVisible(true)}>
          <Text style={styles.addContactButtonText}>➕ הוסף איש קשר</Text>
        </TouchableOpacity>

        {/* 🔹 Add Contact Modal */}
        <Modal visible={addContactModalVisible} animationType="slide" transparent>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>👤 הוסף איש קשר חדש</Text>

              <TextInput style={styles.input} placeholder="שם ההורה" value={newContact.parentName} onChangeText={(text) => setNewContact({ ...newContact, parentName: text })} />
              <TextInput style={styles.input} placeholder="שם התלמיד" value={newContact.studentName} onChangeText={(text) => setNewContact({ ...newContact, studentName: text })} />

              <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setAddContactModalVisible(false)}>
                  <Text style={styles.cancelButtonText}> בטל</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveButton} onPress={addNewContact}>
                  <Text style={styles.saveButtonText}> שמור</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

      </ScrollView>
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
  
  cButton: {
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
  actionText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'blue', // Or any other color you like
    padding: 10,
  },
  
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Dark overlay
  },

  popup: {
    width: "90%",
    maxWidth: 500,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
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

  titleIcon: {
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

  inputLarge: {
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

  toggleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#ddd",
    marginVertical: 12,
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
  tableContainer: {
    marginTop: 10,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#fff",
    padding: 10,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#ddd",
    padding:10,
    borderRadius: 5,
  },
  headerCell: {
    flex: 1, // Ensures equal column width
    fontWeight: "bold",
    textAlign: "center",
    minWidth: 80, // Prevents columns from shrinking too much
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  cell: {
    flex: 1,
    textAlign: "center",
    paddingHorizontal: 5, // Prevents text from touching the edges
    minWidth: 80, // Ensures cells don't get too small
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "flex-start",  // 🔹 Ensures icons stick together
    alignItems: "center",
    flex: 1,
    gap: 0,  // ❌ Ensures no extra space
    padding: 0,  // ❌ Remove padding
    margin: 0,  // ❌ Remove margin
  },
  
  
  actionButton: {
    padding: 0,  // ❌ Remove padding
    margin: 0,   // ❌ Remove margins
    alignItems: "center",
    justifyContent: "center",
  },
  actionIcon: {
    fontSize: 20,  
    textAlign: "center",
    color: "#333",
    padding: 0,  // ❌ Remove padding
    margin: 0,   // ❌ Remove margins
  },
  checkboxContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    padding: 10,
  },
  checkbox: {
    flex: 1,
    alignItems: "center",
    padding: 10,
  },
  selectedCheckbox: {
    backgroundColor: "black",
    borderRadius: 5,
  },
  checkboxText: {
    fontSize: 16,
    color: "black",
  },
  selectedText: {
    color: "white",
    fontWeight: "bold",
  },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
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
  
  uploadArea: {
    borderWidth: 2,
    borderColor: "#ddd",
    borderStyle: "dashed",
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  
  uploadText: {
    fontSize: 16,
    color: "#666",
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
    height: 80,
    textAlignVertical: "top",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
    backgroundColor: "#F9F9F9",
  },
  
  uploadDate: {
    fontSize: 14,
    color: "#555",
    textAlign: "right",
    marginBottom: 12,
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
  addContactButton: {
    backgroundColor: "black",
    padding: 15,
    borderRadius: 8,
    margin: 10,
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
  },
  addContactButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  // 🔹 Center the modal and add a slight shadow
modalContent: {
  alignItems: "center",
  width: "85%",
  padding: 20,
  backgroundColor: "#FFF",
  borderRadius: 12,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.2,
  shadowRadius: 6,
},
buttonContainer: {
  flexDirection: "row",  // Arrange buttons in a row
  justifyContent: "space-between",  // Ensure space between buttons
  alignItems: "center",  // Align buttons vertically
  width: "100%",  // Make sure the container takes full width
  marginTop: 15,
  gap: 10,  // Add space between buttons (optional)
},

cancelButton: {
  flex: 1, // ✅ Make buttons take equal space
  backgroundColor: "#ddd",
  paddingVertical: 14,
  borderRadius: 8,
  alignItems: "center",
  justifyContent: "center", // ✅ Ensures text is centered
  minWidth: 120, // ✅ Prevents buttons from being too small
},

cancelButtonText: {
  fontSize: 16,
  fontWeight: "bold",
  color: "#D32F2F", // ✅ Red for cancel button
},

saveButton: {
  flex: 1, // ✅ Make buttons take equal space
  backgroundColor: "black",
  paddingVertical: 14,
  borderRadius: 8,
  alignItems: "center",
  justifyContent: "center", // ✅ Ensures text is centered
  minWidth: 120, // ✅ Prevents buttons from being too small
},

saveButtonText: {
  fontSize: 16,
  fontWeight: "bold",
  color: "white",
},




});

export default ContactsScreen;


