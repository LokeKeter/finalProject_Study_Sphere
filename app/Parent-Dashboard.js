import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
} from "react-native";
import { PieChart } from "react-native-chart-kit";
import { useRouter } from "expo-router";
import { useNavigation } from "@react-navigation/native";

const stats = [
  { id: "3", title: "אירועים משמעתיים", value: "1", icon: "🔔" },
  { id: "4", title: "שיעורי בית", value: "5", icon: "📚" },
  { id: "5", title: "פגישות", value: "2", icon: "📅" },
];


export default function Dashboard() {
    const router = useRouter();  // ✅ Move inside function
    const navigation = useNavigation();  // ✅ Correct way to initialize navigation
    const [completedTasks, setCompletedTasks] = useState({}); // ✅ Track completed tasks

    // ✅ Toggle task completion
    const toggleTaskCompletion = (taskId) => {
      setCompletedTasks((prev) => ({
        ...prev,
        [taskId]: !prev[taskId], // Toggle true/false
      }));
    };
    
  const [newTask, setNewTask] = useState("");
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [currentTime, setCurrentTime] = useState(getFormattedDateTime());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(getFormattedDateTime());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  function getFormattedDateTime() {
    const now = new Date();
    return now.toLocaleString("he-IL", {
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  }

  const [selectedTimeIndex, setSelectedTimeIndex] = useState(0);
const timeRanges = ["יומי", "שבועי", "חודשי", "סמסטריאלי", "שנתי"];

const handleChangeTimeRange = (direction) => {
  let newIndex = selectedTimeIndex + direction;
  if (newIndex >= 0 && newIndex < timeRanges.length) {
    setSelectedTimeIndex(newIndex);
  }
};

const getChartData = (timeIndex) => {
  switch (timeIndex) {
    case 0: // יומי
      return [
        { name: "נוכחים", population: 28, color: "#0A2540", legendFontColor: "#000", legendFontSize: 14 },
        { name: "נעדרים", population: 2, color: "#B0B0B0", legendFontColor: "#000", legendFontSize: 14 },
      ];
    case 1: // שבועי
      return [
        { name: "נוכחים", population: 135, color: "#0A2540", legendFontColor: "#000", legendFontSize: 14 },
        { name: "נעדרים", population: 15, color: "#B0B0B0", legendFontColor: "#000", legendFontSize: 14 },
      ];
    case 2: // חודשי
      return [
        { name: "נוכחים", population: 550, color: "#0A2540", legendFontColor: "#000", legendFontSize: 14 },
        { name: "נעדרים", population: 50, color: "#B0B0B0", legendFontColor: "#000", legendFontSize: 14 },
      ];
    case 3: // סמסטריאלי
      return [
        { name: "נוכחים", population: 3200, color: "#0A2540", legendFontColor: "#000", legendFontSize: 14 },
        { name: "נעדרים", population: 200, color: "#B0B0B0", legendFontColor: "#000", legendFontSize: 14 },
      ];
    case 4: // שנתי
      return [
        { name: "נוכחים", population: 6200, color: "#0A2540", legendFontColor: "#000", legendFontSize: 14 },
        { name: "נעדרים", population: 300, color: "#B0B0B0", legendFontColor: "#000", legendFontSize: 14 },
      ];
    default:
      return [];
  }
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
                            <Text style={styles.sidebarUser}>👤 הורה</Text>
                            <TouchableOpacity onPress={() => setSidebarVisible(false)}>
                              <Text style={styles.closeButton}>✖</Text>
                            </TouchableOpacity>
                          </View>
              
              
                          <TouchableOpacity style={styles.sidebarItem} onPress={() => { router.push("/Parent-Dashboard"); setSidebarVisible(false); }}>
                            <Text style={styles.sidebarText}>📊 כללי</Text>
                          </TouchableOpacity>
              
                          <TouchableOpacity style={styles.sidebarItem} onPress={() => { router.push("/Parent-Homework"); setSidebarVisible(false); }}>
                            <Text style={styles.sidebarText}>📚 שיעורי בית</Text>
                          </TouchableOpacity>
              
                          <TouchableOpacity style={styles.sidebarItem} onPress={() => { router.push("/Parent-Contacts"); setSidebarVisible(false); }}>
                            <Text style={styles.sidebarText}>👥 אנשי קשר</Text>
                          </TouchableOpacity>
              
                          <TouchableOpacity style={styles.sidebarItem} onPress={() => { router.push("/Parent-Archive"); setSidebarVisible(false); }}>
                            <Text style={styles.sidebarText}>📁 ארכיון</Text>
                          </TouchableOpacity>
              
                          <TouchableOpacity style={styles.sidebarItem} onPress={() => { router.push("/"); setSidebarVisible(false); }}>
                            <Text style={styles.sidebarText}>🚪 התנתקות</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </Modal>


      <ScrollView contentContainerStyle={styles.content}>
        {/* 🔹 INFO CARDS (3 PER ROW) */}
        <View style={styles.statsContainer}>
          {stats.map((item, index) => (
            <View key={item.id} style={[styles.statCard, index >= 3 && styles.statCardBelow]}>
              <Text style={styles.statIcon}>{item.icon}</Text>
              <Text style={styles.statValue}>{item.value}</Text>
              <Text style={styles.statLabel}>{item.title}</Text>
            </View>
          ))}
        </View>

                {/* 🔹 בחירת טווח זמן לפאי צ'ארט */}
                <View style={styles.section}>
  <Text style={styles.sectionTitle}>📊 נוכחות</Text>

  <View style={styles.timeSelectorContainer}>
    {selectedTimeIndex > 0 ? (
      <TouchableOpacity onPress={() => handleChangeTimeRange(-1)}>
        <Text style={styles.arrow}>⬅️</Text>
      </TouchableOpacity>
    ): (
        <Text style={styles.arrow}>{"\u200B"}</Text> // אייקון בלתי נראה
      )}

    <Text style={styles.headerText}>{timeRanges[selectedTimeIndex]}</Text>

    {selectedTimeIndex < timeRanges.length - 1 ? (
      <TouchableOpacity onPress={() => handleChangeTimeRange(1)}>
        <Text style={styles.arrow}>➡️</Text>
      </TouchableOpacity>
    ): (
        <Text style={styles.arrow}>{"\u200B"}</Text> // אייקון בלתי נראה
      )}
  </View>

  <PieChart
    data={getChartData(selectedTimeIndex)}
    width={250}
    height={150}
    chartConfig={{
      backgroundGradientFrom: "#ffffff",
      backgroundGradientTo: "#ffffff",
      color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    }}
    accessor="population"
    backgroundColor="transparent"
  />
</View>


           {/* 🔥 הוספת משפט מוטיבציה מתחת לגרף */}
            <Text style={styles.motivationText}>
                "למידה היא המפתח להצלחה! המשיכו כך! 🚀"
            </Text>
      </ScrollView>
    </View>
  );
}

// 🎨 **STYLES**
const styles = StyleSheet.create({
  content: { padding: 20 },

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

  // 🔹 INFO CARDS (3 PER ROW)
  statsContainer: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  statCard: { width: "30%", backgroundColor: "#fff", padding: 15, alignItems: "center", borderRadius: 8, marginBottom: 10 },

  // 📊 PIE CHART
  section: { 
    backgroundColor: "#fff", 
    padding: 15, 
    borderRadius: 10, 
    marginTop: 20,
    alignItems: "center", // למרכז את כל התוכן
  },
  
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  
  timeSelectorContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  
  arrow: {
    fontSize: 22,
    paddingHorizontal: 15,
  },
  
  headerText: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  
  pieChartLabels: { flexDirection: "row", justifyContent: "space-around", marginTop: 10 },

  //motivation text
  motivationText: {
    marginTop: 15, 
    fontSize: 16, 
    fontWeight: "bold", 
    color: "#2C3E50", 
    textAlign: "center",
    fontStyle: "italic",
  },
  
});
