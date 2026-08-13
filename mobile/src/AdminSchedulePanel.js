import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import ScheduleDiary from "./ScheduleDiary";

const GOLD = "#C99B4A";
const GOLD_LIGHT = "#E7C77A";
const BG = "#050505";
const PANEL = "#0D0D0D";
const BORDER = "#242424";
const DAYS = [["0", "Monday"], ["1", "Tuesday"], ["2", "Wednesday"], ["3", "Thursday"], ["4", "Friday"], ["5", "Saturday"], ["6", "Sunday"]];

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
  return new Date(value).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Europe/London" });
}

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", timeZone: "Europe/London" });
}

function money(value) {
  const number = Number(value || 0);
  return `£${number.toFixed(number % 1 ? 2 : 0)}`;
}

function validClock(value) {
  const match = /^(\d{2}):(\d{2})$/.exec(value || "");
  if (!match) return false;
  return Number(match[1]) >= 0 && Number(match[1]) <= 23 && Number(match[2]) >= 0 && Number(match[2]) <= 59;
}

function londonIsoFromLocal(dateValue, timeValue) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateValue || "") || !validClock(timeValue)) return null;
  const [year, month, day] = dateValue.split("-").map(Number);
  const [hour, minute] = timeValue.split(":").map(Number);
  const target = Date.UTC(year, month - 1, day, hour, minute, 0);
  let guess = target;
  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London",
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  });
  for (let i = 0; i < 3; i += 1) {
    const parts = Object.fromEntries(formatter.formatToParts(new Date(guess)).filter((part) => part.type !== "literal").map((part) => [part.type, part.value]));
    const represented = Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day), Number(parts.hour), Number(parts.minute), 0);
    guess += target - represented;
  }
  const result = new Date(guess);
  return Number.isNaN(result.getTime()) ? null : result.toISOString();
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

function WorkingHours({ value, busy, onSave }) {
  const [draft, setDraft] = useState(value || {});
  useEffect(() => setDraft(value || {}), [value]);

  const change = (day, index, side, text) => setDraft((current) => {
    const windows = [...(current[day] || [])];
    const row = [...(windows[index] || ["", ""])];
    row[side] = text;
    windows[index] = row;
    return { ...current, [day]: windows };
  });
  const add = (day) => setDraft((current) => ({ ...current, [day]: [...(current[day] || []), ["", ""]] }));
  const remove = (day, index) => setDraft((current) => ({ ...current, [day]: (current[day] || []).filter((_, i) => i !== index) }));
  const valid = Object.values(draft).every((windows) => (windows || []).every(([start, end]) => validClock(start) && validClock(end) && end > start));

  return <View style={styles.managerCard}>
    <View style={styles.managerHead}><View><Text style={styles.sectionEyebrow}>WEEKLY AVAILABILITY</Text><Text style={styles.sectionTitle}>Working Hours</Text></View><Pressable disabled={busy || !valid} onPress={() => onSave(draft)} style={[styles.saveButton, (busy || !valid) && styles.disabled]}><Text style={styles.saveText}>{busy ? "SAVING…" : "SAVE"}</Text></Pressable></View>
    <Text style={styles.managerCopy}>These hours control the real times clients can book. Closed days stay unavailable, and split shifts can use more than one window.</Text>
    {DAYS.map(([key, label]) => {
      const windows = draft[key] || [];
      return <View key={key} style={styles.dayCard}>
        <View style={styles.dayTop}><View><Text style={styles.dayName}>{label}</Text><Text style={styles.dayMeta}>{windows.length ? `${windows.length} WORKING WINDOW${windows.length === 1 ? "" : "S"}` : "CLOSED"}</Text></View><Pressable onPress={() => windows.length ? setDraft((current) => ({ ...current, [key]: [] })) : add(key)} style={[styles.openPill, windows.length && styles.openPillActive]}><Text style={[styles.openPillText, windows.length && styles.openPillTextActive]}>{windows.length ? "OPEN" : "CLOSED"}</Text></Pressable></View>
        {windows.map((window, index) => <View key={`${key}-${index}`} style={styles.hoursRow}>
          <TextInput value={window[0]} onChangeText={(text) => change(key, index, 0, text)} maxLength={5} placeholder="09:00" placeholderTextColor="#555" keyboardType="numbers-and-punctuation" style={styles.timeInput} />
          <Text style={styles.dash}>—</Text>
          <TextInput value={window[1]} onChangeText={(text) => change(key, index, 1, text)} maxLength={5} placeholder="17:00" placeholderTextColor="#555" keyboardType="numbers-and-punctuation" style={styles.timeInput} />
          <Pressable onPress={() => remove(key, index)} style={styles.remove}><Text style={styles.removeText}>×</Text></Pressable>
        </View>)}
        {windows.length ? <Pressable onPress={() => add(key)} style={styles.addWindow}><Text style={styles.addWindowText}>＋ ADD ANOTHER WINDOW</Text></Pressable> : null}
      </View>;
    })}
  </View>;
}

