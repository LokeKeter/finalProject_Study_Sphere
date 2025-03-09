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

const initialTasks = [
  { id: "1", title: "בדיקת שיעורי בית" },
  { id: "2", title: "הכנת מערך שיעור למתמטיקה" },
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
    
  const [tasks, setTasks] = useState(initialTasks);
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

  const addTask = () => {
    if (!newTask.trim()) return;
    setTasks([...tasks, { id: String(tasks.length + 1), title: newTask }]);
    setNewTask("");
  };

  const removeTask = (taskId) => {
    setTasks(tasks.filter((task) => task.id !== taskId));
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
                            <Text style={styles.sidebarUser}>👤 מורה</Text>
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

        {/* 📊 PIE CHART */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 נוכחות</Text>
          <PieChart
            data={[
              { name: "נוכחים", population: 30, color: "#0A2540", legendFontColor: "#000", legendFontSize: 14 },
              { name: "נעדרים", population: 5, color: "#B0B0B0", legendFontColor: "#000", legendFontSize: 14 },
            ]}
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
          {/* Labels Under Pie Chart */}
          <View style={styles.pieChartLabels}>
            <Text style={{ color: "#0A2540", fontWeight: "bold" }}>🔵 נוכחים</Text>
            <Text style={{ color: "#B0B0B0", fontWeight: "bold" }}>⚪ נעדרים</Text>
          </View>
        </View>

        {/* ✅ TEACHER TASKS UNDER PIE CHART */}
        <View style={[styles.section, styles.tasksSection]}>
          <Text style={styles.sectionTitle}>📝 משימות למורה</Text>
          {tasks.map((task) => (
  <TouchableOpacity 
    key={task.id} 
    style={[styles.task, completedTasks[task.id] && styles.completedTask]} 
    onPress={() => toggleTaskCompletion(task.id)} // ✅ Mark as completed
  >
    <Text style={styles.taskText}>{task.title}</Text>
    <TouchableOpacity onPress={() => removeTask(task.id)}>
      <Text style={styles.deleteIcon}>❌</Text>
    </TouchableOpacity>
  </TouchableOpacity>
))}

          <TextInput
            value={newTask}
            onChangeText={setNewTask}
            placeholder="הוסף משימה..."
            style={styles.input}
            placeholderTextColor="black"
          />
          <TouchableOpacity onPress={addTask} style={styles.addButton}>
            <Text style={{ color: "black" }}>➕ הוסף</Text>
          </TouchableOpacity>
        </View>
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
    height: 85,
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
    paddingHorizontal: 10, // מרווח פנימי מהצדדים
  },
  menuButton: { padding: 10 },
  menuIcon: { color: "white", fontSize: 26 },
  username: { color: "white", fontSize: 18, fontWeight: "bold" },
  dateTime: { color: "white", fontSize: 16, fontWeight: "bold" },

  modalBackground: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)" },
  sidebar: { position: "absolute", left: 0, width: 250, height: "100%", backgroundColor: "black", padding: 30 },
  sidebarUser: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  
  closeButton: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
  },
  sidebarItem: { paddingVertical: 15 },
  sidebarText: { color: "white", fontSize: 18 },

  /* 🔹 עיצוב ה-SIDEBAR */
  sidebar: { 
    position: "absolute", 
    left: 0, 
    width: 250, 
    height: "100%", 
    backgroundColor: "black", 
    padding: 30, 
    zIndex: 20 // ✅ ה-SIDEBAR תמיד מעל התוכן
  },

  sidebarItem: { paddingVertical: 15 },
  sidebarText: { color: "white", fontSize: 18 },
  closeButton: { color: "white", fontSize: 20, marginBottom: 20 },

  // 🔹 INFO CARDS (3 PER ROW)
  statsContainer: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  statCard: { width: "30%", backgroundColor: "#fff", padding: 15, alignItems: "center", borderRadius: 8, marginBottom: 10 },

  // 📊 PIE CHART
  section: { backgroundColor: "#fff", padding: 15, borderRadius: 10, marginTop: 20 },
  pieChartLabels: { flexDirection: "row", justifyContent: "space-around", marginTop: 10 },

  // 🔹 TASKS
  tasksSection: { marginTop: 20 },
  task: { flexDirection: "row", justifyContent: "space-between", padding: 10, marginVertical: 5, backgroundColor: "#f8d7da" },
  completedTask: { 
    backgroundColor: "#b2f2bb", // ✅ Green when completed
  },
  taskText: { flex: 1 }, // Ensure text takes space
  


});
