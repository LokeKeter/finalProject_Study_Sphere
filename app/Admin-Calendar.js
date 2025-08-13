import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
  StyleSheet,
  Platform,
  Alert,
} from 'react-native';
import TopSidebar from '@/components/TopSidebar';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '@/config';

const API_BASE = `${API_BASE_URL}/api/yearlyevents`;

const toYYYYMMDD = (d) => {
  if (!d) return '';
  if (typeof d === 'string') {
    if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
    const only = d.split('T')[0];
    if (/^\d{4}-\d{2}-\d{2}$/.test(only)) return only;
  }
  const dt = d instanceof Date ? d : new Date(d);
  return isNaN(dt) ? '' : dt.toISOString().split('T')[0];
};


export default function AdminCalendar() {

  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [isNewEvent, setIsNewEvent] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const res = await fetch(API_BASE, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch events');
        const data = await res.json();
        setEvents(
          Array.isArray(data)
            ? data.map(ev => ({ ...ev, id: ev._id || ev.id, date: toYYYYMMDD(ev.date) }))
            : []
        );
      } catch (e) {
        console.warn('Fetch events error', e);
        setEvents([]);
      }
    };
    fetchEvents();
  }, []);

  const filteredEvents = events.filter(
    (event) =>
      event.title?.toLowerCase().includes(search.toLowerCase()) ||
      event.date?.includes(search)
  );

  const formatDisplayDate = (isoDate) => {
    if (!isoDate) return '';
    const d = new Date(isoDate);
    if (isNaN(d.getTime())) return isoDate;
    return d.toLocaleDateString('he-IL', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const onDateChange = (event, pickedDate) => {
    if (pickedDate) {
      const formatted = pickedDate.toISOString().split('T')[0];
      setSelectedEvent((prev) => ({ ...(prev || {}), date: formatted }));
    }
    setShowDatePicker(false);
  };

  const handleAddEvent = async () => {
    if (!selectedEvent?.title || !selectedEvent?.date) return;
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(API_BASE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: selectedEvent.title,
          date: toYYYYMMDD(selectedEvent.date),
          details: selectedEvent.details || '',
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to create');
      }

      const saved = await res.json();
      setEvents(prev => [...prev, { ...saved, id: saved._id || saved.id }]);
      setModalVisible(false);
    } catch (e) {
      console.warn('Add event failed', e);
      Alert.alert('שגיאה', 'לא ניתן ליצור את האירוע. נסו שוב.');
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedEvent?.title || !selectedEvent?.date) return;
    try {
      const token = await AsyncStorage.getItem('token');
      const id = selectedEvent.id || selectedEvent._id;
      const res = await fetch(`${API_BASE}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: selectedEvent.title,
          date: toYYYYMMDD(selectedEvent.date),
          details: selectedEvent.details || '',
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to update');
      }

      const updated = await res.json();
      const updatedId = updated._id || updated.id;
      setEvents(prev =>
        prev.map(ev => (ev.id === updatedId ? { ...updated, id: updatedId } : ev))
      );
      setModalVisible(false);
    } catch (e) {
      console.warn('Edit event failed', e);
      Alert.alert('שגיאה', 'לא ניתן לעדכן את האירוע. נסו שוב.');
    }
  };

  const handleDelete = async () => {
    if (!selectedEvent) return;
    try {
      const token = await AsyncStorage.getItem('token');
      const id = selectedEvent.id || selectedEvent._id;
      const res = await fetch(`${API_BASE}/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        throw new Error('Failed to delete');
      }

      setEvents(prev => prev.filter(ev => ev.id !== (selectedEvent.id || selectedEvent._id)));
      setModalVisible(false);
    } catch (e) {
      console.warn('Delete failed', e);
      Alert.alert('שגיאה', 'לא ניתן למחוק את האירוע. נסו שוב.');
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.tableRow}
      onPress={() => {
        setSelectedEvent({ ...item, date: toYYYYMMDD(item.date) });
        setIsNewEvent(false);
        setModalVisible(true);
        setShowDatePicker(false);
      }}
    >
      <Text style={styles.cell}>{item.title}</Text>
      <Text style={styles.cell}>{formatDisplayDate(item.date)}</Text>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <>
      <TextInput
        style={styles.searchInput}
        placeholder="חפש לפי שם או תאריך"
        value={search}
        onChangeText={setSearch}
        textAlign="right"
        placeholderTextColor="#666"
      />
      <View style={styles.tableHeader}>
        <Text style={styles.headerCell}>שם אירוע</Text>
        <Text style={styles.headerCell}>תאריך</Text>
      </View>
    </>
  );

  return (
    <View style={styles.container}>
      <TopSidebar userRole="admin" />

      <FlatList
        data={filteredEvents}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <Text style={{ textAlign: 'center', marginTop: 20 }}>אין אירועים תואמים</Text>
        }
      />

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => {
          setSelectedEvent({ title: '', date: '', details: '' });
          setIsNewEvent(true);
          setModalVisible(true);
          setShowDatePicker(false);
        }}
      >
        <Text style={styles.addButtonText}>➕ הוסף אירוע</Text>
      </TouchableOpacity>

      {/* חלון עריכת/הוספת אירוע */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
              <Text style={styles.closeText}>X</Text>
            </TouchableOpacity>

            {/* שם אירוע */}
            <View style={styles.formSection}>
              <Text style={styles.label}>שם אירוע</Text>
              <TextInput
                style={styles.input}
                value={selectedEvent?.title || ''}
                onChangeText={(text) =>
                  setSelectedEvent((prev) => ({ ...(prev || {}), title: text }))
                }
                placeholder="שם אירוע"
                placeholderTextColor="#999"
                textAlign="right"
              />
              {!selectedEvent?.title && <Text style={styles.errorText}>שם אירוע נדרש</Text>}
            </View>

            {/* תאריך אירוע */}
            <View style={styles.formSection}>
              <Text style={styles.label}>תאריך אירוע</Text>
              <TouchableOpacity
                onPress={() => setShowDatePicker((s) => !s)}
                style={[styles.input, styles.dateBox]}
              >
                <Text style={{ textAlign: 'right', color: '#000' }}>
                  {selectedEvent?.date ? formatDisplayDate(selectedEvent.date) : 'בחר תאריך אירוע'}
                </Text>
              </TouchableOpacity>
              {!selectedEvent?.date && <Text style={styles.errorText}>תאריך נדרש</Text>}

              {showDatePicker && (
                <View style={styles.simplePicker}>
                  <DateTimePicker
                    value={selectedEvent?.date ? new Date(selectedEvent.date) : new Date()}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'inline' : 'calendar'}
                    onChange={onDateChange}
                    style={{ width: '100%' }}
                  />
                </View>
              )}
            </View>

            {/* פירוט */}
            <View style={styles.formSection}>
              <Text style={styles.label}>פירוט</Text>
              <TextInput
                style={[styles.input, styles.textarea]}
                value={selectedEvent?.details || ''}
                onChangeText={(text) =>
                  setSelectedEvent((prev) => ({ ...(prev || {}), details: text }))
                }
                placeholder="פירוט"
                placeholderTextColor="#999"
                multiline
                textAlign="right"
              />
            </View>

            {/* כפתורים */}
            <View style={styles.modalButtons}>
              {isNewEvent ? (
                <TouchableOpacity
                  onPress={handleAddEvent}
                  style={[
                    styles.saveButton,
                    (!selectedEvent?.title || !selectedEvent?.date) && { opacity: 0.5 },
                  ]}
                  disabled={!selectedEvent?.title || !selectedEvent?.date}
                >
                  <Text style={styles.saveText}>➕ הוסף</Text>
                </TouchableOpacity>
              ) : (
                <>
                  <TouchableOpacity
                    onPress={handleSaveEdit}
                    style={[
                      styles.saveButton,
                      (!selectedEvent?.title || !selectedEvent?.date) && { opacity: 0.5 },
                    ]}
                    disabled={!selectedEvent?.title || !selectedEvent?.date}
                  >
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
  searchInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
    textAlign: 'right',
  },
  tableHeader: { flexDirection: 'row', backgroundColor: '#ddd', padding: 10 },
  headerCell: { flex: 1, textAlign: 'center', fontWeight: 'bold' },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  cell: { flex: 1, textAlign: 'center' },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#fff',
    padding: 24,
    paddingBottom: 32,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
  },
  closeButton: { position: 'absolute', top: 10, right: 10 },
  closeText: { fontSize: 18, fontWeight: 'bold' },

  formSection: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'right',
    color: '#222',
  },
  input: {
    backgroundColor: '#F5F5F7',
    borderWidth: 1,
    borderColor: '#E0E0E5',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    textAlign: 'right',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  textarea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  errorText: {
    color: '#d9534f',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'right',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  saveButton: {
    backgroundColor: 'black',
    padding: 10,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
    marginRight: 5,
  },
  saveText: { color: '#fff', fontWeight: 'bold' },
  deleteButton: {
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
    marginLeft: 5,
  },
  deleteText: { color: '#fff', fontWeight: 'bold' },
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
  },
  dateBox: {
    backgroundColor: '#fff',
    borderColor: '#aaa',
    borderWidth: 1,
  },
  simplePicker: {
    marginTop: 6,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 10,
    overflow: 'hidden',
    
  },
});
