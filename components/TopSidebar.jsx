import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

const sidebarLinks = {
    teacher: [
      { label: '📊 כללי', route: '/dashboard' },
      { label: '📚 שיעורי בית', route: '/Homework' },
      { label: '🏫 כיתות', route: '/Classes' },
      { label: '👥 אנשי קשר', route: '/Contacts' },
      { label: 'AI תבנית 🤖', route: '/TeacherAITemplate' },
      { label: '📁 ארכיון', route: '/Archive' },
      { label: '🚪 התנתקות', route: '/' },
    ],
    parent: [
      { label: '📊 כללי', route: '/Parent-Dashboard' },
      { label: '📚 שיעורי בית', route: '/Parent-Homework' },
      { label: '👥 אנשי קשר', route: '/Parent-Contacts' },
      { label: ' AI תבנית 🤖', route: '/ParentAITemplate' },
      { label: '📁 ארכיון', route: '/Parent-Archive' },
      { label: '🚪 התנתקות', route: '/' },
    ]
  };

  
const TopSidebar = ({ userRole }) => {
  const router = useRouter();
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const profileRoute = userRole === 'parent' ? '/ParentUserProfile' : '/UserProfile';
  const linksToDisplay = sidebarLinks[userRole] || [];
  


  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  
  

  return (
    <>
      {/* 🔹 TOP BAR */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => setSidebarVisible(true)}
          style={styles.menuButton}>
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>
        <Text style={styles.dateTime}>{currentTime}</Text>
      </View>

      {/* 🔹 SIDEBAR MENU */}
      <Modal visible={sidebarVisible} animationType="slide" transparent={true}>
  <View style={styles.modalBackground}>
    <View style={styles.sidebar}>
      <View style={styles.sidebarHeader}>
        <TouchableOpacity
          onPress={() => {
            router.push(profileRoute);
            setSidebarVisible(false);
          }}>
          <Text style={styles.sidebarUser}>👤 {userRole}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setSidebarVisible(false)}>
          <Text style={styles.closeButton}>✖</Text>
        </TouchableOpacity>
      </View>

      {linksToDisplay.map((link, index) => (
        <TouchableOpacity
          key={link.route}
          style={styles.sidebarItem}
          onPress={() => {
            router.push(link.route);
            setSidebarVisible(false);
          }}>
          <Text style={styles.sidebarText}>{link.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  </View>
</Modal>

    </>
  );
};

const styles = StyleSheet.create({
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
    
      sidebarHeader: {
        flexDirection: "row", 
        justifyContent: "space-between", // מרווח בין שם המשתמש לכפתור הסגירה
        alignItems: "center",
        width: "100%",
        paddingBottom: 10,
        borderBottomWidth: 1, 
        borderBottomColor: "#fff", 
        paddingHorizontal: 5, // מרווח פנימי מהצדדים
      },
      menuButton: { padding: 4 },
      menuIcon: { color: "white", fontSize: 26 },
      dateTime: { color: "white", fontSize: 16, fontWeight: "bold" },
    
      sidebar: { 
  position: "absolute", 
  left: 0, 
  width: 250, 
  height: "100%", 
  backgroundColor: "black",  // ✅ ודא שזה קיים
  padding: 50 
},

modalBackground: {
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: "rgba(0,0,0,0.8)",  // ✅ צבע כהה לרקע
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
});

export default TopSidebar;
