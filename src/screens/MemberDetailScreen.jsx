import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../constants/colors';
import { MemberService } from '../services/memberStore';

export default function MemberDetailScreen({ route, navigation }) {
  const { member } = route.params;

  // Calculate payment status (using MemberService for consistency)
  const { daysPassed, needsPayment } = MemberService.checkPaymentStatus(member.subscriptionDate);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{member.name}</Text>
      <Text style={styles.detailText}>ID: {member.id}</Text>
      <Text style={styles.detailText}>Joined: {new Date(member.subscriptionDate).toLocaleDateString()}</Text>
      <Text style={[styles.statusText, { color: needsPayment ? COLORS.danger : COLORS.success }]}>
        Status: {needsPayment ? `Payment Due (${daysPassed} days passed)` : `Active (${daysPassed} days passed)`}
      </Text>

      {/* Edit button */}
      <TouchableOpacity
        style={styles.editButton}
        onPress={() => navigation.navigate('MemberForm', { member })}
      >
        <Text style={styles.editButtonText}>Edit Member</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: COLORS.background,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 15,
  },
  detailText: {
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  editButton: {
    backgroundColor: COLORS.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  editButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});