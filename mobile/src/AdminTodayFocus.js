import React, { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

const GOLD = "#C99B4A";
const GOLD_LIGHT = "#E7C77A";

function formatTime(value) {
  if (!value) return "—";
  return new Date(value).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Europe/London" });
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

export default function AdminTodayFocus({ overview, onOpenSchedule, onRefresh }) {
  const appointments = overview?.appointments || [];
  const next = overview?.next_booking || null;
  const summary = useMemo(() => {
    const completed = appointments.filter((item) => item.status === "completed").length;
    const noShows = appointments.filter((item) => item.status === "no_show").length;
    const remaining = appointments.filter((item) => item.status === "confirmed" && new Date(item.start_at).getTime() >= Date.now()).length;
    const withNotes = appointments.filter((item) => String(item.notes || "").trim()).length;
    return { completed, noShows, remaining, withNotes };
  }, [appointments]);

  return <View style={styles.card}><View style={styles.header}><View style={styles.headerCopy}><Text style={styles.eyebrow}>TODAY FOCUS</Text><Text style={styles.title}>What’s Next</Text><Text style={styles.copy}>The useful things for today, without turning Home into another full diary.</Text></View><Pressable onPress={onRefresh} style={styles.refresh}><Text style={styles.refreshText}>REFRESH</Text></Pressable></View>{next ? <Pressable onPress={onOpenSchedule} style={({ pressed }) => [styles.nextCard, pressed && styles.pressed]}><View style={styles.nextTime}><Text style={styles.time}>{formatTime(next.start_at)}</Text><Text style={styles.until}>{timeUntil(next.start_at)}</Text></View><View style={styles.nextCopy}><Text style={styles.nextName}>{next.customer_name || "Client"}</Text><Text style={styles.nextService}>{next.service || "Appointment"}</Text>{String(next.notes || "").trim() ? <View style={styles.notePill}><Text style={styles.notePillText}>BOOKING NOTE</Text></View> : null}</View><Text style={styles.arrow}>›</Text></Pressable> : <View style={styles.noNext}><Text style={styles.noNextTitle}>No Upcoming Appointment Right Now</Text><Text style={styles.noNextText}>Your next confirmed appointment will appear here automatically.</Text></View>}<View style={styles.stats}><Stat label="LEFT TODAY" value={String(summary.remaining)} /><Stat label="COMPLETED" value={String(summary.completed)} tone="good" /><Stat label="NO-SHOWS" value={String(summary.noShows)} tone={summary.noShows ? "warn" : undefined} /><Stat label="WITH NOTES" value={String(summary.withNotes)} /></View><Pressable onPress={onOpenSchedule} style={styles.openButton}><Text style={styles.openButtonText}>OPEN TODAY’S SCHEDULE</Text><Text style={styles.openArrow}>›</Text></Pressable></View>;
}

const styles = StyleSheet.create({card:{marginTop:14,borderRadius:20,borderWidth:1,borderColor:"#322A1D",backgroundColor:"#0C0A07",padding:16},header:{flexDirection:"row",alignItems:"flex-start",gap:10},headerCopy:{flex:1},eyebrow:{color:GOLD,fontSize:7,letterSpacing:1.5,fontWeight:"900"},title:{color:"#F1E8D9",fontSize:18,fontWeight:"800",marginTop:5},copy:{color:"#847C70",fontSize:8.5,lineHeight:14,marginTop:6},refresh:{borderRadius:10,borderWidth:1,borderColor:"#3D3324",paddingHorizontal:8,paddingVertical:7},refreshText:{color:"#A98F62",fontSize:5.5,letterSpacing:.7,fontWeight:"900"},nextCard:{marginTop:13,minHeight:86,borderRadius:15,borderWidth:1,borderColor:"#51401F",backgroundColor:"#151006",padding:12,flexDirection:"row",alignItems:"center",gap:11},pressed:{opacity:.72},nextTime:{width:58},time:{color:GOLD_LIGHT,fontSize:17,fontWeight:"900"},until:{color:"#8C744A",fontSize:5.8,letterSpacing:.5,fontWeight:"900",marginTop:5},nextCopy:{flex:1},nextName:{color:"#F2EDE5",fontSize:13,fontWeight:"800"},nextService:{color:"#9A9287",fontSize:8,marginTop:4},notePill:{alignSelf:"flex-start",borderRadius:8,borderWidth:1,borderColor:"#51401F",backgroundColor:"#100D07",paddingHorizontal:6,paddingVertical:4,marginTop:7},notePillText:{color:GOLD_LIGHT,fontSize:5,letterSpacing:.45,fontWeight:"900"},arrow:{color:GOLD_LIGHT,fontSize:25},noNext:{marginTop:13,borderRadius:14,borderWidth:1,borderColor:"#25221C",backgroundColor:"#090807",padding:14},noNextTitle:{color:"#DED7CC",fontSize:11,fontWeight:"800"},noNextText:{color:"#777067",fontSize:7.5,lineHeight:12,marginTop:5},stats:{flexDirection:"row",gap:6,marginTop:9},stat:{flex:1,minHeight:60,borderRadius:12,borderWidth:1,borderColor:"#25221C",backgroundColor:"#090807",padding:9,justifyContent:"space-between"},statGood:{borderColor:"#284232",backgroundColor:"#09100B"},statWarn:{borderColor:"#51302A",backgroundColor:"#120B0A"},statLabel:{color:"#746650",fontSize:5,letterSpacing:.55,fontWeight:"900"},statValue:{color:"#E9DFD0",fontSize:16,fontWeight:"900"},statValueGood:{color:"#91D1AD"},statValueWarn:{color:"#D98778"},openButton:{minHeight:45,borderRadius:12,backgroundColor:GOLD,marginTop:10,paddingHorizontal:12,flexDirection:"row",alignItems:"center",justifyContent:"space-between"},openButtonText:{color:"#090909",fontSize:6.5,letterSpacing:.8,fontWeight:"900"},openArrow:{color:"#090909",fontSize:20,fontWeight:"900"}});