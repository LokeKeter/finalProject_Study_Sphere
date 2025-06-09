// ✅ ניהול קודים זמניים להרשמה עם תוקף של 5 דקות
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  Modal,
  StyleSheet
} from 'react-native';
import TopSidebar from '@/components/TopSidebar';

export default function AdminSerialsPage() {
  // 🔸 רשימת הסריאלים הקיימים
  const [serials, setSerials] = useState([
    { id: '1', code: 'ABC123', role: 'teacher', createdAt: Date.now() },
    { id: '2', code: 'XYZ987', role: 'parent', createdAt: Date.now() },
  ]);

  const [newSerial, setNewSerial] = useState({ code: '', role: '' });
  const [modalVisible, setModalVisible] = useState(false);

  // 🔸 מחיקת סריאלים שפג תוקפם אוטומטית כל 10 שניות
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const validSerials = serials.filter(serial => now - serial.createdAt < 5 * 60 * 1000); // 5 דקות
      setSerials(validSerials);
    }, 10000);

    return () => clearInterval(interval);
  }, [serials]);

  // 🔸 פונקציה להוספת סריאל חדש
  const handleAddSerial = () => {
    if (!newSerial.code || !newSerial.role) {
      Alert.alert('שגיאה', 'יש למלא סריאל ותפקיד');
      return;
    }

    const exists = serials.some(s => s.code === newSerial.code.trim());
    if (exists) {
      Alert.alert('שגיאה', 'הקוד כבר קיים במערכת');
      return;
    }

    const newEntry = {
      id: Date.now().toString(),
      code: newSerial.code.trim(),
      role: newSerial.role,
      createdAt: Date.now(),
    };

    setSerials([...serials, newEntry]);
    setNewSerial({ code: '', role: '' });
    setModalVisible(false);
  };

  // 🔸 מחשב את הזמן שנותר עד לפקיעת התוקף
  const getRemainingSeconds = (createdAt) => {
    const diff = 5 * 60 * 1000 - (Date.now() - createdAt);
    return Math.max(0, Math.ceil(diff / 1000));
  };

  // 🔸 מחיקת קוד בהקלקה
  const confirmDelete = (id) => {
    Alert.alert('מחיקת קוד', 'האם למחוק את הקוד?', [
      { text: 'ביטול', style: 'cancel' },
      { text: 'מחק', onPress: () => setSerials(serials.filter(s => s.id !== id)), style: 'destructive' },
    ]);
  };

  return (
    <View style={styles.container}>
      <TopSidebar userRole="admin" />
      <Text style={styles.title}>🔐 ניהול סריאלים להרשמה</Text>

      <FlatList
        data={serials}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.serialRow}>
            <View style={{ flexDirection: 'column' }}>
              <Text style={styles.serialText}>
                {item.code} ({item.role === 'teacher' ? 'מורה' : 'הורה'})
              </Text>
              <Text style={{ fontSize: 12, color: 'gray' }}>
                {getRemainingSeconds(item.createdAt) > 0
                  ? `⏳ תוקף: ${getRemainingSeconds(item.createdAt)} שניות`
                  : '❌ פג תוקף'}
              </Text>
            </View>
            <TouchableOpacity onPress={() => confirmDelete(item.id)}>
              <Text style={{ color: 'red', fontWeight: 'bold' }}>🗑️</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>אין קודים רשומים</Text>}
      />

      <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
        <Text style={styles.addButtonText}>➕ הוסף סריאל</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={{ fontSize: 18, fontWeight: 'bold' }}>הוסף קוד חדש</Text>

            <TextInput
              placeholder="מספר סריאלי"
              style={styles.input}
              value={newSerial.code}
              onChangeText={(text) => setNewSerial({ ...newSerial, code: text })}
            />

            <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 10 }}>
              <TouchableOpacity onPress={() => setNewSerial({ ...newSerial, role: 'teacher' })}>
                <Text>📚 מורה</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setNewSerial({ ...newSerial, role: 'parent' })}>
                <Text>👪 הורה</Text>
              </TouchableOpacity>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text>❌ ביטול</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleAddSerial}>
                <Text style={{ fontWeight: 'bold' }}>💾 שמור</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 85, paddingHorizontal: 20, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
  serialRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 10, borderBottomWidth: 1 },
  serialText: { fontSize: 16 },
  empty: { textAlign: 'center', color: '#777', marginTop: 20 },
  addButton: { backgroundColor: 'black', padding: 12, borderRadius: 8, marginTop: 20 },
  addButtonText: { color: 'white', textAlign: 'center', fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: 'white', padding: 20, borderRadius: 10, width: '90%' },
  input: {
    borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginTop: 10, textAlign: 'right'
  }
});
