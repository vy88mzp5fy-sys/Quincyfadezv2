import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BG = "#050505";
const GOLD = "#D6BD7A";
const GOLD_LIGHT = "#F1DDA2";
const PANEL = "#0D0D0D";
const BORDER = "#242424";
const MUTED = "#929292";
const API_URL = (process.env.EXPO_PUBLIC_API_URL || "").replace(/\/$/, "");
const SESSION_STORAGE = "quincyfadez.clientSession";

function statusLabel(value) {
  if (value === "notified") return "SLOT ALERT SENT";
  if (value === "booked") return "BOOKED";
  if (value === "cancelled") return "LEFT LIST";
  if (value === "expired") return "EXPIRED";
  return "WAITING";
}

async function readJson(response) {
  return response.json().catch(() => ({}));
}

export default function WaitingListScreen({ onBack }) {
  const [session, setSession] = useState(null);
  const [services, setServices] = useState([]);
  const [entries, setEntries] = useState([]);
  const [enabled, setEnabled] = useState(false);
  const [service, setService] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [earliestTime, setEarliestTime] = useState("");
  const [latestTime, setLatestTime] = useState("");
  const [busy, setBusy] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const activeEntries = useMemo(
    () => entries.filter((entry) => ["waiting", "notified"].includes(entry.status)),
    [entries]
  );

  const authedRequest = async (path, options = {}) => {
    if (!session?.token) throw new Error("Log in to manage your waiting list.");
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.token}`,
        ...(options.headers || {}),
      },
    });
    const data = await readJson(response);
    if (!response.ok) throw new Error(typeof data.detail === "string" ? data.detail : "Waiting list could not be updated.");
    return data;
  };

  const load = async (savedSession) => {
    if (!API_URL || !savedSession?.token) {
      setBusy(false);
      return;
    }
    setBusy(true);
    setError("");
    try {
      const [serviceResponse, waitingResponse] = await Promise.all([
        fetch(`${API_URL}/api/booking/services`),
        fetch(`${API_URL}/api/waiting-list`, { headers: { Authorization: `Bearer ${savedSession.token}` } }),
      ]);
      const serviceData = await readJson(serviceResponse);
      const waitingData = await readJson(waitingResponse);
      if (!waitingResponse.ok) throw new Error(typeof waitingData.detail === "string" ? waitingData.detail : "Waiting list could not be loaded.");
      const items = serviceData.services || [];
      setServices(items);
      setService((current) => current || items?.[0]?.name || "");
      setEntries(waitingData.entries || []);
      setEnabled(Boolean(waitingData.enabled));
    } catch (err) {
      setError(err.message || "Waiting list could not be loaded.");
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    AsyncStorage.getItem(SESSION_STORAGE)
      .then((saved) => {
        if (!saved) return null;
        const parsed = JSON.parse(saved);
        setSession(parsed);
        return load(parsed);
      })
      .catch(() => setError("Your client session could not be opened."))
      .finally(() => setBusy(false));
  }, []);

  const join = async () => {
    if (!service || saving) return;
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const body = {
        service,
        preferred_date: preferredDate.trim() || null,
        earliest_time: earliestTime.trim() || null,
        latest_time: latestTime.trim() || null,
      };
      const data = await authedRequest("/api/waiting-list", { method: "POST", body: JSON.stringify(body) });
      setSuccess(data.duplicate ? "You’re already on the list for that preference." : "You’re on the waiting list. We’ll alert you when a suitable slot opens.");
      await load(session);
    } catch (err) {
      setError(err.message || "Could not join the waiting list.");
    } finally {
      setSaving(false);
    }
  };

  const leave = async (entryId) => {
    if (!entryId || saving) return;
    setSaving(true);
    setError("");
    try {
      await authedRequest(`/api/waiting-list/${entryId}`, { method: "DELETE" });
      await load(session);
    } catch (err) {
      setError(err.message || "Could not leave the waiting list.");
    } finally {
      setSaving(false);
    }
  };

  return <SafeAreaView style={styles.safe}><StatusBar barStyle="light-content" backgroundColor={BG} /><ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
    <Pressable onPress={onBack} style={styles.back}><Text style={styles.backText}>‹ BACK</Text></Pressable>
    <Text style={styles.eyebrow}>QUINCYFADEZ</Text>
    <Text style={styles.title}>Waiting List.</Text>
    <Text style={styles.copy}>Can’t see the right appointment? Join the list and we’ll alert you when a suitable slot opens.</Text>

    {busy ? <View style={styles.loading}><ActivityIndicator color={GOLD_LIGHT} /><Text style={styles.loadingText}>CHECKING THE LIST…</Text></View> : null}
    {error ? <Text style={styles.error}>{error}</Text> : null}
    {success ? <View style={styles.successCard}><Text style={styles.successText}>{success}</Text></View> : null}

    {!busy && !session?.token ? <View style={styles.emptyCard}><Text style={styles.emptyTitle}>Log In Required</Text><Text style={styles.emptyText}>Open your QuincyFadez client account first so your waiting-list alerts stay linked to you.</Text></View> : null}
    {!busy && session?.token && !enabled ? <View style={styles.emptyCard}><Text style={styles.emptyTitle}>Waiting List Closed</Text><Text style={styles.emptyText}>The waiting list is not open right now. You can still check normal appointment availability.</Text></View> : null}

    {!busy && session?.token && enabled ? <View style={styles.card}>
      <Text style={styles.sectionLabel}>1 · SERVICE</Text>
      <View style={styles.serviceGrid}>{services.map((item) => <Pressable key={item.name} onPress={() => setService(item.name)} style={[styles.servicePill, service === item.name && styles.servicePillActive]}><Text style={[styles.serviceText, service === item.name && styles.serviceTextActive]}>{item.name}</Text></Pressable>)}</View>
      <Text style={styles.sectionLabel}>2 · PREFERENCE</Text>
      <Text style={styles.help}>Optional — leave these blank if any suitable opening works.</Text>
      <TextInput value={preferredDate} onChangeText={setPreferredDate} placeholder="Preferred date · YYYY-MM-DD" placeholderTextColor="#555" style={styles.input} autoCapitalize="none" />
      <View style={styles.timeRow}><TextInput value={earliestTime} onChangeText={setEarliestTime} placeholder="Earliest · 10:00" placeholderTextColor="#555" style={[styles.input, styles.timeInput]} maxLength={5} /><TextInput value={latestTime} onChangeText={setLatestTime} placeholder="Latest · 15:00" placeholderTextColor="#555" style={[styles.input, styles.timeInput]} maxLength={5} /></View>
      <Pressable disabled={!service || saving} onPress={join} style={[styles.primary, saving && styles.disabled]}>{saving ? <ActivityIndicator color="#090909" /> : <><Text style={styles.primaryText}>JOIN WAITING LIST</Text><Text style={styles.primaryArrow}>›</Text></>}</Pressable>
    </View> : null}

    <View style={styles.current}><View style={styles.currentHead}><View><Text style={styles.sectionLabel}>YOUR LIST</Text><Text style={styles.currentTitle}>Current Requests</Text></View><View style={styles.countPill}><Text style={styles.countText}>{activeEntries.length}</Text></View></View>
      {activeEntries.length ? activeEntries.map((entry) => <View key={entry.id} style={styles.entry}><View style={styles.entryCopy}><Text style={styles.entryService}>{entry.service}</Text><Text style={styles.entryMeta}>{entry.preferred_date || "Any date"}{entry.earliest_time || entry.latest_time ? ` · ${entry.earliest_time || "Any"}–${entry.latest_time || "Any"}` : " · Any time"}</Text><Text style={styles.entryStatus}>{statusLabel(entry.status)}</Text></View><Pressable disabled={saving} onPress={() => leave(entry.id)} style={styles.leave}><Text style={styles.leaveText}>LEAVE</Text></Pressable></View>) : <Text style={styles.noEntries}>You don’t have any active waiting-list requests.</Text>}
    </View>
  </ScrollView></SafeAreaView>;
}

const styles = StyleSheet.create({
  safe:{flex:1,backgroundColor:BG},content:{paddingHorizontal:20,paddingTop:12,paddingBottom:42},back:{paddingVertical:10,alignSelf:"flex-start"},backText:{color:GOLD_LIGHT,fontSize:8,letterSpacing:1.2,fontWeight:"900"},eyebrow:{color:GOLD,fontSize:8,letterSpacing:2.1,fontWeight:"900",marginTop:8},title:{color:"#F5F5F5",fontSize:31,lineHeight:36,fontWeight:"750",marginTop:7},copy:{color:MUTED,fontSize:11.5,lineHeight:18,marginTop:9,maxWidth:345},loading:{minHeight:64,marginTop:18,borderRadius:16,borderWidth:1,borderColor:BORDER,backgroundColor:PANEL,flexDirection:"row",alignItems:"center",justifyContent:"center",gap:9},loadingText:{color:"#81704F",fontSize:7,letterSpacing:1.1,fontWeight:"900"},error:{color:"#E3A097",fontSize:9.5,lineHeight:15,marginTop:14},successCard:{marginTop:14,borderRadius:14,borderWidth:1,borderColor:"#5A4824",backgroundColor:"#100D07",padding:13},successText:{color:"#E9D7AD",fontSize:9.5,lineHeight:15},emptyCard:{marginTop:18,borderRadius:19,borderWidth:1,borderColor:BORDER,backgroundColor:PANEL,padding:19},emptyTitle:{color:"#EFEFEF",fontSize:16,fontWeight:"750"},emptyText:{color:MUTED,fontSize:10,lineHeight:16,marginTop:6},card:{marginTop:18,borderRadius:20,borderWidth:1,borderColor:"#30291D",backgroundColor:"#0B0A08",padding:16},sectionLabel:{color:GOLD,fontSize:7,letterSpacing:1.4,fontWeight:"900"},serviceGrid:{flexDirection:"row",flexWrap:"wrap",gap:7,marginTop:10,marginBottom:18},servicePill:{borderRadius:13,borderWidth:1,borderColor:"#303030",backgroundColor:"#0B0B0B",paddingHorizontal:11,paddingVertical:9},servicePillActive:{borderColor:"#6A5629",backgroundColor:"#171207"},serviceText:{color:"#858585",fontSize:8.5,fontWeight:"750"},serviceTextActive:{color:GOLD_LIGHT},help:{color:"#6F6F6F",fontSize:8,lineHeight:13,marginTop:6,marginBottom:8},input:{minHeight:48,borderRadius:12,borderWidth:1,borderColor:"#292929",backgroundColor:"#0D0D0D",color:"#EEEEEE",paddingHorizontal:12,fontSize:10,marginTop:7},timeRow:{flexDirection:"row",gap:8},timeInput:{flex:1},primary:{minHeight:56,borderRadius:15,backgroundColor:GOLD,marginTop:14,paddingHorizontal:16,flexDirection:"row",alignItems:"center",justifyContent:"space-between"},primaryText:{color:"#090909",fontSize:9,letterSpacing:1,fontWeight:"900"},primaryArrow:{color:"#090909",fontSize:27},disabled:{opacity:.48},current:{marginTop:18,borderRadius:20,borderWidth:1,borderColor:BORDER,backgroundColor:PANEL,padding:16},currentHead:{flexDirection:"row",alignItems:"center",justifyContent:"space-between"},currentTitle:{color:"#F0F0F0",fontSize:17,fontWeight:"750",marginTop:5},countPill:{minWidth:30,height:30,borderRadius:15,borderWidth:1,borderColor:"#4A3B1E",backgroundColor:"#130F07",alignItems:"center",justifyContent:"center"},countText:{color:GOLD_LIGHT,fontSize:10,fontWeight:"900"},entry:{marginTop:11,borderRadius:14,borderWidth:1,borderColor:"#252525",backgroundColor:"#090909",padding:12,flexDirection:"row",alignItems:"center",gap:10},entryCopy:{flex:1},entryService:{color:"#EEEEEE",fontSize:12,fontWeight:"750"},entryMeta:{color:"#777",fontSize:8,marginTop:4},entryStatus:{color:GOLD,fontSize:6.5,letterSpacing:.9,fontWeight:"900",marginTop:6},leave:{borderRadius:10,borderWidth:1,borderColor:"#4A2A26",paddingHorizontal:9,paddingVertical:8},leaveText:{color:"#CB857A",fontSize:6.5,letterSpacing:.7,fontWeight:"900"},noEntries:{color:"#777",fontSize:9.5,lineHeight:15,textAlign:"center",paddingVertical:24}
});
