import React from "react";
import { View, Text, TouchableOpacity, Modal, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

export default function TopSidebar({ currentTime, sidebarVisible, setSidebarVisible }) {
  const router = useRouter();

  return (
    <>
      {/* 🔹 TOP BAR */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => setSidebarVisible(true)} style={styles.menuButton}>
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>
        <Text style={styles.dateTime}>{currentTime}</Text>
      </View>

      {/* 🔹 SIDEBAR MENU */}
      <Modal visible={sidebarVisible} animationType="slide" transparent>
        <View style={styles.modalBackground}>
          <View style={styles.sidebar}>
            <View style={styles.sidebarHeader}>
              <TouchableOpacity onPress={() => { router.push("/UserProfile"); setSidebarVisible(false); }}>
                <Text style={styles.sidebarUser}>👤 מורה</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setSidebarVisible(false)}>
                <Text style={styles.closeButton}>✖</Text>
              </TouchableOpacity>
            </View>

            {/* רשימת קישורים */}
            {[
              { text: "📊 כללי", route: "/dashboard" },
              { text: "📚 שיעורי בית", route: "/Homework" },
              { text: "🏫 כיתות", route: "/Classes" },
              { text: "👥 אנשי קשר", route: "/Contacts" },
              { text: "📁 ארכיון", route: "/Archive" },
              { text: "📝 ציונים", route: "/TestScore" },
              { text: "🚪 התנתקות", route: "/" },
            ].map((item, i) => (
              <TouchableOpacity key={i} style={styles.sidebarItem} onPress={() => { router.push(item.route); setSidebarVisible(false); }}>
                <Text style={styles.sidebarText}>{item.text}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </>
  );
}

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
  menuButton: { padding: 4 },
  menuIcon: { color: "white", fontSize: 26 },
  dateTime: { color: "white", fontSize: 16, fontWeight: "bold" },
  modalBackground: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)" },
  sidebar: { position: "absolute", left: 0, width: 250, height: "100%", backgroundColor: "black", padding: 50 },
  sidebarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#fff",
    paddingHorizontal: 5,
  },
  sidebarUser: { color: "white", fontSize: 18, fontWeight: "bold", marginTop: 15 },
  closeButton: { color: "white", fontSize: 22, fontWeight: "bold" },
  sidebarItem: { paddingVertical: 15 },
  sidebarText: { color: "white", fontSize: 18 },
});
