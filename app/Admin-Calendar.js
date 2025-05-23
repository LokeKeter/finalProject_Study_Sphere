import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
  StyleSheet,
} from 'react-native';
import TopSidebar from '@/components/TopSidebar';

export default function AdminCalendar() {
  const [events, setEvents] = useState([
    { id: '1', name: 'מסיבת סיום', date: '2025-06-15', description: 'אירוע סוף שנה חגיגי' },
    { id: '2', name: 'יום הורים', date: '2025-05-30', description: 'פגישות אישיות עם מורים' },
  ]);
  const [search, setSearch] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [isNewEvent, setIsNewEvent] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const filteredEvents = events.filter(
    (event) => event.name.includes(search) || event.date.includes(search)
  );

  const handleSaveEdit = () => {
    setEvents(prev =>
      prev.map(ev => ev.id === selectedEvent.id ? selectedEvent : ev)
    );
    setModalVisible(false);
  };

  const handleDelete = () => {
    setEvents(prev => prev.filter(ev => ev.id !== selectedEvent.id));
    setModalVisible(false);
  };

  const handleAddEvent = () => {
    const newEvent = {
      ...selectedEvent,
      id: Date.now().toString(),
    };
    setEvents(prev => [...prev, newEvent]);
    setModalVisible(false);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.tableRow} onPress={() => {
      setSelectedEvent(item);
      setIsNewEvent(false);
      setModalVisible(true);
    }}>
      <Text style={styles.cell}>{item.name}</Text>
      <Text style={styles.cell}>{item.date}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TopSidebar userRole="parent" />

      {/* כפתור הוספת אירוע */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => {
          setSelectedEvent({ name: '', date: '', description: '' });
          setIsNewEvent(true);
          setModalVisible(true);
        }}>
        <Text style={styles.addButtonText}>➕ הוסף אירוע</Text>
      </TouchableOpacity>

      {/* שורת חיפוש */}
      <TextInput
        style={styles.searchInput}
        placeholder="חפש לפי שם או תאריך"
        value={search}
        onChangeText={setSearch}
        textAlign="right"
      />

      {/* טבלת אירועים */}
      <View style={styles.tableHeader}>
        <Text style={styles.headerCell}>שם אירוע</Text>
        <Text style={styles.headerCell}>תאריך</Text>
      </View>

      <FlatList
        data={filteredEvents}
        keyExtractor={item => item.id}
        renderItem={renderItem}
      />

      {/* חלון עריכת/הוספת אירוע */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
              <Text style={styles.closeText}>X</Text>
            </TouchableOpacity>

            <TextInput
              style={styles.input}
              value={selectedEvent?.name || ''}
              onChangeText={(text) => setSelectedEvent({ ...selectedEvent, name: text })}
              placeholder="שם אירוע"
            />

            <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.input}>
                <Text style={{ textAlign: 'right', color: selectedEvent?.date ? '#000' : '#888' }}>
                    {selectedEvent?.date || 'בחר תאריך אירוע'}
                </Text>
            </TouchableOpacity>


            {showDatePicker && (
                <DateTimePicker
                    value={selectedEvent?.date ? new Date(selectedEvent.date) : new Date()}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={(event, selectedDate) => {
                    setShowDatePicker(false);
                    if (selectedDate) {
                        const formatted = selectedDate.toISOString().split('T')[0];
                        setSelectedEvent({ ...selectedEvent, date: formatted });
                    }
                    }}
                />
            )}

            <TextInput
              style={styles.input}
              value={selectedEvent?.description || ''}
              onChangeText={(text) => setSelectedEvent({ ...selectedEvent, description: text })}
              placeholder="פירוט"
              multiline
            />

            <View style={styles.modalButtons}>
              {isNewEvent ? (
                <TouchableOpacity onPress={handleAddEvent} style={styles.saveButton}>
                  <Text style={styles.saveText}>➕ הוסף</Text>
                </TouchableOpacity>
              ) : (
                <>
                  <TouchableOpacity onPress={handleSaveEdit} style={styles.saveButton}>
                    <Text style={styles.saveText}>💾 בצע עריכה</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
                    <Text style={styles.deleteText}>🗑️ מחק אירוע</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 85, padding: 16, backgroundColor: '#fff' },
  addButton: { backgroundColor: '#4CAF50', padding: 12, borderRadius: 8, alignItems: 'center', marginBottom: 10 },
  addButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  searchInput: {
    borderWidth: 1, borderColor: '#ccc', borderRadius: 8,
    padding: 10, marginBottom: 16, textAlign: 'right'
  },
  tableHeader: { flexDirection: 'row', backgroundColor: '#ddd', padding: 10 },
  headerCell: { flex: 1, textAlign: 'center', fontWeight: 'bold' },
  tableRow: { flexDirection: 'row', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
  cell: { flex: 1, textAlign: 'center' },
  modalOverlay: {
    flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)'
  },
  modalContent: {
    width: '85%', backgroundColor: '#fff', padding: 20, borderRadius: 10
  },
  closeButton: { position: 'absolute', top: 10, right: 10 },
  closeText: { fontSize: 18, fontWeight: 'bold' },
  input: {
    borderWidth: 1, borderColor: '#ccc', borderRadius: 8,
    padding: 10, marginBottom: 10, textAlign: 'right'
  },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  saveButton: { backgroundColor: '#2196F3', padding: 10, borderRadius: 8, flex: 1, alignItems: 'center', marginRight: 5 },
  saveText: { color: '#fff', fontWeight: 'bold' },
  deleteButton: { backgroundColor: 'red', padding: 10, borderRadius: 8, flex: 1, alignItems: 'center', marginLeft: 5 },
  deleteText: { color: '#fff', fontWeight: 'bold' },
});
