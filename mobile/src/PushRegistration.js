import { Platform } from "react-native";
import Constants from "expo-constants";
import * as Notifications from "expo-notifications";

let handlerConfigured = false;

function configureForegroundNotifications() {
  if (handlerConfigured) return;
  handlerConfigured = true;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

export async function getPushRegistrationPayload() {
  configureForegroundNotifications();

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("appointments", {
      name: "Appointments",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  const existing = await Notifications.getPermissionsAsync();
  let status = existing.status;
  if (status !== "granted") {
    status = (await Notifications.requestPermissionsAsync()).status;
  }
  if (status !== "granted") return null;

  const projectId = Constants?.expoConfig?.extra?.eas?.projectId || Constants?.easConfig?.projectId;
  if (!projectId) return null;

  const expoPushToken = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
  if (!expoPushToken) return null;

  return {
    expo_push_token: expoPushToken,
    platform: Platform.OS,
  };
}
