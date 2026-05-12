import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS } from '../constants/colors';
import { MemberService } from '../services/memberStore';

export default function MembersScreen({ navigation }) {
  const [members, setMembers] = useState([]);

  useFocusEffect(
    useCallback(() => {
      MemberService.getMembers().then(setMembers);
    }, [])
  );

  const renderItem = ({ item }) => {
    const status = MemberService.checkPaymentStatus(item.subscriptionDate);
    return (
      <TouchableOpacity 
        style={styles.card} 
        onPress={() => navigation.navigate('MemberDetail', { member: item })}
      >
        <View>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.date}>Joined: {new Date(item.subscriptionDate).toLocaleDateString()}</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: status.needsPayment ? COLORS.danger : COLORS.success }]}>
          <Text style={styles.badgeText}>{status.needsPayment ? 'Needs Payment' : 'Active'}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList data={members} renderItem={renderItem} keyExtractor={item => item.id} />
      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('AddMember')}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: 15 },
  card: { backgroundColor: COLORS.card, padding: 15, borderRadius: 12, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWeight: 1, borderColor: COLORS.border },
  name: { fontSize: 18, fontWeight: 'bold', color: COLORS.text },
  date: { fontSize: 12, color: COLORS.textSecondary },
  badge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  badgeText: { color: 'white', fontSize: 10, fontWeight: 'bold' },
  fab: { position: 'absolute', bottom: 20, right: 20, width: 60, height: 60, borderRadius: 30, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', elevation: 5 },
  fabText: { color: 'white', fontSize: 30 }
});