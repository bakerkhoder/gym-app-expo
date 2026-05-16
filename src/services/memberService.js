// MemberService - handles all member business logic
import AsyncStorage from '@react-native-async-storage/async-storage'; // Directly use AsyncStorage here
import { isPaymentDue, daysRemaining, getDueDate, todayISO } from '../utils/dateUtils';

const STORAGE_KEY = '@gym_members_data'; // Keep this key to potentially recover old data
const NOTIFICATION_KEY = '@gym_notifications_data'; // For future notification tracking

export const memberService = {
  // --- Core Data Operations (formerly storageService) ---
  async getRawMembers() { // Renamed to avoid confusion with getAllMembers (calculated)
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error("memberService.getRawMembers error:", e);
      return [];
    }
  },

  async saveRawMembers(members) { // Renamed to avoid confusion
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(members));
      return true;
    } catch (e) {
      console.error("memberService.saveRawMembers error:", e);
      return false;
    }
  },

  // --- Member Management Logic ---

  /**
   * Saves a new member or updates an existing one.
   * Handles ID generation for new members.
   * Returns the saved member with calculated properties.
   */
  async saveMember(memberData) {
    let members = await this.getRawMembers();
    let memberToSave;

    if (memberData.id && members.some(m => m.id === memberData.id)) {
      // Update existing member
      memberToSave = { ...memberData }; // Assume memberData has all necessary fields
      members = members.map(m => (m.id === memberData.id ? memberToSave : m));
    } else {
      // Create new member
      memberToSave = {
        id: `member_${Date.now()}`, // Generate ID for new member
        name: memberData.name,
        phone: memberData.phone,
        subscriptionStartDate: memberData.subscriptionStartDate || todayISO(),
        lastPaidDate: memberData.lastPaidDate || memberData.subscriptionStartDate || todayISO(), // Ensure lastPaidDate is set
        notes: memberData.notes || ''
      };
      members.push(memberToSave);
    }

    const success = await this.saveRawMembers(members);
    if (!success) return null; // Indicate failure

    // Return the saved member with calculated properties for immediate use
    return {
      ...memberToSave,
      isPaymentDue: isPaymentDue(memberToSave.lastPaidDate),
      daysRemaining: daysRemaining(memberToSave.lastPaidDate),
      dueDate: getDueDate(memberToSave.lastPaidDate).toISOString(), // Convert to string for navigation
      status: isPaymentDue(memberToSave.lastPaidDate) ? 'overdue' : 'active'
    };
  },

  /**
   * Get all members with calculated status (isPaymentDue, daysRemaining, dueDate, status)
   */
  async getAllMembers() {
    const members = await this.getRawMembers();
    return members.map(member => ({
      ...member,
      isPaymentDue: isPaymentDue(member.lastPaidDate),
      daysRemaining: daysRemaining(member.lastPaidDate),
      dueDate: getDueDate(member.lastPaidDate).toISOString(), // Convert to string for navigation
      status: member.isPaymentDue ? 'overdue' : 'active'
    }));
  },

  /**
   * Mark member as paid (resets payment cycle)
   * Returns the updated member with calculated properties.
   */
  async markAsPaid(id) {
    let members = await this.getRawMembers();
    const memberIndex = members.findIndex(m => m.id === id);

    if (memberIndex !== -1) {
      const updatedMemberRaw = {
        ...members[memberIndex],
        lastPaidDate: todayISO(),
      };
      members[memberIndex] = updatedMemberRaw;
      const success = await this.saveRawMembers(members);
      if (!success) return null;

      // Return the updated member with calculated properties
      return {
        ...updatedMemberRaw,
        isPaymentDue: isPaymentDue(updatedMemberRaw.lastPaidDate),
        daysRemaining: daysRemaining(updatedMemberRaw.lastPaidDate),
        dueDate: getDueDate(updatedMemberRaw.lastPaidDate).toISOString(), // Convert to string for navigation
        status: isPaymentDue(updatedMemberRaw.lastPaidDate) ? 'overdue' : 'active'
      };
    }
    return null;
  },

  /**
   * Remove a member
   */
  async deleteMember(id) { // Consolidated from old memberStore.js and memberService.js
    try {
      let members = await this.getRawMembers();
      members = members.filter(m => m.id !== id);
      await this.saveRawMembers(members);
      return true;
    } catch (e) {
      console.error("memberService.deleteMember error:", e);
      return false;
    }
  },

  /**
   * Get member by ID
   */
  async getMemberById(id) {
    const members = await this.getAllMembers(); // Get all members with calculated fields
    return members.find(m => m.id === id) || null;
  },

  // --- Notification/Payment Logic (can be expanded later) ---

  // Logic to check if 30 days have passed (kept for direct use if needed, but getAllMembers calculates it)
  checkPaymentStatus: (subscriptionDate) => { // From old memberStore.js
    const start = new Date(subscriptionDate);
    const now = new Date();
    const diffTime = Math.abs(now - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return {
      daysPassed: diffDays,
      needsPayment: diffDays >= 30,
    };
  },

  // Placeholder for notification management (e.g., to track which notifications have been sent)
  getSentNotifications: async () => { // From old memberStore.js
    try {
      const data = await AsyncStorage.getItem(NOTIFICATION_KEY);
      return data ? JSON.parse(data) : {};
    } catch (e) {
      console.error("Failed to load notifications", e);
      return {};
    }
  },

  markNotificationSent: async (memberId, date) => { // From old memberStore.js
    const notifications = await memberService.getSentNotifications();
    notifications[memberId] = notifications[memberId] || [];
    notifications[memberId].push(date);
    await AsyncStorage.setItem(NOTIFICATION_KEY, JSON.stringify(notifications));
  }
};
