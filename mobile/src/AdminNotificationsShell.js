import React, { useCallback, useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AdminScreen from "./AdminScreen";
import PendingBookingsPanel from "./PendingBookingsPanel";
import AdminSchedulePanel from "./AdminSchedulePanel";

const GOLD = "#C99B4A";
const GOLD_LIGHT = "#E7C77A";
const API_URL = (process.env.EXPO_PUBLIC_API_URL || "").replace(/\/$/, "");
const TOKEN_KEY = "quincyfadez.adminToken";

export default function AdminNotificationsShell({ onExit }) {
  const [visible, setVisible] = useState(false);
  const [scheduleVisible, setScheduleVisible] = useState(false);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionBusy, setActionBusy] = useState("");
  const [hasAdminSession, setHasAdminSession] = useState(false);
  const [adminToken, setAdminToken] = useState("");
  const mounted = useRef(true);

  const getToken = useCallback(async () => AsyncStorage.getItem(TOKEN_KEY), []);

  const loadRequests = useCallback(async ({ quiet = false } = {}) => {
    if (!API_URL) return;
    const token = await getToken();
    if (!mounted.current) return;
    setHasAdminSession(Boolean(token));
    setAdminToken(token || "");
    if (!token) {
      setRequests([]);
      return;
    }
    if (!quiet) setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/admin/booking-requests`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 401) {
        if (mounted.current) {
          setHasAdminSession(false);
          setAdminToken("");
          setRequests([]);
        }
        return;
      }
      const data = await response.json().catch(() => ({}));
      if (!response.ok) return;
      if (mounted.current) setRequests(data.bookings || []);
    } finally {
      if (mounted.current && !quiet) setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    mounted.current = true;
    loadRequests({ quiet: true });
    const interval = setInterval(() => loadRequests({ quiet: true }), 15000);
    return () => {
      mounted.current = false;
      clearInterval(interval);
    };
  }, [loadRequests]);

  const openRequests = async () => {
    setVisible(true);
    await loadRequests();
  };

  const openSchedule = async () => {
    const token = await getToken();
    if (!token) return;
    setAdminToken(token);
    setScheduleVisible(true);
  };

  const updateRequest = async (booking, status) => {
    if (!booking?.id || actionBusy) return;
    const token = await getToken();
    if (!token || !API_URL) return;
    setActionBusy(booking.id);
    try {
      const response = await fetch(`${API_URL}/api/admin/bookings/${booking.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) return;
      setRequests((current) => current.filter((item) => item.id !== booking.id));
      await loadRequests({ quiet: true });
    } finally {
      if (mounted.current) setActionBusy("");
    }
  };

  return <View style={styles.shell}>
    <AdminScreen onExit={onExit} />
    {hasAdminSession ? <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Open Schedule"
        onPress={openSchedule}
        style={styles.scheduleTabHotspot}
      />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${requests.length} pending booking request${requests.length === 1 ? "" : "s"}`}
        onPress={openRequests}
        style={({ pressed }) => [styles.bell, requests.length > 0 && styles.bellActive, pressed && styles.pressed]}
      >
        <Text style={styles.bellIcon}>♢</Text>
        {requests.length > 0 ? <View style={styles.badge}><Text style={styles.badgeText}>{requests.length > 99 ? "99+" : requests.length}</Text></View> : null}
      </Pressable>
    </> : null}
    <PendingBookingsPanel
      visible={visible}
      bookings={requests}
      loading={loading}
      actionBusy={actionBusy}
      onClose={() => setVisible(false)}
      onRefresh={() => loadRequests()}
      onAction={updateRequest}
    />
    <AdminSchedulePanel
      visible={scheduleVisible}
      token={adminToken}
      apiUrl={API_URL}
      onClose={() => setScheduleVisible(false)}
    />
  </View>;
}

const styles = StyleSheet.create({
  shell:{flex:1,position:"relative"},
  scheduleTabHotspot:{position:"absolute",left:"20%",bottom:7,width:"20%",height:62,zIndex:30},
  bell:{position:"absolute",top:14,right:132,width:40,height:40,borderRadius:20,borderWidth:1,borderColor:"#343434",backgroundColor:"#0A0A0A",alignItems:"center",justifyContent:"center",zIndex:20},
  bellActive:{borderColor:"#5A4523",backgroundColor:"#171107"},
  bellIcon:{color:GOLD_LIGHT,fontSize:20,lineHeight:22,transform:[{rotate:"45deg"}]},
  badge:{position:"absolute",top:-4,right:-4,minWidth:18,height:18,borderRadius:9,backgroundColor:GOLD,borderWidth:2,borderColor:"#050505",alignItems:"center",justifyContent:"center",paddingHorizontal:4},
  badgeText:{color:"#090909",fontSize:7,fontWeight:"900"},
  pressed:{opacity:.72,transform:[{scale:.97}]},
});
