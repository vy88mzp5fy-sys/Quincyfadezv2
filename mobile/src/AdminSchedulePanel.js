import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import ScheduleDiary from "./ScheduleDiary";

const GOLD = "#C99B4A";
const GOLD_LIGHT = "#E7C77A";
const BG = "#050505";
const PANEL = "#0D0D0D";
const BORDER = "#242424";

function isoLocalDate(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function shiftDate(value, amount) {
  const date = new Date(`${value}T12:00:00`);
  date.setDate(date.getDate() + amount);
  return isoLocalDate(date);
}

function formatTime(value) {
  if (!value) return "—";
  return new Date(value).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false });
}

function money(value) {
  const number = Number(value || 0);
  return `£${number.toFixed(number % 1 ? 2 : 0)}`;
}

function DiaryBooking({ booking, busy, onAction }) {
  const status = booking.status || "confirmed";
  const isBusy = busy === booking.id;
  return <View style={styles.bookingCard}>
    <View style={styles.bookingMain}>
      <View style={styles.timeBlock}><Text style={styles.time}>{formatTime(booking.start_at)}</Text><Text style={styles.duration}>{booking.duration_minutes || 0} MIN</Text></View>
      <View style={styles.bookingCopy}><Text style={styles.name}>{booking.customer_name || "Client"}</Text><Text style={styles.service}>{booking.service}</Text><Text style={styles.meta}>{money(booking.price)} · {status.replace("_", " ").toUpperCase()}</Text></View>
    </View>
    {status === "confirmed" ? <View style={styles.actions}>
      <Pressable disabled={isBusy} onPress={() => onAction(booking, "completed")} style={[styles.primary, isBusy && styles.disabled]}><Text style={styles.primaryText}>COMPLETE</Text></Pressable>
      <Pressable disabled={isBusy} onPress={() => onAction(booking, "no_show")} style={[styles.secondary, isBusy && styles.disabled]}><Text style={styles.secondaryText}>NO-SHOW</Text></Pressable>
      <Pressable disabled={isBusy} onPress={() => onAction(booking, "cancelled")} style={[styles.danger, isBusy && styles.disabled]}><Text style={styles.dangerText}>CANCEL</Text></Pressable>
    </View> : null}
  </View>;
}

export default function AdminSchedulePanel({ visible, token, apiUrl, onClose }) {
  const [view, setView] = useState("week");
  const [startDate, setStartDate] = useState(isoLocalDate());
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionBusy, setActionBusy] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!visible || !token || !apiUrl) return;
    const days = view === "day" ? 1 : view === "week" ? 7 : 31;
    setLoading(true); setError("");
    try {
      const response = await fetch(`${apiUrl}/api/admin/bookings?start_date=${startDate}&days=${days}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.detail || "Schedule could not be loaded.");
      setBookings(data.bookings || []);
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  }, [visible, token, apiUrl, view, startDate]);

  useEffect(() => { load(); }, [load]);

  const changeView = (next) => {
    setView(next);
    setStartDate(isoLocalDate());
  };

  const move = (direction) => {
    const jump = view === "day" ? 1 : view === "week" ? 7 : 31;
    setStartDate((current) => shiftDate(current, direction * jump));
  };

  const updateStatus = async (booking, status) => {
    if (!booking?.id || actionBusy) return;
    setActionBusy(booking.id); setError("");
    try {
      const response = await fetch(`${apiUrl}/api/admin/bookings/${booking.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.detail || "Appointment could not be updated.");
      await load();
    } catch (err) { setError(err.message); } finally { setActionBusy(""); }
  };

  return <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
    <View style={styles.screen}>
      <View style={styles.header}><View><Text style={styles.eyebrow}>QUINCYFADEZ ADMIN</Text><Text style={styles.title}>Schedule Diary</Text></View><Pressable onPress={onClose} style={styles.close}><Text style={styles.closeText}>×</Text></Pressable></View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.intro}>Your confirmed diary stays separate from pending booking requests. Move through Day, Week or Agenda without mixing the two.</Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {loading ? <View style={styles.loading}><ActivityIndicator color={GOLD_LIGHT} /><Text style={styles.loadingText}>LOADING DIARY…</Text></View> : null}
        <ScheduleDiary
          bookings={bookings}
          view={view}
          startDate={startDate}
          onViewChange={changeView}
          onMove={move}
          onToday={() => setStartDate(isoLocalDate())}
          renderBooking={(booking) => <DiaryBooking key={booking.id} booking={booking} busy={actionBusy} onAction={updateStatus} />}
        />
      </ScrollView>
    </View>
  </Modal>;
}

const styles = StyleSheet.create({
  screen:{flex:1,backgroundColor:BG},header:{minHeight:78,paddingHorizontal:18,borderBottomWidth:1,borderBottomColor:"#191919",flexDirection:"row",alignItems:"center",justifyContent:"space-between"},eyebrow:{color:GOLD,fontSize:7,letterSpacing:1.6,fontWeight:"900"},title:{color:"#F4F4F4",fontSize:22,fontWeight:"750",marginTop:4},close:{width:40,height:40,borderRadius:20,borderWidth:1,borderColor:BORDER,backgroundColor:PANEL,alignItems:"center",justifyContent:"center"},closeText:{color:GOLD_LIGHT,fontSize:24},content:{paddingHorizontal:18,paddingBottom:42},intro:{color:"#929292",fontSize:10.5,lineHeight:17,marginTop:18},error:{color:"#E5A29A",fontSize:9.5,lineHeight:15,marginTop:10},loading:{height:42,marginTop:10,borderRadius:12,borderWidth:1,borderColor:"#2D281F",backgroundColor:"#0C0A07",flexDirection:"row",alignItems:"center",justifyContent:"center",gap:8},loadingText:{color:"#9A845C",fontSize:7,letterSpacing:1.1,fontWeight:"900"},bookingCard:{marginTop:9,borderRadius:14,borderWidth:1,borderColor:"#222",backgroundColor:"#090909",padding:11},bookingMain:{flexDirection:"row",alignItems:"center",gap:11},timeBlock:{width:52},time:{color:GOLD_LIGHT,fontSize:14,fontWeight:"900"},duration:{color:"#70654F",fontSize:6.2,marginTop:4},bookingCopy:{flex:1},name:{color:"#EFEFEF",fontSize:12,fontWeight:"750"},service:{color:"#A2A2A2",fontSize:8.5,marginTop:3},meta:{color:"#6E6250",fontSize:7,marginTop:4},actions:{flexDirection:"row",gap:6,marginTop:10,paddingTop:9,borderTopWidth:1,borderTopColor:"#1B1B1B"},primary:{flex:1,minHeight:34,borderRadius:10,backgroundColor:GOLD,alignItems:"center",justifyContent:"center"},primaryText:{color:"#090909",fontSize:6.3,fontWeight:"900",letterSpacing:.6},secondary:{flex:1,minHeight:34,borderRadius:10,borderWidth:1,borderColor:"#353535",alignItems:"center",justifyContent:"center"},secondaryText:{color:"#A8A8A8",fontSize:6.3,fontWeight:"900",letterSpacing:.6},danger:{flex:1,minHeight:34,borderRadius:10,borderWidth:1,borderColor:"#57302A",backgroundColor:"#130A09",alignItems:"center",justifyContent:"center"},dangerText:{color:"#D48F83",fontSize:6.3,fontWeight:"900",letterSpacing:.6},disabled:{opacity:.45},
});