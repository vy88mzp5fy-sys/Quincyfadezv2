import React, { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DiaryClientContext from "./DiaryClientContext";

const GOLD = "#C99B4A";
const GOLD_LIGHT = "#E7C77A";
const API_URL = (process.env.EXPO_PUBLIC_API_URL || "").replace(/\/$/, "");
const TOKEN_KEY = "quincyfadez.adminToken";

function formatTime(value) {
  if (!value) return "—";
  return new Date(value).toLocaleTimeString("en-GB", { hour:"2-digit", minute:"2-digit", hour12:false, timeZone:"Europe/London" });
}

function money(value) {
  const number = Number(value || 0);
  return `£${number.toFixed(number % 1 ? 2 : 0)}`;
}

function timeUntil(value) {
  if (!value) return "";
  const minutes = Math.round((new Date(value).getTime() - Date.now()) / 60000);
  if (!Number.isFinite(minutes)) return "";
  if (minutes <= 0 && minutes > -60) return "NOW";
  if (minutes < 0) return "PASSED";
  if (minutes < 60) return `IN ${minutes} MIN`;
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder ? `IN ${hours}H ${remainder}M` : `IN ${hours}H`;
}

function Stat({ label, value, tone }) {
  return <View style={[styles.stat, tone === "good" && styles.statGood, tone === "warn" && styles.statWarn]}><Text style={styles.statLabel}>{label}</Text><Text style={[styles.statValue, tone === "good" && styles.statValueGood, tone === "warn" && styles.statValueWarn]}>{value}</Text></View>;
}

function AttentionCard({ alert }) {
  if (!alert) return null;
  return <View style={[styles.attentionCard, alert.level === "high" && styles.attentionCardHigh]}><View style={[styles.attentionIcon, alert.level === "high" && styles.attentionIconHigh]}><Text style={[styles.attentionIconText, alert.level === "high" && styles.attentionIconTextHigh]}>!</Text></View><View style={styles.attentionCopy}><Text style={[styles.attentionLabel, alert.level === "high" && styles.attentionLabelHigh]}>{alert.level === "high" ? "NEEDS ATTENTION" : "USEFUL HEADS-UP"}</Text><Text style={styles.attentionTitle}>{alert.title}</Text><Text style={styles.attentionText}>{alert.text}</Text></View></View>;
}

function DayCompleteCard({ summary, overview }) {
  return <View style={styles.completeCard}>
    <View style={styles.completeIcon}><Text style={styles.completeIconText}>✓</Text></View>
    <Text style={styles.completeEyebrow}>DAY COMPLETE</Text>
    <Text style={styles.completeTitle}>That’s Today Wrapped.</Text>
    <Text style={styles.completeText}>There are no more confirmed appointments waiting today. Your final figures stay here so you can close the day without hunting through the diary.</Text>
    <View style={styles.completeMetrics}>
      <View style={styles.completeMetric}><Text style={styles.completeMetricLabel}>COMPLETED</Text><Text style={styles.completeMetricValue}>{summary.completed}</Text></View>
      <View style={styles.completeMetric}><Text style={styles.completeMetricLabel}>COMPLETED VALUE</Text><Text style={styles.completeMetricValue}>{money(overview?.today_revenue)}</Text></View>
      <View style={styles.completeMetric}><Text style={styles.completeMetricLabel}>NO-SHOWS</Text><Text style={[styles.completeMetricValue, summary.noShows > 0 && styles.completeMetricWarn]}>{summary.noShows}</Text></View>
    </View>
  </View>;
}

export default function AdminTodayFocus({ overview, onOpenSchedule, onOpenNext, onRefresh }) {
  const appointments = overview?.appointments || [];
  const next = overview?.next_booking || null;
  const [nextClient, setNextClient] = useState(null);

  useEffect(() => {
    let active = true;
    setNextClient(null);
    if (!next?.client_key || !API_URL) return () => { active = false; };
    (async () => {
      try {
        const token = await AsyncStorage.getItem(TOKEN_KEY);
        if (!token) return;
        const response = await fetch(`${API_URL}/api/admin/clients/${encodeURIComponent(next.client_key)}`, { headers:{ Authorization:`Bearer ${token}` } });
        const data = await response.json().catch(() => ({}));
        if (response.ok && active) setNextClient(data.client || null);
      } catch (_) {}
    })();
    return () => { active = false; };
  }, [next?.client_key]);

  const summary = useMemo(() => {
    const completed = appointments.filter((item) => item.status === "completed").length;
    const noShows = appointments.filter((item) => item.status === "no_show").length;
    const remaining = appointments.filter((item) => item.status === "confirmed" && new Date(item.start_at).getTime() >= Date.now()).length;
    const withNotes = appointments.filter((item) => String(item.notes || "").trim()).length;
    return { completed, noShows, remaining, withNotes };
  }, [appointments]);

  const dayComplete = appointments.length > 0 && !next && summary.remaining === 0;
  const emptyDay = appointments.length === 0 && !next;

  const alert = useMemo(() => {
    if (!nextClient) return null;
    const noShows = Number(nextClient.no_show_count || 0);
    const cancelled = Number(nextClient.cancelled_count || 0);
    const notes = String(nextClient.notes || "").trim();
    if (nextClient.blocked) return { level:"high", title:"Client Is Booking Blocked", text:"This client has an active booking restriction on their record. Check the profile before the appointment." };
    if (noShows >= 2) return { level:"high", title:`${noShows} Previous No-Shows`, text:"Reliability is the most important context for this next appointment, so it is prioritised above ordinary tags." };
    if (noShows === 1) return { level:"medium", title:"Previous No-Show", text:"Worth keeping in mind before this appointment. Full reliability history is available in the client record." };
    if (cancelled >= 3) return { level:"medium", title:"Frequent Cancellations", text:`This client has ${cancelled} recorded cancellations. Check their history if you need more context.` };
    if (notes) return { level:"medium", title:"Private Barber Note Saved", text:"There is ongoing client information worth checking before the cut. The note itself stays inside the private appointment details." };
    return null;
  }, [nextClient]);

  const openNext = () => {
    if (!next) return;
    if (onOpenNext) onOpenNext(next);
    else onOpenSchedule?.();
  };

  return <View style={styles.card}>
    <View style={styles.header}><View style={styles.headerCopy}><Text style={styles.eyebrow}>TODAY FOCUS</Text><Text style={styles.title}>{dayComplete ? "Day Complete" : emptyDay ? "A Clear Day" : "What's Next"}</Text><Text style={styles.copy}>{dayComplete ? "Your working day is wrapped, with the final useful figures kept in one clean summary." : emptyDay ? "Nothing is booked today. You can still open Schedule to manage availability or future appointments." : "Urgent context comes first. Tap the next appointment to open its exact booking, client and payment details."}</Text></View><Pressable onPress={onRefresh} style={styles.refresh}><Text style={styles.refreshText}>REFRESH</Text></Pressable></View>
    {!dayComplete && !emptyDay ? <AttentionCard alert={alert} /> : null}
    {dayComplete ? <DayCompleteCard summary={summary} overview={overview} /> : null}
    {emptyDay ? <View style={styles.clearDayCard}><View style={styles.clearDayIcon}><Text style={styles.clearDayIconText}>○</Text></View><Text style={styles.clearDayTitle}>No Appointments Today</Text><Text style={styles.clearDayText}>There is nothing waiting in today’s diary. Future bookings and availability are still one tap away.</Text></View> : null}
    {next ? <Pressable onPress={openNext} style={({ pressed }) => [styles.nextCard, pressed && styles.pressed]} accessibilityRole="button" accessibilityLabel={`Open ${next.customer_name || "next client"} appointment details`}><View style={styles.nextTime}><Text style={styles.time}>{formatTime(next.start_at)}</Text><Text style={styles.until}>{timeUntil(next.start_at)}</Text></View><View style={styles.nextCopy}><Text style={styles.nextName}>{next.customer_name || "Client"}</Text><Text style={styles.nextService}>{next.service || "Appointment"}</Text><DiaryClientContext clientKey={next.client_key} bookingNote={next.notes} /><Text style={styles.detailsHint}>OPEN APPOINTMENT DETAILS</Text></View><Text style={styles.arrow}>›</Text></Pressable> : null}
    {!dayComplete && !emptyDay ? <View style={styles.stats}><Stat label="LEFT TODAY" value={String(summary.remaining)} /><Stat label="COMPLETED" value={String(summary.completed)} tone="good" /><Stat label="NO-SHOWS" value={String(summary.noShows)} tone={summary.noShows ? "warn" : undefined} /><Stat label="WITH NOTES" value={String(summary.withNotes)} /></View> : null}
    <Pressable onPress={onOpenSchedule} style={[styles.openButton, dayComplete && styles.openButtonQuiet]}><Text style={[styles.openButtonText, dayComplete && styles.openButtonTextQuiet]}>{dayComplete ? "REVIEW TODAY'S SCHEDULE" : "OPEN TODAY'S SCHEDULE"}</Text><Text style={[styles.openArrow, dayComplete && styles.openButtonTextQuiet]}>›</Text></Pressable>
  </View>;
}

const styles = StyleSheet.create({
  card:{marginTop:14,borderRadius:20,borderWidth:1,borderColor:"#322A1D",backgroundColor:"#0C0A07",padding:16},header:{flexDirection:"row",alignItems:"flex-start",gap:10},headerCopy:{flex:1},eyebrow:{color:GOLD,fontSize:7,letterSpacing:1.5,fontWeight:"900"},title:{color:"#F1E8D9",fontSize:18,fontWeight:"800",marginTop:5},copy:{color:"#847C70",fontSize:8.5,lineHeight:14,marginTop:6},refresh:{borderRadius:10,borderWidth:1,borderColor:"#3D3324",paddingHorizontal:8,paddingVertical:7},refreshText:{color:"#A98F62",fontSize:5.5,letterSpacing:.7,fontWeight:"900"},attentionCard:{marginTop:12,borderRadius:14,borderWidth:1,borderColor:"#5A4523",backgroundColor:"#171107",padding:11,flexDirection:"row",gap:10},attentionCardHigh:{borderColor:"#65342E",backgroundColor:"#160B09"},attentionIcon:{width:28,height:28,borderRadius:14,borderWidth:1,borderColor:"#6A5229",alignItems:"center",justifyContent:"center"},attentionIconHigh:{borderColor:"#7A3E35"},attentionIconText:{color:GOLD_LIGHT,fontSize:12,fontWeight:"900"},attentionIconTextHigh:{color:"#E3998D"},attentionCopy:{flex:1},attentionLabel:{color:GOLD_LIGHT,fontSize:5.4,letterSpacing:.8,fontWeight:"900"},attentionLabelHigh:{color:"#E3998D"},attentionTitle:{color:"#F0E5D3",fontSize:10.5,fontWeight:"800",marginTop:4},attentionText:{color:"#8F8373",fontSize:7.3,lineHeight:11.5,marginTop:4},nextCard:{marginTop:13,minHeight:96,borderRadius:15,borderWidth:1,borderColor:"#51401F",backgroundColor:"#151006",padding:12,flexDirection:"row",alignItems:"center",gap:11},pressed:{opacity:.72},nextTime:{width:58},time:{color:GOLD_LIGHT,fontSize:17,fontWeight:"900"},until:{color:"#8C744A",fontSize:5.8,letterSpacing:.5,fontWeight:"900",marginTop:5},nextCopy:{flex:1},nextName:{color:"#F2EDE5",fontSize:13,fontWeight:"800"},nextService:{color:"#9A9287",fontSize:8,marginTop:4},detailsHint:{color:"#A88A54",fontSize:5.4,letterSpacing:.65,fontWeight:"900",marginTop:7},arrow:{color:GOLD_LIGHT,fontSize:25},clearDayCard:{marginTop:13,borderRadius:16,borderWidth:1,borderColor:"#27241E",backgroundColor:"#090807",padding:18,alignItems:"center"},clearDayIcon:{width:42,height:42,borderRadius:21,borderWidth:1,borderColor:"#3B3428",alignItems:"center",justifyContent:"center"},clearDayIconText:{color:"#9D8966",fontSize:20},clearDayTitle:{color:"#E8E0D4",fontSize:13,fontWeight:"800",marginTop:10},clearDayText:{color:"#7B746B",fontSize:8,lineHeight:13,textAlign:"center",marginTop:6,maxWidth:260},completeCard:{marginTop:13,borderRadius:17,borderWidth:1,borderColor:"#2E4B38",backgroundColor:"#09100B",padding:17,alignItems:"center"},completeIcon:{width:44,height:44,borderRadius:22,borderWidth:1,borderColor:"#376047",backgroundColor:"#0D1811",alignItems:"center",justifyContent:"center"},completeIconText:{color:"#91D1AD",fontSize:20,fontWeight:"900"},completeEyebrow:{color:"#79B992",fontSize:5.8,letterSpacing:1,fontWeight:"900",marginTop:10},completeTitle:{color:"#E9F0EB",fontSize:15,fontWeight:"850",marginTop:5},completeText:{color:"#7F9184",fontSize:8,lineHeight:13,textAlign:"center",marginTop:6,maxWidth:280},completeMetrics:{width:"100%",flexDirection:"row",gap:7,marginTop:14},completeMetric:{flex:1,minHeight:67,borderRadius:12,borderWidth:1,borderColor:"#24362A",backgroundColor:"#080D09",padding:9,justifyContent:"space-between"},completeMetricLabel:{color:"#668071",fontSize:5,letterSpacing:.5,fontWeight:"900"},completeMetricValue:{color:"#DCE8DF",fontSize:14,fontWeight:"900"},completeMetricWarn:{color:"#D98778"},stats:{flexDirection:"row",gap:6,marginTop:9},stat:{flex:1,minHeight:60,borderRadius:12,borderWidth:1,borderColor:"#25221C",backgroundColor:"#090807",padding:9,justifyContent:"space-between"},statGood:{borderColor:"#284232",backgroundColor:"#09100B"},statWarn:{borderColor:"#51302A",backgroundColor:"#120B0A"},statLabel:{color:"#746650",fontSize:5,letterSpacing:.55,fontWeight:"900"},statValue:{color:"#E9DFD0",fontSize:16,fontWeight:"900"},statValueGood:{color:"#91D1AD"},statValueWarn:{color:"#D98778"},openButton:{minHeight:45,borderRadius:12,backgroundColor:GOLD,marginTop:10,paddingHorizontal:12,flexDirection:"row",alignItems:"center",justifyContent:"space-between"},openButtonQuiet:{backgroundColor:"#11100D",borderWidth:1,borderColor:"#343028"},openButtonText:{color:"#090909",fontSize:6.5,letterSpacing:.8,fontWeight:"900"},openButtonTextQuiet:{color:"#B5A17C"},openArrow:{color:"#090909",fontSize:20,fontWeight:"900"}
});