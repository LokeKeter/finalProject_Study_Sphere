import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  FlatList,
  TextInput,
  Modal,
} from "react-native";
import { PieChart } from "react-native-chart-kit";
import TopSidebar from '../components/TopSidebar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from "../config";

export default function Dashboard() {

  const [selectedTimeIndex, setSelectedTimeIndex] = useState(0);
  const timeRanges = ["יומי", "שבועי", "חודשי", "סמסטריאלי", "שנתי"];
  const [popupVisible, setPopupVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null); // 'discipline' | 'homework' | 'meetings'
  const [searchQuery, setSearchQuery] = useState("");

  const [disciplineEvents, setDisciplineEvents] = useState([]);
  const [homeworkList, setHomeworkList] = useState([]);
  const [selectedHomework, setSelectedHomework] = useState(null);
  const [meetings, setMeetings] = useState([]);
  const [selectedMeeting, setSelectedMeeting] = useState(null);

  const cards = [
    { id: "3", title: "משמעת", value: disciplineEvents.length, icon: "🔔", type: "discipline" },
    { id: "4", title: "שיעורים", value: homeworkList.length, icon: "📚", type: "homework" },
    { id: "5", title: "פגישות", value: meetings.length, icon: "📅", type: "meetings" },
  ];
  const handleChangeTimeRange = (direction) => {
    let newIndex = selectedTimeIndex + direction;
    if (newIndex >= 0 && newIndex < timeRanges.length) {
      setSelectedTimeIndex(newIndex);
    }
  };

  const toDateDMY = (s) => {
    if (!s) return null;
    const str = String(s).trim();
    const [datePart, timePart] = str.split(/\s+/);
    const [dd, MM, yyyy] = (datePart || "").split("/").map(n => parseInt(n, 10));
    if (!dd || !MM || !yyyy) return null;
    let hh = 0, mm = 0;
    if (timePart && timePart.includes(":")) {
      const [h, m] = timePart.split(":").map(n => parseInt(n, 10));
      hh = h || 0; mm = m || 0;
    }
    return new Date(yyyy, MM - 1, dd, hh, mm);
  };

  // "זום" או "פרונטלי"
  const formatMeetingType = (t) => {
    const s = String(t || '').trim();
    if (s.includes('זום')) return 'זום';
    if (s.includes('פרונטלי')) return 'פרונטלי';
    return 'פרונטלי';
  };


  const formatMeetingDate = (m) => {
    const d =
      toDateDMY(m?.meetingDate) ||
      toDateDMY(m?.date) ||
      (m?.createdAt ? new Date(m.createdAt) : null);
    return d ? d.toLocaleString("he-IL") : "";
  };

    // שיעורי בית – להורה
  const fetchHomeworkForParent = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const url = `${API_BASE_URL}/api/homework/parent/current`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) { setHomeworkList([]); return; }
      const data = await res.json();
      const normalized = (Array.isArray(data) ? data : []).map(h => ({
        id: h._id || h.id,
        classId: h.classId,
        grade: h.grade || h.classId,
        subject: h.subject || "",
        content: h.content || "",
        createdAt: h.createdAt,
      }));
      setHomeworkList(normalized);
    } catch (e) {
      console.error('❌ שגיאה בשליפת שיעורי בית להורה:', e.message);
      setHomeworkList([]);
    }
  };

  // אירועי משמעת – נסיון לפילטור לפי הורה (אם השרת תומך), אחרת פילטר בצד לקוח
  const fetchDisciplineForParent = async (days = 14) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('missing token');

      const url = `${API_BASE_URL}/api/attendance/discipline/parent?days=${days}`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });

      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        throw new Error(`HTTP ${res.status} ${errText}`);
      }

      const data = await res.json();
      const items = (Array.isArray(data) ? data : []).map(ev => ({
        id: ev.id || ev._id || String(Math.random()),
        title: ev.title, // "לא הכין שיעורי בית • ..." / "לא נכח ב..."
        date: ev.date ? new Date(ev.date).toLocaleString('he-IL') : ''
      }));

      setDisciplineEvents(items);
    } catch (e) {
      console.error("❌ שגיאה בשליפת אירועי משמעת:", e.message || e);
      setDisciplineEvents([]);
    }
  };

  // פגישות – מסנן לפי ההורה כ־receiverId/parentId
  const fetchMeetingsForParent = async (days = 60) => {
  try {
    const token = await AsyncStorage.getItem('token');
    const url = `${API_BASE_URL}/api/communication/meetings/parent?days=${days}`;

    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) {
      console.error('❌ meetings parent fetch failed:', res.status);
      setMeetings([]);
      return;
    }
    const data = await res.json();

    setMeetings(
      Array.isArray(data)
        ? data.map(m => ({
            id: m.id,
            id: m.id || m._id,
            title: `פגישה ב${formatMeetingType(m.meetingType)}`,
            date: formatMeetingDate(m),   // 👈 אחיד עם מסך הפרטים
            _raw: m,
          }))
        : []
    );
  } catch (e) {
    console.error("❌ שגיאה בשליפת פגישות:", e.message);
    setMeetings([]);
  }
};

