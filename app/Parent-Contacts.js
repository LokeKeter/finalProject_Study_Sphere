import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TextInput,
  Modal,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import TopSidebar from '../components/TopSidebar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config';

const parentsData = [
  { id: "1", parentName: "יוסי כהן", studentName: "מטמטיקה" },
  { id: "2", parentName: "רונית לוי", studentName: "היסטוריה" },
  { id: "3", parentName: "משה ישראלי", studentName: "לשון" },
  { id: "4", parentName: "שרה דויד", studentName: "תנ''ך" },
];

const ContactsScreen = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const [isLetterModalVisible, setLetterModalVisible] = useState(false);
  const [letterSubject, setLetterSubject] = useState("");
  const [letterContent, setLetterContent] = useState("");
  const [teachers, setTeachers] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        console.log('🚀 Fetching teachers for parent...');
        
        // Get user data and token
        const userStr = await AsyncStorage.getItem('user');
        const token = await AsyncStorage.getItem('token');
        
        if (!userStr) {
          console.error('❌ No user data in storage');
          Alert.alert('שגיאה', 'לא נמצאו פרטי משתמש. אנא התחבר מחדש.');
          setTeachers([]);
          return;
        }
        
        if (!token) {
          console.error('❌ No token in storage');
          Alert.alert('שגיאה', 'לא נמצא טוקן התחברות. אנא התחבר מחדש.');
          setTeachers([]);
          return;
        }
        
        // Parse user data
        const parsed = JSON.parse(userStr);
        console.log('👤 User data:', parsed);
        
        // Get parent ID
        const parentId = parsed?.id || parsed?._id;
        
        if (!parentId) {
          console.error('❌ No parentId in user data');
          Alert.alert('שגיאה', 'לא נמצא מזהה הורה. אנא התחבר מחדש.');
          setTeachers([]);
          return;
        }
        
        console.log('👤 Parent ID:', parentId);
        
        // Create API URL
        const url = `${API_BASE_URL}/api/communication/contacts/teachers/${encodeURIComponent(parentId)}`;
        console.log('🌐 API URL:', url);
        
        // Set up request with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
        // Fetch data
        const res = await fetch(url, { 
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        console.log('📥 Response status:', res.status);
        
        if (!res.ok) {
          let errorData;
          try {
            errorData = await res.json();
            console.error('❌ Server error response:', errorData);
          } catch (jsonError) {
            console.error('❌ Failed to parse error response');
          }
          
          console.error(`❌ Failed to fetch teachers: ${res.status}`);
          Alert.alert('שגיאה', `לא ניתן לטעון את רשימת המורים (${res.status})`);
          setTeachers([]);
          return;
        }
        
        // Parse response
        const data = await res.json();
        console.log('📊 Teachers data:', data);
        
        if (!Array.isArray(data)) {
          console.error('❌ Response is not an array:', data);
          Alert.alert('שגיאה', 'התקבל מבנה נתונים לא תקין מהשרת');
          setTeachers([]);
          return;
        }
        
        if (data.length === 0) {
          console.log('ℹ️ No teachers found for this parent');
        } else {
          console.log(`✅ Found ${data.length} teachers`);
        }
        
        // Update state
        setTeachers(data);
        
      } catch (error) {
        if (error.name === 'AbortError') {
          console.error('❌ Request timed out');
          Alert.alert('שגיאה', 'הבקשה לשרת נכשלה עקב זמן תגובה ארוך מדי');
        } else {
          console.error('❌ Error fetching teachers:', error.message);
          Alert.alert('שגיאה', `אירעה שגיאה בטעינת רשימת המורים: ${error.message}`);
        }
        setTeachers([]);
      }
    };
    
    fetchTeachers();
  }, []);

  const q = (searchQuery || '').toLowerCase();
  const filteredTeachers = teachers.filter(t => {
    const name = String(t.name || '').toLowerCase();
    const subj = String(t.subject || '').toLowerCase();
    return name.includes(q) || subj.includes(q);
  });

  // 🔹 סינון נתונים לפי כיתה ושם
  const filteredParents = parentsData.filter(
    (parent) =>
      parent.parentName.includes(searchQuery) ||
      parent.studentName.includes(searchQuery)
  );
  
  

  return (
    <View style={styles.container}>
      
      {/* top and side bar */}
      <TopSidebar userRole="parent" />

      {/* 🔹 חיפוש לפי שם הורה/תלמיד */}
      <TextInput
        style={styles.searchInput}
        placeholder="חפש לפי שם הורה או תלמיד 🔍"
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholderTextColor="black"
        textAlign="right"
      />

      {/* 🔹 טבלה */}
      <ScrollView>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.headerCell}>       שם המורה</Text>
            <Text style={styles.headerCell}>            מקצוע</Text>
          </View>

          {filteredTeachers.length > 0 ? (
            filteredTeachers.map((t) => (
              <View key={t._id} style={styles.tableRow}>
                <Text style={styles.cell}>{t.name}</Text>
                <Text style={styles.cell}>{t.subject || '—'}</Text>
                {/* פעולות */}
                <View style={styles.actionsContainer}>
                  <TouchableOpacity onPress={() => {
                    setSelectedTeacher(t);
                    setLetterSubject('');
                    setLetterContent('');
                    setLetterModalVisible(true);
                  }}>
                    <Text style={styles.actionText}>✉️   </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.noDataContainer}>
              <Text style={styles.noDataText}>לא נמצאו מורים לתלמיד זה</Text>
              <Text style={styles.noDataSubText}>אנא פנה למנהל המערכת לקבלת סיוע</Text>
            </View>
          )}
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
          <Text style={styles.title}>מכתב למורה</Text>
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
        <TouchableOpacity
          style={styles.sendButton}
          onPress={async () => {
            try {
              if (!selectedTeacher?._id) {
                Alert.alert("❌ שגיאה", "בחר/י מורה.");
                return;
              }
              if (!letterSubject.trim() || !letterContent.trim()) {
                Alert.alert("❌ שגיאה", "יש למלא נושא ותוכן.");
                return;
              }

              const userStr = await AsyncStorage.getItem('user');
              const token   = await AsyncStorage.getItem('token');
              const parsed  = userStr ? JSON.parse(userStr) : {};
              const parentId = parsed?.id || parsed?._id;

              const res = await fetch(`${API_BASE_URL}/api/communication/send-letter`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  // הראוט הזה אצלך לא מוגן, אבל לא מזיק לשלוח:
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  senderId: parentId,
                  receiverId: selectedTeacher._id,
                  subject: letterSubject.trim(),
                  content: letterContent.trim()
                })
              });

              if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.message || 'שליחה נכשלה');
              }

              Alert.alert("✅ הצלחה", "המכתב נשלח למורה.");
              setLetterModalVisible(false);
              setSelectedTeacher(null);
              setLetterSubject('');
              setLetterContent('');
            } catch (e) {
              Alert.alert("❌ שגיאה", e.message);
            }
          }}
        >
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
  noDataContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  noDataText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#555',
    textAlign: 'center',
    marginBottom: 8,
  },
  noDataSubText: {
    fontSize: 14,
    color: '#777',
    textAlign: 'center',
  },
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
  tableHeader: { flexDirection: "row", backgroundColor: "#ddd", padding: 10, borderRadius: 5 , justifyContent: "center", alignItems: "center"},
  headerCell: { flex: 1, fontWeight: "bold", textAlign: "center", alignSelf: "stretch", textAlignVertical: "center", paddingVertical: 5,},

  tableRow: {
    flexDirection: "row", // ✅ סידור שורות לרוחב
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  cell: { flex: 1,  textAlign: "center", alignSelf: "stretch", textAlignVertical: "center", paddingVertical: 5,},

  searchInput: {
    height: 40,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
    marginBottom: 15,
    textAlign: "right",
    
  },


  actionsContainer: { flexDirection: "row", justifyContent: "center" },
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
