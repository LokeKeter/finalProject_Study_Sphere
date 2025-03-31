import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
} from "react-native";
import { useRouter } from "expo-router";

const testTypes = ["מבחן", "בוחן"];
const classNames = ["כיתה א'", "כיתה ב'", "כיתה ג'", "כיתה ד'", "כיתה ה'", "כיתה ו'", "כיתה ז'"];


const studentData = {
  "כיתה א'": [
    { id: "1", name: "דנה כהן", idNumber: "123456789", score: "" },
    { id: "2", name: "איתי לוי", idNumber: "234567890", score: "" },
  ],
  "כיתה ב'": [
    { id: "3", name: "נועה ישראלי", idNumber: "345678901", score: "" },
  ],
  "כיתה ג'": [
    { id: "4", name: "עומר דויד", idNumber: "456789012", score: "" },
  ],
};

// מחלק מערך לתת-מערכים בגודל 3
const chunkArray = (array, size) => {
  const result = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
};


const TestScreen = () => {
  const router = useRouter();

  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [testIndex, setTestIndex] = useState(0);
  const [selectedClass, setSelectedClass] = useState(null);
  const [scores, setScores] = useState(studentData);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleScoreChange = (className, studentId, value) => {
    const numeric = value.replace(/[^0-9]/g, "");
    const validScore = Math.min(100, Math.max(0, parseInt(numeric || 0)));

    const updatedClass = scores[className].map((student) =>
      student.id === studentId ? { ...student, score: validScore.toString() } : student
    );
    setScores({ ...scores, [className]: updatedClass });
  };

//כפתור שלח ציונים
const handleSubmitScores = () => {
  const missingScore = scores[selectedClass].some((student) => student.score === "");
  if (missingScore) {
    alert("יש תלמידים בלי ציון. נא להשלים לפני שליחה.");
    return;
  }
  alert("הציונים נשלחו בהצלחה!");
};



  return (
    <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
      <View style={styles.container}>
        {/* 🔹 TOP BAR */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => setSidebarVisible(true)} style={styles.menuButton}>
            <Text style={styles.menuIcon}>☰</Text>
          </TouchableOpacity>
          <Text style={styles.dateTime}>{currentTime}</Text>
        </View>

        {/* 🔹 SIDEBAR */}
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

        {/* 🔹 סוג מבחן עם חצים */}
        <View style={styles.headerContainer}>
          {testIndex > 0 && (
            <TouchableOpacity onPress={() => setTestIndex(testIndex - 1)}>
              <Text style={styles.arrow}>⬅️</Text>
            </TouchableOpacity>
          )}
          <Text style={styles.headerText}>{testTypes[testIndex]}</Text>
          {testIndex < testTypes.length - 1 && (
            <TouchableOpacity onPress={() => setTestIndex(testIndex + 1)}>
              <Text style={styles.arrow}>➡️</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* 🔹 בחירת כיתה */}
        <View style={{ paddingHorizontal: 10, marginBottom: 10 }}>
            {chunkArray(classNames, 3).map((row, rowIndex) => (
              <View
                key={rowIndex}
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                  marginBottom: 10,
                }}
              >
                {row.map((className) => (
                  <TouchableOpacity
                    key={className}
                    style={[
                      styles.classButton,
                      selectedClass === className && styles.selectedClassButton,
                    ]}
                    onPress={() => setSelectedClass(className)}
                  >
                    <Text
                      style={[
                        styles.classButtonText,
                        selectedClass === className && styles.selectedClassButtonText,
                      ]}
                    >
                      {className}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ))}
        </View>


        {/* 🔹 טבלה */}
        <ScrollView>
          {selectedClass && (
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={styles.headerCell}>ת.ז   </Text>
                <Text style={styles.headerCell}>שם        </Text>
                <Text style={styles.headerCell}>ציון      </Text>
              </View>
              {scores[selectedClass]?.map((student) => (
                <View key={student.id} style={styles.tableRow}>
                  <Text style={styles.cell}>{student.idNumber}</Text>
                  <Text style={styles.cell}>{student.name}</Text>
                  <TextInput
                    style={styles.scoreInput}
                    keyboardType="numeric"
                    value={student.score}
                    onChangeText={(text) => handleScoreChange(selectedClass, student.id, text)}
                    maxLength={3}
                  />
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </View>
      {selectedClass && (
        <TouchableOpacity style={styles.sendScoresButton} onPress={handleSubmitScores}>
          <Text style={styles.sendScoresButtonText}>שלח ציונים</Text>
        </TouchableOpacity>
      )}
    </KeyboardAvoidingView>
    
  );
};

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
  menuButton: { padding: 4 },
  menuIcon: { color: "white", fontSize: 26 },
  dateTime: { color: "white", fontSize: 16, fontWeight: "bold" },

  modalBackground: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)" },
  sidebar: { position: "absolute", left: 0, width: 250, height: "100%", backgroundColor: "black", padding: 50 },
  sidebarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#fff",
  },
  sidebarUser: { color: "white", fontSize: 18, fontWeight: "bold" },
  closeButton: { color: "white", fontSize: 22, fontWeight: "bold" },
  sidebarItem: { paddingVertical: 15 },
  sidebarText: { color: "white", fontSize: 18 },

  headerContainer: { flexDirection: "row", justifyContent: "center", alignItems: "center", marginVertical: 10 },
  headerText: { fontSize: 22, fontWeight: "bold" },
  arrow: { fontSize: 26, marginHorizontal: 20 },

  classButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: "#ddd",
    borderRadius: 8,
    margin: 5, // זה יוצר את הריווח בפועל
  },
  selectedClassButton: {
    backgroundColor: "black",
  },
  classButtonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  selectedClassButtonText: {
    color: "white",
  },

  table: {
    backgroundColor: "#fff",
    margin: 15,
    borderRadius: 10,
    padding: 10,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#eee",
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  
  tableRow: {
    flexDirection: "row",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: "#ccc",
    alignItems: "center",
    justifyContent: "center",
  },
  
  headerCell: {
    flex: 1,
    fontWeight: "bold",
    textAlign: "center",
    justifyContent: "center",
    alignItems: "center",
  },
  cell: {
    flex: 1,
    textAlign: "center", 
    fontSize: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  scoreInput: {
    width: 60,
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    textAlign: "center",
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },

  //כפתור שלח
  sendScoresButton: {
    backgroundColor: "black",
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignSelf: "center",
    borderRadius: 8,
    marginTop: 20,
  },
  sendScoresButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  
});

export default TestScreen;
