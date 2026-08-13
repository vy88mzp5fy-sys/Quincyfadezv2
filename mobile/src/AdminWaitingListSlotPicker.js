import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

const GOLD = "#D6BD7A";
const GOLD_LIGHT = "#F1DDA2";
const BG = "#050505";
const PANEL = "#0D0D0D";
const BORDER = "#242424";

function localParts(value) {
  const date = new Date(value);
  return {
    date: new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/London", year: "numeric", month: "2-digit", day: "2-digit" }).format(date),
    time: new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/London", hour: "2-digit", minute: "2-digit", hour12: false }).format(date),
  };
}

function matchesPreference(entry, slot) {
  if (entry.preferred_date && slot.date !== entry.preferred_date) return false;
  if (entry.earliest_time && slot.time < entry.earliest_time) return false;
  if (entry.latest_time && slot.time > entry.latest_time) return false;
  return true;
}

function dateLabel(value) {
  const date = new Date(`${value}T12:00:00`);
  return new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short" }).format(date);
}

export default function AdminWaitingListSlotPicker({ visible, apiUrl, token, entry, sending, onClose, onSend }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [slots, setSlots] = useState([]);

  useEffect(() => {
    if (!visible || !apiUrl || !entry?.service) return;
    let active = true;
    const load = async () => {
      setLoading(true); setError(""); setSlots([]);
      try {
        const startDate = entry.preferred_date ? `&start_date=${encodeURIComponent(entry.preferred_date)}` : "";
        const days = entry.preferred_date ? 1 : 21;
        const response = await fetch(`${apiUrl}/api/booking/availability?service=${encodeURIComponent(entry.service)}${startDate}&days=${days}`);
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.detail || "Availability could not be loaded.");
        if (data.setup_required) throw new Error("Working hours still need to be configured before matching slots can be offered.");
        const next = [];
        for (const day of data.days || []) {
          for (const value of day.slots || []) {
            const parts = localParts(value);
            const slot = { value, date: parts.date, time: parts.time };
            if (matchesPreference(entry, slot)) next.push(slot);
          }
        }
        if (active) setSlots(next);
      } catch (err) {
        if (active) setError(err.message || "Availability could not be loaded.");
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, [visible, apiUrl, entry]);

  const groups = useMemo(() => {
    const map = new Map();
    slots.forEach((slot) => {
      if (!map.has(slot.date)) map.set(slot.date, []);
      map.get(slot.date).push(slot);
    });
    return [...map.entries()];
  }, [slots]);

  return <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
    <View style={styles.screen}>
      <View style={styles.header}><View><Text style={styles.eyebrow}>WAITING LIST · REAL AVAILABILITY</Text><Text style={styles.title}>Choose A Slot</Text></View><Pressable disabled={sending} onPress={onClose} style={styles.close}><Text style={styles.closeText}>×</Text></Pressable></View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.clientCard}><Text style={styles.client}>{entry?.client?.name || "Client"}</Text><Text style={styles.service}>{entry?.service || ""}</Text><Text style={styles.note}>Only slots matching this client’s saved waiting-list preferences are shown.</Text></View>
        {loading ? <View style={styles.empty}><ActivityIndicator color={GOLD_LIGHT}/><Text style={styles.emptyText}>Checking live availability…</Text></View> : error ? <View style={styles.error}><Text style={styles.errorTitle}>NO MATCHING SLOTS AVAILABLE</Text><Text style={styles.errorText}>{error}</Text></View> : groups.length ? groups.map(([date, daySlots]) => <View key={date} style={styles.dayCard}><Text style={styles.day}>{dateLabel(date)}</Text><View style={styles.times}>{daySlots.map((slot) => <Pressable key={slot.value} disabled={sending} onPress={() => onSend?.(slot)} style={({pressed})=>[styles.time,pressed&&styles.pressed,sending&&styles.disabled]}><Text style={styles.timeText}>{slot.time}</Text></Pressable>)}</View></View>) : <View style={styles.empty}><Text style={styles.emptyTitle}>NO MATCHING SLOTS RIGHT NOW</Text><Text style={styles.emptyText}>Nothing currently available matches this client’s saved date/time preferences. No alert will be sent.</Text></View>}
      </ScrollView>
    </View>
  </Modal>;
}

const styles=StyleSheet.create({screen:{flex:1,backgroundColor:BG},header:{minHeight:78,paddingHorizontal:18,borderBottomWidth:1,borderBottomColor:"#191919",flexDirection:"row",alignItems:"center",justifyContent:"space-between"},eyebrow:{color:GOLD,fontSize:6.5,letterSpacing:1.2,fontWeight:"900"},title:{color:"#F4F4F4",fontSize:22,fontWeight:"750",marginTop:4},close:{width:40,height:40,borderRadius:20,borderWidth:1,borderColor:BORDER,backgroundColor:PANEL,alignItems:"center",justifyContent:"center"},closeText:{color:GOLD_LIGHT,fontSize:24},content:{padding:18,paddingBottom:44},clientCard:{borderRadius:16,borderWidth:1,borderColor:"#30291D",backgroundColor:"#0D0B08",padding:14},client:{color:"#F1F1F1",fontSize:14,fontWeight:"800"},service:{color:GOLD_LIGHT,fontSize:9.5,fontWeight:"700",marginTop:4},note:{color:"#81786A",fontSize:7.8,lineHeight:12.5,marginTop:6},dayCard:{marginTop:10,borderRadius:16,borderWidth:1,borderColor:BORDER,backgroundColor:PANEL,padding:14},day:{color:"#EDEDED",fontSize:11,fontWeight:"800"},times:{flexDirection:"row",flexWrap:"wrap",gap:8,marginTop:11},time:{minWidth:72,height:40,borderRadius:12,borderWidth:1,borderColor:"#4A3C23",backgroundColor:"#151006",alignItems:"center",justifyContent:"center"},timeText:{color:GOLD_LIGHT,fontSize:10,fontWeight:"800"},empty:{minHeight:150,marginTop:12,borderRadius:17,borderWidth:1,borderColor:BORDER,backgroundColor:PANEL,alignItems:"center",justifyContent:"center",padding:24,gap:10},emptyTitle:{color:"#EEE",fontSize:8,letterSpacing:.9,fontWeight:"900"},emptyText:{color:"#888",fontSize:8,lineHeight:13,textAlign:"center"},error:{marginTop:12,borderRadius:16,borderWidth:1,borderColor:"#442A2A",backgroundColor:"#100808",padding:18},errorTitle:{color:"#C99A9A",fontSize:7,letterSpacing:.8,fontWeight:"900"},errorText:{color:"#9D8585",fontSize:8,lineHeight:13,marginTop:6},pressed:{opacity:.72},disabled:{opacity:.45}});
