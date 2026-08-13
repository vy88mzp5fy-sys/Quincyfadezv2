import React from "react";
import { View } from "react-native";
import AppShell from "./src/AppShell";
import ClientIdentitySync from "./src/ClientIdentitySync";
import PushDeviceSync from "./src/PushDeviceSync";

export default function App() {
  return <View style={{ flex: 1 }}>
    <ClientIdentitySync />
    <PushDeviceSync />
    <AppShell />
  </View>;
}