function BlockTime({ blocks, busy, onCreate, onDelete }) {
  const [label, setLabel] = useState("");
  const [dateValue, setDateValue] = useState("");
  const [startValue, setStartValue] = useState("");
  const [endValue, setEndValue] = useState("");
  const valid = /^\d{4}-\d{2}-\d{2}$/.test(dateValue) && validClock(startValue) && validClock(endValue) && endValue > startValue;
  const ordered = useMemo(() => [...(blocks || [])].sort((a, b) => String(a.start).localeCompare(String(b.start))), [blocks]);

  const submit = async () => {
    if (!valid || busy) return;
    const startAt = londonIsoFromLocal(dateValue, startValue);
    const endAt = londonIsoFromLocal(dateValue, endValue);
    if (!startAt || !endAt) return;
    const ok = await onCreate({ label: label.trim() || "Blocked Time", start_at: startAt, end_at: endAt });
    if (ok) { setLabel(""); setDateValue(""); setStartValue(""); setEndValue(""); }
  };

  return <View style={styles.managerCard}>
    <View><Text style={styles.sectionEyebrow}>TIME OFF & CLOSURES</Text><Text style={styles.sectionTitle}>Block Time</Text></View>
    <Text style={styles.managerCopy}>Add lunch, holidays, personal appointments or closures here. Overlapping customer slots are removed immediately.</Text>
    <TextInput value={label} onChangeText={setLabel} placeholder="Label — e.g. Lunch, Holiday" placeholderTextColor="#555" style={styles.blockInput} />
    <TextInput value={dateValue} onChangeText={setDateValue} maxLength={10} placeholder="YYYY-MM-DD" placeholderTextColor="#555" keyboardType="numbers-and-punctuation" style={styles.blockInput} />
    <View style={styles.blockRow}><TextInput value={startValue} onChangeText={setStartValue} maxLength={5} placeholder="Start 13:00" placeholderTextColor="#555" keyboardType="numbers-and-punctuation" style={[styles.blockInput, styles.blockHalf]} /><TextInput value={endValue} onChangeText={setEndValue} maxLength={5} placeholder="End 14:00" placeholderTextColor="#555" keyboardType="numbers-and-punctuation" style={[styles.blockInput, styles.blockHalf]} /></View>
    <Pressable disabled={!valid || busy} onPress={submit} style={[styles.blockButton, (!valid || busy) && styles.disabled]}><Text style={styles.blockButtonText}>{busy ? "SAVING…" : "BLOCK THIS TIME"}</Text></Pressable>
    <Text style={styles.subLabel}>BLOCKED PERIODS</Text>
    {ordered.length ? ordered.map((block) => <View key={block.id || `${block.start}-${block.end}`} style={styles.blockItem}><View style={{ flex: 1 }}><Text style={styles.blockTitle}>{block.label || "Blocked Time"}</Text><Text style={styles.blockMeta}>{formatDate(block.start)} · {formatTime(block.start)}–{formatTime(block.end)}</Text></View>{block.id ? <Pressable disabled={busy} onPress={() => Alert.alert("Remove Blocked Time?", "This will make the time available for booking again if it falls inside your working hours.", [{ text: "Keep", style: "cancel" }, { text: "Remove", style: "destructive", onPress: () => onDelete(block.id) }])} style={styles.removeBlock}><Text style={styles.removeBlockText}>REMOVE</Text></Pressable> : null}</View>) : <Text style={styles.emptyLine}>No blocked time added yet.</Text>}
  </View>;
}

