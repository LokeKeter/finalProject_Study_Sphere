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

const classesData = ["כל המכתבים", "כיתה א'", "כיתה ב'", "כיתה ג'"];

const messagesData = [
  { id: "1", title: "אסיפת הורים", sender: "יוסי כהן", date: "10-03", classId: "כיתה א'" },
  { id: "2", title: "תזכורת", sender: "רונית לוי", date: "09-03", classId: "כיתה ב'" },
  { id: "3", title: "מערכת שעות", sender: "משה ישראלי", date: "08-03", classId: "כיתה א'" },
  { id: "4", title: "טיול שנתי", sender: "שרה דויד", date: "07-03", classId: "כיתה ג'" },
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
      (classesData[selectedClassIndex] === "כל המכתבים" ||
        msg.classId === classesData[selectedClassIndex]) &&
      (msg.sender.includes(searchQuery) || msg.title.includes(searchQuery))
  );

  // 🔹 חישוב מספר הדפים
  const totalPages = Math.ceil(filteredMessages.length / PAGE_SIZE);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const displayedMessages = filteredMessages.slice(startIndex, startIndex + PAGE_SIZE);

  return (
    <View style={styles.container}>
      
      {/* 🔹 TOP BAR */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => setSidebarVisible(true)} style={styles.menuButton}>
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>
        <Text style={styles.username}>👤 מורה</Text>
        <Text style={styles.dateTime}>{currentTime}</Text>
      </View>

      {/* 🔹 SIDEBAR MENU */}
      <Modal visible={sidebarVisible} animationType="slide" transparent>
        <View style={styles.sidebar}>
          <TouchableOpacity onPress={() => setSidebarVisible(false)}>
            <Text style={styles.closeButton}>✖ סגור</Text>
          </TouchableOpacity>

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
        placeholder="🔍 חפש לפי שם שולח או כותרת"
        value={searchQuery}
        onChangeText={(text) => {
          setSearchQuery(text);
          setCurrentPage(1);
        }}
      />
    </View>
  );
};

// 🎨 **Updated Styles**
const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 85, backgroundColor: "#F4F4F4" },

  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 85,
    backgroundColor: "black",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingTop: 30,
  },

  menuButton: { padding: 10 },
  menuIcon: { color: "white", fontSize: 26 },
  username: { color: "white", fontSize: 18, fontWeight: "bold" },
  dateTime: { color: "white", fontSize: 16, fontWeight: "bold" },

  sidebar: { position: "absolute", left: 0, width: 250, height: "100%", backgroundColor: "black", padding: 30 },
  closeButton: { color: "white", fontSize: 20, marginBottom: 20 },
  sidebarItem: { paddingVertical: 15 },
  sidebarText: { color: "white", fontSize: 18 },
});

export default ArchiveScreen;
