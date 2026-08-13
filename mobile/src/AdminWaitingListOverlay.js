import React, { useCallback, useEffect, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import AdminWaitingListPanel from "./AdminWaitingListPanel";
import AdminWaitingListSlotPicker from "./AdminWaitingListSlotPicker";

const GOLD = "#D6BD7A";
const GOLD_LIGHT = "#F1DDA2";

export default function AdminWaitingListOverlay({ apiUrl, token }) {
  const [visible, setVisible] = useState(false);
  const [slotPickerVisible, setSlotPickerVisible] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [entries, setEntries] = useState([]);
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState("");
  const [sending, setSending] = useState(false);

  const load = useCallback(async ({ quiet = false } = {}) => {
    if (!apiUrl || !token) {
      setEntries([]);
      return;
    }
    if (!quiet) setLoading(true);
    try {
      const response = await fetch(`${apiUrl}/api/admin/waiting-list?status=active`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) return;
      setEntries(data.entries || []);
      setEnabled(Boolean(data.enabled));
    } finally {
      if (!quiet) setLoading(false);
    }
  }, [apiUrl, token]);

  useEffect(() => {
    if (!token) return undefined;
    load({ quiet: true });
    const timer = setInterval(() => load({ quiet: true }), 30000);
    return () => clearInterval(timer);
  }, [load, token]);

  const open = async () => {
    setVisible(true);
    await load();
  };

  const remove = (entry) => {
    if (!entry?.id || busyId) return;
    const name = entry.client?.name || "this client";
    Alert.alert("Remove From Waiting List?", `This will remove ${name}'s active waiting-list request.`, [
      { text: "Keep Waiting", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          setBusyId(entry.id);
          try {
            const response = await fetch(`${apiUrl}/api/admin/waiting-list/${entry.id}/status`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
              body: JSON.stringify({ status: "cancelled" }),
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) throw new Error(data.detail || "Waiting-list request could not be removed.");
            setEntries((current) => current.filter((item) => item.id !== entry.id));
          } catch (error) {
            Alert.alert("Could Not Remove Client", error.message || "Please try again.");
          } finally {
            setBusyId("");
          }
        },
      },
    ]);
  };

  const findSlot = (entry) => {
    if (!entry?.id) return;
    setSelectedEntry(entry);
    setVisible(false);
    setSlotPickerVisible(true);
  };

  const sendSlotAlert = async (slot) => {
    if (!selectedEntry?.id || sending) return;
    setSending(true);
    try {
      const response = await fetch(`${apiUrl}/api/admin/waiting-list/${selectedEntry.id}/alert`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ service: selectedEntry.service, date: slot.date, time: slot.time }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.detail || "Waiting-list alert could not be sent.");
      setSlotPickerVisible(false);
      setSelectedEntry(null);
      await load({ quiet: true });
      Alert.alert("Slot Alert Sent", "The client has been notified about this matching available slot.");
    } catch (error) {
      Alert.alert("Could Not Send Alert", error.message || "Please try again.");
    } finally {
      setSending(false);
    }
  };

  if (!token) return null;

  return <>
    <Pressable accessibilityRole="button" accessibilityLabel={`${entries.length} clients on waiting list`} onPress={open} style={({ pressed }) => [styles.button, entries.length > 0 && styles.buttonActive, pressed && styles.pressed]}>
      <Text style={styles.icon}>⌛</Text>
      {entries.length > 0 ? <View style={styles.badge}><Text style={styles.badgeText}>{entries.length > 99 ? "99+" : entries.length}</Text></View> : null}
    </Pressable>
    <AdminWaitingListPanel visible={visible} enabled={enabled} entries={entries} loading={loading} busyId={busyId} onClose={() => setVisible(false)} onRefresh={() => load()} onOpenSchedule={findSlot} onRemove={remove} />
    <AdminWaitingListSlotPicker visible={slotPickerVisible} apiUrl={apiUrl} token={token} entry={selectedEntry} sending={sending} onClose={() => { if (!sending) { setSlotPickerVisible(false); setSelectedEntry(null); } }} onSend={sendSlotAlert} />
  </>;
}

const styles = StyleSheet.create({
  button:{position:"absolute",top:14,right:84,width:40,height:40,borderRadius:20,borderWidth:1,borderColor:"#343434",backgroundColor:"#0A0A0A",alignItems:"center",justifyContent:"center",zIndex:20},
  buttonActive:{borderColor:"#5A4523",backgroundColor:"#171107"},icon:{color:GOLD_LIGHT,fontSize:16},badge:{position:"absolute",top:-4,right:-4,minWidth:18,height:18,borderRadius:9,backgroundColor:GOLD,borderWidth:2,borderColor:"#050505",alignItems:"center",justifyContent:"center",paddingHorizontal:4},badgeText:{color:"#090909",fontSize:7,fontWeight:"900"},pressed:{opacity:.72,transform:[{scale:.97}]},
});
