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
import TopSidebar from "../components/TopSidebar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as DocumentPicker from "expo-document-picker";
import { API_BASE_URL } from "../config";
import DateTimePickerModal from "react-native-modal-datetime-picker";


const ContactsScreen = () => {
  const router = useRouter();
  const [selectedClassIndex, setSelectedClassIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [contacts, setContacts] = useState([]);

  //בחירת תאריך
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  const [meetingSubject, setMeetingSubject] = useState("");
  const [meetingDate, setMeetingDate] = useState("");


  //בחירת תאריך ושעה
  const [dateObject, setDateObject] = useState(new Date());

  //הורה נבחר(בשביל ההודעות)
  const [selectedParentId, setSelectedParentId] = useState(null);

  // ✅ Add missing modal states
  const [isLetterModalVisible, setLetterModalVisible] = useState(false);
  const [isMeetingModalVisible, setMeetingModalVisible] = useState(false);
  const [isSignatureModalVisible, setSignatureModalVisible] = useState(false);

  // ✅ Fix missing meetingType state
  const [meetingType, setMeetingType] = useState("פרונטלי"); // Default to פרונטלי

  // ✅ Fix missing letter modal states
  const [letterSubject, setLetterSubject] = useState("");
  const [letterContent, setLetterContent] = useState("");
  const [isSending, setIsSending] = useState(false);

  // ✅ Fix missing selectedFile state
  const [selectedFile, setSelectedFile] = useState(null);

  // ✅ Fix missing fileDescription state
  const [fileDescription, setFileDescription] = useState("");

  // ✅ Fix missing uploadDate state
  const [uploadDate, setUploadDate] = useState(new Date().toLocaleDateString());

  // 🔹 New Contact Modal
  const [addContactModalVisible, setAddContactModalVisible] = useState(false);
  const [newContact, setNewContact] = useState({
    parentName: "",
    studentName: "",
    classId: ""
  });

  //העלאת קובץ
  const pickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        setSelectedFile({
          uri: file.uri,
          name: file.name,
          mimeType: file.mimeType || "application/octet-stream"
        });
      }
    } catch (err) {
      Alert.alert("שגיאה בבחירת קובץ", err.message);
    }
  };

  

  //בחירת כיתה והתלמידים
  const [userId, setUserId] = useState(null);
  const [teacherClasses, setTeacherClasses] = useState([]);

  // 🔹 Update Time
  useEffect(() => {
  const fetchTeacherClasses = async () => {
    const user = await AsyncStorage.getItem("user");
    const parsed = JSON.parse(user);
    const token = await AsyncStorage.getItem("token");
    setUserId(parsed.id);

    const res = await fetch(`${API_BASE_URL}/api/attendance/teacher-classes/${parsed.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();
    setTeacherClasses(data); // ⬅️ מחליף את classesData
  };

  fetchTeacherClasses();
}, []);

useEffect(() => {
  const fetchContacts = async () => {
    try {
      // Check if there's a selected class
      if (!teacherClasses || !teacherClasses[selectedClassIndex]) {
        console.log('⚠️ No class selected or no classes available');
        setContacts([]);
        return;
      }
      
      console.log('🔍 Fetching contacts for class:', teacherClasses[selectedClassIndex]);
      
      // Get authentication token
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        console.error('❌ No authentication token found');
        Alert.alert("❌ שגיאה", "אין אישור גישה. נא להתחבר מחדש");
        setContacts([]);
        return;
      }

      // Make API request
      const url = `${API_BASE_URL}/api/attendance/students-by-class/${encodeURIComponent(teacherClasses[selectedClassIndex])}`;
      console.log('🌐 Fetching from URL:', url);
      
      const res = await fetch(url, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      // Check response status
      console.log('📥 Response status:', res.status);
      if (!res.ok) {
        const errorText = await res.text();
        console.error('❌ Failed to fetch contacts:', res.status, errorText);
        Alert.alert("❌ שגיאה", `לא ניתן לטעון אנשי קשר (${res.status})`);
        setContacts([]);
        return;
      }

      // Parse response data
      const data = await res.json();
      console.log("📦 DATA FROM BACKEND:", data);
      
      // Validate data is an array
      if (!Array.isArray(data)) {
        console.error('❌ Expected array but got:', typeof data, data);
        Alert.alert("❌ שגיאה", "התקבל מבנה נתונים שגוי מהשרת");
        setContacts([]);
        return;
      }
      
      // Map data to contacts format
      const mapped = data.map((student) => {
        // Generate a unique ID even if parentId is null
        const contactId = student.parentId || `student-${student.studentName}-${Date.now()}`;
        
        console.log('📝 Mapping contact:', {
          originalParentId: student.parentId,
          generatedId: contactId,
          parentName: student.parentName,
          studentName: student.studentName
        });
        
        return {
          id: contactId, // Use the generated ID that's never null
          parentId: student.parentId, // Keep the original parentId separately
          parentName: student.parentName || 'לא ידוע',
          studentName: student.studentName || 'לא ידוע',
          classId: teacherClasses[selectedClassIndex]
        };
      });

      console.log('✅ Mapped', mapped.length, 'contacts');
      setContacts(mapped);
    } catch (error) {
      console.error('💥 Error in fetchContacts:', error);
      Alert.alert("❌ שגיאה", "אירעה שגיאה בטעינת אנשי קשר: " + error.message);
      setContacts([]);
    }
  };

  fetchContacts();
}, [teacherClasses, selectedClassIndex]);


  // 🔹 Change Selected Class
  const handleChangeClass = (direction) => {
    let newIndex = selectedClassIndex + direction;
    if (newIndex >= 0 && newIndex < teacherClasses.length) {
      setSelectedClassIndex(newIndex);
    }
  };

  // 🔹 Filter Contacts by Class & Search
  const filteredContacts = contacts.filter(
    (contact) =>
      contact.classId === teacherClasses[selectedClassIndex] &&
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
    setNewContact({ parentName: "", studentName: "", classId: teacherClasses[selectedClassIndex] });
    setAddContactModalVisible(false);
  };

  const sendLetter = async () => {
    try {
      console.log('🚀 Starting sendLetter function...');
      setIsSending(true); // ✅ Show loading state
      
      // ✅ Validate required fields with detailed logging
      console.log('🔍 Validating fields:');
      console.log('  - selectedParentId:', selectedParentId);
      console.log('  - letterSubject:', letterSubject);
      console.log('  - letterContent:', letterContent);
      
      // Check if parent ID exists and is valid
      if (!selectedParentId || selectedParentId === "undefined" || selectedParentId === "null") {
        console.log('❌ Validation failed: Invalid parent ID:', selectedParentId);
        Alert.alert("❌ שגיאה", "יש לבחור הורה לשליחת המכתב");
        setIsSending(false);
        return;
      }
      
      // Find the selected contact
      const selectedContact = contacts.find(contact => contact.id === selectedParentId);
      if (!selectedContact) {
        console.log('❌ Validation failed: Contact not found with ID:', selectedParentId);
        console.log('Available contacts:', contacts.map(c => ({id: c.id, parentId: c.parentId, name: c.parentName})));
        Alert.alert("❌ שגיאה", "ההורה שנבחר אינו קיים ברשימה. נא לנסות שוב");
        setIsSending(false);
        return;
      }
      
      // Check if the contact has a valid parentId
      if (!selectedContact.parentId) {
        console.log('❌ Validation failed: Selected contact has no parent ID:', selectedContact);
        Alert.alert("❌ שגיאה", "להורה זה אין מזהה תקין במערכת. אנא פנה למנהל המערכת");
        setIsSending(false);
        return;
      }
      
      if (!letterSubject.trim()) {
        console.log('❌ Validation failed: No subject');
        Alert.alert("❌ שגיאה", "יש להזין נושא למכתב");
        setIsSending(false);
        return;
      }
      
      if (!letterContent.trim()) {
        console.log('❌ Validation failed: No content');
        Alert.alert("❌ שגיאה", "יש להזין תוכן למכתב");
        setIsSending(false);
        return;
      }
      
      console.log('✅ All validations passed, proceeding with send...');

      // ✅ Get teacher ID from stored user data
      const token = await AsyncStorage.getItem("token");
      const storedUser = await AsyncStorage.getItem("user");
      
      if (!token) {
        Alert.alert("❌ שגיאה", "לא נמצא טוקן התחברות. אנא התחבר מחדש");
        return;
      }
      
      if (!storedUser) {
        Alert.alert("❌ שגיאה", "לא נמצאו פרטי משתמש. אנא התחבר מחדש");
        return;
      }

      const userData = JSON.parse(storedUser);
      const senderId = userData.id || userData._id;

      if (!senderId) {
        Alert.alert("❌ שגיאה", "לא נמצא מזהה משתמש. אנא התחבר מחדש");
        return;
      }

      const requestData = {
        senderId: senderId,
        receiverId: selectedContact.parentId, // Use the actual parent ID, not the contact ID
        subject: letterSubject.trim(),
        content: letterContent.trim()
      };
      
      console.log('📤 Request data:', requestData);

      console.log('📤 Sending letter:', requestData);
      console.log('🌐 API URL:', `${API_BASE_URL}/api/communication/send-letter`);

      // ✅ Send letter with proper error handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const res = await fetch(`${API_BASE_URL}/api/communication/send-letter`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(requestData),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      console.log('📥 Response status:', res.status);

      if (!res.ok) {
        let errorData;
        try {
          errorData = await res.json();
          console.error('❌ Send letter error:', errorData);
          
          // Provide specific error messages based on the error
          if (errorData.error === "מזהה מקבל לא תקין") {
            Alert.alert(
              "❌ שגיאה", 
              "מזהה ההורה אינו תקין. נא לפנות למנהל המערכת או לנסות לבחור הורה אחר.",
              [
                { text: "סגור", style: "cancel" },
                { 
                  text: "נסה שוב", 
                  onPress: () => {
                    // Refresh the contacts list
                    fetchContacts();
                  }
                }
              ]
            );
          } else if (errorData.error === "משתמש מקבל לא נמצא במערכת") {
            Alert.alert(
              "❌ שגיאה", 
              "ההורה אינו רשום במערכת. המערכת מנסה ליצור משתמש הורה אוטומטית, אך התהליך נכשל. נא לפנות למנהל המערכת.",
              [{ text: "הבנתי", style: "cancel" }]
            );
          } else {
            Alert.alert("❌ שגיאה", errorData.message || errorData.error || `שליחה נכשלה (${res.status})`);
          }
        } catch (jsonError) {
          console.error('❌ Failed to parse error response:', jsonError);
          Alert.alert("❌ שגיאה", `שליחה נכשלה (${res.status}): תקלת תקשורת עם השרת`);
        }
        return;
      }

      const data = await res.json();
      console.log('✅ Letter sent successfully:', data);

      Alert.alert("✅ הצלחה", "המכתב נשלח להורה בהצלחה");
      setLetterModalVisible(false);
      setLetterSubject("");
      setLetterContent("");
      setSelectedParentId(null);
      
    } catch (error) {
      console.error('💥 Network error in sendLetter:', error);
      
      if (error.name === 'AbortError') {
        Alert.alert("❌ תם הזמן", "הבקשה לשרת ארכה יותר מדי. נסה שוב");
      } else if (error.message.includes('fetch')) {
        Alert.alert("❌ שגיאת רשת", "לא ניתן להתחבר לשרת. בדוק את החיבור לאינטרנט");
      } else {
        Alert.alert("❌ שגיאה", error.message || "שגיאה לא צפויה");
      }
    } finally {
      setIsSending(false); // ✅ Always hide loading state
    }
  };

  const sendFile = async () => {
    try {
      console.log('🚀 Starting sendFile function (signature)...');
      
      // Validate required fields
      if (!selectedFile) {
        console.log('❌ Validation failed: No file selected');
        Alert.alert("❌ שגיאה", "יש לבחור קובץ לשליחה");
        return;
      }
      
      if (!fileDescription || !fileDescription.trim()) {
        console.log('❌ Validation failed: No description');
        Alert.alert("❌ שגיאה", "יש להזין תיאור לקובץ");
        return;
      }
      
      // Find the selected contact
      const selectedContact = contacts.find(contact => contact.id === selectedParentId);
      if (!selectedContact) {
        console.log('❌ Validation failed: Contact not found with ID:', selectedParentId);
        Alert.alert("❌ שגיאה", "ההורה שנבחר אינו קיים ברשימה. נא לנסות שוב");
        return;
      }
      
      // Check if the contact has a valid parentId
      if (!selectedContact.parentId) {
        console.log('❌ Validation failed: Selected contact has no parent ID:', selectedContact);
        Alert.alert("❌ שגיאה", "להורה זה אין מזהה תקין במערכת. אנא פנה למנהל המערכת");
        return;
      }
      
      // Get authentication token and user data
      const token = await AsyncStorage.getItem("token");
      const storedUser = await AsyncStorage.getItem("user");
      
      if (!token) {
        Alert.alert("❌ שגיאה", "לא נמצא טוקן התחברות. אנא התחבר מחדש");
        return;
      }
      
      if (!storedUser) {
        Alert.alert("❌ שגיאה", "לא נמצאו פרטי משתמש. אנא התחבר מחדש");
        return;
      }
      
      const userData = JSON.parse(storedUser);
      const senderId = userData.id || userData._id;
      
      if (!senderId) {
        Alert.alert("❌ שגיאה", "לא נמצא מזהה משתמש. אנא התחבר מחדש");
        return;
      }
      
      // Create form data for the file upload
      const formData = new FormData();
      formData.append("file", {
        uri: selectedFile.uri,
        name: selectedFile.name,
        type: selectedFile.mimeType || "application/octet-stream"
      });
      
      // Add other required fields
      formData.append("receiverId", selectedContact.parentId); // Use the actual parent ID
      formData.append("senderId", senderId);
      formData.append("content", fileDescription.trim());
      
      console.log('📤 Sending signature with file:', {
        fileName: selectedFile.name,
        fileType: selectedFile.mimeType,
        receiverId: selectedContact.parentId,
        senderId: senderId,
        content: fileDescription.trim()
      });
      
      // Send the signature request to the correct endpoint
      console.log('🌐 API URL:', `${API_BASE_URL}/api/communication/signature`);
      const res = await fetch(`${API_BASE_URL}/api/communication/signature`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          // Don't set Content-Type here, it will be set automatically with the boundary
        },
        body: formData
      });
      
      console.log('📥 Response status:', res.status);
      
      // Handle response
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: 'שגיאת שרת' }));
        console.error('❌ Send signature error:', errorData);
        Alert.alert("❌ שגיאה", errorData.message || `שליחת האישור נכשלה (${res.status})`);
        return;
      }
      
      const data = await res.json();
      console.log('✅ Signature sent successfully:', data);
      
      Alert.alert("✅ הצלחה", "האישור נשלח להורה בהצלחה");
      setSignatureModalVisible(false);
      setSelectedFile(null);
      setFileDescription("");
      setSelectedParentId(null);
      
    } catch (error) {
      console.error('💥 Network error in sendFile:', error);
      Alert.alert("❌ שגיאה", `שליחת האישור נכשלה: ${error.message}`);
    }
  };

  const sendMeeting = async () => {
    const token = await AsyncStorage.getItem("token");

    const res = await fetch(`${API_BASE_URL}/api/communication/send-meeting`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        receiverId: selectedParentId,
        senderId: userId,
        type: "meeting",
        subject: meetingSubject,
        meetingType: meetingType,
        meetingDate: meetingDate
      })
    });

    const data = await res.json();

    if (res.ok) {
      Alert.alert("✅ פגישה נשלחה", "הפגישה נקבעה בהצלחה");
      setMeetingModalVisible(false);
      setMeetingSubject("");
      setMeetingDate("");
    } else {
      Alert.alert("❌ שגיאה", data.message || "שליחה נכשלה");
    }
  };

  const cancelMeeting = async () => {
    const token = await AsyncStorage.getItem("token");
    const res = await fetch(`${API_BASE_URL}/api/communication/cancel-meeting`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ receiverId: selectedParentId, senderId: userId })
    });

    const data = await res.json();

    if (res.ok) {
      Alert.alert("📅", "הפגישה בוטלה בהצלחה");
    } else {
      Alert.alert("❌ שגיאה", data.message || "ביטול נכשל");
    }
  };

   return (
     <View style={styles.container}>

      {/* top and side bar */}
       <TopSidebar userRole="teacher" />
      
      {/* 🔹 Class Selector */}
      <View style={styles.headerContainer}>
        {selectedClassIndex > 0 && (
          <TouchableOpacity onPress={() => handleChangeClass(-1)}>
            <Text style={styles.arrow}>⬅️</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.headerText}>
          {teacherClasses.length > 0 ? teacherClasses[selectedClassIndex] : "אין כיתות"}
        </Text>
        {selectedClassIndex < teacherClasses.length - 1 && (
          <TouchableOpacity onPress={() => handleChangeClass(1)}>
            <Text style={styles.arrow}>➡️</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* 🔹 Search Box */}
      <TextInput
        style={styles.searchInput}
        placeholder="🔍 חפש לפי שם הורה או תלמיד"
        textAlign= "right"
        placeholderTextColor="black"
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
              <View style={{ flexDirection: "row"}}>
                <TouchableOpacity onPress={() => {
                  setSelectedParentId(parent.id); // ⬅️ עדכון מזהה ההורה הנבחר
                  setSignatureModalVisible(true);
                }}>
                  <Text style={styles.actionIcon}>📝</Text>
                </TouchableOpacity>

               <TouchableOpacity onPress={() => {
                console.log('✉️ Letter icon pressed for parent:', parent.parentName, 'ID:', parent.id);
                setSelectedParentId(parent.id);
                setLetterModalVisible(true);
              }}>
                <Text style={styles.actionIcon}>✉️</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => {
                setSelectedParentId(parent.id);
                setMeetingModalVisible(true);
              }}>
                <Text style={styles.actionIcon}>📅</Text>
              </TouchableOpacity>

                <TouchableOpacity style={styles.actionButton} onPress={() => {
                  setSelectedParentId(parent.id);
                  cancelMeeting();
                }}>
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
      <TextInput
        style={styles.inputLarge}
        placeholder="נושא"
        placeholderTextColor="black"
        textAlign="right"
        value={meetingSubject}
        onChangeText={setMeetingSubject}
      />

      {/* 🔹 Date Picker */}
      <TouchableOpacity onPress={() => setDatePickerVisibility(true)}>
        <TextInput
          style={styles.input}
          placeholder="תאריך ושעה"
          placeholderTextColor="black"
          value={meetingDate}
          editable={false}
          textAlign="right"
        />
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        placeholder="👤 הורה מקבל"
        value={contacts.find(c => c.id === selectedParentId)?.parentName || ""}
        editable={false}
        placeholderTextColor="black"
        textAlign="right"
      />


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
        <TouchableOpacity style={styles.sendButton} onPress={sendMeeting}>
          <Text style={styles.sendButtonText}>שלח</Text>
        </TouchableOpacity>

      </View>
    </View>
  </View>
    <DateTimePickerModal
    isVisible={isDatePickerVisible}
    mode="datetime"
    minimumDate={new Date(Date.now() + 24 * 60 * 60 * 1000)} // ממחר ומעלה
    onConfirm={(selectedDate) => {
      setDatePickerVisibility(false);
      setDateObject(selectedDate);
      const formatted = selectedDate.toLocaleString("he-IL", {
        dateStyle: "short",
        timeStyle: "short",
      });
      setMeetingDate(formatted);
    }}
    onCancel={() => setDatePickerVisibility(false)}
    locale="he-IL"
  />



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
        <TouchableOpacity onPress={() => {
          console.log('🚪 Closing letter modal');
          setLetterModalVisible(false);
          setIsSending(false);
          // Don't clear subject/content to preserve user input
        }}>
          <Text style={styles.closeButton}>✖</Text>
        </TouchableOpacity>
      </View>

      {/* 🔹 Subject Input */}
      <TextInput
        style={styles.input}
        placeholder="📌 נושא המכתב"
        value={letterSubject}
        onChangeText={setLetterSubject}
        placeholderTextColor="black"  // ✅ Makes text black
        textAlign="right"  
      />

      {/* 🔹 Letter Content */}
      <TextInput
        style={styles.textArea}
        placeholder="✍️ תוכן המכתב..."
        value={letterContent}
        onChangeText={setLetterContent}
        multiline
        placeholderTextColor="black"  // ✅ Makes text black
        textAlign="right"  
      />

      {/* 🔹 Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => {
            console.log('❌ Cancel button pressed');
            setLetterModalVisible(false);
            setIsSending(false);
          }}
        >
          <Text style={styles.cancelButtonText}>ביטול</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[
            styles.sendButton, 
            isSending && styles.sendButtonDisabled
          ]} 
          onPress={() => {
            if (isSending) return; // ✅ Prevent multiple presses
            console.log('🔘 Send button pressed!');
            console.log('📧 Letter Subject:', letterSubject);
            console.log('📝 Letter Content:', letterContent);
            console.log('👤 Selected Parent ID:', selectedParentId);
            sendLetter();
          }}
          activeOpacity={isSending ? 1 : 0.7}
          disabled={isSending}
        >
          <Text style={styles.sendButtonText}>
            {isSending ? "⏳ שולח..." : "📨 שלח"}
          </Text>
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
        value={contacts.find(c => c.id === selectedParentId)?.parentName || ""}
        editable={false}
        placeholderTextColor="black"
        textAlign="right"
      />

      {/* 🔹 File Description */}
      <TextInput
        style={styles.textArea}
        placeholder="📝 תיאור הקובץ..."
        value={fileDescription}
        onChangeText={setFileDescription}
        multiline
        placeholderTextColor="black"  // ✅ Makes text black
        textAlign="right"  
        
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
        <TouchableOpacity
          style={styles.addContactButton}
          onPress={() => {
            setNewContact({
              parentName: "",
              studentName: "",
              classId: teacherClasses[selectedClassIndex] || ""
            });
            setAddContactModalVisible(true);
          }}
        >
          <Text style={styles.addContactButtonText}>➕ הוסף איש קשר</Text>
        </TouchableOpacity>

        {/* 🔹 Add Contact Modal */}
        <Modal visible={addContactModalVisible} animationType="slide" transparent>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>👤 הוסף איש קשר חדש</Text>
              

              <TextInput style={styles.input} 
              placeholder="שם ההורה" 
              value={newContact.parentName} 
              onChangeText={(text) => setNewContact({ ...newContact, parentName: text })}
              textAlign= "right"
              placeholderTextColor="black"
               />
              <TextInput style={styles.input} 
              placeholder="שם התלמיד" value={newContact.studentName}
              onChangeText={(text) => setNewContact({ ...newContact, studentName: text })} 
              textAlign= "right"
              placeholderTextColor="black"
               />

              <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setAddContactModalVisible(false)}>
                  <Text style={styles.cancelButtonText}> בטל</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.sendButton} onPress={addNewContact}>
                  <Text style={styles.sendButtonText}>שמור</Text> 
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


  tableRow: {
    flexDirection: "row", // ✅ סידור שורות לרוחב
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    paddingVertical: 10,
    alignItems: "center",
  },

  searchInput: {
    height: 40,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
    marginBottom: 15,

  },

  actionButton: { justifyContent: "center",marginHorizontal: 5},
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

  title: {
    fontSize: 20,
    fontWeight: "bold",
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
  
  headerCell: {
    flex: 1, // Ensures equal column width
    fontWeight: "bold",
    textAlign: "center",
    minWidth: 80, // Prevents columns from shrinking too much
    paddingLeft: 10,
  },

  cell: {
    flex: 1,
    textAlign: "center",
    paddingHorizontal: 5, // Prevents text from touching the edges
    minWidth: 80, // Ensures cells don't get too small
  },

  
  

  actionIcon: {
    fontSize: 17,  
    textAlign: "center",
    color: "#333",
    padding: 3,
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
  
  iconBox: {
    backgroundColor: "#EAEAEA",
    padding: 10,
    borderRadius: 8,
    marginRight: 10,
  },
 
  

  input: {
    borderWidth: 1, 
    borderColor: "#ddd", 
    borderRadius: 8, 
    padding: 12, 
    margin: 5, 
    fontSize: 16, 
    backgroundColor: "#F9F9F9",
    width: "100%", // ✅ Ensures the input field spans full width
    textAlign: "right", // ✅ Aligns placeholder and text to the right
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
  
  uploadDate: {
    fontSize: 14,
    color: "#555",
    textAlign: "right",
    marginBottom: 12,
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

cancelButtonText: {
  fontSize: 16,
  fontWeight: "bold",
  color: "#D32F2F", // ✅ Red for cancel button
},

cancelButton: {
  flex: 1,
  backgroundColor: "#ddd",
  paddingVertical: 14,
  borderRadius: 8,
  alignItems: "center",
  marginRight: 10,
},

sendButton: {
  flex: 1,
  backgroundColor: "black",
  paddingVertical: 14,
  borderRadius: 8,
  alignItems: "center",
},

sendButtonDisabled: {
  backgroundColor: "#666", // ✅ Grayed out when disabled
  opacity: 0.7,
},

sendButtonText: {
  fontSize: 16,
  fontWeight: "bold",
  color: "white",
},


/*
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

*/


});

export default ContactsScreen;


