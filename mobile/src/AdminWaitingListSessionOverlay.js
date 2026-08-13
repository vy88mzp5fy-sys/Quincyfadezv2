import React, { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AdminWaitingListOverlay from "./AdminWaitingListOverlay";

const API_URL = (process.env.EXPO_PUBLIC_API_URL || "").replace(/\/$/, "");
const TOKEN_KEY = "quincyfadez.adminToken";

export default function AdminWaitingListSessionOverlay() {
  const [token, setToken] = useState("");

  useEffect(() => {
    let active = true;
    const sync = async () => {
      const next = await AsyncStorage.getItem(TOKEN_KEY).catch(() => "");
      if (active) setToken(next || "");
    };
    sync();
    const timer = setInterval(sync, 3000);
    return () => { active = false; clearInterval(timer); };
  }, []);

  return <AdminWaitingListOverlay apiUrl={API_URL} token={token} />;
}
