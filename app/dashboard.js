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
import TopSidebar from "../components/TopSidebar";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from "../config";

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

export default function Dashboard() {
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

      //מערך ריק של משימות
      const [tasks, setTasks] = useState([]);
    // ✅ Toggle task completion
    const toggleTaskCompletion = async (taskId) => {
      try {
        const token = await AsyncStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}/toggle`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          const err = await response.json();
          console.error("❌ לא ניתן לעדכן משימה:", err.message);
          return;
        }

        const updatedTask = await response.json();
        setTasks((prev) =>
          prev.map((task) =>
            task._id === updatedTask._id ? updatedTask : task
          )
        );
      } catch (error) {
        console.error("❌ שגיאה בעדכון המשימה:", error.message);
      }
    };

    //שליפת משימות מהמסד נתונים
    useEffect(() => {
      const fetchTasks = async () => {
        try {
          const token = await AsyncStorage.getItem('token');
          const response = await fetch(`${API_BASE_URL}/api/tasks`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          const data = await response.json();
          setTasks(Array.isArray(data) ? data : []);
        } catch (error) {
          console.error("❌ שגיאה בטעינת משימות:", error.message);
          setTasks([]); // למנוע קריסה
        }
      };
      fetchTasks();
    }, []);

  const [newTask, setNewTask] = useState("");
//הוספת משימה
const addTask = async () => {
  if (!newTask.trim()) return;
  try {
    const token = await AsyncStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/api/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` // ⬅️ חשוב מאוד
      },
      body: JSON.stringify({ title: newTask }),
    });

    const data = await response.json();
    setTasks([...tasks, data]);
    setNewTask('');
  } catch (error) {
    console.error('❌ שגיאה בהוספת משימה:', error.message);
  }
};


//מחיקת משימה
const removeTask = async (taskId) => {
  try {
    const token = await AsyncStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      setTasks((prevTasks) => prevTasks.filter((task) => task._id !== taskId));
    } else {
      const errorData = await response.json();
      console.error('❌ Failed to delete task:', errorData.message || 'Unknown error');
    }
  } catch (error) {
    console.error('❌ Error deleting task:', error.message);
  }
};


  // ✅ Yearly Events Data
const [yearlyEvents, setYearlyEvents] = useState([
  { id: "1", title: "🎉 פסח", date: "22 באפריל 2024" },
  { id: "2", title: "🚌 טיול שנתי", date: "15 במאי 2024" },
  { id: "3", title: "📅 יום המורה", date: "30 ביוני 2024" },
]);

