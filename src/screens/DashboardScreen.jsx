import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Linking, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { MemberService } from '../services/memberStore';

const DashboardScreen = ({ navigation }) => {
  const [members, setMembers] = useState([]);

  const loadData = useCallback(async () => {
    const allMembers = await MemberService.getMembers();
    setMembers(allMembers);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleMarkAsPaid = async (member) => {
    const updatedMember = {
      ...member,
      subscriptionDate: new Date().toISOString(), // Reset the 30-day cycle to today
    };
    await MemberService.saveMember(updatedMember);
    Alert.alert('Success', `${member.name} marked as paid. Next due in 30 days.`);
    loadData();
  };

  const sendWhatsApp = (member) => {
    if (!member.phone) {
      Alert.alert('Error', 'No phone number provided for this member.');
      return;
    }
    const message = `Hello ${member.name}, this is a friendly reminder that your gym subscription is due for renewal.`;
    const url = `whatsapp://send?phone=${member.phone}&text=${encodeURIComponent(message)}`;
    
    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert('Error', 'WhatsApp is not installed on this device.');
      }
    });
  };

  const renderMemberItem = ({ item }) => {
    const status = MemberService.checkPaymentStatus(item.subscriptionDate);
    
    return (
      <View style={styles.memberCard}>
        <View style={styles.memberInfo}>
          {/* Red/Green Light Indicator */}
          <View style={[styles.statusLight, { backgroundColor: status.needsPayment ? COLORS.danger : COLORS.success }]} />
          <View>
            <Text style={styles.memberName}>{item.name}</Text>
            <Text style={styles.memberSub}>{status.daysPassed} days since last payment</Text>
          </View>
        </View>

        <View style={styles.actions}>
          {status.needsPayment && (
            <TouchableOpacity style={styles.actionButton} onPress={() => sendWhatsApp(item)}>
              <Ionicons name="logo-whatsapp" size={24} color={COLORS.success} />
            </TouchableOpacity>
          )}
          <TouchableOpacity 
            style={[styles.payButton, { opacity: status.needsPayment ? 1 : 0.5 }]} 
            onPress={() => handleMarkAsPaid(item)}
            disabled={!status.needsPayment}
          >
            <Text style={styles.payButtonText}>{status.needsPayment ? 'Mark Paid' : 'Active'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Gym Overview</Text>
        <Text style={styles.subtitle}>Membership Status Tracker</Text>
      </View>

      <FlatList
        data={members}
        keyExtractor={(item) => item.id}
        renderItem={renderMemberItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<Text style={styles.emptyText}>No members added yet.</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { padding: 20, paddingTop: 60, backgroundColor: COLORS.card, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  title: { fontSize: 24, fontWeight: 'bold', color: COLORS.text },
  subtitle: { fontSize: 14, color: COLORS.textSecondary },
  listContent: { padding: 15 },
  memberCard: { 
    backgroundColor: COLORS.card, 
    padding: 15, 
    borderRadius: 12, 
    marginBottom: 10, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  memberInfo: { flexDirection: 'row', alignItems: 'center' },
  statusLight: { width: 12, height: 12, borderRadius: 6, marginRight: 12 },
  memberName: { fontSize: 16, fontWeight: 'bold', color: COLORS.text },
  memberSub: { fontSize: 12, color: COLORS.textSecondary },
  actions: { flexDirection: 'row', alignItems: 'center' },
  actionButton: { marginRight: 15 },
  payButton: { backgroundColor: COLORS.primary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  payButtonText: { color: 'white', fontSize: 12, fontWeight: 'bold' },
  emptyText: { textAlign: 'center', marginTop: 50, color: COLORS.textSecondary }
});

export default DashboardScreen;