import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';

export default function LoginScreen({ navigation }) {
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (password === 'admin') { // Simple local check for testing
      navigation.replace('Main');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gym Admin</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter Admin Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 30, backgroundColor: COLORS.background },
  title: { fontSize: 28, fontWeight: 'bold', color: COLORS.primary, marginBottom: 30, textAlign: 'center' },
  input: { 
    backgroundColor: COLORS.card, 
    padding: 15, 
    borderRadius: 10, 
    borderWidth: 1, 
    borderColor: COLORS.border,
    marginBottom: 20 
  },
  button: { backgroundColor: COLORS.primary, padding: 15, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});