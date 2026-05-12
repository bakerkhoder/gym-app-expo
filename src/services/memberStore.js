import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@gym_members_data';
const NOTIFICATION_KEY = '@gym_notifications_data'; // For future notification tracking

export const MemberService = {
  // Fetch all members
  getMembers: async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error("Failed to load members", e);
      return [];
    }
  },

  // Save/Update a member
  saveMember: async (member) => {
    try {
      const members = await MemberService.getMembers();
      const index = members.findIndex(m => m.id === member.id);
      
      if (index > -1) {
        members[index] = member; // Update
      } else {
        members.push({ ...member, id: Date.now().toString() }); // Create
      }
      
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(members));
      return true;
    } catch (e) {
      return false;
    }
  },

  // Delete a member
  deleteMember: async (memberId) => {
    try {
      let members = await MemberService.getMembers();
      members = members.filter(m => m.id !== memberId);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(members));
      return true;
    } catch (e) {
      console.error("Failed to delete member", e);
      return false;
    }
  },

  // --- Notification/Payment Logic (can be expanded later) ---

  // Logic to check if 30 days have passed
  checkPaymentStatus: (subscriptionDate) => {
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
  getSentNotifications: async () => {
    try {
      const data = await AsyncStorage.getItem(NOTIFICATION_KEY);
      return data ? JSON.parse(data) : {};
    } catch (e) {
      console.error("Failed to load notifications", e);
      return {};
    }
  },

  markNotificationSent: async (memberId, date) => {
    const notifications = await MemberService.getSentNotifications();
    notifications[memberId] = notifications[memberId] || [];
    notifications[memberId].push(date);
    await AsyncStorage.setItem(NOTIFICATION_KEY, JSON.stringify(notifications));
  }
};