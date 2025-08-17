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
import { useRouter } from "expo-router";
import TopSidebar from '../components/TopSidebar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config';

const PAGE_SIZE = 20;

const AssignmentScreen = () => {
  const router = useRouter();
  //sidebar and topbar
  const [sidebarVisible, setSidebarVisible] = useState(false); // ✅ קובע האם התפריט פתוח או סגור
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError('');

        const userStr = await AsyncStorage.getItem('user');
        const token   = await AsyncStorage.getItem('token');
        const parsed  = userStr ? JSON.parse(userStr) : {};
        const parentId = parsed?.id || parsed?._id;

        if (!parentId) {
          setError('לא נמצא מזהה הורה באחסון');
          setAssignments([]);
          setLoading(false);
          return;
        }

        const url = `${API_BASE_URL}/api/homework/parent/current`;
        // לעזרה באבחון:
        console.log('↗️ GET', url);

        const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) {
          setError(`שגיאה בטעינה (${res.status})`);
          setAssignments([]);
          setLoading(false);
          return;
        }

        const data = await res.json();

        const normalized = (Array.isArray(data) ? data : []).map(h => ({
          id: h.id || h._id,
          teacher: h.teacherName || '',                 // מגיע מה־service
          subject: h.subject || '',
          dueDate: h.dueDate
            ? new Date(h.dueDate).toLocaleDateString('he-IL')
            : (h.createdAt ? new Date(h.createdAt).toLocaleDateString('he-IL') : ''),
          _raw: h,                                      // נשמור את כל האובייקט להצגה במודאל
        }));

        setAssignments(normalized);
      } catch (e) {
        console.error('❌ homework fetch error:', e.message);
        setError('אירעה שגיאה בטעינה');
        setAssignments([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const filteredAssignments = assignments.filter(a =>
    (a.teacher || '').includes(searchQuery) || (a.subject || '').includes(searchQuery)
  );

  const totalPages = Math.ceil(filteredAssignments.length / PAGE_SIZE) || 1;
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const displayedAssignments = filteredAssignments.slice(startIndex, startIndex + PAGE_SIZE);

  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const handleOpenAssignment = (assignment) => {
    setSelectedAssignment(assignment);
    setModalVisible(true);
  };

  return (
    <View style={styles.container}>
      
      {/* top and side bar */}
      <TopSidebar userRole="parent" />

      {/* 🔹 חיפוש */}
      <TextInput
        style={styles.searchInput}
        placeholder="חפש לפי מורה או מקצוע 🔍" 
                    placeholderTextColor="black"
             textAlign="right"
        value={searchQuery}
        onChangeText={(text) => {
          setSearchQuery(text);
          setCurrentPage(1);
        }}
      />
      {loading && (
        <Text style={{ textAlign: 'center', marginTop: 10 }}>
          טוען שיעורי בית…
        </Text>
      )}
      {!!error && !loading && (
        <Text style={{ textAlign: 'center', marginTop: 10, color: 'red' }}>
          {error}
        </Text>
      )}
      {!loading && !error && assignments.length === 0 && (
        <Text style={{ textAlign: 'center', marginTop: 10 }}>
          אין שיעורי בית כרגע
        </Text>
      )}
      {/* 🔹 טבלה */}
      <ScrollView>
        <View style={styles.tableContainer}>
          <View style={styles.tableHeader}>
            <Text style={styles.headerCell}>מורה</Text>
            <Text style={styles.headerCell}>מקצוע</Text>
            <Text style={styles.headerCell}>תאריך סיום</Text>
          </View>

          {displayedAssignments.map((assignment) => (
            <TouchableOpacity
              key={assignment.id}
              style={styles.tableRow}
              onPress={() => handleOpenAssignment(assignment)}
            >
              <Text style={styles.cell}>{assignment.teacher}</Text>
              <Text style={styles.cell}>{assignment.subject}</Text>
              <Text style={styles.cell}>{assignment.dueDate}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* 🔹 Modal */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalBackground}>
          <View style={styles.messageModal}>
            <ScrollView style={{ width: "100%" }}>
              <Text style={styles.messageTitle}>{selectedAssignment?.subject}</Text>
              <Text style={styles.messageSender}>מורה: {selectedAssignment?.teacher}</Text>
              <Text style={styles.messageDate}>תאריך סיום: {selectedAssignment?.dueDate}</Text>
              <Text style={styles.messageContent}>
                {selectedAssignment?._raw?.content || '—'}
              </Text>
            </ScrollView>
            <View style={styles.modalButtonsContainer}>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeMessageButton}>
                <Text style={styles.closeMessageButtonText}>סגור</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  alert("המטלה סומנה כהושלמה!");
                  setModalVisible(false);
                }}
                style={styles.completeButton}
              >
                <Text style={styles.completeButtonText}>✔️ סיים</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
    </View>
  );
};

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
  menuButton: { padding: 4 },
  menuIcon: { color: "white", fontSize: 26 },
  dateTime: { color: "white", fontSize: 16, fontWeight: "bold" },

  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  sidebar: {
    position: "absolute",
    left: 0,
    width: 250,
    height: "100%",
    backgroundColor: "black",
    padding: 50,
  },
  sidebarHeader: {
    flexDirection: "row",
    justifyContent: "space-between", 
    alignItems: "center",
    width: "100%",
    paddingBottom: 10,
    borderBottomWidth: 1, 
    borderBottomColor: "#fff", 
    paddingHorizontal: 5,
  },
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
  
  searchInput: {
    height: 40,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
    marginVertical: 15,
    marginHorizontal: 20,
    textAlign: "right",
  },

  tableContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    marginHorizontal: 10,
    marginTop: 20,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#ddd",
    padding: 10,
    borderRadius: 5,
  },
  headerCell: { flex: 1, fontWeight: "bold", textAlign: "center" },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    paddingVertical: 10,
    alignItems: "center",
  },
  cell: { flex: 1, textAlign: "center" },

  
  messageModal: {
    width: "85%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  messageTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "right",
  },
  messageSender: {
    fontSize: 16,
    marginBottom: 5,
    textAlign: "right",
  },
  messageDate: {
    fontSize: 14,
    color: "#777",
    marginBottom: 15,
    textAlign: "right",
  },
  messageContent: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
    textAlign: "right",
  },

  modalButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 15,
  },
  closeMessageButton: {
    backgroundColor: "#ccc",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    alignItems: "center",
    marginRight: 5,
  },
  closeMessageButtonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "bold",
  },
  completeButton: {
    backgroundColor: "green",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    alignItems: "center",
    marginLeft: 5,
  },
  completeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default AssignmentScreen;
