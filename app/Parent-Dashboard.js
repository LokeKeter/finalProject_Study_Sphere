import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { PieChart } from "react-native-chart-kit";
import TopSidebar from '../components/TopSidebar';
import AsyncStorage from '@react-native-async-storage/async-storage';

const stats = [
  { id: "3", title: "אירועים משמעתיים", value: "1", icon: "🔔" },
  { id: "4", title: "שיעורי בית", value: "5", icon: "📚" },
  { id: "5", title: "פגישות", value: "2", icon: "📅" },
];

export default function Dashboard() {

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

  // ✅ נתוני האירועים
const yearlyEvents = [
  { id: "1", title: "🎉 פסח", date: "22 באפריל 2024" },
  { id: "2", title: "🚌 טיול שנתי", date: "15 במאי 2024" },
  { id: "3", title: "📅 יום המורה", date: "30 ביוני 2024" },
];

  return (
    <View style={styles.container}>
          
          {/* top and side bar */}
          <TopSidebar userRole="parent" />

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
    </View>
  );
}

// 🎨 **STYLES**
const styles = StyleSheet.create({
  content: { padding: 20 },

  container: { flex: 1, paddingTop: 85, backgroundColor: "#F4F4F4" },
  

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

});