const [addEventModalVisible, setAddEventModalVisible] = useState(false);
const [newEventTitle, setNewEventTitle] = useState("");
const [newEventDate, setNewEventDate] = useState(new Date());
const [showDatePicker, setShowDatePicker] = useState(false);

  return (
    <View style={styles.container}>       
          {/* top and side bar */}   
          <TopSidebar userRole="teacher" />
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
          <Text style={styles.sectionTitle}>📝 משימות למורה  
          </Text>
        {tasks.map((task) => (
          <TouchableOpacity
            key={task._id}
            style={[
              styles.task,
              task.completed ? styles.completedTask : styles.incompleteTask // ✅ שינוי כאן
            ]}
            onPress={() => toggleTaskCompletion(task._id)}
          >
            <Text style={styles.taskText}>{task.title}</Text>
            <TouchableOpacity onPress={() => removeTask(task._id)}>
              <Text style={styles.deleteIcon}>❌</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        ))}

          <TextInput
            value={newTask}
            onChangeText={setNewTask}
            placeholder="הוסף משימה..."
            textAlign="right"
            borderWidth="0.5"    // Thickness of the border
            borderColor= "black" // Color of the border
            borderRadius= "10"      // (Optional) Rounded corners
            placeholderTextColor="black"
            style={styles.input}
            
          />
          <TouchableOpacity onPress={addTask} style={styles.addTaskButton}>
            <Text style={{ color: "black" }}>➕ הוסף</Text>
          </TouchableOpacity>
        </View>
              {/* 🔹 NEW: YEARLY EVENTS SECTION */}
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

      {/* 🔹 Edit Button */}
      <TouchableOpacity style={styles.editButton}>
        <Text style={styles.editIcon}>✎</Text>
      </TouchableOpacity>
    </View>
  ))}
  {/* ✅ Add Event Button — מחוץ ללולאה */}
  <TouchableOpacity
    style={styles.addEventButton}
    onPress={() => setAddEventModalVisible(true)}
  >
    <Text style={{ fontSize: 16 }}>➕ הוסף אירוע</Text>
  </TouchableOpacity>
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
      <Modal visible={addEventModalVisible} transparent={true} animationType="slide">
  <View style={styles.popupOverlay}>
    <View style={styles.popupContainer}>
      <Text style={styles.popupTitle}>📅 הוספת אירוע שנתי</Text>
      <TextInput
        placeholder="שם האירוע..."
        value={newEventTitle}
        onChangeText={setNewEventTitle}
        style={styles.input}
        textAlign="right"
        placeholderTextColor="#777"
      />
      <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.addTaskButton}>
        <Text>📆 בחר תאריך: {newEventDate.toLocaleDateString("he-IL")}</Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={newEventDate}
          mode="date"
          display="default"
          onChange={(event, date) => {
            setShowDatePicker(false);
            if (date) setNewEventDate(date);
          }}
          locale="he-IL"
        />
      )}
      <TouchableOpacity
        onPress={() => {
          if (!newEventTitle.trim()) return;
          const formatted = {
            id: Date.now().toString(),
            title: newEventTitle,
            date: newEventDate.toLocaleDateString("he-IL"),
          };
          setYearlyEvents([...yearlyEvents, formatted]);
          setNewEventTitle("");
          setNewEventDate(new Date());
          setAddEventModalVisible(false);
        }}
        style={styles.addTaskButton}
      >
        <Text>📥 שמור</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setAddEventModalVisible(false)} style={styles.closeButton}>
        <Text style={styles.closeButtonText}>❌ ביטול</Text>
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
  dateTime: { color: "white", fontSize: 16, fontWeight: "bold" },
  modalBackground: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)" },
  sidebar: { position: "absolute", left: 0, width: 250, height: "100%", backgroundColor: "black", padding: 50 },
  sidebarUser: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 15,   
  },
  sidebarItem: { paddingVertical: 15 },
  sidebarText: { color: "white", fontSize: 18 },
 // 🔹 INFO CARDS (3 PER ROW)
 statsContainer: { flexDirection: "row", flexWrap: "wrap", margin:15, justifyContent: "space-between", },
 statCard: { width: "100%", backgroundColor: "#fff", padding:20, alignItems: "center", borderRadius: 8,},
  // 📊 PIE CHART
  section: { backgroundColor: "#fff", padding: 15, borderRadius: 10, marginTop: 20, },
  pieChartLabels: { flexDirection: "row", justifyContent: "space-around", marginTop: 10 },
  // 🔹 TASKS
  tasksSection: { marginTop: 20 },
  task: { flexDirection: "row", justifyContent: "space-between", padding: 10, marginVertical: 5 },
  //task color
  completedTask: { 
    backgroundColor: "#b2f2bb", // ✅ Green when completed
  },
  incompleteTask: {
  backgroundColor: "#f8d7da", // אדום
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
  },
  addTaskButton: {
    alignSelf: "flex-end",  // ✅ Moves the button to the right
    padding: 10, 
    color:"black",
    backgroundColor:" rgba(66, 65, 65, 0.27)", 
    borderRadius: 8, 
    marginTop: 15,
  },
  input: {
    height: 50,  // Adjust height if needed
    borderWidth: 0.5,  // ✅ Make border thicker
    borderColor: "black",  // ✅ Border color
    borderRadius: 10,  // ✅ Optional: Rounded corners
    paddingHorizontal: 15,  // ✅ Adjust inner spacing
    paddingVertical: 10,  // ✅ Adjust vertical padding
    textAlign: "right",  // ✅ Align text to right
    fontSize: 16,  // ✅ Make text more readable
    color: "black",  // ✅ Text color
    backgroundColor: "white", // ✅ Background color for clarity
  },
  sectionTitle:{
    textAlign: "center",  // ✅ Align text to right
    marginBottom:15,
    marginTop:5,
    color:"bold",
    fontWeight: "bold",
    borderRadius: 10,  // ✅ Optional: Rounded corners
  }
});