import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { COLORS } from '../constants/colors';
import { MemberService } from '../services/memberStore';
import { notificationService } from '../services/nnotificationService';
export default function MemberFormScreen({ navigation, route }) {
  /** @type {any} */
  const editingMember = route.params?.member; // Check if a member object is passed for editing

  const [name, setName] = useState(editingMember?.name || '');
  const [phone, setPhone] = useState(editingMember?.phone || '');
  const [subscriptionDate, setSubscriptionDate] = useState(
    editingMember?.subscriptionDate ? new Date(editingMember.subscriptionDate) : new Date()
  );
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    navigation.setOptions({
      title: editingMember ? 'Edit Member' : 'Add New Member',
    });
  }, [editingMember, navigation]);

  const onChangeDate = (event, selectedDate) => {
    const currentDate = selectedDate || subscriptionDate;
    setShowDatePicker(Platform.OS === 'ios'); // Keep date picker open on iOS until confirmed
    setSubscriptionDate(currentDate);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Member name cannot be empty.');
      return;
    }

    /** @type {Member} */
    const memberToSave = {
      id: editingMember?.id || Date.now().toString(), // Use existing ID or generate new
      name: name.trim(),
      phone: phone.trim(),
      subscriptionDate: subscriptionDate.toISOString(), // Store as ISO string
    };

    const success = await MemberService.saveMember(memberToSave);
    if (success) {
            await notificationService.schedulePaymentDueNotification(memberToSave);
      Alert.alert('Success', `Member ${editingMember ? 'updated' : 'added'} successfully!`);
      navigation.goBack(); // Go back to MembersScreen
    } else {
      Alert.alert('Error', `Failed to ${editingMember ? 'update' : 'add'} member.`);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Member Name:</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter member name"
        value={name}
        onChangeText={setName}
      />

      <Text style={styles.label}>Phone Number (for WhatsApp):</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. +96170123456"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
      />

      <Text style={styles.label}>Subscription Date:</Text>
      <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.datePickerButton}>
        <Text style={styles.datePickerButtonText}>
          {subscriptionDate.toLocaleDateString()}
        </Text>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          testID="dateTimePicker"
          value={subscriptionDate}
          mode="date"
          display="default"
          onChange={onChangeDate}
        />
      )}

      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>{editingMember ? 'Update Member' : 'Add Member'}</Text>
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
  label: {
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 5,
    marginTop: 10,
  },
  input: {
    backgroundColor: COLORS.card,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 15,
    fontSize: 16,
    color: COLORS.text,
  },
  datePickerButton: {
    backgroundColor: COLORS.card,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 15,
    alignItems: 'flex-start', // Align text to left
  },
  datePickerButtonText: {
    fontSize: 16,
    color: COLORS.text,
  },
  button: {
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
});