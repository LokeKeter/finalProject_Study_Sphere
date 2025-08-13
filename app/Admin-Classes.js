import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert, Modal, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import TopSidebar from '@/components/TopSidebar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '@/config';

export default function AdminClassesPage() {
  const router = useRouter();

  const [classes, setClasses] = useState([]);
  const [unassignedStudents, setUnassignedStudents] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [isStudentModalVisible, setStudentModalVisible] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [isConfirmModalVisible, setConfirmModalVisible] = useState(false);
  const [studentToRemove, setStudentToRemove] = useState(null);

  const [candidateStudents, setCandidateStudents] = useState([]);

  const baseOf = (g) => String(g || '').replace(/\d+$/, ''); // "ג1" -> "ג", "יב10" -> "יב"

  // טעינת נתונים מהשרת
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      
      console.log('=== FETCHING ALL DATA ===');
      
      // שליפת כל הכיתות
      const classesResponse = await fetch(`${API_BASE_URL}/api/class`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const classesData = await classesResponse.json();
      console.log('Classes data:', classesData.length, 'classes found');
      console.log('Classes structure:', classesData.map(c => ({
        grade: c.grade,
        studentsCount: c.students?.length || 0,
        students: c.students?.map(s => ({ studentId: s.studentId, studentName: s.studentName }))
      })));
      setClasses(classesData);

      // שליפת תלמידים לא משויכים
      const unassignedResponse = await fetch(`${API_BASE_URL}/api/class/students/unassigned`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const unassignedData = await unassignedResponse.json();
      console.log('Unassigned students:', unassignedData.length, 'students found');
      console.log('Unassigned structure:', unassignedData.map(s => ({
        _id: s._id,
        studentId: s.studentId,
        studentName: s.studentName
      })));
      setUnassignedStudents(unassignedData);

    } catch (error) {
      console.error('שגיאה בטעינת נתונים:', error);
      Alert.alert('שגיאה', 'לא ניתן לטעון את הנתונים מהשרת');
    }
  };

  const addStudentToClass = async () => {
    if (!selectedStudent || !selectedClass) {
      Alert.alert('שגיאה', 'יש לבחור תלמיד וכיתה');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('token');
      const student = candidateStudents.find(s => s._id === selectedStudent);
      
      console.log('=== ADDING STUDENT TO CLASS ===');
      console.log('Student object:', student);
      console.log('Class object:', selectedClass);
      
      const requestBody = {
        classId: selectedClass._id,
        parentId: student._id,
        studentId: student.studentId,
        studentName: student.studentName
      };
      
      console.log('Request body for adding student:', requestBody);
      
      const response = await fetch(`${API_BASE_URL}/api/class/students/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });

      console.log('Add student response status:', response.status);

      if (response.ok) {
        const responseData = await response.json();
        console.log('Add student success:', responseData);
        Alert.alert('הצלחה', 'התלמיד נוסף לכיתה בהצלחה');
        setStudentModalVisible(false);
        setSelectedStudent('');
        setSelectedClass(null);
        await fetchAllData(); // רענן את הנתונים
      } else {
        const errorData = await response.json();
        console.error('Add student error:', errorData);
        Alert.alert('שגיאה', errorData.error || 'שגיאה בהוספת התלמיד');
      }
    } catch (error) {
      console.error('שגיאה בהוספת תלמיד:', error);
      Alert.alert('שגיאה', 'לא ניתן להתחבר לשרת');
    }
  };

  const removeStudentFromClass = async (classId, student) => {
    try {
      console.log('=== REMOVING STUDENT FROM CLASS ===');
      console.log('Class ID:', classId);
      console.log('Student to remove:', student);
      
      const token = await AsyncStorage.getItem('token');
      
      // נבדוק איזה פורמט השרת מצפה לו
      const requestBody = {
        classId,
        studentId: student.studentId
      };
      
      console.log('Remove request body:', requestBody);
      console.log('API URL:', `${API_BASE_URL}/api/class/students/remove`);
      
      const response = await fetch(`${API_BASE_URL}/api/class/students/remove`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });

      console.log('Remove response status:', response.status);
      console.log('Remove response ok:', response.ok);
      
      const responseData = await response.json();
      console.log('Remove response data:', responseData);
      
      if (response.ok) {
        console.log('✅ Student removed successfully');
        Alert.alert('הצלחה', 'התלמיד הוסר מהכיתה בהצלחה');
        setConfirmModalVisible(false);
        setStudentToRemove(null);
        await fetchAllData(); // רענן את הנתונים
      } else {
        console.error('❌ Failed to remove student:', responseData);
        Alert.alert('שגיאה', responseData.error || 'שגיאה בהסרת התלמיד');
      }
    } catch (error) {
      console.error('💥 Exception in removeStudentFromClass:', error);
      Alert.alert('שגיאה', 'לא ניתן להתחבר לשרת');
    }
  };

  // החלפת Alert בModal מותאם אישית
  const confirmRemoveStudent = (classId, student) => {
    console.log('=== CONFIRM REMOVE STUDENT ===');
    console.log('Setting up confirmation for:', { classId, student });
    
    setStudentToRemove({
      classId,
      student,
      studentName: student.studentName || student.studentId,
      studentId: student.studentId
    });
    setConfirmModalVisible(true);
  };

  const handleConfirmRemoval = () => {
    console.log('=== USER CONFIRMED REMOVAL ===');
    console.log('Removing student:', studentToRemove);
    removeStudentFromClass(studentToRemove.classId, studentToRemove.student);
  };

  const handleCancelRemoval = () => {
    console.log('=== USER CANCELLED REMOVAL ===');
    setConfirmModalVisible(false);
    setStudentToRemove(null);
  };

  const renderClassItem = ({ item }) => (
    <View style={styles.classCard}>
      <Text style={styles.classTitle}>כיתה {item.grade}</Text>
      <Text style={styles.studentCount}>מספר תלמידים: {item.students?.length || 0}</Text>
      
      <View style={styles.studentsContainer}>
        {item.students?.map((student, index) => (
          <View key={`${item._id}-${student.studentId}-${index}`} style={styles.studentItem}>
            <Text style={styles.studentText}>
              {student.studentName ? `${student.studentName} (${student.studentId})` : `תלמיד: ${student.studentId}`}
            </Text>
            <TouchableOpacity 
              onPress={() => {
                console.log('=== REMOVE BUTTON PRESSED ===');
                console.log('Class ID:', item._id);
                console.log('Student data:', student);
                confirmRemoveStudent(item._id, student);
              }}
              style={styles.removeButton}
            >
              <Text style={styles.removeButtonText}>✖</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      <TouchableOpacity 
        style={styles.addStudentButton}
        onPress={() => {
          console.log('=== ADD STUDENT BUTTON PRESSED ===');
          console.log('Selected class:', item);
          setSelectedClass(item);

          // בסיס שכבה לכיתה (למשל "ג1" -> "ג")
          const base = baseOf(item.grade);

          // unassignedStudents מגיעים עם student.grade מהשרת (מודל Student)
          const filtered = unassignedStudents.filter(s => s.grade === base);

          setCandidateStudents(filtered);
          setSelectedStudent('');
          setStudentModalVisible(true);
        }}
      >
        <Text style={styles.addStudentButtonText}>➕ הוסף תלמיד</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <TopSidebar userRole="admin" />

      <View style={styles.contentContainer}>
        <Text style={styles.title}>ניהול כיתות ותלמידים</Text>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{classes.length}</Text>
            <Text style={styles.statLabel}>כיתות פעילות</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{unassignedStudents.length}</Text>
            <Text style={styles.statLabel}>תלמידים לא משויכים</Text>
          </View>
        </View>

        {unassignedStudents.length > 0 && (
          <View style={styles.unassignedContainer}>
            <Text style={styles.unassignedTitle}>⚠️ תלמידים ללא כיתה:</Text>
            {unassignedStudents.map(student => (
              <View key={student._id} style={styles.unassignedStudent}>
                <Text>{student.studentName || student.name} (מספר: {student.studentId})</Text>
              </View>
            ))}
          </View>
        )}

        <FlatList
          data={classes}
          keyExtractor={item => item._id}
          renderItem={renderClassItem}
          ListEmptyComponent={<Text style={styles.emptyText}>לא נמצאו כיתות</Text>}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      </View>

      {/* מודל אישור מחיקה מותאם אישית */}
      <Modal visible={isConfirmModalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.confirmModalContent}>
            <Text style={styles.confirmTitle}>🚫 הסרת תלמיד</Text>
            
            <Text style={styles.confirmMessage}>
              האם אתה בטוח שברצונך להסיר את התלמיד{'\n'}
              <Text style={styles.studentNameHighlight}>
                {studentToRemove?.studentName}
              </Text>{'\n'}
              מהכיתה?
            </Text>
            
            <View style={styles.confirmButtons}>
              <TouchableOpacity 
                style={[styles.confirmButton, styles.cancelButton]} 
                onPress={handleCancelRemoval}
              >
                <Text style={styles.cancelButtonText}>❌ ביטול</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.confirmButton, styles.removeButton]} 
                onPress={handleConfirmRemoval}
              >
                <Text style={styles.removeButtonText}>🗑️ הסר</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* מודל הוספת תלמיד לכיתה */}
      <Modal visible={isStudentModalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              הוסף תלמיד לכיתה {selectedClass?.grade}
            </Text>
            
            <Text style={styles.label}>בחר תלמיד:</Text>
            <ScrollView style={styles.dropdown}>
              {candidateStudents.map(student => (
                <TouchableOpacity 
                  key={student._id}
                  style={[styles.dropdownItem, selectedStudent === student._id && styles.selected]}
                  onPress={() => {
                    console.log('=== STUDENT SELECTED ===');
                    console.log('Selected student:', student);
                    setSelectedStudent(student._id);
                  }}
                >
                  <Text>{(student.studentName || student.name) } - מספר: {student.studentId}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {candidateStudents.length === 0 && (
              <Text style={styles.noStudentsText}>כל התלמידים כבר משויכים לכיתות</Text>
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, {backgroundColor: '#ccc'}]} 
                onPress={() => {
                  console.log('=== CANCEL ADD STUDENT ===');
                  setStudentModalVisible(false);
                  setSelectedStudent('');
                  setSelectedClass(null);
                  setCandidateStudents([]);
                }}
              >
                <Text>❌ ביטול</Text>
              </TouchableOpacity>
              {unassignedStudents.length > 0 && (
                <TouchableOpacity 
                  style={[styles.modalButton, {backgroundColor: '#4CAF50'}]} 
                  onPress={() => {
                    console.log('=== CONFIRM ADD STUDENT ===');
                    addStudentToClass();
                  }}
                >
                  <Text style={{color: 'white'}}>✅ הוסף</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  contentContainer: {
    paddingTop: 85,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333'
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3'
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5
  },
  unassignedContainer: {
    backgroundColor: '#fff3cd',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107'
  },
  unassignedTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#856404'
  },
  unassignedStudent: {
    backgroundColor: 'white',
    padding: 8,
    borderRadius: 5,
    marginBottom: 5,
  },
  classCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  classTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333'
  },
  studentCount: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10
  },
  studentsContainer: {
    marginBottom: 15,
  },
  studentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 10,
    borderRadius: 8,
    marginBottom: 5,
  },
  studentText: {
    flex: 1,
    fontSize: 14
  },
  removeButton: {
    backgroundColor: '#dc3545',
    borderRadius: 15,
    width: 25,
    height: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold'
  },
  addStudentButton: {
    backgroundColor: '#28a745',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
  },
  addStudentButtonText: {
    color: 'white',
    fontWeight: 'bold'
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    color: '#999',
    fontSize: 16
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center'
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  dropdown: {
    maxHeight: 200,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 15,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  selected: {
    backgroundColor: '#e3f2fd',
  },
  noStudentsText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    marginVertical: 20
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
  },
  // סטיילים למודל האישור המותאם אישית
  confirmModalContent: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 25,
    width: '85%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  confirmTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#dc3545',
    textAlign: 'center'
  },
  confirmMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 25,
    color: '#333',
    lineHeight: 24,
  },
  studentNameHighlight: {
    fontWeight: 'bold',
    color: '#007AFF',
    fontSize: 18,
  },
  confirmButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  confirmButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    minWidth: 100,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#6c757d',
  },
  removeButton: {
    backgroundColor: '#dc3545',
  },
  cancelButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  removeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});