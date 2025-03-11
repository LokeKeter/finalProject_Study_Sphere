import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  Switch,
} from "react-native";
import { useRouter } from "expo-router";

const classesData = ["כיתה א'", "כיתה ב'", "כיתה ג'"];
const subjectsData = ["מתמטיקה", "אנגלית", "עברית"];

const studentsData = [
  { id: "1", parentName: "יוסי כהן", studentName: "דנה כהן", classId: "כיתה א'", subject: "מתמטיקה", homework: false, attendance: false },
  { id: "2", parentName: "רונית לוי", studentName: "איתי לוי", classId: "כיתה ב'", subject: "אנגלית", homework: true, attendance: true },
  { id: "3", parentName: "משה ישראלי", studentName: "נועה ישראלי", classId: "כיתה א'", subject: "עברית", homework: false, attendance: true },
  { id: "4", parentName: "שרה דויד", studentName: "עומר דויד", classId: "כיתה ג'", subject: "מתמטיקה", homework: true, attendance: false },
];

const HomeworkScreen = () => {
  const router = useRouter();
  const [students, setStudents] = useState(studentsData);
  const [selectedClassIndex, setSelectedClassIndex] = useState(0);
  const [selectedSubjectIndex, setSelectedSubjectIndex] = useState(0);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // 🔹 שינוי הכיתה
  const handleChangeClass = (direction) => {
    let newIndex = selectedClassIndex + direction;
    if (newIndex >= 0 && newIndex < classesData.length) {
      setSelectedClassIndex(newIndex);
    }
  };

  // 🔹 סינון נתונים לפי כיתה ומקצוע
  const filteredStudents = students.filter(
    (student) =>
      student.classId === classesData[selectedClassIndex] &&
      student.subject === subjectsData[selectedSubjectIndex]
  );

  // 🔹 עדכון ה-Checkbox
  const toggleCheckbox = (id, field) => {
    setStudents((prevStudents) =>
      prevStudents.map((student) =>
        student.id === id ? { ...student, [field]: !student[field] } : student
      )
    );
  };

  const handleUpdate = () => {
    console.log("🔥 נתונים עודכנו!");
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

      
      {/* 🔹 בחירת כיתה */}
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

      {/* 🔹 SUBJECT TABS */}
      <View style={styles.tabContainer}>
        {subjectsData.map((subject, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.tab, selectedSubjectIndex === index && styles.activeTab]}
            onPress={() => setSelectedSubjectIndex(index)}
          >
            <Text style={[styles.tabText, selectedSubjectIndex === index && styles.activeTabText]}>
              {subject}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 🔹 טבלה */}
      <ScrollView>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.headerCell}>שם הורה</Text>
            <Text style={styles.headerCell}>שם תלמיד</Text>
            <Text style={styles.headerCell}>שיעורי בית</Text>
            <Text style={styles.headerCell}>נוכחות</Text>
          </View>

          {filteredStudents.map((student) => (
            <View key={student.id} style={styles.tableRow}>
              <Text style={styles.cell}>{student.parentName}</Text>
              <Text style={styles.cell}>{student.studentName}</Text>
              
              <View style={styles.switchContainer}>
                <Switch
                  value={student.homework}
                  onValueChange={() => toggleCheckbox(student.id, "homework")}
                />
              </View>

              <View style={styles.switchContainer}>
                <Switch
                  value={student.attendance}
                  onValueChange={() => toggleCheckbox(student.id, "attendance")}
                />
              </View>
            </View>
          ))}
        </View>

        {/* 🔹 כפתור "עדכון" */}
        <TouchableOpacity style={styles.updateButton} onPress={handleUpdate}>
          <Text style={styles.updateButtonText}>🔄 עדכון</Text>
        </TouchableOpacity>

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
  // ✅ Tabs (Subjects) in a row
tabContainer: { 
  flexDirection: "row", 
  justifyContent: "center", 
  alignItems: "center", 
  marginVertical: 10 
},
tab: { 
  flex: 1, // ✅ Equal spacing for all tabs 
  paddingVertical: 10, 
  backgroundColor: "#ddd", 
  borderRadius: 5, 
  alignItems: "center", 
  marginHorizontal: 5 
},
activeTab: { 
  backgroundColor: "black" 
},
tabText: { 
  fontSize: 16, 
  fontWeight: "bold" 
},
activeTabText: { 
  color: "white", 
  fontWeight: "bold" 
},

});

export default HomeworkScreen;

