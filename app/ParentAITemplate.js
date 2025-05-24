import React, { useState } from 'react';
import { View, Text, TextInput, Button, ScrollView, StyleSheet, TouchableOpacity, Clipboard, Alert } from 'react-native';
import TopSidebar from "../components/TopSidebar";
const ParentAITemplate = () => {
  const [form, setForm] = useState({
    childName: '',
    age: '',
    grade: '',
    subject: '',
  });

  const [templates, setTemplates] = useState([]);

  const handleChange = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const generateTemplates = () => {
    const { childName, age, grade, subject } = form;
    const capitalizedName = childName.charAt(0).toUpperCase() + childName.slice(1);

   const generatedTemplates = [
  `שלום, אני הורה לילד/ה בשם ${capitalizedName}, בגיל ${age}, הלומד/ת בכיתה ${grade}. ברצוני לסייע לו/לה להבין טוב יותר את מקצוע ה-${subject} בו הוא/היא חווה קושי. אשמח לקבל הסבר מפורט על נושאים מרכזיים במקצוע זה ברמת הכיתה, כולל דוגמאות פשוטות, המחשות, ותרגול מותאם. כמו כן, אודה להמלצה על אסטרטגיות למידה מתאימות לפי הגיל ורמת ההבנה.`,

  `שלום! אני מחפש/ת עזרה לימודית עבור ${capitalizedName}, בן/בת ${age}, תלמיד/ה בכיתה ${grade}. נושא הלימוד שבו אנו נתקלים בקושי הוא ${subject}. אני זקוק/ה לתוכן לימודי מותאם אישית שיכלול:
1. הסבר תיאורטי ברור ופשוט
2. דוגמאות מוחשיות או מצבים מחיי היומיום
3. תרגילים עם פתרונות לדוגמה
4. הצעות לשיפור הבנת החומר
תודה רבה מראש!`,

  `שלום מערכת בינה מלאכותית, אנא עזרי לי ליצור תוכנית תמיכה לימודית ב-${subject} עבור ילדי ${capitalizedName}, בן/בת ${age}, בכיתה ${grade}. 
המטרה: לשפר את ההבנה, הביטחון והיכולות שלו/ה במקצוע זה.
מבוקש:
- הסבר עקרונות יסוד לפי רמת הכיתה
- הדגמות/אנלוגיות חזותיות או שמיעתיות
- שאלות חזרה ותשובות
- המלצות למשאבים דיגיטליים חינמיים (כגון סרטונים או משחקים)
- תכנית תרגול יומית של 10-15 דקות

אשמח לכל עזרה, תודה מראש 🙏`
];


    setTemplates(generatedTemplates);
  };

  const copyToClipboard = (text) => {
    Clipboard.setString(text);
    Alert.alert("הועתק!", "הטקסט הועתק לזיכרון.");
  };

  return (
    
    <ScrollView contentContainerStyle={styles.container}>
                {/* top and side bar */}
          <TopSidebar userRole="parent" />

      <Text style={styles.title}>🤖 צור הודעה מוכנה לשימוש ב-AI</Text>

      <TextInput
        style={styles.input}
        placeholder="שם הילד/ה"
          placeholderTextColor="#000"
        value={form.childName}
        onChangeText={text => handleChange('childName', text)}
      />
      <TextInput
        style={styles.input}
        placeholder="גיל"
          placeholderTextColor="#000"
        keyboardType="numeric"
        value={form.age}
        onChangeText={text => handleChange('age', text)}
      />
      <TextInput
        style={styles.input}
        placeholder="כיתה"
          placeholderTextColor="#000"
        value={form.grade}
        onChangeText={text => handleChange('grade', text)}
      />
      <TextInput
        style={styles.input}
        placeholder="מקצוע (לדוגמה: מתמטיקה)"
          placeholderTextColor="#000"
        value={form.subject}
        onChangeText={text => handleChange('subject', text)}
      />

      <TouchableOpacity onPress={generateTemplates} style={styles.blackButton}>
  <Text style={styles.buttonText}>📄 צור תבניות הודעה</Text>
</TouchableOpacity>


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
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    
    padding: 20,
    backgroundColor: '#fff',
    
  },
  title: {
    color:'black',
    marginTop:85,
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
  }
  
});

export default ParentAITemplate;
