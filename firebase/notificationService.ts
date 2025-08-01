import { Alert, PermissionsAndroid } from 'react-native';
import { getApp } from '@react-native-firebase/app';
import {
  getMessaging,
  getToken,
  onMessage,
  onNotificationOpenedApp,
  getInitialNotification,
  setBackgroundMessageHandler,
  requestPermission,
  AuthorizationStatus,
  FirebaseMessagingTypes
} from '@react-native-firebase/messaging';
import Toast from 'react-native-toast-message';
import { useNotificationStore } from '~/store/notification.store';
import { getOrCreateGuestId, getStoredGuestUserId, setStoredGuestUserId } from '~/utils/device-info';
import { registerGuestUser, updateFcmToken } from '~/lib/api';

const app = getApp();
const messaging = getMessaging(app);

const requestNotificationPermission = async () => {
  const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
  if (granted === PermissionsAndroid.RESULTS.GRANTED) {
    console.log("Notification permission granted");
  } else {
    console.log("Notification permission denied")
  }
};

export async function requestUserPermission() {
  await requestNotificationPermission();
  const authStatus = await requestPermission(messaging);
  const enabled =
    authStatus === AuthorizationStatus.AUTHORIZED ||
    authStatus === AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    console.log('✅ Authorization status:', authStatus);
    await handleFcmRegistration();
    await subscribeToAllDevicesTopic();
  } else {
    Alert.alert('Notification Permission', 'Permission denied. Notifications will not work.');
  }
}

/**
 * Handle FCM token logic + sync to backend
 */
async function handleFcmRegistration() {
  const guestId = await getOrCreateGuestId();
  const fcmToken = await getFcmToken();

  if (!fcmToken) return;

  const existingUserId = await getStoredGuestUserId();

  if (!existingUserId) {
    const { success, data } = await registerGuestUser(guestId, fcmToken);
    if (success && data?.data?.id) {
      await setStoredGuestUserId(data.data.id);
      console.log("👤 Guest registered and user ID saved:", data.data.id);
    } else {
      console.warn("❌ Failed to register guest user");
    }
  } else {
    const res = await updateFcmToken(existingUserId, fcmToken);
    if (!res.success) console.warn("❌ Failed to update FCM token");
  }
}

export async function getFcmToken() {
  try {
    const token = await getToken(messaging);
    console.log('✅ FCM Token:', token);
    return token;
  } catch (error) {
    console.error('❌ Error getting FCM token:', error);
  }
}

// Background
setBackgroundMessageHandler(messaging, async (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
  console.log('📩 [Background Handler] Notification:', remoteMessage);
});

// Foreground/Background/Quit Listeners
export function notificationListener() {
  onMessage(messaging, async remoteMessage => {
    console.log('📩 [Foreground] Notification:', remoteMessage);
    Toast.show({
      type: 'info',
      text1: remoteMessage.notification?.title ?? 'New Notification',
      text2: remoteMessage.notification?.body ?? '',
      position: 'top',
      visibilityTime: 4000,
    });

    useNotificationStore.getState().addNotification({
      messageId: remoteMessage.messageId ?? '',
      title: remoteMessage.notification?.title ?? 'Notification',
      body: remoteMessage.notification?.body ?? '',
      sentTime: remoteMessage.sentTime ?? Date.now(),
      data: remoteMessage.data ?? {},
    });
  });

  onNotificationOpenedApp(messaging, remoteMessage => {
    console.log('📩 [Opened from Background] Notification:', remoteMessage.notification);
    // same logic...
  });

  getInitialNotification(messaging).then(remoteMessage => {
    if (remoteMessage) {
      console.log('📩 [Opened from Quit] Notification:', remoteMessage.notification);
      // same logic...
    }
  });
}

export async function subscribeToAllDevicesTopic() {
  try {
    await messaging.subscribeToTopic('all-devices');
    console.log('✅ Subscribed to "all-devices" topic');
  } catch (error) {
    console.error('❌ Error subscribing to "all-devices" topic:', error);
  }
}
