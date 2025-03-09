import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  StyleSheet, 
  Alert, 
  Modal 
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router"; // ✅ Import router
import { useNavigation } from "@react-navigation/native";

const classes = [
  { id: "1", name: "כיתה א'", subjects: ["מתמטיקה", "אנגלית", "עברית"] },
  { id: "2", name: "כיתה ב'", subjects: ["מתמטיקה", "מדעים", "היסטוריה"] },
  { id: "3", name: "כיתה ג'", subjects: ["אנגלית", "מדעים", "גיאוגרפיה"] },
];

const HomeworkScreen = () => {
  const router = useRouter();

  const [selectedClass, setSelectedClass] = useState(classes[0]);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  // ⏳ ✅ Update time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

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
      

      {/* 🔹 כיתות - טאבים */}
      <View style={styles.tabsContainer}>
        {classes.map((classItem) => (
          <TouchableOpacity
            key={classItem.id}
            style={[styles.tab, selectedClass.id === classItem.id && styles.activeTab]}
            onPress={() => setSelectedClass(classItem)}
          >
            <Text style={[styles.tabText, selectedClass.id === classItem.id && styles.activeTabText]}>
              {classItem.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

    </View>
  );
};

// 🎨 **Updated Styles**
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    paddingTop: 85,  // ✅ Push content below the top bar
    backgroundColor: "#F4F4F4", 
    alignItems: "center" 
  },

  // 🔹 TOP BAR
  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,  // ✅ Ensures full width
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

  // 🔹 SIDEBAR
  sidebar: { position: "absolute", left: -45, width: 225, height: "100%", backgroundColor: "black", padding: 60 },
  closeButton: { color: "white", fontSize: 20, marginBottom: 20 },
  sidebarItem: { paddingVertical: 15 },
  sidebarText: { color: "white", fontSize: 18 },

  // 🔹 Tabs Styling
  tabsContainer: { 
    flexDirection: "row", 
    justifyContent: "center", 
    marginTop: 20 // ✅ Increased to avoid overlapping with top bar
  },
  tab: { padding: 10, marginHorizontal: 5, backgroundColor: "#ddd", borderRadius: 5 },
  activeTab: { backgroundColor: "black" },
  tabText: { fontSize: 16 },
  activeTabText: { color: "white" },
});

export default HomeworkScreen;
