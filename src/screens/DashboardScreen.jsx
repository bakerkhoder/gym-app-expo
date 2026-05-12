import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';

const DashboardScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dashboard</Text>
      <Text style={styles.subtitle}>Welcome to the Gym App</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS?.background || '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS?.primary || '#333',
  },
  subtitle: {
    fontSize: 16,
    color: COLORS?.textSecondary || '#666',
    marginTop: 8,
  },
});

export default DashboardScreen;