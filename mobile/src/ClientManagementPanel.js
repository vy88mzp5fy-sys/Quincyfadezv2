import React, { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const GOLD = "#C99B4A";
const GOLD_LIGHT = "#E7C77A";
const PANEL = "#0D0D0D";
const BORDER = "#242424";
const MUTED = "#858585";
const API_URL = (process.env.EXPO_PUBLIC_API_URL || "").replace(/\/$/, "");
const TOKEN_KEY = "quincyfadez.adminToken";

const QUICK_TAGS = ["Regular", "VIP", "New", "Late Risk", "No-Show Risk", "Prefers Quiet"];
const BLOCK_REASONS = ["Repeated No-Shows", "Late Cancellations", "Payment Issue", "Booking Misuse"];

function cleanTags(tags) {
  return Array.from(new Set((tags || []).map((tag) => String(tag || "").trim()).filter(Boolean))).slice(0, 20);
}

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
}

function formatTime(value) {
  if (!value) return "—";
  return new Date(value).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false });
}

function money(value) {
  const number = Number(value || 0);
  return `£${number.toFixed(number % 1 ? 2 : 0)}`;
}

export default function ClientManagementPanel({ client, busy, onUpdate }) {
  const [tags, setTags] = useState(cleanTags(client?.tags));
  const [customTag, setCustomTag] = useState("");
  const [blockReason, setBlockReason] = useState(client?.block_reason || "");
  const [dirty, setDirty] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);
  const [appointmentBusy, setAppointmentBusy] = useState("");
  const [appointmentError, setAppointmentError] = useState("");

  useEffect(() => {
    setTags(cleanTags(client?.tags));
    setBlockReason(client?.block_reason || "");
    setCustomTag("");
    setDirty(false);
  }, [client?.client_key, client?.tags, client?.block_reason, client?.blocked]);

  const loadAppointments = async () => {
    if (!client?.client_key || !API_URL) return;
    setAppointmentsLoading(true);
    setAppointmentError("");
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      if (!token) throw new Error("Admin session is not available.");
      const response = await fetch(`${API_URL}/api/admin/clients/${encodeURIComponent(client.client_key)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.detail || "Appointments could not be loaded.");
      setAppointments(data.upcoming || []);
    } catch (err) {
      setAppointmentError(err.message);
    } finally {
      setAppointmentsLoading(false);
    }
  };

  useEffect(() => { loadAppointments(); }, [client?.client_key]);

  const tagSet = useMemo(() => new Set(tags.map((tag) => tag.toLowerCase())), [tags]);
  const toggleTag = (tag) => {
    setTags((current) => {
      const exists = current.some((item) => item.toLowerCase() === tag.toLowerCase());
      return exists ? current.filter((item) => item.toLowerCase() !== tag.toLowerCase()) : cleanTags([...current, tag]);
    });
    setDirty(true);
  };

  const addCustomTag = () => {
    const next = customTag.trim();
    if (!next || tagSet.has(next.toLowerCase())) return;
    setTags((current) => cleanTags([...current, next]));
    setCustomTag("");
    setDirty(true);
  };

  const saveTags = async () => {
    if (!dirty || busy) return;
    const ok = await onUpdate({ tags });
    if (ok) setDirty(false);
  };

  const clearTags = () => {
    if (!tags.length || busy) return;
    Alert.alert("Clear Client Tags?", "This removes all private tags from this client.", [
      { text: "Keep Tags", style: "cancel" },
      { text: "Clear Tags", style: "destructive", onPress: async () => { setTags([]); setDirty(false); await onUpdate({ tags: [] }); } },
    ]);
  };

  const requestBlockChange = () => {
    if (busy) return;
    if (client?.blocked) {
      Alert.alert(
        "Unblock Client?",
        "This will allow this client to make new online bookings again.",
        [
          { text: "Keep Blocked", style: "cancel" },
          { text: "Unblock", onPress: () => onUpdate({ blocked: false, block_reason: "" }) },
        ],
      );
      return;
    }

    const reason = blockReason.trim();
    Alert.alert(
      "Block Online Booking?",
      "This stops new online bookings and reschedules for this client. Existing appointments are not cancelled automatically.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Block Client", style: "destructive", onPress: () => onUpdate({ blocked: true, block_reason: reason || "Blocked By Barber" }) },
      ],
    );
  };

  const runAppointmentAction = async (booking, status) => {
    if (!booking?.id || appointmentBusy || busy) return;
    const actionName = status === "confirmed" ? "Approve" : status === "completed" ? "Complete" : status === "no_show" ? "Mark No-Show" : "Cancel";
    const perform = async () => {
      setAppointmentBusy(booking.id);
      setAppointmentError("");
      try {
        const token = await AsyncStorage.getItem(TOKEN_KEY);
        if (!token) throw new Error("Admin session is not available.");
        const response = await fetch(`${API_URL}/api/admin/bookings/${booking.id}/status`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ status }),
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.detail || "Appointment could not be updated.");
        await loadAppointments();
        await onUpdate({});
      } catch (err) {
        setAppointmentError(err.message);
      } finally {
        setAppointmentBusy("");
      }
    };

    if (status === "completed" || status === "confirmed") {
      await perform();
      return;
    }
    Alert.alert(`${actionName} Appointment?`, status === "no_show" ? "This records the client as a no-show and releases the slot." : "This cancels the appointment and releases the slot.", [
      { text: "Keep Appointment", style: "cancel" },
      { text: actionName, style: "destructive", onPress: perform },
    ]);
  };

  const completed = Number(client?.completed_count || 0);
  const noShows = Number(client?.no_show_count || 0);
  const cancelled = Number(client?.cancelled_count || 0);
  const reliability = noShows >= 2 ? "Needs Attention" : noShows === 1 || cancelled >= 3 ? "Watch" : completed >= 3 ? "Reliable" : "Building History";

  return <View style={styles.card}>
    <View style={styles.header}>
      <View style={styles.headerCopy}>
        <Text style={styles.eyebrow}>MANAGEMENT</Text>
        <Text style={styles.title}>Client Controls</Text>
      </View>
      <View style={[styles.statusPill, client?.blocked && styles.statusPillBlocked]}>
        <Text style={[styles.statusText, client?.blocked && styles.statusTextBlocked]}>{client?.blocked ? "BLOCKED" : "ACTIVE"}</Text>
      </View>
    </View>

    <View style={styles.reliabilityCard}>
      <View><Text style={styles.sectionLabelNoMargin}>CLIENT RELIABILITY</Text><Text style={styles.reliabilityValue}>{reliability}</Text></View>
      <View style={styles.reliabilityStats}><Text style={styles.reliabilityStat}>{completed} Completed</Text><Text style={styles.reliabilityStat}>{noShows} No-Shows</Text><Text style={styles.reliabilityStat}>{cancelled} Cancelled</Text></View>
    </View>

    {client?.blocked ? <View style={styles.blockedBanner}>
      <Text style={styles.blockedTitle}>Online Booking Blocked</Text>
      <Text style={styles.blockedText}>{client.block_reason || "No reason saved."}</Text>
      <Text style={styles.blockedMeta}>Existing appointments stay in the schedule unless you cancel them separately.</Text>
    </View> : null}

    <Text style={styles.sectionLabel}>CLIENT TAGS</Text>
    <Text style={styles.help}>Use tags to spot important client context quickly. They are private and only visible in Admin.</Text>
    <View style={styles.tagsWrap}>
      {QUICK_TAGS.map((tag) => {
        const active = tagSet.has(tag.toLowerCase());
        return <Pressable key={tag} disabled={busy} onPress={() => toggleTag(tag)} style={[styles.tag, active && styles.tagActive]}>
          <Text style={[styles.tagText, active && styles.tagTextActive]}>{active ? "✓ " : ""}{tag}</Text>
        </Pressable>;
      })}
    </View>

    {tags.filter((tag) => !QUICK_TAGS.some((quick) => quick.toLowerCase() === tag.toLowerCase())).length ? <View style={styles.customTagsWrap}>
      {tags.filter((tag) => !QUICK_TAGS.some((quick) => quick.toLowerCase() === tag.toLowerCase())).map((tag) => <Pressable key={tag} onPress={() => toggleTag(tag)} style={[styles.tag, styles.tagActive]}><Text style={[styles.tagText, styles.tagTextActive]}>× {tag}</Text></Pressable>)}
    </View> : null}

    <View style={styles.customRow}>
      <TextInput value={customTag} onChangeText={setCustomTag} maxLength={28} placeholder="Add Custom Tag" placeholderTextColor="#555" style={styles.input} onSubmitEditing={addCustomTag} returnKeyType="done" />
      <Pressable disabled={!customTag.trim() || busy} onPress={addCustomTag} style={[styles.addButton, (!customTag.trim() || busy) && styles.disabled]}><Text style={styles.addButtonText}>ADD</Text></Pressable>
    </View>
    <View style={styles.tagSaveRow}><Pressable disabled={!dirty || busy} onPress={saveTags} style={[styles.saveButton, styles.tagSaveMain, (!dirty || busy) && styles.disabled]}><Text style={styles.saveButtonText}>{busy ? "SAVING…" : dirty ? "SAVE CLIENT TAGS" : "TAGS SAVED"}</Text></Pressable>{tags.length ? <Pressable disabled={busy} onPress={clearTags} style={styles.clearButton}><Text style={styles.clearButtonText}>CLEAR</Text></Pressable> : null}</View>

    <View style={styles.divider} />
    <Text style={styles.sectionLabel}>BOOKING ACCESS</Text>
    <Text style={styles.help}>Blocking is for clients you do not want making new bookings through the app. It does not erase their history.</Text>
    {!client?.blocked ? <><View style={styles.reasonChips}>{BLOCK_REASONS.map((reason) => <Pressable key={reason} disabled={busy} onPress={() => setBlockReason(reason)} style={[styles.reasonChip, blockReason === reason && styles.reasonChipActive]}><Text style={[styles.reasonChipText, blockReason === reason && styles.reasonChipTextActive]}>{reason}</Text></Pressable>)}</View><TextInput value={blockReason} onChangeText={setBlockReason} maxLength={300} multiline placeholder="Optional Private Reason — e.g. Repeated No-Shows" placeholderTextColor="#555" style={[styles.input, styles.reasonInput]} /></> : null}
    <Pressable disabled={busy} onPress={requestBlockChange} style={[styles.accessButton, client?.blocked ? styles.unblockButton : styles.blockButton, busy && styles.disabled]}>
      <Text style={[styles.accessButtonText, client?.blocked ? styles.unblockText : styles.blockText]}>{busy ? "UPDATING…" : client?.blocked ? "UNBLOCK ONLINE BOOKING" : "BLOCK ONLINE BOOKING"}</Text>
    </Pressable>

    <View style={styles.divider} />
    <View style={styles.appointmentHeader}><View><Text style={styles.sectionLabelNoMargin}>APPOINTMENT MANAGEMENT</Text><Text style={styles.help}>Manage this client’s upcoming bookings without leaving their profile.</Text></View><Pressable disabled={appointmentsLoading || appointmentBusy} onPress={loadAppointments} style={styles.refreshButton}><Text style={styles.refreshText}>{appointmentsLoading ? "…" : "REFRESH"}</Text></Pressable></View>
    {appointmentError ? <Text style={styles.errorText}>{appointmentError}</Text> : null}
    {appointmentsLoading && !appointments.length ? <Text style={styles.emptyText}>Loading appointments…</Text> : null}
    {!appointmentsLoading && !appointments.length ? <Text style={styles.emptyText}>No upcoming appointments.</Text> : null}
    {appointments.map((booking) => {
      const status = booking.status || "confirmed";
      const isBusy = appointmentBusy === booking.id;
      return <View key={booking.id} style={styles.appointmentCard}>
        <View style={styles.appointmentTop}><View style={styles.appointmentCopy}><Text style={styles.appointmentService}>{booking.service || "Appointment"}</Text><Text style={styles.appointmentMeta}>{formatDate(booking.start_at)} · {formatTime(booking.start_at)} · {money(booking.price)}</Text></View><View style={[styles.appointmentStatus, status === "pending" && styles.appointmentStatusPending]}><Text style={styles.appointmentStatusText}>{status.toUpperCase()}</Text></View></View>
        <View style={styles.appointmentActions}>
          {status === "pending" ? <Pressable disabled={isBusy} onPress={() => runAppointmentAction(booking, "confirmed")} style={[styles.actionPrimary, isBusy && styles.disabled]}><Text style={styles.actionPrimaryText}>{isBusy ? "…" : "APPROVE"}</Text></Pressable> : null}
          {status === "confirmed" ? <Pressable disabled={isBusy} onPress={() => runAppointmentAction(booking, "completed")} style={[styles.actionPrimary, isBusy && styles.disabled]}><Text style={styles.actionPrimaryText}>{isBusy ? "…" : "COMPLETE"}</Text></Pressable> : null}
          {status === "confirmed" ? <Pressable disabled={isBusy} onPress={() => runAppointmentAction(booking, "no_show")} style={[styles.actionNeutral, isBusy && styles.disabled]}><Text style={styles.actionNeutralText}>NO-SHOW</Text></Pressable> : null}
          {(status === "pending" || status === "confirmed") ? <Pressable disabled={isBusy} onPress={() => runAppointmentAction(booking, "cancelled")} style={[styles.actionDanger, isBusy && styles.disabled]}><Text style={styles.actionDangerText}>{status === "pending" ? "DECLINE" : "CANCEL"}</Text></Pressable> : null}
        </View>
      </View>;
    })}
  </View>;
}

const styles = StyleSheet.create({
  card:{marginTop:14,borderRadius:19,borderWidth:1,borderColor:"#2D281F",backgroundColor:"#0B0A08",padding:16},
  header:{flexDirection:"row",alignItems:"flex-start",justifyContent:"space-between",gap:12},headerCopy:{flex:1},eyebrow:{color:GOLD,fontSize:7.5,letterSpacing:1.6,fontWeight:"900"},title:{color:"#F0F0F0",fontSize:18,fontWeight:"700",marginTop:5},
  statusPill:{borderRadius:13,borderWidth:1,borderColor:"#3E452F",backgroundColor:"#0E130B",paddingHorizontal:9,paddingVertical:6},statusPillBlocked:{borderColor:"#5D2D27",backgroundColor:"#160B09"},statusText:{color:"#91A76D",fontSize:6.3,letterSpacing:.9,fontWeight:"900"},statusTextBlocked:{color:"#D98778"},
  reliabilityCard:{marginTop:13,borderRadius:14,borderWidth:1,borderColor:"#29251D",backgroundColor:"#0E0C08",padding:13,flexDirection:"row",alignItems:"center",justifyContent:"space-between",gap:12},sectionLabelNoMargin:{color:"#8C744A",fontSize:6.8,letterSpacing:1.3,fontWeight:"900"},reliabilityValue:{color:"#EFE6D7",fontSize:13,fontWeight:"800",marginTop:5},reliabilityStats:{alignItems:"flex-end",gap:3},reliabilityStat:{color:"#766B5B",fontSize:7},
  blockedBanner:{marginTop:13,borderRadius:14,borderWidth:1,borderColor:"#502B27",backgroundColor:"#130A09",padding:13},blockedTitle:{color:"#E4A095",fontSize:11,fontWeight:"800"},blockedText:{color:"#C98B82",fontSize:9,marginTop:5},blockedMeta:{color:"#7D625E",fontSize:7.5,lineHeight:12,marginTop:7},
  sectionLabel:{color:"#8C744A",fontSize:6.8,letterSpacing:1.3,fontWeight:"900",marginTop:17},help:{color:MUTED,fontSize:8.8,lineHeight:14,marginTop:6},tagsWrap:{flexDirection:"row",flexWrap:"wrap",gap:7,marginTop:11},customTagsWrap:{flexDirection:"row",flexWrap:"wrap",gap:7,marginTop:7},tag:{borderRadius:13,borderWidth:1,borderColor:BORDER,backgroundColor:PANEL,paddingHorizontal:10,paddingVertical:8},tagActive:{borderColor:"#5A4523",backgroundColor:"#171107"},tagText:{color:"#777",fontSize:7.3,fontWeight:"800"},tagTextActive:{color:GOLD_LIGHT},
  customRow:{flexDirection:"row",gap:8,marginTop:10},input:{flex:1,minHeight:46,borderRadius:12,borderWidth:1,borderColor:"#282828",backgroundColor:"#090909",paddingHorizontal:12,color:"#EFEFEF",fontSize:9.5},addButton:{width:62,borderRadius:12,backgroundColor:"#171107",borderWidth:1,borderColor:"#4D3B1E",alignItems:"center",justifyContent:"center"},addButtonText:{color:GOLD_LIGHT,fontSize:7,letterSpacing:.8,fontWeight:"900"},tagSaveRow:{flexDirection:"row",gap:8,marginTop:9},saveButton:{minHeight:44,borderRadius:12,backgroundColor:GOLD,alignItems:"center",justifyContent:"center"},tagSaveMain:{flex:1},saveButtonText:{color:"#090909",fontSize:7.5,letterSpacing:.9,fontWeight:"900"},clearButton:{width:70,borderRadius:12,borderWidth:1,borderColor:"#4D2B27",backgroundColor:"#130A09",alignItems:"center",justifyContent:"center"},clearButtonText:{color:"#D48F83",fontSize:7,letterSpacing:.8,fontWeight:"900"},
  divider:{height:1,backgroundColor:"#211D17",marginTop:18},reasonChips:{flexDirection:"row",flexWrap:"wrap",gap:6,marginTop:10},reasonChip:{borderRadius:12,borderWidth:1,borderColor:"#2B2B2B",backgroundColor:"#0B0B0B",paddingHorizontal:9,paddingVertical:7},reasonChipActive:{borderColor:"#5D2D27",backgroundColor:"#160B09"},reasonChipText:{color:"#747474",fontSize:6.7,fontWeight:"800"},reasonChipTextActive:{color:"#D99387"},reasonInput:{minHeight:78,marginTop:10,paddingTop:12,textAlignVertical:"top"},accessButton:{minHeight:48,borderRadius:13,alignItems:"center",justifyContent:"center",marginTop:10,borderWidth:1},blockButton:{borderColor:"#5D2D27",backgroundColor:"#160B09"},unblockButton:{borderColor:"#4D3B1E",backgroundColor:"#171107"},accessButtonText:{fontSize:7.5,letterSpacing:.9,fontWeight:"900"},blockText:{color:"#E09A8F"},unblockText:{color:GOLD_LIGHT},
  appointmentHeader:{marginTop:17,flexDirection:"row",alignItems:"flex-start",justifyContent:"space-between",gap:10},refreshButton:{borderRadius:11,borderWidth:1,borderColor:"#3A3020",paddingHorizontal:9,paddingVertical:7},refreshText:{color:GOLD_LIGHT,fontSize:6.2,letterSpacing:.7,fontWeight:"900"},appointmentCard:{marginTop:10,borderRadius:14,borderWidth:1,borderColor:"#242424",backgroundColor:"#0A0A0A",padding:12},appointmentTop:{flexDirection:"row",alignItems:"center",justifyContent:"space-between",gap:10},appointmentCopy:{flex:1},appointmentService:{color:"#EEEEEE",fontSize:11.5,fontWeight:"800"},appointmentMeta:{color:"#777",fontSize:7.5,marginTop:4},appointmentStatus:{borderRadius:11,borderWidth:1,borderColor:"#3A3020",paddingHorizontal:7,paddingVertical:5},appointmentStatusPending:{borderColor:"#6A4F20",backgroundColor:"#171005"},appointmentStatusText:{color:"#A78C58",fontSize:5.8,letterSpacing:.6,fontWeight:"900"},appointmentActions:{flexDirection:"row",gap:6,marginTop:10,paddingTop:10,borderTopWidth:1,borderTopColor:"#1E1E1E"},actionPrimary:{flex:1,minHeight:34,borderRadius:10,backgroundColor:GOLD,alignItems:"center",justifyContent:"center"},actionPrimaryText:{color:"#090909",fontSize:6.4,letterSpacing:.7,fontWeight:"900"},actionNeutral:{flex:1,minHeight:34,borderRadius:10,borderWidth:1,borderColor:"#333",alignItems:"center",justifyContent:"center"},actionNeutralText:{color:"#AAA",fontSize:6.2,letterSpacing:.6,fontWeight:"800"},actionDanger:{flex:1,minHeight:34,borderRadius:10,borderWidth:1,borderColor:"#56302A",backgroundColor:"#140B0A",alignItems:"center",justifyContent:"center"},actionDangerText:{color:"#D48F83",fontSize:6.2,letterSpacing:.6,fontWeight:"900"},emptyText:{color:"#777",fontSize:8.5,marginTop:12},errorText:{color:"#E5A29A",fontSize:8.5,lineHeight:13,marginTop:10},disabled:{opacity:.42},
});
