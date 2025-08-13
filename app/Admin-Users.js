import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Alert,
  Modal,
  TextInput,
  ScrollView,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config';
import TopSidebar from '../components/TopSidebar';
import { useRouter } from 'expo-router';

// קבלת גודל המסך הראשוני
const { width: initialScreenWidth, height: screenHeight } = Dimensions.get('window');

const InfoCard = ({ title, count, icon, color, screenWidth }) => {
  const cardSize =
    screenWidth > 1024 ? '22%' :
    screenWidth > 768 ? '30%' :
    '45%';

  return (
    <View style={{
      backgroundColor: color,
      flexBasis: cardSize,
      aspectRatio: 1,
      minWidth: 80,
      maxWidth:80,
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 12,
      marginBottom: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 6,
    }}>
      <Text style={{
         fontSize: screenWidth > 1024 ? 14 : screenWidth > 768 ? 13 : 12,
        marginBottom: 8,
      }}>{icon}</Text>

      <Text style={{
         fontSize: screenWidth > 1024 ? 14 : screenWidth > 768 ? 13 : 12,
        fontWeight: 'bold',
        color: 'white',
      }}>{count}</Text>

      <Text style={{
         fontSize: screenWidth > 1024 ? 14 : screenWidth > 768 ? 13 : 12,
        color: 'white',
        textAlign: 'center',
        fontWeight: '600',
      }}>{title}</Text>
    </View>
  );
};