export default function AdminSchedulePanel({ visible, token, apiUrl, onClose }) {
  const [section, setSection] = useState("diary");
  const [view, setView] = useState("week");
  const [startDate, setStartDate] = useState(isoLocalDate());
  const [bookings, setBookings] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [actionBusy, setActionBusy] = useState("");
  const [error, setError] = useState("");

  const request = useCallback(async (path, options = {}) => {
    const response = await fetch(`${apiUrl}${path}`, { ...options, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...(options.headers || {}) } });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.detail || "Schedule could not be updated.");
    return data;
  }, [apiUrl, token]);

  const loadDiary = useCallback(async () => {
    if (!visible || !token || !apiUrl || section !== "diary") return;
    const days = view === "day" ? 1 : view === "week" ? 7 : 31;
    setLoading(true); setError("");
    try {
      const data = await request(`/api/admin/bookings?start_date=${startDate}&days=${days}`);
      setBookings(data.bookings || []);
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  }, [visible, token, apiUrl, section, view, startDate, request]);

  const loadSettings = useCallback(async () => {
    if (!visible || !token || !apiUrl) return;
    try {
      const data = await request("/api/admin/settings");
      setSettings(data.settings || null);
    } catch (err) { setError(err.message); }
  }, [visible, token, apiUrl, request]);

  useEffect(() => { loadSettings(); }, [loadSettings]);
  useEffect(() => { loadDiary(); }, [loadDiary]);

  const changeView = (next) => { setView(next); setStartDate(isoLocalDate()); };
  const move = (direction) => { const jump = view === "day" ? 1 : view === "week" ? 7 : 31; setStartDate((current) => shiftDate(current, direction * jump)); };

  const updateStatus = async (booking, status) => {
    if (!booking?.id || actionBusy) return;
    setActionBusy(booking.id); setError("");
    try { await request(`/api/admin/bookings/${booking.id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }); await loadDiary(); }
    catch (err) { setError(err.message); } finally { setActionBusy(""); }
  };

  const saveHours = async (weeklyHours) => {
    if (saving) return false;
    setSaving(true); setError("");
    try { const data = await request("/api/admin/settings", { method: "PUT", body: JSON.stringify({ weekly_hours: weeklyHours }) }); setSettings(data.settings || settings); return true; }
    catch (err) { setError(err.message); return false; } finally { setSaving(false); }
  };

  const createBlock = async (payload) => {
    if (saving) return false;
    setSaving(true); setError("");
    try { const data = await request("/api/admin/blocked-time", { method: "POST", body: JSON.stringify(payload) }); setSettings(data.settings || settings); return true; }
    catch (err) { setError(err.message); return false; } finally { setSaving(false); }
  };

  const deleteBlock = async (id) => {
    if (!id || saving) return;
    setSaving(true); setError("");
    try { const data = await request(`/api/admin/blocked-time/${id}`, { method: "DELETE" }); setSettings(data.settings || settings); }
    catch (err) { setError(err.message); } finally { setSaving(false); }
  };

  return <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
    <View style={styles.screen}>
      <View style={styles.header}><View><Text style={styles.eyebrow}>QUINCYFADEZ ADMIN</Text><Text style={styles.title}>Schedule</Text></View><Pressable onPress={onClose} style={styles.close}><Text style={styles.closeText}>×</Text></Pressable></View>
      <View style={styles.sectionTabs}>{[["diary", "DIARY"], ["hours", "WORKING HOURS"], ["blocks", "BLOCK TIME"]].map(([key, label]) => <Pressable key={key} onPress={() => setSection(key)} style={[styles.sectionTab, section === key && styles.sectionTabActive]}><Text style={[styles.sectionTabText, section === key && styles.sectionTabTextActive]}>{label}</Text></Pressable>)}</View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {section === "diary" ? <Text style={styles.intro}>Your confirmed diary stays separate from pending booking requests. Move through Day, Week or Agenda without mixing the two.</Text> : null}
        {section === "hours" ? <Text style={styles.intro}>Set your normal week here. Customer availability updates from these real working hours.</Text> : null}
        {section === "blocks" ? <Text style={styles.intro}>Manage exceptions to your normal week without changing your regular working hours.</Text> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {loading && section === "diary" ? <View style={styles.loading}><ActivityIndicator color={GOLD_LIGHT} /><Text style={styles.loadingText}>LOADING DIARY…</Text></View> : null}
        {section === "diary" ? <ScheduleDiary bookings={bookings} view={view} startDate={startDate} onViewChange={changeView} onMove={move} onToday={() => setStartDate(isoLocalDate())} renderBooking={(booking) => <DiaryBooking key={booking.id} booking={booking} busy={actionBusy} onAction={updateStatus} />} /> : null}
        {section === "hours" ? <WorkingHours value={settings?.weekly_hours || {}} busy={saving} onSave={saveHours} /> : null}
        {section === "blocks" ? <BlockTime blocks={settings?.blocked_periods || []} busy={saving} onCreate={createBlock} onDelete={deleteBlock} /> : null}
      </ScrollView>
    </View>
  </Modal>;
}

const styles = StyleSheet.create({
  screen:{flex:1,backgroundColor:BG},header:{minHeight:78,paddingHorizontal:18,borderBottomWidth:1,borderBottomColor:"#191919",flexDirection:"row",alignItems:"center",justifyContent:"space-between"},eyebrow:{color:GOLD,fontSize:7,letterSpacing:1.6,fontWeight:"900"},title:{color:"#F4F4F4",fontSize:22,fontWeight:"750",marginTop:4},close:{width:40,height:40,borderRadius:20,borderWidth:1,borderColor:BORDER,backgroundColor:PANEL,alignItems:"center",justifyContent:"center"},closeText:{color:GOLD_LIGHT,fontSize:24},sectionTabs:{marginHorizontal:18,marginTop:12,flexDirection:"row",gap:5,borderRadius:14,borderWidth:1,borderColor:BORDER,backgroundColor:"#090909",padding:4},sectionTab:{flex:1,minHeight:40,borderRadius:10,alignItems:"center",justifyContent:"center"},sectionTabActive:{backgroundColor:"#181207",borderWidth:1,borderColor:"#51401F"},sectionTabText:{color:"#666",fontSize:6,letterSpacing:.75,fontWeight:"900"},sectionTabTextActive:{color:GOLD_LIGHT},content:{paddingHorizontal:18,paddingBottom:42},intro:{color:"#929292",fontSize:10.5,lineHeight:17,marginTop:18},error:{color:"#E5A29A",fontSize:9.5,lineHeight:15,marginTop:10},loading:{height:42,marginTop:10,borderRadius:12,borderWidth:1,borderColor:"#2D281F",backgroundColor:"#0C0A07",flexDirection:"row",alignItems:"center",justifyContent:"center",gap:8},loadingText:{color:"#9A845C",fontSize:7,letterSpacing:1.1,fontWeight:"900"},bookingCard:{marginTop:9,borderRadius:14,borderWidth:1,borderColor:"#222",backgroundColor:"#090909",padding:11},bookingMain:{flexDirection:"row",alignItems:"center",gap:11},timeBlock:{width:52},time:{color:GOLD_LIGHT,fontSize:14,fontWeight:"900"},duration:{color:"#70654F",fontSize:6.2,marginTop:4},bookingCopy:{flex:1},name:{color:"#EFEFEF",fontSize:12,fontWeight:"750"},service:{color:"#A2A2A2",fontSize:8.5,marginTop:3},meta:{color:"#6E6250",fontSize:7,marginTop:4},actions:{flexDirection:"row",gap:6,marginTop:10,paddingTop:9,borderTopWidth:1,borderTopColor:"#1B1B1B"},primary:{flex:1,minHeight:34,borderRadius:10,backgroundColor:GOLD,alignItems:"center",justifyContent:"center"},primaryText:{color:"#090909",fontSize:6.3,fontWeight:"900",letterSpacing:.6},secondary:{flex:1,minHeight:34,borderRadius:10,borderWidth:1,borderColor:"#353535",alignItems:"center",justifyContent:"center"},secondaryText:{color:"#A8A8A8",fontSize:6.3,fontWeight:"900",letterSpacing:.6},danger:{flex:1,minHeight:34,borderRadius:10,borderWidth:1,borderColor:"#57302A",backgroundColor:"#130A09",alignItems:"center",justifyContent:"center"},dangerText:{color:"#D48F83",fontSize:6.3,fontWeight:"900",letterSpacing:.6},disabled:{opacity:.45},managerCard:{marginTop:14,borderRadius:20,borderWidth:1,borderColor:"#2B261D",backgroundColor:"#0A0907",padding:15},managerHead:{flexDirection:"row",alignItems:"flex-start",justifyContent:"space-between",gap:12},sectionEyebrow:{color:GOLD,fontSize:7,letterSpacing:1.4,fontWeight:"900"},sectionTitle:{color:"#F0F0F0",fontSize:18,fontWeight:"750",marginTop:5},managerCopy:{color:"#8C8C8C",fontSize:9.5,lineHeight:15,marginTop:8,marginBottom:7},saveButton:{borderRadius:12,backgroundColor:GOLD,paddingHorizontal:12,paddingVertical:9},saveText:{color:"#090909",fontSize:6.5,letterSpacing:.8,fontWeight:"900"},dayCard:{marginTop:9,borderRadius:14,borderWidth:1,borderColor:"#222",backgroundColor:PANEL,padding:12},dayTop:{flexDirection:"row",alignItems:"center",justifyContent:"space-between"},dayName:{color:"#EDEDED",fontSize:12,fontWeight:"750"},dayMeta:{color:"#6F6658",fontSize:6,letterSpacing:.65,fontWeight:"900",marginTop:4},openPill:{borderRadius:11,borderWidth:1,borderColor:"#333",paddingHorizontal:9,paddingVertical:6},openPillActive:{borderColor:"#55411F",backgroundColor:"#171107"},openPillText:{color:"#777",fontSize:6,fontWeight:"900"},openPillTextActive:{color:GOLD_LIGHT},hoursRow:{flexDirection:"row",alignItems:"center",gap:7,marginTop:9},timeInput:{flex:1,minHeight:42,borderRadius:10,borderWidth:1,borderColor:"#2B2B2B",backgroundColor:"#090909",color:"#EFEFEF",fontSize:11,fontWeight:"750",textAlign:"center"},dash:{color:"#666"},remove:{width:28,height:40,alignItems:"center",justifyContent:"center"},removeText:{color:"#C47B70",fontSize:18},addWindow:{paddingVertical:9,marginTop:3},addWindowText:{color:"#A88A54",fontSize:6.2,letterSpacing:.8,fontWeight:"900"},blockInput:{minHeight:47,borderRadius:11,borderWidth:1,borderColor:"#292929",backgroundColor:"#0B0B0B",color:"#EFEFEF",fontSize:9.5,paddingHorizontal:11,marginTop:8},blockRow:{flexDirection:"row",gap:8},blockHalf:{flex:1},blockButton:{minHeight:48,borderRadius:12,backgroundColor:GOLD,alignItems:"center",justifyContent:"center",marginTop:9},blockButtonText:{color:"#090909",fontSize:7,letterSpacing:.9,fontWeight:"900"},subLabel:{color:"#7E6A48",fontSize:6.5,letterSpacing:1.2,fontWeight:"900",marginTop:18},blockItem:{minHeight:64,borderRadius:12,borderWidth:1,borderColor:"#232323",backgroundColor:"#0C0C0C",paddingHorizontal:11,marginTop:8,flexDirection:"row",alignItems:"center",gap:10},blockTitle:{color:"#EAEAEA",fontSize:11,fontWeight:"750"},blockMeta:{color:"#777",fontSize:7.2,marginTop:4},removeBlock:{borderRadius:9,borderWidth:1,borderColor:"#4B2B27",paddingHorizontal:8,paddingVertical:7},removeBlockText:{color:"#CF8175",fontSize:5.8,letterSpacing:.6,fontWeight:"900"},emptyLine:{color:"#777",fontSize:9.5,paddingVertical:24,textAlign:"center"},
});