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
import TopSidebar from "../components/TopSidebar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "../config";

const HomeworkScreen = () => {
  const router = useRouter();
  const [students, setStudents] = useState([]);
  const [selectedClassIndex, setSelectedClassIndex] = useState(0);
  const [classesData, setClassesData] = useState([]);
  const [userId, setUserId] = useState(null);
  const [subject, setSubject] = useState("");

  //שליפת מקצוע וכיתות
  useEffect(() => {
  const fetchTeacherClasses = async () => {
    const user = await AsyncStorage.getItem("user");
    const parsed = JSON.parse(user);
    const token = await AsyncStorage.getItem("token");
    setUserId(parsed.id);

    const res = await fetch(`${API_BASE_URL}/api/attendance/teacher-classes/${parsed.id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await res.json();
    setClassesData(data);

    // 🔄 שליפת מקצוע מהמורה
    const resSubject = await fetch(`${API_BASE_URL}/api/attendance/teacher-subject/${parsed.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const subjectData = await resSubject.json();
    setSubject(subjectData.subject); // 🎯 עדכון ה־state
  };

  fetchTeacherClasses();
}, []);

//שליפת תלמידים לפי הכיתה שנבחרה
useEffect(() => {
  const fetchStudentsByClass = async () => {
    try {
      if (!classesData[selectedClassIndex]) {
        console.log("No class selected");
        return;
      }
      
      const token = await AsyncStorage.getItem("token");
      console.log(`🔍 Fetching students for class: ${classesData[selectedClassIndex]}`);
      
      const url = `${API_BASE_URL}/api/attendance/students-by-class/${encodeURIComponent(classesData[selectedClassIndex])}`;
      console.log(`🌐 API URL: ${url}`);
      
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log(`📥 Response status: ${res.status}`);
      
      if (!res.ok) {
        console.error(`❌ Error fetching students: ${res.status}`);
        const errorText = await res.text();
        console.error(`❌ Error response: ${errorText}`);
        setStudents([]);
        return;
      }
      
      const data = await res.json();
      console.log(`📊 Received data:`, data);
      
      // Check if data is an array
      if (!Array.isArray(data)) {
        console.error(`❌ Expected array but got:`, data);
        setStudents([]);
        return;
      }
      
      const mapped = data.map((student) => ({
        parentId: student.parentId,
        parentName: student.parentName,
        studentName: student.studentName || "לא ידוע",
        classId: classesData[selectedClassIndex],
        subject: subject,
        homework: false,
        attendance: false
      }));
      
      console.log(`✅ Processed students:`, mapped);
      setStudents(mapped);
      
    } catch (error) {
      console.error(`💥 Error in fetchStudentsByClass:`, error);
      setStudents([]);
    }
  };

  fetchStudentsByClass();
}, [classesData, selectedClassIndex, subject]);



  // 🔹 שינוי הכיתה
  const handleChangeClass = (direction) => {
    let newIndex = selectedClassIndex + direction;
    if (newIndex >= 0 && newIndex < classesData.length) {
      setSelectedClassIndex(newIndex);
    }
  };

  // 🔹 סינון נתונים לפי כיתה ומקצוע
  const filteredStudents = students.filter(
  (student) => student.classId === classesData[selectedClassIndex]
);

  // 🔹 עדכון ה-Checkbox
  const toggleCheckbox = (parentId, field) => {
    setStudents((prevStudents) =>
      prevStudents.map((student) =>
        student.parentId === parentId ? { ...student, [field]: !student[field] } : student
      )
    );
  };

  const handleUpdate = async () => {
    const token = await AsyncStorage.getItem("token");
    const today = new Date().toISOString().split("T")[0];

    const payload = {
      date: today,
      className: classesData[selectedClassIndex],
      subject,
      students: students.map(s => ({
        parentId: s.parentId,
        homework: s.homework,
        attendance: s.attendance,
        teacherId: userId
      }))
    };

    const res = await fetch(`${API_BASE_URL}/api/attendance/save`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    const result = await res.json();
    console.log("🎉 נשמר:", result);
  };

   return (
     <View style={styles.container}>

      {/* top and side bar */}
       <TopSidebar userRole="teacher" />

      
      {/* 🔹 בחירת כיתה */}
      <View style={styles.headerContainer}>
        {selectedClassIndex > 0 && (
          <TouchableOpacity onPress={() => handleChangeClass(-1)}>
            <Text style={styles.arrow}>⬅️</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.headerText}>
          {classesData.length > 0 ? classesData[selectedClassIndex] : "אין כיתות"}
        </Text>

        {selectedClassIndex < classesData.length - 1 && (
          <TouchableOpacity onPress={() => handleChangeClass(1)}>
            <Text style={styles.arrow}>➡️</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* 🔹 SUBJECT TABS */}
      <View style={styles.tabContainer}>
        <TouchableOpacity style={[styles.tab, styles.activeTab]}>
          <Text style={[styles.tabText, styles.activeTabText]}>
            {subject}
          </Text>
        </TouchableOpacity>
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
            <View key={student.parentId} style={styles.tableRow}>
              <Text style={styles.cell}>{student.parentName}</Text>
              <Text style={styles.cell}>{student.studentName}</Text>
              
              <View style={styles.switchContainer}>
                <Switch
                  value={student.homework}
                  onValueChange={() => toggleCheckbox(student.parentId, "homework")}
                />
              </View>

              <View style={styles.switchContainer}>
                <Switch
                  value={student.attendance}
                  onValueChange={() => toggleCheckbox(student.parentId, "attendance")}
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