export default function AdminUsers() {
  const router = useRouter();
  
  // State for screen dimensions
  const [screenData, setScreenData] = useState(Dimensions.get('window'));

  const [users, setUsers] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [parents, setParents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [search, setSearch] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isAddModalVisible, setAddModalVisible] = useState(false);
  const [isTeacherModalVisible, setIsTeacherModalVisible] = useState(false);
  const [isClassModalVisible, setIsClassModalVisible] = useState(false);
  const [isStudentAssignmentVisible, setStudentAssignmentVisible] = useState(false);
  const [selectedGradeForAssignment, setSelectedGradeForAssignment] = useState('');
  const [availableStudents, setAvailableStudents] = useState([]);
  const [selectedStudentsForClass, setSelectedStudentsForClass] = useState([]);
  const [isUserDetailsModalVisible, setIsUserDetailsModalVisible] = useState(false);
  const [selectedUserDetails, setSelectedUserDetails] = useState(null);
  const [newUser, setNewUser] = useState({ 
    name: '', 
    email: '', 
    username: '', 
    password: '', 
    role: 'parent',
    subject: '',
    studentName: '',
    studentId: ''
  });
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [selectedClass, setSelectedClass] = useState('');

  // Listen for screen dimension changes
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreenData(window);
    });

    return () => subscription?.remove();
  }, []);

  // Update current screen width
  const currentScreenWidth = screenData.width;

  // טעינת נתונים מהשרת
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      console.log('🚀 מתחיל טעינת נתונים...');
      const token = await AsyncStorage.getItem('token');
      console.log('🔑 Token:', token ? 'קיים' : 'לא קיים');
      
      if (!token) {
        console.error('❌ אין token - המשתמש לא מחובר');
        Alert.alert(
          'שגיאת אימות',
          'אתה לא מחובר למערכת. אנא התחבר שוב.',
          [
            { text: 'התחבר שוב', onPress: () => router.push('/') }
          ]
        );
        return;
      }
      
      // שליפת כל המשתמשים
      console.log('📡 מבקש משתמשים מ:', `${API_BASE_URL}/api/users/users`);
      const usersResponse = await fetch(`${API_BASE_URL}/api/users/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('👥 תגובה משתמשים:', usersResponse.status, usersResponse.statusText);
      
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        console.log('👥 נתוני משתמשים:', usersData.length, 'משתמשים');
        setUsers(usersData);
      } else {
        console.error('❌ שגיאה בשליפת משתמשים:', usersResponse.status);
      }

      // שליפת מורים
      console.log('📡 מבקש מורים מ:', `${API_BASE_URL}/api/users/teachers`);
      const teachersResponse = await fetch(`${API_BASE_URL}/api/users/teachers`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('👨‍🏫 תגובה מורים:', teachersResponse.status, teachersResponse.statusText);
      
      if (teachersResponse.ok) {
        const teachersData = await teachersResponse.json();
        console.log('👨‍🏫 נתוני מורים:', teachersData.length, 'מורים');
        setTeachers(teachersData);
      } else {
        console.error('❌ שגיאה בשליפת מורים:', teachersResponse.status);
      }

      // שליפת הורים
      console.log('📡 מבקש הורים מ:', `${API_BASE_URL}/api/users/parents`);
      const parentsResponse = await fetch(`${API_BASE_URL}/api/users/parents`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('👪 תגובה הורים:', parentsResponse.status, parentsResponse.statusText);
      
      if (parentsResponse.ok) {
        const parentsData = await parentsResponse.json();
        console.log('👪 נתוני הורים:', parentsData.length, 'הורים');
        setParents(parentsData);
      } else {
        console.error('❌ שגיאה בשליפת הורים:', parentsResponse.status);
      }

      // שליפת כיתות
      console.log('📡 מבקש כיתות מ:', `${API_BASE_URL}/api/class`);
      const classesResponse = await fetch(`${API_BASE_URL}/api/class`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('🏫 תגובה כיתות:', classesResponse.status, classesResponse.statusText);
      
      if (classesResponse.ok) {
        const classesData = await classesResponse.json();
        console.log('🏫 נתוני כיתות:', classesData.length, 'כיתות');
        setClasses(classesData);
      } else {
        console.error('❌ שגיאה בשליפת כיתות:', classesResponse.status);
      }

      console.log('✅ סיום טעינת נתונים');

    } catch (error) {
      console.error('💥 שגיאה כללית בטעינת נתונים:', error);
      Alert.alert('שגיאה', 'לא ניתן לטעון את הנתונים מהשרת. בדוק שהשרת פועל.');
    }
  };

  // לוגים לבדיקת שינויים ב-state
  useEffect(() => {
    console.log('📊 עדכון נתונים:');
    console.log('👥 סך משתמשים:', users.length);
    console.log('👨‍🏫 מורים:', teachers.length);
    console.log('👪 הורים:', parents.length);
    console.log('🏫 כיתות:', classes.length);
    console.log('👑 מנהלים:', users.filter(u => u.role === 'admin').length);
  }, [users, teachers, parents, classes]);

  useEffect(() => {
    if (!search.trim()) {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user => 
        user.name.includes(search) || user.email.includes(search)
      );
      setFilteredUsers(filtered);
    }
  }, [search, users]);

  const handleAddUser = async () => {
    if (!newUser.name.trim() || !newUser.email.trim() || !newUser.username.trim() || !newUser.password.trim()) {
      Alert.alert('שגיאה', 'יש למלא את כל השדות הנדרשים');
      return;
    }

    // אזהרה מיוחדת ליצירת משתמש מנהל
    if (newUser.role === 'admin') {
      Alert.alert(
        'יצירת משתמש מנהל',
        'האם אתה בטוח שברצונך ליצור משתמש מנהל נוסף? משתמש מנהל יקבל גישה מלאה למערכת.',
        [
          { text: 'ביטול', style: 'cancel' },
          { text: 'כן, צור מנהל', style: 'destructive', onPress: () => createUserRequest() },
        ]
      );
      return;
    }

    // עבור תפקידים אחרים
    createUserRequest();
  };

  const createUserRequest = async () => {
    try {
      console.log('📤 Admin creating user with data:', newUser);
      const token = await AsyncStorage.getItem('token');
      
      if (!token) {
        Alert.alert('שגיאת אימות', 'אתה לא מחובר למערכת. אנא התחבר שוב.');
        return;
      }
      
      // הכנת הנתונים לשליחה - הסרת שדות ריקים
      const userData = {
        name: newUser.name,
        email: newUser.email,
        username: newUser.username,
        password: newUser.password,
        role: newUser.role
      };
      
      // הוספת subject רק למורים
      if (newUser.role === 'teacher' && newUser.subject) {
        userData.subject = newUser.subject;
      }
      
      // הוספת נתוני תלמיד רק להורים
      if (newUser.role === 'parent') {
        if (newUser.studentName) userData.studentName = newUser.studentName;
        if (newUser.studentId) userData.studentId = newUser.studentId;
        if (newUser.grade) userData.grade = newUser.grade;
      }
      
      console.log('📤 Final user data being sent:', userData);
      
      const response = await fetch(`${API_BASE_URL}/api/users/create-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(userData)
      });

      console.log('📥 Admin user creation response:', response.status, response.statusText);

      if (response.ok) {
        const responseData = await response.json();
        console.log('✅ Admin user creation success:', responseData);
        const roleText = newUser.role === 'admin' ? 'מנהל' : newUser.role === 'teacher' ? 'מורה' : 'הורה';
        Alert.alert('הצלחה', `${roleText} ${newUser.name} נוסף בהצלחה למערכת`);
        setNewUser({ 
          name: '', 
          email: '', 
          username: '', 
          password: '', 
          role: 'parent',
          subject: '',
          studentName: '',
          studentId: ''
        });
    setAddModalVisible(false);
        fetchAllData(); // רענן את הנתונים
      } else {
        const errorData = await response.json();
        console.error('❌ Admin user creation error:', errorData);
        Alert.alert('שגיאה', errorData.error || errorData.errors?.map(e => e.msg).join('\n') || 'שגיאה בהוספת המשתמש');
      }
    } catch (error) {
      console.error('💥 Admin user creation exception:', error);
      Alert.alert('שגיאה', 'לא ניתן להתחבר לשרת');
    }
  };

  const fetchUserDetails = async (userId) => {
    try {
      console.log('👤 מציג פרטי משתמש:', userId);
      console.log('📊 רשימת משתמשים כוללת:', users.length, 'משתמשים');
      console.log('📊 IDs של משתמשים:', users.map(u => u._id));
      
      // מוצא את המשתמש מהנתונים שכבר טענו
      const userDetails = users.find(u => u._id === userId);
      if (!userDetails) {
        console.error('❌ משתמש לא נמצא ב-state עבור ID:', userId);
        Alert.alert('שגיאה', 'לא נמצאו פרטי משתמש');
        return;
      }

      console.log('✅ פרטי משתמש נמצאו:', userDetails);
      console.log('📊 רשימת כיתות כוללת:', classes.length, 'כיתות');
      
      // מוצא את הכיתות שהמשתמש שייך אליהן
      let userClasses = [];
      let studentClassId = null;
      if (userDetails.role === 'teacher' && userDetails.assignedClasses) {
        userClasses = userDetails.assignedClasses;
        console.log('👨‍🏫 כיתות של מורה:', userClasses);
      } else if (userDetails.role === 'parent') {
        console.log('👪 מחפש כיתה עבור תלמיד ID:', userDetails.studentId);
        // מחפש את הכיתה של התלמיד
        const studentClass = classes.find(c => 
          c.students.some(s => s.studentId === userDetails.studentId)
        );
        if (studentClass) {
          userClasses = [studentClass.grade];
          studentClassId = studentClass._id;
          console.log('🎒 תלמיד נמצא בכיתה:', studentClass.grade, 'ID:', studentClassId);
        } else {
          console.log('⚠️ תלמיד לא נמצא בכיתה כלשהי');
        }
      }

      const finalUserDetails = {
        ...userDetails,
        userClasses,
        studentClassId
      };
      console.log('📋 פרטי משתמש סופיים:', finalUserDetails);

      setSelectedUserDetails(finalUserDetails);
      setIsUserDetailsModalVisible(true);
    } catch (error) {
      console.error('💥 שגיאה בהצגת פרטי משתמש:', error);
      Alert.alert('שגיאה', 'לא ניתן להציג את פרטי המשתמש');
    }
  };

  const removeStudentFromClass = async (userId, classId, studentId) => {
    try {
      console.log('🚫 מסיר תלמיד מכיתה:', { userId, classId, studentId });
      const token = await AsyncStorage.getItem('token');
      
      if (!token) {
        Alert.alert('שגיאת אימות', 'אתה לא מחובר למערכת. אנא התחבר שוב.');
        return;
      }
      
      const requestBody = {
        classId,
        studentId
      };
      console.log('📤 נתונים נשלחים להסרת תלמיד:', requestBody);
      
      const response = await fetch(`${API_BASE_URL}/api/class/students/remove`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });

      console.log('📥 תגובה להסרת תלמיד:', response.status, response.statusText);

      if (response.ok) {
        console.log('✅ תלמיד הוסר בהצלחה מהכיתה');
        Alert.alert('הצלחה', 'התלמיד הוסר בהצלחה מהכיתה והרשימה תתעדכן');
        setIsUserDetailsModalVisible(false);
        setSelectedUserDetails(null);
        fetchAllData(); // רענן את הנתונים
      } else {
        const errorText = await response.text();
        console.error('❌ שגיאה בהסרת תלמיד:', response.status, errorText);
        Alert.alert('שגיאה', `לא ניתן להסיר את התלמיד: ${response.status}\n${errorText}`);
      }
    } catch (error) {
      console.error('💥 שגיאה כללית בהסרת תלמיד:', error);
      Alert.alert('שגיאה', 'לא ניתן להתחבר לשרת. בדוק שהשרת פועל.');
    }
  };

  const confirmRemoveStudent = (userId, classId, studentId, studentName) => {
    Alert.alert(
      'הסרת תלמיד מכיתה',
      `האם אתה בטוח שברצונך להסיר את ${studentName} מהכיתה?`,
      [
        { text: 'ביטול', style: 'cancel' },
        { 
          text: 'הסר', 
          style: 'destructive', 
          onPress: () => removeStudentFromClass(userId, classId, studentId) 
        },
      ]
    );
  };

  const confirmDelete = (userId) => {
    console.log('🚨 confirmDelete called with userId:', userId);
    
    // זמנית - ביטול Alert ומחיקה ישירה לבדיקה
    if (window.confirm('האם אתה בטוח שברצונך למחוק את המשתמש?')) {
      console.log('✅ משתמש אישר מחיקה דרך window.confirm');
      deleteUser(userId);
    } else {
      console.log('❌ מחיקה בוטלה דרך window.confirm');
    }
    
    /* 
    Alert.alert(
      'מחיקת משתמש',
      'האם אתה בטוח שברצונך למחוק את המשתמש?',
      [
        { text: 'ביטול', style: 'cancel', onPress: () => console.log('❌ מחיקה בוטלה') },
        { text: 'מחק', style: 'destructive', onPress: () => {
          console.log('✅ משתמש אישר מחיקה');
          deleteUser(userId);
        }},
      ]
    );
    */
  };

  const deleteUser = async (userId) => {
    try {
      console.log('🗑️ מתחיל מחיקת משתמש:', userId);
      const token = await AsyncStorage.getItem('token');
      console.log('🔑 Token for deletion:', token ? 'קיים' : 'לא קיים');
      
      if (!token) {
        Alert.alert('שגיאת אימות', 'אתה לא מחובר למערכת. אנא התחבר שוב.');
        return;
      }
      
      // מוצא את המשתמש למחיקה
      const userToDelete = users.find(u => u._id === userId);
      const userName = userToDelete ? userToDelete.name : 'המשתמש';
      
      const url = `${API_BASE_URL}/api/users/users/${userId}`;
      console.log('📡 URL למחיקה:', url);
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      console.log('📥 תגובה למחיקה:', response.status, response.statusText);

      if (response.ok) {
        console.log('✅ משתמש נמחק בהצלחה');
        Alert.alert(
          'מחיקה הושלמה!', 
          `${userName} נמחק בהצלחה מהמערכת.\n\nהרשימה תתעדכן כעת.`
        );
        fetchAllData(); // רענן את הנתונים
      } else {
        const errorText = await response.text();
        console.error('❌ שגיאה במחיקת משתמש:', response.status, errorText);
        Alert.alert('שגיאה במחיקה', `לא ניתן למחוק את המשתמש: ${response.status}\n${errorText}`);
      }
    } catch (error) {
      console.error('💥 שגיאה כללית במחיקת משתמש:', error);
      Alert.alert('שגיאה', 'לא ניתן להתחבר לשרת. בדוק שהשרת פועל.');
    }
  };

  const assignTeacherToClass = async () => {
    console.log('🎯 התחלת תהליך שיוך מורה');
    console.log('📋 מורה נבחר:', selectedTeacher);
    console.log('📋 כיתה נבחרת:', selectedClass);
    console.log('📋 רשימת מורים זמינים:', teachers.length);
    console.log('📋 רשימת כיתות זמינות:', classes.length);
    
    // בדיקה מפורטת של נתונים
    if (!selectedTeacher) {
      console.log('❌ לא נבחר מורה');
      Alert.alert('נתונים חסרים', 'אנא בחר מורה מהרשימה');
      return;
    }
    
    if (!selectedClass) {
      console.log('❌ לא נבחרה כיתה');
      Alert.alert('נתונים חסרים', 'אנא בחר כיתה מהרשימה');
      return;
    }

    try {
      console.log('👨‍🏫 מתחיל שיוך מורה לכיתה');
      
      const token = await AsyncStorage.getItem('token');
      console.log('🔑 Token for teacher assignment:', token ? 'קיים' : 'לא קיים');
      
      if (!token) {
        Alert.alert('שגיאת אימות', 'אתה לא מחובר למערכת. אנא התחבר שוב.');
        return;
      }
      
      const requestBody = {
        teacherId: selectedTeacher,
        className: selectedClass
      };
      console.log('📤 נתונים נשלחים:', requestBody);
      
      const url = `${API_BASE_URL}/api/users/assign-teacher`;
      console.log('📡 URL:', url);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });

      console.log('📥 תגובה מהשרת:', response.status, response.statusText);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ מורה שויך לכיתה בהצלחה:', data);
        
        // מצא את המורה שנבחר
        const teacher = teachers.find(t => t._id === selectedTeacher);
        const teacherName = teacher ? teacher.name : 'מורה';
        
        Alert.alert(
          'שיוך הושלם בהצלחה!', 
          `המורה ${teacherName} שויך לכיתה ${selectedClass}.\n\nהשיוך נשמר במסד הנתונים.`
        );
        setIsTeacherModalVisible(false);
        setSelectedTeacher('');
        setSelectedClass('');
        fetchAllData(); // רענן את הנתונים
      } else {
        const errorText = await response.text();
        console.error('❌ שגיאה בשיוך מורה:', response.status, errorText);
        Alert.alert('שגיאה', `לא ניתן לשייך את המורה: ${response.status}\n${errorText}`);
      }
    } catch (error) {
      console.error('💥 שגיאה כללית בשיוך מורה:', error);
      Alert.alert('שגיאה', 'לא ניתן להתחבר לשרת. בדוק שהשרת פועל.');
    }
  };

  const createNewClass = async (grade) => {
    try {
      console.log('🏫 מתחיל יצירת כיתה:', grade);
      const token = await AsyncStorage.getItem('token');
      console.log('🔑 Token for class creation:', token ? 'קיים' : 'לא קיים');
      
      if (!token) {
        Alert.alert('שגיאת אימות', 'אתה לא מחובר למערכת. אנא התחבר שוב.');
        return;
      }
      
      const requestBody = { grade, students: [] };
      console.log('📤 נתונים נשלחים:', requestBody);
      
      const url = `${API_BASE_URL}/api/class`;
      console.log('📡 URL:', url);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });

      console.log('📥 תגובה מהשרת:', response.status, response.statusText);

      if (response.ok) {
        const newClass = await response.json();
        console.log('✅ כיתה נוצרה בהצלחה:', newClass);
        
        Alert.alert(
          'כיתה נוצרה בהצלחה!',
          `כיתה ${grade} נוצרה במסד הנתונים.\n\nהאם ברצונך להוסיף תלמידים עכשיו?`,
          [
            { 
              text: 'לא תודה, השאר ריקה', 
              style: 'cancel',
              onPress: () => {
                setIsClassModalVisible(false);
                fetchAllData(); // רענן את הנתונים
              }
            },
            { 
              text: 'כן, הוסף תלמידים', 
              onPress: async () => {
                setIsClassModalVisible(false);
                // עבור לחלוקת תלמידים
                setSelectedGradeForAssignment(grade);
                await fetchAvailableStudents();
                setStudentAssignmentVisible(true);
                fetchAllData(); // רענן את הנתונים
              }
            },
          ]
        );
      } else {
        const errorText = await response.text();
        console.error('❌ שגיאה ביצירת כיתה:', response.status, errorText);
        Alert.alert('שגיאה', `שגיאה ביצירת הכיתה: ${response.status}\n${errorText}`);
      }
    } catch (error) {
      console.error('💥 שגיאה כללית ביצירת כיתה:', error);
      Alert.alert('שגיאה', 'לא ניתן להתחבר לשרת. בדוק שהשרת פועל.');
    }
  };

  const fetchAvailableStudents = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/class/students/unassigned`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const studentsData = await response.json();
      setAvailableStudents(studentsData);
    } catch (error) {
      console.error('שגיאה בטעינת תלמידים:', error);
    }
  };

  const toggleStudentSelection = (studentId) => {
    setSelectedStudentsForClass(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const assignStudentsToClass = async () => {
    if (selectedStudentsForClass.length === 0) {
      Alert.alert('שגיאה', 'יש לבחור לפחות תלמיד אחד');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('token');
      const classToUpdate = classes.find(c => c.grade === selectedGradeForAssignment);
      
      for (const studentId of selectedStudentsForClass) {
        const student = availableStudents.find(s => s._id === studentId);
        await fetch(`${API_BASE_URL}/api/class/students/add`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            classId: classToUpdate._id,
            parentId: student._id,
            studentId: student.studentId,
            studentName: student.studentName
          })
        });
      }

      Alert.alert('הצלחה', `${selectedStudentsForClass.length} תלמידים נוספו לכיתה ${selectedGradeForAssignment}`);
      setStudentAssignmentVisible(false);
      setSelectedStudentsForClass([]);
      fetchAllData();
    } catch (error) {
      console.error('שגיאה בהוספת תלמידים:', error);
      Alert.alert('שגיאה', 'לא ניתן להוסיף תלמידים');
    }
  };

  const renderItem = ({ item }) => (
    <View style={[styles.tableRow, item.role === 'admin' && styles.adminRow]}>
      <Text style={[styles.cell, item.role === 'admin' && styles.adminText]}>
        {item.role === 'admin' && '👑 '}
        {item.name}
      </Text>
      <Text style={[styles.cell, item.role === 'admin' && styles.adminText]}>{item.email}</Text>
      <Text style={[styles.cell, item.role === 'admin' && styles.adminText]}>
        {item.role === 'teacher' ? ' מורה' : item.role === 'parent' ? ' הורה' : ' מנהל'}
      </Text>
      <TouchableOpacity 
        onPress={() => confirmDelete(item._id)}
        disabled={item.role === 'admin' && item.username === 'admin'} // לא ניתן למחוק את המנהל הראשי
      >
        <Text style={{ 
          color: item.role === 'admin' && item.username === 'admin' ? '#ccc' : 'red', 
          fontWeight: 'bold' 
        }}>
          {item.role === 'admin' && item.username === 'admin' ? '🔒' : '🗑️'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  // פונקציה ליצירת סטיילים דינמיים
  const getStyles = (screenWidth) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
    scrollContainer: {
      flex: 1,
      backgroundColor: 'transparent',
    },
    contentContainer: {
      paddingTop: 85, // מרווח עבור הטופ סיידבר
      paddingHorizontal: screenWidth > 768 ? 32 : 16,
      paddingBottom: 20,
      maxWidth: screenWidth > 1200 ? 1200 : '100%',
      alignSelf: 'center',
      width: '100%',
    },
    title: {
      fontSize: screenWidth > 768 ? 32 : 24,
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: screenWidth > 768 ? 25 : 15,
      color: '#333',
  },
  searchWrapper: {
      marginBottom: screenWidth > 768 ? 20 : 15,
  },
  searchInput: {
    borderWidth: 1,
      borderColor: '#ddd',
      borderRadius: screenWidth > 768 ? 12 : 8,
      paddingHorizontal: screenWidth > 768 ? 20 : 15,
      paddingVertical: screenWidth > 768 ? 15 : 12,
      fontSize: screenWidth > 768 ? 18 : 16,
      backgroundColor: '#f9f9f9',
    textAlign: 'right',
  },
    buttonContainer: {
      flexDirection: screenWidth > 768 ? 'row' : 'column',
      justifyContent: screenWidth > 768 ? 'space-around' : 'center',
      flexWrap: 'wrap',
      marginBottom: screenWidth > 768 ? 25 : 20,
      gap: 10,
    },
    buttonContainerTablet: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginBottom: 25,
    },
    buttonContainerLarge: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginBottom: 30,
    },
    actionButton: {
      paddingVertical: screenWidth > 768 ? 15 : 12,
      paddingHorizontal: screenWidth > 768 ? 25 : 20,
      borderRadius: screenWidth > 768 ? 12 : 8,
      alignItems: 'center',
      justifyContent: 'center',
      marginVertical: screenWidth > 768 ? 0 : 5,
      minWidth: screenWidth > 768 ? 200 : '100%',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 3.84,
      elevation: 5,
    },
    actionButtonTablet: {
      width: '23%',
      marginVertical: 0,
      paddingVertical: 15,
    },
    buttonText: {
      color: 'white',
      fontSize: screenWidth > 768 ? 16 : 14,
      fontWeight: 'bold',
      textAlign: 'center',
  },
  tableContainer: {
      backgroundColor: '#f9f9f9',
      borderRadius: screenWidth > 768 ? 12 : 8,
    overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 3.84,
      elevation: 5,
    },
    tableContainerTablet: {
      marginTop: 10,
  },
  tableHeader: {
    flexDirection: 'row',
      backgroundColor: '#007AFF',
      paddingVertical: screenWidth > 768 ? 15 : 12,
      paddingHorizontal: screenWidth > 768 ? 20 : 15,
    },
    tableHeaderTablet: {
      paddingVertical: 15,
    },
    tableRow: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: '#eee',
      paddingVertical: screenWidth > 768 ? 12 : 10,
      paddingHorizontal: screenWidth > 768 ? 20 : 15,
      alignItems: 'center',
      backgroundColor: '#fff',
    },
    cell: {
    flex: 1,
      textAlign: 'center',
      fontSize: screenWidth > 768 ? 16 : 14,
      color: '#333',
    },
    emptyText: {
      textAlign: 'center',
      marginTop: 40,
      color: '#999'
    },
    adminRow: {
      backgroundColor: '#f0f0f0',
    },
    adminText: {
    fontWeight: 'bold',
      color: '#333',
    },
    infoCardsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      gap: 10,
      padding: 10,
      backgroundColor: '#f8f9fa',
      borderRadius: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3.84,
      elevation: 5,
      marginBottom: 20,
    },
    
    searchWrapperTablet: {
      marginBottom: 16,
    },
    tableRowTablet: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 12,
    alignItems: 'center'
  },
    headerText: {
    flex: 1,
      fontWeight: 'bold',
    textAlign: 'center',
      color: 'white',
      fontSize: screenWidth > 768 ? 16 : 14,
    },
    headerTextTablet: {
    fontSize: 16
  },
    cellTablet: {
      fontSize: 16
    },
    deleteButton: {
      padding: 5,
    },
    deleteButtonTablet: {
      padding: 8,
    },
    addButton: {
      backgroundColor: '#4CAF50',
    },
    assignButton: {
      backgroundColor: '#2196F3',
    },
    createButton: {
      backgroundColor: '#FF9800',
    },
    manageButton: {
      backgroundColor: '#9C27B0',
    },
    buttonTextTablet: {
      fontSize: 16,
    },
    // סטיילים למודלים
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
      backgroundColor: 'white',
      padding: screenWidth > 768 ? 25 : 20,
      borderRadius: screenWidth > 768 ? 15 : 10,
      width: screenWidth > 768 ? '50%' : '90%',
      maxWidth: 500,
      maxHeight: '80%',
    },
    modalTitle: {
      fontSize: screenWidth > 768 ? 20 : 18,
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: screenWidth > 768 ? 20 : 15,
      color: '#333',
    },
    input: {
      borderWidth: 1,
      borderColor: '#ddd',
      borderRadius: screenWidth > 768 ? 10 : 8,
      paddingHorizontal: screenWidth > 768 ? 15 : 12,
      paddingVertical: screenWidth > 768 ? 12 : 10,
      marginBottom: screenWidth > 768 ? 15 : 12,
      fontSize: screenWidth > 768 ? 16 : 14,
      backgroundColor: '#f9f9f9',
      textAlign: 'right',
    },
    modalButtons: {
      flexDirection: screenWidth > 768 ? 'row' : 'column',
      justifyContent: 'space-around',
      marginTop: screenWidth > 768 ? 20 : 15,
      gap: screenWidth > 768 ? 10 : 8,
    },
    modalButton: {
      paddingVertical: screenWidth > 768 ? 12 : 10,
      paddingHorizontal: screenWidth > 768 ? 20 : 15,
      borderRadius: screenWidth > 768 ? 10 : 8,
      alignItems: 'center',
      flex: screenWidth > 768 ? 1 : undefined,
    },
    roleContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-around',
      marginTop: 10,
      marginBottom: 10,
      width: '100%',
    },
    roleButton: {
      paddingVertical: screenWidth > 768 ? 12 : 10,
      paddingHorizontal: screenWidth > 768 ? 18 : 15,
      borderRadius: screenWidth > 768 ? 10 : 8,
      borderWidth: 1,
      borderColor: '#ccc',
      marginHorizontal: 5,
      marginVertical: 5,
      minWidth: screenWidth > 768 ? '30%' : '28%',
      alignItems: 'center',
    },
    selectedRole: {
      backgroundColor: '#007AFF',
      borderColor: '#007AFF',
    },
    gradeGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-around',
      paddingVertical: 10,
    },
    gradeButton: {
      width: screenWidth > 768 ? '18%' : '22%',
      aspectRatio: 1,
      backgroundColor: '#f0f0f0',
      borderRadius: screenWidth > 768 ? 12 : 8,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 10,
      borderWidth: 2,
      borderColor: 'transparent',
    },
    selectedGrade: {
      backgroundColor: '#007AFF',
      borderColor: '#0056b3',
    },
    gradeText: {
      fontSize: screenWidth > 768 ? 18 : 16,
      fontWeight: 'bold',
      color: '#333',
    },
    selectedGradeText: {
      color: 'white',
    },
    // סטיילים נוספים שהיו חסרים
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    color: '#999'
  },
    label: {
      fontSize: 16,
      fontWeight: 'bold',
      marginBottom: 5,
      alignSelf: 'flex-start',
    },
    dropdown: {
      width: '100%',
      maxHeight: 150,
      borderWidth: 1,
      borderColor: '#ccc',
    borderRadius: 8,
      marginBottom: 10,
    },
    dropdownItem: {
      paddingVertical: 10,
      paddingHorizontal: 15,
      borderBottomWidth: 1,
      borderBottomColor: '#eee',
    },
    selected: {
      backgroundColor: '#e0e0e0',
    },
    userDetailRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 10,
    },
    userDetailLabel: {
      fontSize: 16,
    fontWeight: 'bold',
      color: '#555',
    },
    userDetailValue: {
      fontSize: 16,
      color: '#333',
      flexShrink: 1,
    },
  });

  // השתמש בסטיילים הדינמיים
  const styles = getStyles(currentScreenWidth);

  return (
    <View style={styles.container}>
      <TopSidebar userRole="admin" />
      
      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.tableRow,
              item.role === 'admin' && styles.adminRow,
              currentScreenWidth > 768 && styles.tableRowTablet
            ]}
            onPress={() => fetchUserDetails(item._id)}
          >
            <Text style={[
              styles.cell,
              item.role === 'admin' && styles.adminText,
              currentScreenWidth > 768 && styles.cellTablet
            ]}>
              {item.role === 'admin' && ' '}
              {item.name}
            </Text>
            <Text style={[
              styles.cell,
              item.role === 'admin' && styles.adminText,
              currentScreenWidth > 768 && styles.cellTablet
            ]}>
              {item.email}
            </Text>
            <Text style={[
              styles.cell,
              item.role === 'admin' && styles.adminText,
              currentScreenWidth > 768 && styles.cellTablet
            ]}>
              {item.role === 'teacher' ? ' מורה' : item.role === 'parent' ? ' הורה' : ' מנהל'}
            </Text>
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                confirmDelete(item._id);
              }}
              disabled={item.role === 'admin' && item.username === 'admin'}
              style={[
                styles.deleteButton,
                currentScreenWidth > 768 && styles.deleteButtonTablet
              ]}
            >
              <Text style={{
                color: item.role === 'admin' && item.username === 'admin' ? '#ccc' : 'red',
                fontWeight: 'bold',
                fontSize: currentScreenWidth > 768 ? 20 : 16
              }}>
                {item.role === 'admin' && item.username === 'admin' ? '' : '🗑️'}
              </Text>
            </TouchableOpacity>
          </TouchableOpacity>
        )}

        /* כל מה שהיה לפני הרשימה עובר לכאן */
        ListHeaderComponent={
          <View style={styles.contentContainer}>
            <Text style={styles.title}>ניהול משתמשים</Text>

            {/* סטטיסטיקות */}
            <View style={[
              styles.infoCardsContainer,
              currentScreenWidth > 768 && styles.infoCardsContainerTablet,
              currentScreenWidth > 1024 && styles.infoCardsContainerLarge
            ]}>
              <InfoCard
                title="מנהלים"
                count={users.filter(u => u.role === 'admin').length}
                color="#FF6B6B"
                screenWidth={currentScreenWidth}
              />
              <InfoCard
                title="מורים"
                count={teachers.length}
                color="#4ECDC4"
                screenWidth={currentScreenWidth}
              />
              <InfoCard
                title="הורים"
                count={parents.length}
                color="#45B7D1"
                screenWidth={currentScreenWidth}
              />
            </View>

            <View style={[
              styles.searchWrapper,
              currentScreenWidth > 768 && styles.searchWrapperTablet
            ]}>
              <TextInput
                placeholder="חפש משתמש..."
                style={styles.searchInput}
                value={search}
                onChangeText={setSearch}
              />
            </View>

            {/* כותרת הטבלה */}
            <View style={[
              styles.tableHeader,
              currentScreenWidth > 768 && styles.tableHeaderTablet
            ]}>
              <Text style={[styles.headerText, currentScreenWidth > 768 && styles.headerTextTablet]}>שם</Text>
              <Text style={[styles.headerText, currentScreenWidth > 768 && styles.headerTextTablet]}>אימייל</Text>
              <Text style={[styles.headerText, currentScreenWidth > 768 && styles.headerTextTablet]}>תפקיד</Text>
              <Text style={[styles.headerText, currentScreenWidth > 768 && styles.headerTextTablet]}>פעולות</Text>
            </View>
          </View>
        }

        /* מה שהיה אחרי הרשימה עובר לכאן */
        ListFooterComponent={
          <View style={[
            styles.buttonContainer,
            currentScreenWidth > 768 && styles.buttonContainerTablet,
            currentScreenWidth > 1024 && styles.buttonContainerLarge
          ]}>
            <TouchableOpacity
              style={[
                styles.actionButton,
                styles.addButton,
                currentScreenWidth > 768 && styles.actionButtonTablet
              ]}
              onPress={() => setAddModalVisible(true)}
            >
              <Text style={[
                styles.buttonText,
                currentScreenWidth > 768 && styles.buttonTextTablet
              ]}> הוסף משתמש</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.actionButton,
                styles.assignButton,
                currentScreenWidth > 768 && styles.actionButtonTablet
              ]}
              onPress={() => {
                setIsTeacherModalVisible(true);
              }}
            >
              <Text style={[
                styles.buttonText,
                currentScreenWidth > 768 && styles.buttonTextTablet
              ]}>שייך מורה לכיתה </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.actionButton,
                styles.createButton,
                currentScreenWidth > 768 && styles.actionButtonTablet
              ]}
              onPress={() => setIsClassModalVisible(true)}
            >
              <Text style={[
                styles.buttonText,
                currentScreenWidth > 768 && styles.buttonTextTablet
              ]}>צור כיתה חדשה </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.actionButton,
                styles.manageButton,
                currentScreenWidth > 768 && styles.actionButtonTablet
              ]}
              onPress={() => router.push('/Admin-Classes')}
            >
              <Text style={[
                styles.buttonText,
                currentScreenWidth > 768 && styles.buttonTextTablet
              ]}>נהל כיתות קיימות </Text>
            </TouchableOpacity>
          </View>
        }

        ListEmptyComponent={<Text style={styles.emptyText}>אין משתמשים</Text>}
        contentContainerStyle={styles.contentContainer}
      />

      {/* מודל הוספת משתמש */}
      <Modal visible={isAddModalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>📝 הוסף משתמש חדש</Text>
            
            <TextInput
              placeholder="שם מלא"
              value={newUser.name}
              onChangeText={(text) => setNewUser({ ...newUser, name: text })}
              style={styles.input}
            />
            
            <TextInput
              placeholder="אימייל"
              value={newUser.email}
              onChangeText={(text) => setNewUser({ ...newUser, email: text })}
              style={styles.input}
              keyboardType="email-address"
            />
            
            <TextInput
              placeholder="שם משתמש"
              value={newUser.username}
              onChangeText={(text) => setNewUser({ ...newUser, username: text })}
              style={styles.input}
            />
            
            <TextInput
              placeholder="סיסמה"
              value={newUser.password}
              onChangeText={(text) => setNewUser({ ...newUser, password: text })}
              style={styles.input}
              secureTextEntry
            />

            {/* בחירת תפקיד */}
            <View style={styles.roleContainer}>
              <TouchableOpacity 
                style={[styles.roleButton, newUser.role === 'teacher' && styles.selectedRole]}
                onPress={() => setNewUser({ ...newUser, role: 'teacher' })}
              >
                <Text>👨‍🏫 מורה</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.roleButton, newUser.role === 'parent' && styles.selectedRole]}
                onPress={() => setNewUser({ ...newUser, role: 'parent' })}
              >
                <Text>👪 הורה</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.roleButton, newUser.role === 'admin' && styles.selectedRole]}
                onPress={() => setNewUser({ ...newUser, role: 'admin' })}
              >
                <Text>👑 מנהל</Text>
              </TouchableOpacity>
            </View>

            {newUser.role === 'teacher' && (
              <TextInput
                placeholder="מקצוע"
                value={newUser.subject}
                onChangeText={(text) => setNewUser({ ...newUser, subject: text })}
                style={styles.input}
              />
            )}

            {newUser.role === 'parent' && (
              <>
                <TextInput
                  placeholder="שם התלמיד"
                  value={newUser.studentName}
                  onChangeText={(text) => setNewUser({ ...newUser, studentName: text })}
                  style={styles.input}
                />
                <TextInput
                  placeholder="מספר תלמיד"
                  value={newUser.studentId}
                  onChangeText={(text) => setNewUser({ ...newUser, studentId: text })}
                  style={styles.input}
                />
              </>
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, {backgroundColor: '#ccc'}]} 
                onPress={() => setAddModalVisible(false)}
              >
                <Text>❌ ביטול</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, {backgroundColor: '#4CAF50'}]} 
                onPress={handleAddUser}
              >
                <Text style={{color: 'white'}}>💾 שמור</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* מודל שיוך מורה לכיתה */}
      <Modal visible={isTeacherModalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>👨‍🏫 שיוך מורה לכיתה</Text>
            
            <Text style={styles.label}>בחר מורה:</Text>
            <ScrollView style={styles.dropdown}>
              {teachers.map(teacher => (
                <TouchableOpacity 
                  key={teacher._id}
                  style={[styles.dropdownItem, selectedTeacher === teacher._id && styles.selected]}
                  onPress={() => {
                    console.log('🎯 מורה נבחר:', teacher.name, 'ID:', teacher._id);
                    setSelectedTeacher(teacher._id);
                  }}
                >
                  <Text>{teacher.name} - {teacher.subject}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.label}>בחר כיתה:</Text>
            <ScrollView style={styles.dropdown}>
              {classes.map(classItem => (
                <TouchableOpacity 
                  key={classItem._id}
                  style={[styles.dropdownItem, selectedClass === classItem.grade && styles.selected]}
                  onPress={() => {
                    console.log('🎯 כיתה נבחרת:', classItem.grade, 'ID:', classItem._id);
                    setSelectedClass(classItem.grade);
                  }}
                >
                  <Text>כיתה {classItem.grade}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, {backgroundColor: '#ccc'}]} 
                onPress={() => setIsTeacherModalVisible(false)}
              >
                <Text>❌ ביטול</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, {backgroundColor: '#2196F3'}]} 
                onPress={assignTeacherToClass}
              >
                <Text style={{color: 'white'}}>✅ שייך</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* מודל יצירת כיתה */}
      <Modal visible={isClassModalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>🏫 צור כיתה חדשה</Text>
            
            <Text style={styles.label}>בחר שכבה:</Text>
            <ScrollView contentContainerStyle={styles.gradeGrid}>
              {["א", "ב", "ג", "ד", "ה", "ו", "ז", "ח", "ט", "י", "יא", "יב"].map(grade => (
                <TouchableOpacity 
                  key={grade}
                  style={styles.gradeButton}
                  onPress={() => {
                    createNewClass(grade);
                    setIsClassModalVisible(false);
                  }}
                >
                  <Text style={styles.gradeText}>כיתה {grade}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity 
              style={[styles.modalButton, {backgroundColor: '#ccc', marginTop: 20}]} 
                              onPress={() => setIsClassModalVisible(false)}
            >
              <Text>❌ ביטול</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* מודל חלוקת תלמידים */}
      <Modal visible={isStudentAssignmentVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>👥 חלוקת תלמידים לכיתה {selectedGradeForAssignment}</Text>
            
            <Text style={styles.label}>תלמידים זמינים לחלוקה:</Text>
            <ScrollView style={styles.dropdown}>
              {availableStudents.map(student => (
                <TouchableOpacity 
                  key={student._id}
                  style={[styles.dropdownItem, selectedStudentsForClass.includes(student._id) && styles.selected]}
                  onPress={() => toggleStudentSelection(student._id)}
                >
                  <Text>{student.studentName} (מספר: {student.studentId})</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, {backgroundColor: '#ccc'}]} 
                onPress={() => setStudentAssignmentVisible(false)}
              >
                <Text>❌ ביטול</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, {backgroundColor: '#FF9800'}]} 
                onPress={assignStudentsToClass}
              >
                <Text style={{color: 'white'}}>✅ שייך</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* מודל פרטי משתמש */}
      <Modal visible={isUserDetailsModalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>👤 פרטי משתמש</Text>
            
            {selectedUserDetails && (
              <ScrollView>
                <View style={styles.userDetailRow}>
                  <Text style={styles.userDetailLabel}>שם:</Text>
                  <Text style={styles.userDetailValue}>{selectedUserDetails.name || 'לא זמין'}</Text>
                </View>
                
                <View style={styles.userDetailRow}>
                  <Text style={styles.userDetailLabel}>אימייל:</Text>
                  <Text style={styles.userDetailValue}>{selectedUserDetails.email || 'לא זמין'}</Text>
                </View>
                
                <View style={styles.userDetailRow}>
                  <Text style={styles.userDetailLabel}>שם משתמש:</Text>
                  <Text style={styles.userDetailValue}>{selectedUserDetails.username || 'לא זמין'}</Text>
                </View>
                
                <View style={styles.userDetailRow}>
                  <Text style={styles.userDetailLabel}>תפקיד:</Text>
                  <Text style={styles.userDetailValue}>
                    {selectedUserDetails.role === 'teacher' ? 'מורה' : 
                     selectedUserDetails.role === 'parent' ? 'הורה' : 
                     selectedUserDetails.role === 'admin' ? 'מנהל' : 'לא מוגדר'}
                  </Text>
                </View>

                {selectedUserDetails.role === 'teacher' && (
                  <>
                    <View style={styles.userDetailRow}>
                      <Text style={styles.userDetailLabel}>מקצוע:</Text>
                      <Text style={styles.userDetailValue}>{selectedUserDetails.subject || 'לא מוגדר'}</Text>
                    </View>
                    
                    <View style={styles.userDetailRow}>
                      <Text style={styles.userDetailLabel}>כיתות משויכות:</Text>
                      <Text style={styles.userDetailValue}>
                        {selectedUserDetails.userClasses && selectedUserDetails.userClasses.length > 0 
                          ? selectedUserDetails.userClasses.join(', ') 
                          : 'אין כיתות משויכות'}
                      </Text>
                    </View>
                  </>
                )}

                {selectedUserDetails.role === 'parent' && (
                  <>
                    <View style={styles.userDetailRow}>
                      <Text style={styles.userDetailLabel}>שם התלמיד:</Text>
                      <Text style={styles.userDetailValue}>{selectedUserDetails.studentName || 'לא מוגדר'}</Text>
                    </View>
                    
                    <View style={styles.userDetailRow}>
                      <Text style={styles.userDetailLabel}>מספר תלמיד:</Text>
                      <Text style={styles.userDetailValue}>{selectedUserDetails.studentId || 'לא מוגדר'}</Text>
                    </View>
                    
                    <View style={styles.userDetailRow}>
                      <Text style={styles.userDetailLabel}>כיתה:</Text>
                      <Text style={styles.userDetailValue}>
                        {selectedUserDetails.userClasses && selectedUserDetails.userClasses.length > 0 
                          ? selectedUserDetails.userClasses[0] 
                          : 'לא משויך לכיתה'}
                      </Text>
                    </View>
                  </>
                )}

                <View style={styles.userDetailRow}>
                  <Text style={styles.userDetailLabel}>תאריך הצטרפות:</Text>
                  <Text style={styles.userDetailValue}>
                    {selectedUserDetails.createdAt 
                      ? new Date(selectedUserDetails.createdAt).toLocaleDateString('he-IL')
                      : 'לא זמין'}
                  </Text>
                </View>
              </ScrollView>
            )}

            <View style={styles.modalButtons}>
              {selectedUserDetails?.role === 'parent' && 
                selectedUserDetails?.userClasses?.length > 0 && 
                selectedUserDetails?.studentClassId && (
                 <TouchableOpacity 
                   style={[styles.modalButton, {backgroundColor: '#FF6B6B', marginBottom: 10}]} 
                   onPress={() => confirmRemoveStudent(
                     selectedUserDetails._id,
                     selectedUserDetails.studentClassId,
                     selectedUserDetails.studentId,
                     selectedUserDetails.studentName
                   )}
                 >
                   <Text style={{color: 'white'}}>🚫 הסר מכיתה</Text>
                 </TouchableOpacity>
               )}
               
               <TouchableOpacity 
                 style={[styles.modalButton, {backgroundColor: '#007AFF'}]} 
                 onPress={() => {
                   setIsUserDetailsModalVisible(false);
                   setSelectedUserDetails(null);
                 }}
               >
                 <Text style={{color: 'white'}}>✅ סגור</Text>
               </TouchableOpacity>
             </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
