import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AdminScreen from "./AdminScreen";
import PendingBookingsPanel from "./PendingBookingsPanel";
import AdminSchedulePanel from "./AdminSchedulePanel";
import AdminTodayFocus from "./AdminTodayFocus";
import AdminAppointmentDetails from "./AdminAppointmentDetails";

const GOLD = "#C99B4A";
const GOLD_LIGHT = "#E7C77A";
const API_URL = (process.env.EXPO_PUBLIC_API_URL || "").replace(/\/$/, "");
const TOKEN_KEY = "quincyfadez.adminToken";

export default function AdminNotificationsShell({ onExit }) {
  const [visible, setVisible] = useState(false);
  const [scheduleVisible, setScheduleVisible] = useState(false);
  const [todayVisible, setTodayVisible] = useState(false);
  const [appointmentVisible, setAppointmentVisible] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [requests, setRequests] = useState([]);
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [todayLoading, setTodayLoading] = useState(false);
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
      setOverview(null);
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
          setOverview(null);
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

  const loadOverview = useCallback(async ({ quiet = false } = {}) => {
    if (!API_URL) return;
    const token = await getToken();
    if (!token) return;
    if (!quiet) setTodayLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/admin/overview`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json().catch(() => ({}));
      if (response.ok && mounted.current) setOverview(data);
    } finally {
      if (mounted.current && !quiet) setTodayLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    mounted.current = true;
    loadRequests({ quiet: true });
    loadOverview({ quiet: true });
    const interval = setInterval(() => {
      loadRequests({ quiet: true });
      loadOverview({ quiet: true });
    }, 15000);
    return () => {
      mounted.current = false;
      clearInterval(interval);
    };
  }, [loadRequests, loadOverview]);

  const openRequests = async () => {
    setVisible(true);
    await loadRequests();
  };

  const openSchedule = async () => {
    const token = await getToken();
    if (!token) return;
    setAdminToken(token);
    setAppointmentVisible(false);
    setSelectedAppointment(null);
    setTodayVisible(false);
    setScheduleVisible(true);
  };

  const openToday = async () => {
    setTodayVisible(true);
    await loadOverview();
  };

  const openAppointment = (booking) => {
    if (!booking?.id) return;
    setSelectedAppointment(booking);
    setAppointmentVisible(true);
  };

  const closeAppointment = () => {
    setAppointmentVisible(false);
    setSelectedAppointment(null);
    loadOverview({ quiet: true });
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
      await Promise.all([loadRequests({ quiet: true }), loadOverview({ quiet: true })]);
    } finally {
      if (mounted.current) setActionBusy("");
    }
  };

  const todayAttention = useMemo(() => {
    const appointments = overview?.appointments || [];
    const remaining = appointments.filter((item) => item.status === "confirmed" && new Date(item.start_at).getTime() >= Date.now()).length;
    return remaining;
  }, [overview]);

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
        accessibilityLabel={`Open today focus${todayAttention ? `, ${todayAttention} appointment${todayAttention === 1 ? "" : "s"} left today` : ""}`}
        onPress={openToday}
        style={({ pressed }) => [styles.todayButton, pressed && styles.pressed]}
      >
        <Text style={styles.todayLabel}>TODAY</Text>
        {todayAttention > 0 ? <Text style={styles.todayCount}>{todayAttention}</Text> : <Text style={styles.todayArrow}>›</Text>}
      </Pressable>
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
    <Modal visible={todayVisible} animationType="slide" onRequestClose={() => setTodayVisible(false)}>
      <View style={styles.todayModal}>
        <View style={styles.todayHeader}>
          <View><Text style={styles.todayEyebrow}>QUINCYFADEZ ADMIN</Text><Text style={styles.todayTitle}>Today</Text></View>
          <Pressable onPress={() => setTodayVisible(false)} style={styles.todayClose}><Text style={styles.todayCloseText}>×</Text></Pressable>
        </View>
        <ScrollView contentContainerStyle={styles.todayContent} showsVerticalScrollIndicator={false}>
          <AdminTodayFocus overview={overview} onOpenSchedule={openSchedule} onOpenNext={openAppointment} onRefresh={() => loadOverview()} loading={todayLoading} />
        </ScrollView>
      </View>
    </Modal>
    <Modal visible={appointmentVisible} animationType="slide" onRequestClose={closeAppointment}>
      <View style={styles.appointmentModal}>
        <View style={styles.todayHeader}>
          <View><Text style={styles.todayEyebrow}>TODAY · NEXT APPOINTMENT</Text><Text style={styles.todayTitle}>Appointment</Text></View>
          <Pressable onPress={closeAppointment} style={styles.todayClose}><Text style={styles.todayCloseText}>×</Text></Pressable>
        </View>
        <ScrollView contentContainerStyle={styles.appointmentContent} showsVerticalScrollIndicator={false}>
          {selectedAppointment ? <AdminAppointmentDetails booking={selectedAppointment} onClose={closeAppointment} /> : null}
          <Pressable onPress={openSchedule} style={styles.scheduleFromAppointment}><Text style={styles.scheduleFromAppointmentText}>OPEN FULL SCHEDULE</Text><Text style={styles.scheduleFromAppointmentArrow}>›</Text></Pressable>
        </ScrollView>
      </View>
    </Modal>
    <AdminSchedulePanel
      visible={scheduleVisible}
      token={adminToken}
      apiUrl={API_URL}
      onClose={() => { setScheduleVisible(false); loadOverview({ quiet: true }); }}
    />
  </View>;
}

const styles = StyleSheet.create({
  shell:{flex:1,position:"relative"},
  scheduleTabHotspot:{position:"absolute",left:"20%",bottom:7,width:"20%",height:62,zIndex:30},
  todayButton:{position:"absolute",top:14,right:180,minWidth:58,height:40,borderRadius:20,borderWidth:1,borderColor:"#34302A",backgroundColor:"#0A0907",paddingHorizontal:10,flexDirection:"row",alignItems:"center",justifyContent:"center",gap:7,zIndex:20},
  todayLabel:{color:"#A98F62",fontSize:5.8,letterSpacing:.8,fontWeight:"900"},
  todayCount:{color:GOLD_LIGHT,fontSize:10,fontWeight:"900"},
  todayArrow:{color:GOLD_LIGHT,fontSize:16,fontWeight:"900"},
  bell:{position:"absolute",top:14,right:132,width:40,height:40,borderRadius:20,borderWidth:1,borderColor:"#343434",backgroundColor:"#0A0A0A",alignItems:"center",justifyContent:"center",zIndex:20},
  bellActive:{borderColor:"#5A4523",backgroundColor:"#171107"},
  bellIcon:{color:GOLD_LIGHT,fontSize:20,lineHeight:22,transform:[{rotate:"45deg"}]},
  badge:{position:"absolute",top:-4,right:-4,minWidth:18,height:18,borderRadius:9,backgroundColor:GOLD,borderWidth:2,borderColor:"#050505",alignItems:"center",justifyContent:"center",paddingHorizontal:4},
  badgeText:{color:"#090909",fontSize:7,fontWeight:"900"},
  pressed:{opacity:.72,transform:[{scale:.97}]},
  todayModal:{flex:1,backgroundColor:"#050505"},
  appointmentModal:{flex:1,backgroundColor:"#050505"},
  todayHeader:{minHeight:78,paddingHorizontal:18,borderBottomWidth:1,borderBottomColor:"#191919",flexDirection:"row",alignItems:"center",justifyContent:"space-between"},
  todayEyebrow:{color:GOLD,fontSize:7,letterSpacing:1.6,fontWeight:"900"},
  todayTitle:{color:"#F4F4F4",fontSize:22,fontWeight:"750",marginTop:4},
  todayClose:{width:40,height:40,borderRadius:20,borderWidth:1,borderColor:"#242424",backgroundColor:"#0D0D0D",alignItems:"center",justifyContent:"center"},
  todayCloseText:{color:GOLD_LIGHT,fontSize:24},
  todayContent:{paddingHorizontal:18,paddingBottom:42},
  appointmentContent:{paddingHorizontal:18,paddingBottom:42},
  scheduleFromAppointment:{minHeight:50,borderRadius:13,backgroundColor:GOLD,marginTop:12,paddingHorizontal:14,flexDirection:"row",alignItems:"center",justifyContent:"space-between"},
  scheduleFromAppointmentText:{color:"#090909",fontSize:7,letterSpacing:.9,fontWeight:"900"},
  scheduleFromAppointmentArrow:{color:"#090909",fontSize:22,fontWeight:"900"},
});