const [pieData, setPieData] = useState([
  { name: "נוכחים", population: 0, color: "#0A2540", legendFontColor: "#000", legendFontSize: 14 },
  { name: "נעדרים", population: 0, color: "#B0B0B0", legendFontColor: "#000", legendFontSize: 14 },
]);

const idxToRange = (idx) => ([
  'daily',      // 0
  'weekly',     // 1
  'monthly',    // 2
  'semester',   // 3 (4 חודשים)
  'yearly'      // 4
][idx] || 'weekly');

const fetchParentPie = async (idx) => {
  try {
    const token = await AsyncStorage.getItem('token');
    const range = idxToRange(idx);
    const res = await fetch(`${API_BASE_URL}/api/attendance/parent/pie?range=${range}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json(); // { present, absent }
    setPieData([
      { name: "נוכחים", population: Number(data.present || 0), color: "#0A2540", legendFontColor: "#000", legendFontSize: 14 },
      { name: "נעדרים", population: Number(data.absent  || 0), color: "#B0B0B0", legendFontColor: "#000", legendFontSize: 14 },
    ]);
  } catch (e) {
    console.error('❌ fetch parent pie failed:', e.message || e);
    setPieData([
      { name: "נוכחים", population: 0, color: "#0A2540", legendFontColor: "#000", legendFontSize: 14 },
      { name: "נעדרים", population: 0, color: "#B0B0B0", legendFontColor: "#000", legendFontSize: 14 },
    ]);
  }
};

const [yearlyEvents, setYearlyEvents] = useState([]);
  const fetchYearlyEvents = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/yearlyevents/upcoming?limit=5`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setYearlyEvents(
        (Array.isArray(data) ? data : []).map(e => ({
          id: e.id || e._id,
          title: e.title || '',
          // מציג תאריך יפה בעברית
          date: e.date ? new Date(e.date).toLocaleDateString('he-IL', { day: '2-digit', month: 'long', year: 'numeric' }) : '',
        }))
      );
    } catch (err) {
      console.error('❌ yearly events fetch failed:', err.message || err);
      setYearlyEvents([]);
    }
  };

    const openPopup = async (type) => {
      setSelectedCategory(type);
      setPopupVisible(true);
      setSearchQuery("");
      setSelectedHomework(null);
      setSelectedMeeting(null);

      if (type === "discipline") {
        await fetchDisciplineForParent(7);
      } else if (type === "homework") {
        await fetchHomeworkForParent();
      } else if (type === "meetings") {
        await fetchMeetingsForParent(60);
      }
    };

    useEffect(() => {
      (async () => {
        await fetchHomeworkForParent();
        await fetchDisciplineForParent(7);
        await fetchMeetingsForParent(60);
        await fetchYearlyEvents();
        await fetchParentPie(selectedTimeIndex);
      })();
    }, []);

    useEffect(() => {
      fetchParentPie(selectedTimeIndex);
    }, [selectedTimeIndex]);

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
                _raw: item,
              }))
          : selectedCategory === "meetings"
            ? meetings.filter(m => (m.title || "").toLowerCase().includes(q))
            : [];

  return (
    <View style={styles.container}>
          
          {/* top and side bar */}
          <TopSidebar userRole="parent" />

      <ScrollView contentContainerStyle={styles.content}>
        {/* 🔹 INFO CARDS (3 PER ROW) */}
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

                {/* 🔹 בחירת טווח זמן לפאי צ'ארט */}
                <View style={styles.section}>
  <Text style={styles.sectionTitle}>📊 נוכחות</Text>

  <View style={styles.timeSelectorContainer}>
    {selectedTimeIndex > 0 ? (
      <TouchableOpacity onPress={() => handleChangeTimeRange(-1)}>
        <Text style={styles.arrow}>⬅️</Text>
      </TouchableOpacity>
    ): (
        <Text style={styles.arrow}>{"\u200B"}</Text>
      )}

    <Text style={styles.headerText}>{timeRanges[selectedTimeIndex]}</Text>

    {selectedTimeIndex < timeRanges.length - 1 ? (
      <TouchableOpacity onPress={() => handleChangeTimeRange(1)}>
        <Text style={styles.arrow}>➡️</Text>
      </TouchableOpacity>
    ): (
        <Text style={styles.arrow}>{"\u200B"}</Text>
      )}
  </View>

  <PieChart
    data={pieData}
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

{/*אירועים שנתיים*/}
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
          </View>
        </View>
      ))}
    </View>

           {/* 🔥 הוספת משפט מוטיבציה מתחת לגרף */}
            <Text style={styles.motivationText}>
                "למידה היא המפתח להצלחה! המשיכו כך! 🚀"
            </Text>
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
                    {selectedMeeting.studentName || selectedMeeting?.receiverName || "—"}
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
    </View>
  );
}

