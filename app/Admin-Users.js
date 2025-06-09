import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import TopSidebar from '@/components/TopSidebar';

export default function AdminUsersPage() {
  const router = useRouter();

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isAddModalVisible, setAddModalVisible] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', idNumber: '' });

  
//   const isValidSerial = serials.some(s => s.code === user.serialCode && s.role === user.role);
// if (!isValidSerial) {
//   Alert.alert("קוד סריאלי לא תקף", "הקוד לא תואם לתפקיד הנבחר");
//   return;
// }



//   const [serials, setSerials] = useState([
//   { id: '1', code: 'ABC123', role: 'teacher' },
//   { id: '2', code: 'XYZ987', role: 'parent' }
// ]);


  useEffect(() => {
    const fetchUsers = async () => {
      const response = await Promise.resolve([
        { _id: '1', idNumber: '123456789', name: 'משה כהן' },
        { _id: '2', idNumber: '987654321', name: 'שרה לוי' },
        { _id: '3', idNumber: '456789123', name: 'דוד ישראלי' },
        { _id: '4', idNumber: '321654987', name: 'רחל נבון' },
      ]);
      setUsers(response);
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    if (!search.trim()) {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user => user.idNumber.includes(search));
      setFilteredUsers(filtered);
    }
  }, [search, users]);

  const handleAddUser = () => {
    if (!newUser.name.trim() || !newUser.idNumber.trim()) {
      Alert.alert('שגיאה', 'יש למלא שם ות.ז');
      return;
    }
    const newEntry = { _id: Date.now().toString(), ...newUser };
    const updatedUsers = [...users, newEntry];
    setUsers(updatedUsers);
    setNewUser({ name: '', idNumber: '' });
    setAddModalVisible(false);
  };

  const confirmDelete = (userId) => {
    Alert.alert(
      'מחיקת משתמש',
      'האם אתה בטוח שברצונך למחוק את המשתמש?',
      [
        { text: 'ביטול', style: 'cancel' },
        { text: 'מחק', style: 'destructive', onPress: () => deleteUser(userId) },
      ]
    );
  };

  const deleteUser = (userId) => {
    const updatedUsers = users.filter(user => user._id !== userId);
    setUsers(updatedUsers);
  };

  const renderItem = ({ item }) => (
    <View style={styles.tableRow}>
      <Text style={styles.cell}>{item.name}</Text>
      <Text style={styles.cell}>{item.idNumber}</Text>
      <TouchableOpacity onPress={() => confirmDelete(item._id)}>
        <Text style={{ color: 'red', fontWeight: 'bold' }}>🗑️</Text>
      </TouchableOpacity>
    </View>
  );

  return (



    
    <View style={styles.container}>
      <TopSidebar userRole="admin" />

      <View style={styles.searchWrapper}>
        <TextInput
          placeholder="חפש לפי ת.ז"
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <TouchableOpacity onPress={() => setAddModalVisible(true)} style={styles.addButton}>
        <Text style={styles.addButtonText}>➕ הוסף משתמש</Text>
      </TouchableOpacity>

      <View style={styles.tableContainer}>
        <View style={styles.tableHeader}>
          <Text style={styles.headerCell}>שם משתמש</Text>
          <Text style={styles.headerCell}> סיסמא</Text>
        </View>

        <FlatList
          data={filteredUsers}
          keyExtractor={item => item._id}
          renderItem={renderItem}
          ListEmptyComponent={<Text style={styles.emptyText}>לא נמצאו משתמשים</Text>}
        />
      </View>

      <Modal visible={isAddModalVisible} animationType="slide" transparent>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View style={{ width: '90%', backgroundColor: 'white', padding: 20, borderRadius: 10 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>📝 הוסף משתמש חדש</Text>
            <TextInput
              placeholder="שם מלא"
              value={newUser.name}
              onChangeText={(text) => setNewUser({ ...newUser, name: text })}
              style={styles.searchInput}
            />
            <TextInput
              placeholder="תעודת זהות"
              value={newUser.idNumber}
              onChangeText={(text) => setNewUser({ ...newUser, idNumber: text })}
              style={styles.searchInput}
              keyboardType="numeric"
            />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 }}>
              <TouchableOpacity style={{ backgroundColor: '#ccc', padding: 10, borderRadius: 5 }} onPress={() => setAddModalVisible(false)}>
                <Text style={{ fontWeight: 'bold' }}>❌ ביטול</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{ backgroundColor: 'black', padding: 10, borderRadius: 5 }} onPress={handleAddUser}>
                <Text style={{ color: 'white', fontWeight: 'bold' }}>💾 שמור</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        {/* <TextInput
  placeholder="מספר סריאלי"
  value={newSerial.code}
  onChangeText={(text) => setNewSerial({ ...newSerial, code: text })}
  style={styles.searchInput}
/>
<TouchableOpacity onPress={() => setNewSerial({ ...newSerial, role: 'teacher' })}>
  <Text>📚 מורה</Text>
</TouchableOpacity>
<TouchableOpacity onPress={() => setNewSerial({ ...newSerial, role: 'parent' })}>
  <Text>👪 הורה</Text>
</TouchableOpacity> */}



      </Modal>
      
      
    </View>
    
//     const handleAddSerial = () => {
//   if (!newSerial.code || !newSerial.role) {
//     Alert.alert("שגיאה", "יש למלא סריאל ותפקיד");
//     return;
//   }
//   const newEntry = { id: Date.now().toString(), ...newSerial };
//   setSerials([...serials, newEntry]);
//   setNewSerial({ code: '', role: '' });
//   setModalVisible(false);
// };
// <TextInput
//   placeholder="הזן קוד סריאלי"
//   value={user.serialCode}
//   onChangeText={(text) => setUser({ ...user, serialCode: text })}
//   style={styles.input}
// />


  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 85,
    paddingHorizontal: 16,
    backgroundColor: '#fff'
  },
  searchWrapper: {
    marginBottom: 16
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    textAlign: 'right',
  },
  tableContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#ddd',
    paddingVertical: 10,
  },
  headerCell: {
    flex: 1,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 12,
    alignItems: 'center'
  },
  cell: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    color: '#999'
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: 'black',
    padding: 14,
    borderRadius: 8,
    zIndex: 10,
  },
  addButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  }
});
