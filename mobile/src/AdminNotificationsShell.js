import React from "react";
import { View } from "react-native";
import AdminNotificationsShellCore from "./AdminNotificationsShellCore";
import AdminWaitingListSessionOverlay from "./AdminWaitingListSessionOverlay";

export default function AdminNotificationsShellWrapper(props) {
  return <View style={{ flex: 1 }}>
    <AdminNotificationsShellCore {...props} />
    <AdminWaitingListSessionOverlay />
  </View>;
}
