import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert
} from 'react-native';
import TopSidebar from "../components/TopSidebar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "../config";


// 🔹 קומפוננטת תבניות AI למורה
const TeacherAITemplate = () => {

  // 🔹 סטייט לצ'אט AI
const [aiMessages, setAiMessages] = useState([
  { role: 'system', content: 'את/ה עוזר/ת הוראה. ענה/י בעברית קצרה ומכבדת.' }
]);
const [aiInput, setAiInput] = useState('');
const [aiSending, setAiSending] = useState(false);

  // 🔸 סטייט לטופס הקלט מהמורה
  const [form, setForm] = useState({
    className: '',
    studentCount: '',
    grade: '',
    subject: '',
  });

  // 🔸 תבניות ההודעות שנוצרו
  const [templates, setTemplates] = useState([]);

  // 🔸 עדכון ערך בשדה טופס
  const handleChange = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  // 🔸 ייצור של תבניות הודעה על סמך הנתונים שהוזנו
  const generateTemplates = async () => {
    try {
      const token = await AsyncStorage.getItem('token');

      const response = await fetch(`${API_BASE_URL}/api/ai/template`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });

      const data = await response.json();

      if (response.ok) {
        setTemplates(data.templates);
        Alert.alert("נשלח למייל", "התבניות נוצרו ונשלחו בהצלחה.");
      } else {
        Alert.alert("שגיאה", data.error || "אירעה שגיאה.");
      }
    } catch (error) {
      console.error("❌ שגיאה ביצירת תבניות:", error.message);
      Alert.alert("שגיאה", "לא ניתן להתחבר לשרת.");
    }
  };

  const sendAiMessage = async () => {
    const text = aiInput.trim();
    if (!text || aiSending) return;
  
    // מוסיפים את הודעת המשתמש ל־UI
    const userMsg = { role: 'user', content: text };
    setAiMessages(prev => [...prev, userMsg]);
    setAiInput('');
    setAiSending(true);
  
    try {
      const token = await AsyncStorage.getItem('token');
  
      // אפשר להעביר הקשר מהטופס כדי שה-AI ינסח ממוקד יותר
      const context = {
        className: form.className,
        studentCount: form.studentCount,
        grade: form.grade,
        subject: form.subject,
      };
  
      const res = await fetch(`${API_BASE_URL}/api/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          // שולחים קצת הקשר והודעת המשתמש
          context,
          lastParentMessage: text, // או סתם השאלה שהמורה כתב
          // אם יש לך היסטוריה, אפשר לשלוח גם אותה (לא חובה)
        }),
      });
  
      const data = await res.json();
      if (res.ok) {
        const assistantMsg = { role: 'assistant', content: data.draft || data.reply || '...' };
        setAiMessages(prev => [...prev, assistantMsg]);
      } else {
        setAiMessages(prev => [...prev, { role: 'assistant', content: '🤖 אירעה תקלה בשירות ה-AI.' }]);
      }
    } catch (e) {
      setAiMessages(prev => [...prev, { role: 'assistant', content: '🤖 שגיאת רשת.' }]);
    } finally {
      setAiSending(false);
    }
  };
  

  // 🔸 העתקת הודעה לזיכרון
  const copyToClipboard = (text) => {
    Clipboard.setString(text);
    Alert.alert("הועתק!", "הטקסט הועתק לזיכרון.");
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* 🔹 תפריט עליון */}
      <TopSidebar userRole="teacher" />

      <Text style={styles.title}>🧑‍🏫 צור תבנית AI מותאמת להוראה</Text>

      {/* 🔸 טופס להזנת פרטים על הכיתה */}
      <TextInput
        style={styles.input}
        placeholder="שם כיתה (לדוגמה: ה'1)"
        placeholderTextColor="#000"
        value={form.className}
        onChangeText={text => handleChange('className', text)}
      />
      <TextInput
        style={styles.input}
        placeholder="מספר תלמידים"
        placeholderTextColor="#000"
        keyboardType="numeric"
        value={form.studentCount}
        onChangeText={text => handleChange('studentCount', text)}
      />
      <TextInput
        style={styles.input}
        placeholder="שכבת גיל / כיתה"
        placeholderTextColor="#000"
        value={form.grade}
        onChangeText={text => handleChange('grade', text)}
      />
      <TextInput
        style={styles.input}
        placeholder="מקצוע (לדוגמה: היסטוריה)"
        placeholderTextColor="#000"
        value={form.subject}
        onChangeText={text => handleChange('subject', text)}
      />

      {/* 🔸 כפתור יצירת תבניות */}
   <TouchableOpacity onPress={generateTemplates} style={styles.blackButton}>
  <Text style={styles.buttonText}>📄 צור תבניות הודעה</Text>
</TouchableOpacity>


      {/* 🔸 הצגת התבניות שנוצרו */}
      {templates.length > 0 && (
        <View style={styles.templatesSection}>
          <Text style={styles.sectionTitle}>📋 בחר תבנית הודעה:</Text>
          {templates.map((tpl, index) => (
            <View key={index} style={styles.templateBox}>
              <Text style={styles.templateText}>{tpl}</Text>
              <TouchableOpacity onPress={() => copyToClipboard(tpl)} style={styles.copyButton}>
                <Text style={styles.copyText}>📋 העתק</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}





    {/* 🔹 צ'אט AI נפרד */}
<View style={styles.aiChatSection}>
  <Text style={styles.sectionTitle}>🤖 צ'אט עם ה-AI (למורה בלבד)</Text>

  {aiMessages.filter(m => m.role !== 'system').map((m, i) => (
    <View
      key={`${i}-${m.content.slice(0, 10)}`}
      style={[styles.aiBubble, m.role === 'user' ? styles.aiBubbleUser : styles.aiBubbleBot]}
    >
      <Text style={styles.aiBubbleText}>{m.content}</Text>
    </View>
  ))}

  <View style={styles.aiInputRow}>
    <TextInput
      style={styles.aiInput}
      placeholder="כתבו שאלה או בקשת ניסוח..."
      placeholderTextColor="#555"
      value={aiInput}
      onChangeText={setAiInput}
      editable={!aiSending}
    />
    <TouchableOpacity
      style={[styles.aiSendBtn, aiSending && { opacity: 0.6 }]}
      onPress={sendAiMessage}
      disabled={aiSending}
    >
      <Text style={styles.aiSendText}>{aiSending ? '...' : 'שלח'}</Text>
    </TouchableOpacity>
  </View>
</View>
      
    </ScrollView>
  );
};

// 🎨 עיצוב המרכיבים
const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    color: 'black',
    marginTop: 85,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 6,
    marginBottom: 10,
    color: '#000',
  },
  templatesSection: {
    marginTop: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  templateBox: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
  },
  templateText: {
    fontSize: 16,
    lineHeight: 22,
  },
  copyButton: {
    marginTop: 10,
    alignSelf: 'flex-start',
    backgroundColor: 'black',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  copyText: {
    color: '#fff',
    fontWeight: 'bold',
  },
   blackButton: {
    backgroundColor: 'black',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },

  aiChatSection: {
    marginTop: 28,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 16,
  },
  aiBubble: {
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    maxWidth: '85%',
  },
  aiBubbleUser: {
    alignSelf: 'flex-end',
    backgroundColor: '#dbeafe',
  },
  aiBubbleBot: {
    alignSelf: 'flex-start',
    backgroundColor: '#f3f4f6',
  },
  aiBubbleText: {
    color: '#111',
    fontSize: 15,
    lineHeight: 21,
  },
  aiInputRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  aiInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#000',
  },
  aiSendBtn: {
    backgroundColor: 'black',
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: 'center',
  },
  aiSendText: {
    color: '#fff',
    fontWeight: '600',
  },
  
});

export default TeacherAITemplate;