// 🎨 **STYLES**
const styles = StyleSheet.create({
  content: { padding: 20 },

  container: { flex: 1, paddingTop: 85, backgroundColor: "#F4F4F4" },
  

  // 🔹 INFO CARDS (3 PER ROW)
  statsContainer: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", margin: 15 },
  statCard: {
    width: "100%",
    backgroundColor: "#fff",
    padding: 20,
    alignItems: "center",
    borderRadius: 8,
  },


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
  
  //motivation text
  motivationText: {
    marginTop: 15, 
    fontSize: 16, 
    fontWeight: "bold", 
    color: "#2C3E50", 
    textAlign: "center",
    fontStyle: "italic",
  },
  
  //עיצוב אירועים שנתיים
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
    // לפופאפ
  popupOverlay: { 
    flex: 1, 
    backgroundColor: "rgba(0,0,0,0.5)", 
    justifyContent: "center", 
    alignItems: "center" 
  },
  popupContainer: { 
    width: "90%", 
    backgroundColor: "#FFF", 
    padding: 20, 
    borderRadius: 12, 
    alignItems: "center" 
  },
  popupTitle: { 
    fontSize: 20, 
    fontWeight: "bold", 
    marginBottom: 15 
  },
  searchBar: { 
    width: "100%", 
    height: 40, 
    borderColor: "#ddd", 
    borderWidth: 1, 
    borderRadius: 8, 
    padding: 10, 
    marginBottom: 10 
  },
  taskItem: { 
    width: "100%", 
    flexDirection: "row", 
    justifyContent: "space-between", 
    paddingVertical: 10, 
    borderBottomWidth: 1, 
    borderBottomColor: "#ddd" 
  },
  taskTitle: { fontSize: 16 },
  taskDate:  { fontSize: 14, color: "gray" },
  closeButton: { 
    marginTop: 15, 
    backgroundColor: "#ddd", 
    paddingVertical: 12, 
    paddingHorizontal: 20, 
    borderRadius: 8 
  },
  closeButtonText: { 
    fontSize: 16, 
    fontWeight: "bold", 
    color: "black" 
  },
});
