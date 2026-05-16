// NotificationService - handles local notifications for payment due alerts
import * as Notifications from 'expo-notifications'; // Correct import for Notifications module
import * as Device from 'expo-device';
import { Platform } from 'react-native';

// Configure notification settings
try {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
} catch (e) { console.warn('Notifications handler failed to init:', e); }

// Create Android Notification Channel
if (Platform.OS === 'android') {
  Notifications.setNotificationChannelAsync('gym-notifications', {
    name: 'Gym Notifications',
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#2563eb',
  });
}

export const notificationService = {
  /**
   * Request permissions for notifications
   */
  async requestPermissions() {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    return finalStatus === 'granted';
  },

  /**
   * Schedule a notification for when payment is due
   */
  async schedulePaymentDueNotification(member) {
    try {
      const permissionsGranted = await this.requestPermissions();
      if (!permissionsGranted) {
        console.log('Notification permissions not granted');
        return;
      }

      // FOR TESTING: Use a simple interval trigger (60 seconds)
      // This avoids the 'type' or 'channelId' missing errors on some Android versions
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Payment Due',
          body: `${member.name}'s membership payment is due!`,
          data: { memberId: member.id, memberName: member.name },
          android: { channelId: 'gym-notifications' }, // Use the created channel
        },
        trigger: {
          type: 'timeInterval', // Required in newer SDKs
          seconds: 60,
        },
      });
      
      console.log(`Notification scheduled for ${member.name} in 60 seconds.`);
    } catch (error) {
      console.error('Error scheduling notification:', error);
    }
  },

  /**
   * Cancel a scheduled notification
   */
  async cancelNotification(memberId) {
    try {
      // In a real app, we would track scheduled notification IDs
      // For now, we'll clear all notifications for simplicity
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error canceling notification:', error);
    }
  },

  /**
   * Handle incoming notification (when app is in foreground)
   */
  setupNotificationListener(callback) {
    return Notifications.addNotificationReceivedListener(callback);
  },

  /**
   * Handle notification press (when user taps notification)
   */
  setupNotificationResponseListener(callback) {
    return Notifications.addNotificationResponseReceivedListener(callback);
  }
};
