import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import TopSidebar from '@/components/TopSidebar';

export default function AdminUsersPage() {
    //מצב ראשי של רשימת המשתמשים
  const [users, setUsers] = useState([
    { _id: '1', idNumber: '123456789', name: 'משה כהן' },
    { _id: '2', idNumber: '987654321', name: 'שרה לוי' },
    { _id: '3', idNumber: '456789123', name: 'דוד ישראלי' },
    { _id: '4', idNumber: '321654987', name: 'רחל נבון' },
  ]);
  //משתנה עבור טקסט חיפוש
  const [search, setSearch] = useState('');
  // משתמשים לאחר סינון
  const [filteredUsers, setFilteredUsers] = useState([]);

  const router = useRouter();
  //הצגת כל המשתמשים בהתחלה
  useEffect(() => {
    setFilteredUsers(users);
  }, [users]);
  // סינון המשתמשים לפי תעודת זהות
  useEffect(() => {
    if (!search.trim()) {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user => user.idNumber.includes(search));
      setFilteredUsers(filtered);
    }
  }, [search, users]);
  //שורת משתמש אחת עם ניווט לפרטים
  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.tableRow} onPress={() => router.push(`/admin/users/${item._id}`)}>
      <Text style={styles.cell}>{item.name}</Text>
      <Text style={styles.cell}>{item.idNumber}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
       {/*שורת משתמש אחת עם ניווט לפרטים*/}
      <TopSidebar userRole="admin" />

        {/* שורת חיפוש לפי תעודת זהות */}
      <View style={styles.searchWrapper}>
        <TextInput
          placeholder="חפש לפי ת.ז"
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
        />
      </View>
        
        {/* טבלת משתמשים */}
      <View style={styles.tableContainer}>
        <View style={styles.tableHeader}>
          <Text style={styles.headerCell}>שם מלא</Text>
          <Text style={styles.headerCell}>ת.ז</Text>
        </View>

        <FlatList
          data={filteredUsers}
          keyExtractor={item => item._id}
          renderItem={renderItem}
          ListEmptyComponent={<Text style={styles.emptyText}>לא נמצאו משתמשים</Text>}
        />
      </View>
    </View>
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
  }
});
