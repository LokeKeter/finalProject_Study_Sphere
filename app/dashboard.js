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
  { id: "3", title: "משמעת", value: "1", icon: "🔔", type: "discipline" },
  { id: "4", title: "שיעורים ", value: "5", icon: "📚", type: "homework" },
  { id: "5", title: "פגישות", value: "2", icon: "📅", type: "meetings" },
];

const taskData = {
  discipline: [
    { id: "1", title: "איחור לשיעור", date: "03/03/2024" },
    { id: "2", title: "דיבור בזמן המורה", date: "05/03/2024" },
  ],
  homework: [
    { id: "1", title: "תרגול מתמטיקה", date: "03/03/2024" },
    { id: "2", title: "קריאה באנגלית", date: "04/03/2024" },
  ],
  meetings: [
    { id: "1", title: "פגישה עם הורים - כיתה א'", date: "07/03/2024" },
    { id: "2", title: "ישיבת צוות מורים", date: "10/03/2024" },
  ],
};

const initialTasks = [
  { id: "1", title: "בדיקת שיעורי בית" },
  { id: "2", title: "הכנת מערך שיעור למתמטיקה" },
];

export default function Dashboard() {
    const router = useRouter();  // ✅ Move inside function
    const navigation = useNavigation();  // ✅ Correct way to initialize navigation
    const [completedTasks, setCompletedTasks] = useState({}); // ✅ Track completed tasks
    const [popupVisible, setPopupVisible] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
  
    const openPopup = (type) => {
      setSelectedCategory(type);
      setPopupVisible(true);
      setSearchQuery("");
    };
    const filteredTasks =
    selectedCategory && taskData[selectedCategory]
      ? taskData[selectedCategory].filter((task) =>
          task.title.includes(searchQuery)
        )
      : [];
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
  // ✅ Yearly Events Data
const yearlyEvents = [
  { id: "1", title: "🎉 פסח", date: "22 באפריל 2024" },
  { id: "2", title: "🚌 טיול שנתי", date: "15 במאי 2024" },
  { id: "3", title: "📅 יום המורה", date: "30 ביוני 2024" },
];

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

                          <TouchableOpacity style={styles.sidebarItem} onPress={() => { router.push("/TestScore"); setSidebarVisible(false); }}>
                            <Text style={styles.sidebarText}>📝 ציונים</Text>
                          </TouchableOpacity>
              
                          <TouchableOpacity style={styles.sidebarItem} onPress={() => { router.push("/"); setSidebarVisible(false); }}>
                            <Text style={styles.sidebarText}>🚪 התנתקות</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </Modal>


      <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.statsContainer}>
          {stats.map((item) => (
            <TouchableOpacity key={item.id} onPress={() => openPopup(item.type)}>
              <View style={styles.statCard}>
                <Text style={styles.statIcon}>{item.icon}</Text>
                <Text style={styles.statValue}>{item.value}</Text>
                <Text style={styles.statLabel}>{item.title}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
        
        

        {/* 📊 PIE CHART */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊  נוכחות</Text>
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
              {/* 🔹 NEW: YEARLY EVENTS SECTION */}
<View style={styles.eventsContainer}>
  <Text style={styles.sectionTitle}>📅 אירועים שנתיים</Text>

  {yearlyEvents.map((event) => (
    <View key={event.id} style={styles.eventCard}>
      {/* 🔹 Left Icon */}
      <View style={styles.eventIconContainer}>
        <Text style={styles.eventIcon}>🏫</Text>
      </View>

      {/* 🔹 Event Details */}
      <View style={styles.eventTextContainer}>
        <Text style={styles.eventTitle}>{event.title}</Text>
        <Text style={styles.eventDate}>{event.date}</Text>
        {event.details && <Text style={styles.eventDetails}>{event.details}</Text>}
      </View>

      {/* 🔹 Edit Button (Right Side) */}
      <TouchableOpacity style={styles.editButton}>
        <Text style={styles.editIcon}>✎</Text>
      </TouchableOpacity>
    </View>
  ))}
</View>
      </ScrollView>
      <Modal transparent={true} visible={popupVisible} animationType="slide">
        <View style={styles.popupOverlay}>
          <View style={styles.popupContainer}>
            <Text style={styles.popupTitle}>
              {selectedCategory === "discipline"
                ? "📌 אירועי משמעת"
                : selectedCategory === "homework"
                ? "📚 שיעורים"
                : "📅 פגישות"}
            </Text>

            <TextInput
              style={styles.searchBar}
              placeholder="🔍 חפש משימה..."
              value={searchQuery}
              onChangeText={(text) => setSearchQuery(text)}
            />

            <FlatList
              data={filteredTasks}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.taskItem}>
                  <Text style={styles.taskTitle}>{item.title}</Text>
                  <Text style={styles.taskDate}>{item.date}</Text>
                </View>
              )}
            />

            <TouchableOpacity onPress={() => setPopupVisible(false)} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>❌ סגור</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
    
    
  );
  
  
}

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

 // 🔹 INFO CARDS (3 PER ROW)
 statsContainer: { flexDirection: "row", flexWrap: "wrap", margin:15, justifyContent: "space-between", },
 statCard: { width: "100%", backgroundColor: "#fff", padding:20, alignItems: "center", borderRadius: 8,},

 
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

