// NotificationService - handles local notifications for payment due alerts
import { Notifications } from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

// Configure notification settings
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

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

      // Parse the due date
      const dueDate = new Date(member.dueDate);

      // Schedule notification for 9 AM on the due date
      let notificationTime = new Date(dueDate);
     // notificationTime.setHours(9, 0, 0, 0);

      // FOR TESTING: Uncomment the line below to receive a notification in 60 seconds
      notificationTime = new Date(Date.now() + 60 * 1000);

      // Only schedule if in the future
      if (notificationTime > new Date()) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Payment Due',
            body: `${member.name}'s membership payment is due today!`,
            data: { memberId: member.id },
          },
          trigger: notificationTime,
        });
      }
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
