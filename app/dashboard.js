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
import TopSidebar from "../components/TopSidebar";



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
  const router = useRouter();
  const navigation = useNavigation();
  const [completedTasks, setCompletedTasks] = useState({});
  const [popupVisible, setPopupVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
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

  const toggleTaskCompletion = (taskId) => {
    setCompletedTasks((prev) => ({
      ...prev,
      [taskId]: !prev[taskId],
    }));
  };

  const addTask = () => {
    if (!newTask.trim()) return;
    setTasks([...tasks, { id: String(tasks.length + 1), title: newTask }]);
    setNewTask("");
  };

  const removeTask = (taskId) => {
    setTasks(tasks.filter((task) => task.id !== taskId));
  };

  const yearlyEvents = [
    { id: "1", title: "🎉 פסח", date: "22 באפריל 2024" },
    { id: "2", title: "🚌 טיול שנתי", date: "15 במאי 2024" },
    { id: "3", title: "📅 יום המורה", date: "30 ביוני 2024" },
  ];

  return (
    <View style={styles.container}>
  <TopSidebar
  currentTime={currentTime}
  sidebarVisible={sidebarVisible}
  setSidebarVisible={setSidebarVisible}
/>


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
              onPress={() => toggleTaskCompletion(task.id)}
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
            textAlign="right"
            borderWidth="0.5"
            borderColor="black"
            borderRadius="10"
            placeholderTextColor="black"
            style={styles.input}
          />
          <TouchableOpacity onPress={addTask} style={styles.addTaskButton}>
            <Text style={{ color: "black" }}>➕ הוסף</Text>
          </TouchableOpacity>
        </View>

        {/* 🔹 YEARLY EVENTS SECTION */}
        <View style={styles.eventsContainer}>
          <Text style={styles.sectionTitle}>📅 אירועים שנתיים</Text>
          {yearlyEvents.map((event) => (
            <View key={event.id} style={styles.eventCard}>
              <View style={styles.eventIconContainer}>
                <Text style={styles.eventIcon}>🏫</Text>
              </View>
              <View style={styles.eventTextContainer}>
                <Text style={styles.eventTitle}>{event.title}</Text>
                <Text style={styles.eventDate}>{event.date}</Text>
                {event.details && <Text style={styles.eventDetails}>{event.details}</Text>}
              </View>
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
              placeholderTextColor={"black"}
              color="black"
              value={searchQuery}
              onChangeText={(text) => setSearchQuery(text)}
              textAlign="right"
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
const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 85, backgroundColor: "#F4F4F4" },

  // 🔹 Cards
  statsContainer: { flexDirection: "row", flexWrap: "wrap", margin: 15, justifyContent: "space-between" },
  statCard: { width: "100%", backgroundColor: "#fff", padding: 20, alignItems: "center", borderRadius: 8 },

  // 🔹 Pie chart
  section: { backgroundColor: "#fff", padding: 15, borderRadius: 10, marginTop: 20 },
  pieChartLabels: { flexDirection: "row", justifyContent: "space-around", marginTop: 10 },

  // 🔹 Tasks
  tasksSection: { marginTop: 20 },
  task: { flexDirection: "row", justifyContent: "space-between", padding: 10, marginVertical: 5, backgroundColor: "#f8d7da" },
  completedTask: { backgroundColor: "#b2f2bb" },
  taskText: { flex: 1 },
  deleteIcon: { marginLeft: 10 },

  // 🔹 Input + Button
  input: {
    height: 50,
    borderWidth: 0.5,
    borderColor: "black",
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    textAlign: "right",
    fontSize: 16,
    color: "black",
    backgroundColor: "white",
  },
  addTaskButton: {
    alignSelf: "flex-end",
    padding: 10,
    backgroundColor: "rgba(66, 65, 65, 0.27)",
    borderRadius: 8,
    marginTop: 15,
  },

  // 🔹 Events
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
  eventIconContainer: { backgroundColor: "#F4F4F4", padding: 0, borderRadius: 50 },
  eventIcon: { fontSize: 20 },
  eventTextContainer: { flex: 1, marginLeft: 12 },
  eventTitle: { fontSize: 14, fontWeight: "bold" },
  eventDate: { fontSize: 14, color: "#666" },
  eventDetails: { fontSize: 13, color: "#888" },
  editButton: { padding: 8, borderRadius: 10 },
  editIcon: { fontSize: 10, color: "#000" },

  // 🔹 Popup
  popupOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  popupContainer: {
    width: "90%",
    backgroundColor: "#FFF",
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
  },
  popupTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 15 },
  searchBar: {
    width: "100%",
    height: 40,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  taskItem: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  taskTitle: { fontSize: 16 },
  taskDate: { fontSize: 14, color: "gray" },
  closeButton: {
    marginTop: 15,
    backgroundColor: "#ddd",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  closeButtonText: { fontSize: 16, fontWeight: "bold", color: "black" },

  sectionTitle: {
    textAlign: "center",
    marginBottom: 15,
    marginTop: 5,
    fontWeight: "bold",
  },
});


// keep styles unchanged