// 🔹 EVENTS SECTION STYLES
eventsContainer: {
  backgroundColor: "#F4F4F4",
  padding: 2,
  borderRadius: 15,
  marginTop: 5,
},

eventCard: {
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: "#fff",
  borderWidth: 1,
  borderColor: "#000",
  padding: 12,
  borderRadius: 15,
  marginBottom: 13,
  justifyContent: "space-between",
},

eventIconContainer: {
  backgroundColor: "#F4F4F4",
  padding: 0,
  borderRadius: 50,
},

eventIcon: {
  fontSize: 20,
},

eventTextContainer: {
  flex: 1,
  marginLeft: 12,
},

eventTitle: {
  fontSize: 14,
  fontWeight: "bold",
},

eventDate: {
  fontSize: 14,
  color: "#666",
},

eventDetails: {
  fontSize: 13,
  color: "#888",
},

editButton: {
  padding: 8,
  borderRadius: 10,
},

editIcon: {
  fontSize: 10,
  color: "#000",
},
  // 🔹 Overlay for the popup background
  popupOverlay: { 
    flex: 1, 
    backgroundColor: "rgba(0,0,0,0.5)", 
    justifyContent: "center", 
    alignItems: "center" 
  },

  // 🔹 Container for the popup
  popupContainer: { 
    width: "90%", 
    backgroundColor: "#FFF", 
    padding: 20, 
    borderRadius: 12, 
    alignItems: "center" 
  },

  // 🔹 Title text in the popup
  popupTitle: { 
    fontSize: 20, 
    fontWeight: "bold", 
    marginBottom: 15 
  },

  // 🔹 Search bar inside the popup
  searchBar: { 
    width: "100%", 
    height: 40, 
    borderColor: "#ddd", 
    borderWidth: 1, 
    borderRadius: 8, 
    padding: 10, 
    marginBottom: 10 
  },

  // 🔹 Task list item
  taskItem: { 
    width: "100%", 
    flexDirection: "row", 
    justifyContent: "space-between", 
    paddingVertical: 10, 
    borderBottomWidth: 1, 
    borderBottomColor: "#ddd" 
  },

  // 🔹 Task title in the list
  taskTitle: { 
    fontSize: 16 
  },

  // 🔹 Task date in the list
  taskDate: { 
    fontSize: 14, 
    color: "gray" 
  },

  // 🔹 Close button for the popup
  closeButton: { 
    marginTop: 15, 
    backgroundColor: "#ddd", 
    paddingVertical: 12, 
    paddingHorizontal: 20, 
    borderRadius: 8 
  },

  // 🔹 Text inside the close button
  closeButtonText: { 
    fontSize: 16, 
    fontWeight: "bold", 
    color: "black" 
  }
});




