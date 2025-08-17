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
    const [disciplineEvents, setDisciplineEvents] = useState([]);
    // 🆕 שיעורי בית
    const [homeworkList, setHomeworkList] = useState([]);
    const [selectedHomework, setSelectedHomework] = useState(null);
    const [classesById, setClassesById] = useState({});
    const [parentToClass, setParentToClass] = useState({});
    const [meetings, setMeetings] = useState([]);
    const [selectedMeeting, setSelectedMeeting] = useState(null);
    // לנוכחות 
    const [attendanceSummary, setAttendanceSummary] = useState({
      present: 0,
      absent: 0,
      total: 0,
      date: null
    });

    const [yearlyEvents, setYearlyEvents] = useState([]);

    const cards = [
      { id: "3", title: "משמעת", value: disciplineEvents.length, icon: "🔔", type: "discipline" },
      { id: "4", title: "שיעורים", value: homeworkList.length, icon: "📚", type: "homework" },
      { id: "5", title: "פגישות", value: meetings.length, icon: "📅", type: "meetings" },
    ];
    
    const openPopup = async (type) => {
      setSelectedCategory(type);
      setPopupVisible(true);
      setSearchQuery("");
      setSelectedHomework(null);
      setSelectedMeeting(null);

      if (type === "discipline") {
        await fetchDiscipline(2);
      } else if (type === "homework") {
        await fetchHomeworkCurrent();
      } else if (type === "meetings") {
        await buildParentToClass();
        await fetchMeetings(30);
      }
    };

    useEffect(() => {
      (async () => {
        await fetchHomeworkCurrent();
        await fetchDiscipline(2);
        await buildParentToClass();
        await fetchMeetings(30);
        await fetchAttendanceSummary();
        await fetchYearlyEvents();
      })();
    }, []);

    const fetchYearlyEvents = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const res = await fetch(`${API_BASE_URL}/api/yearlyevents/upcoming?limit=5`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('failed to load events');

        const data = await res.json();
        setYearlyEvents(
          (Array.isArray(data) ? data : []).map(e => ({
            id: e.id || e._id,
            title: e.title,
            date: new Date(e.date).toLocaleDateString('he-IL'),
            details: e.details || ''
          }))
        );
      } catch (err) {
        console.error('❌ yearly events fetch:', err.message);
        setYearlyEvents([]);
      }
    };

    const fetchMeetings = async (days = 30) => {
      try {
        const token = await AsyncStorage.getItem('token');
        const userStr = await AsyncStorage.getItem('user');
        let senderId;
        try { senderId = JSON.parse(userStr)?.id; } catch {}

        const url = `${API_BASE_URL}/api/communication/meetings/recent?days=${days}${senderId ? `&senderId=${senderId}` : ""}`;

        const res = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
        const data = await res.json();

        console.log('📥 meetings url:', url);
        console.log('📥 meetings raw:', data);

        setMeetings(
          Array.isArray(data)
            ? data.map(m => {
                // נזהה את מזהה ההורה כדי למצוא את הכיתה שלו במפה
                const pid = String(
                  (m?.receiverId && (m?.receiverId?._id || m?.receiverId)) ||
                  m?.receiver ||
                  m?.parentId ||
                  ''
                );
                const classLabel = parentToClass[pid];

                return {
                  id: m.id || m._id,
                  title: classLabel
                    ? `כיתה ${classLabel}`
                    : (
                        // נפילה חזרה לשם הילד/נושא אם לא נמצאה כיתה
                        (m?.receiverId?.studentName) ||
                        (m?.receiverId?.name) ||
                        m?.receiverName ||
                        m?.subject ||
                        "פגישה"
                      ),
                  date: formatMeetingDate(m),
                  _raw: m,
                };
              })
            : []
        );
      } catch (err) {
        console.error("❌ שגיאה בשליפת פגישות:", err.message);
        setMeetings([]);
      }
    };

    const q = (searchQuery || "").trim().toLowerCase();

    const filteredTasks =
      selectedCategory === "discipline"
        ? disciplineEvents.filter(t => (t.title || "").toLowerCase().includes(q))
        : selectedCategory === "homework"
          ? homeworkList
              .filter(item => {
                const txt = `${item.grade || item.classId || ""} ${item.subject || ""}`.toLowerCase();
                return txt.includes(q);
              })
              .map(item => ({
                id: item.id,
                title: `כיתה ${item.grade || item.classId}${item.subject ? ` • ${item.subject}` : ""}`,
                date: item.createdAt ? new Date(item.createdAt).toLocaleString("he-IL") : "",
                _raw: item, // לשימוש בלחיצה להצגת התוכן
              }))
          : selectedCategory === "meetings"
            ? meetings.filter(m => (m.title || "").toLowerCase().includes(q))
            : selectedCategory && taskData[selectedCategory]
              ? taskData[selectedCategory].filter(t => (t.title || "").toLowerCase().includes(q))
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

    const fetchDiscipline = async (days = 2) => {
      try {
        const token = await AsyncStorage.getItem('token');
        const res = await fetch(`${API_BASE_URL}/api/communication/discipline/recent?days=${days}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        // מצפה למערך של { id, title, studentName, parentName, date }
        setDisciplineEvents(
          Array.isArray(data)
            ? data.map(ev => ({
                id: ev.id,
                title: `${ev.title} • ${ev.studentName || ""}`.trim(),
                date: new Date(ev.date).toLocaleString("he-IL")
              }))
            : []
        );
      } catch (err) {
        console.error("❌ שגיאה בשליפת אירועי משמעת:", err.message);
        setDisciplineEvents([]);
      }
    };

    // שליפת שיעורי בית נוכחיים
    const fetchHomeworkCurrent = async () => {
      try {
        const token = await AsyncStorage.getItem('token');

        // שלוף שיעורי בית (נניח שיש ראוט כזה; אם אצלך שונה – עדכן את ה-URL)
        const hwRes = await fetch(`${API_BASE_URL}/api/homework/current`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        // אופציונלי: שלוף את הכיתות כדי להמיר classId -> grade לשם יפה
        const classesRes = await fetch(`${API_BASE_URL}/api/class`, {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => null);

        let classesMap = {};
        if (classesRes && classesRes.ok) {
          const classes = await classesRes.json();
          classesMap = (classes || []).reduce((acc, c) => {
            acc[c._id] = c.grade || c.name || c.className || c._id;
            return acc;
          }, {});
          setClassesById(classesMap);
        }

        if (!hwRes.ok) {
          setHomeworkList([]);
          return;
        }

        const hw = await hwRes.json();
        const normalized = Array.isArray(hw) ? hw
          .filter(h => h.isCurrent) // למקרה שהראוט מחזיר הכל
          .map(h => ({
            id: h._id || h.id,
            classId: h.classId,
            grade: classesMap[h.classId], // יכול להיות undefined – נציג classId
            subject: h.subject,
            content: h.content,
            createdAt: h.createdAt
          })) : [];

        setHomeworkList(normalized);
      } catch (e) {
        console.error('❌ שגיאה בשליפת שיעורי בית:', e);
        setHomeworkList([]);
      }
    };

    // שליפת סיכום נוכחות עבור המורה לשבוע האחרון
    const fetchAttendanceSummary = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const url = `${API_BASE_URL}/api/attendance/summary`; // ה-API מחזיר {present, absent, total}
        console.log('↗️ GET', url);

        const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
        console.log('↙️ status:', res.status);
        if (!res.ok) {
          console.error('❌ attendance summary failed:', res.status);
          return;
        }

        const data = await res.json(); // מצופה: { present, absent, total }
        console.log('✅ attendance summary data:', data);

        setAttendanceSummary({
          present: Number(data.present || 0),
          absent:  Number(data.absent  || 0),
          total:   Number(data.total   || 0),
        });
      } catch (e) {
        console.error("❌ שגיאה בשליפת סיכום נוכחות:", e.message);
      }
    };

    // בונה מיפוי parentId -> כיתה
    const buildParentToClass = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const res = await fetch(`${API_BASE_URL}/api/class`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) return;

        const classes = await res.json();
        const map = {};
        (classes || []).forEach(cls => {
          const label = cls.grade || cls.name || cls.className || '';
          (cls.students || []).forEach(s => {
            // parentId יכול להיות אובייקט { _id } או מחרוזת
            const pid = s?.parentId?._id || s?.parentId;
            if (pid) map[String(pid)] = label;
          });
        });
        setParentToClass(map);
      } catch (e) {
        console.error('❌ buildParentToClass:', e.message);
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

// מקבל "DD/MM/YYYY" או "DD/MM/YYYY HH:mm" ומחזיר Date (או null אם לא פרסי)
const toDateDMY = (s) => {
  if (!s) return null;
  const str = String(s).trim();

  // מפרק לחלק של תאריך וחלק של שעה (אם קיים)
  const [datePart, timePart] = str.split(/\s+/); // "DD/MM/YYYY" ["HH:mm"]?
  const [dd, MM, yyyy] = (datePart || "").split("/").map(n => parseInt(n, 10));
  if (!dd || !MM || !yyyy) return null;

  let hh = 0, mm = 0;
  if (timePart && timePart.includes(":")) {
    const [h, m] = timePart.split(":").map(n => parseInt(n, 10));
    hh = h || 0;
    mm = m || 0;
  }

  // יוצר תאריך מקומי
  return new Date(yyyy, MM - 1, dd, hh, mm);
};

const formatMeetingType = (mt) => {
  const t = String(mt || "").toLowerCase();
  if (t.includes("zoom") || t.includes("online")) return "זום";
  if (t.includes("פרונט") || t.includes("in-person") || t.includes("onsite")) return "פרונטלי";
  return "פגישה";
};

const formatMeetingDate = (m) => {
  const d =
    toDateDMY(m?.meetingDate) ||   // נסיון לפרסר "DD/MM/YYYY HH:mm"
    toDateDMY(m?.date) ||          // נסיון נוסף אם השדה אחר
    (m?.createdAt ? new Date(m.createdAt) : null); // נפילה ל-createdAt
  return d ? d.toLocaleString("he-IL") : "";
};

const getStudentName = (m) => {
  return m?.studentName || m?.receiverId?.studentName || m?.receiverName || "";
};

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
          {cards.map((item) => (
            <TouchableOpacity key={item.id} onPress={() => openPopup(item.type)}>
              <View style={styles.statCard}>
                <Text style={styles.statIcon}>{item.icon}</Text>
                <Text style={styles.statValue}>{item.value}</Text>
                <Text style={styles.statLabel}>{item.title}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
        {/* PIE CHART */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊  נוכחות</Text>
            {attendanceSummary.total > 0 ? (
              <>
                <PieChart
                  data={[
                    { name: "נוכחים", population: attendanceSummary.present, color: "#0A2540", legendFontColor: "#000", legendFontSize: 14 },
                    { name: "נעדרים",  population: attendanceSummary.absent,  color: "#B0B0B0", legendFontColor: "#000", legendFontSize: 14 },
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
                  <Text style={{ color: "#0A2540", fontWeight: "bold" }}>🔵 נוכחים: {attendanceSummary.present}</Text>
                  <Text style={{ color: "#B0B0B0", fontWeight: "bold" }}>⚪ נעדרים: {attendanceSummary.absent}</Text>
                </View>
              </>
            ) : (
              <Text style={{ textAlign: "center", marginVertical: 10, color: "#666" }}>
                אין נתוני נוכחות לשבוע האחרון
              </Text>
            )}
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
                  ? (selectedHomework ? "📚 תוכן שיעורי בית" : "📚 שיעורי בית נוכחיים")
                  : selectedCategory === "meetings"
                    ? (selectedMeeting ? "📅 פרטי פגישה" : "📅 פגישות")
                    : ""}
            </Text>

            {selectedCategory === "homework" && selectedHomework ? (
              <>
                {/* כותרת/מטה של שיעורי בית */}
                <View style={[styles.taskItem, { width: "100%" }]}>
                  <Text style={styles.taskTitle}>
                    כיתה: {selectedHomework.grade || selectedHomework.classId}
                    {selectedHomework.subject ? ` • ${selectedHomework.subject}` : ""}
                  </Text>
                  <Text style={styles.taskDate}>
                    {selectedHomework.createdAt
                      ? new Date(selectedHomework.createdAt).toLocaleString("he-IL")
                      : ""}
                  </Text>
                </View>

                {/* תוכן שיעורי הבית */}
                <View style={{ width: "100%", paddingVertical: 10 }}>
                  <Text style={{ textAlign: "right" }}>
                    {selectedHomework.content || "—"}
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={() => setSelectedHomework(null)}
                  style={[styles.closeButton, { marginTop: 10 }]}
                >
                  <Text style={styles.closeButtonText}>⬅️ חזור</Text>
                </TouchableOpacity>
              </>
            ) : selectedCategory === "meetings" && selectedMeeting ? (
              <>
                <View style={[styles.taskItem, { width: "100%" }]}>
                  <Text style={styles.taskTitle}>
                    {formatMeetingType(selectedMeeting.meetingType)}
                  </Text>
                  <Text style={styles.taskDate}>
                    {formatMeetingDate(selectedMeeting)}
                  </Text>
                </View>

                <View style={{ width: "100%", paddingVertical: 10 }}>
                  <Text style={{ textAlign: "right" }}>
                    {getStudentName(selectedMeeting) || "—"}
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={() => setSelectedMeeting(null)}
                  style={[styles.closeButton, { marginTop: 10 }]}
                >
                  <Text style={styles.closeButtonText}>⬅️ חזור</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TextInput
                  style={styles.searchBar}
                  placeholder="🔍 חפש..."
                  value={searchQuery}
                  onChangeText={(text) => setSearchQuery(text)}
                  textAlign="right"
                />

                <FlatList
                  data={filteredTasks}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.taskItem}
                      onPress={() => {
                        if (selectedCategory === "homework" && item._raw) {
                          setSelectedHomework(item._raw);
                        } else if (selectedCategory === "meetings" && item._raw) {
                          setSelectedMeeting(item._raw);
                        }
                      }}
                    >
                      <Text style={styles.taskTitle}>{item.title}</Text>
                      <Text style={styles.taskDate}>{item.date}</Text>
                    </TouchableOpacity>
                  )}
                />

                <TouchableOpacity
                  onPress={() => setPopupVisible(false)}
                  style={styles.closeButton}
                >
                  <Text style={styles.closeButtonText}>❌ סגור</Text>
                </TouchableOpacity>
              </>
            )}
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