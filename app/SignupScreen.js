import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";  

const SignupScreen = () => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>

      <TouchableOpacity onPress={() => router.push("/")} style={styles.button}>
        <Text style={styles.buttonText}>חזרה להתחברות</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  button: { padding: 15, backgroundColor: "black", borderRadius: 10 },
  buttonText: { color: "white", fontSize: 16 },
});

export default SignupScreen;
