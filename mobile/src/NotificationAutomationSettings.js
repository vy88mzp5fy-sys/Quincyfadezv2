import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

const GOLD = "#D6BD7A";
const GOLD_LIGHT = "#F1DDA2";
const PANEL = "#0D0D0D";
const BORDER = "#242424";

const AUTOMATIONS = [
  { key: "booking_confirmed", title: "Booking Confirmed", meta: "Immediately after a booking is confirmed" },
  { key: "booking_reminder", title: "Booking Reminder", meta: "Remind clients before their appointment", timing: "hours" },
  { key: "rescheduled_booking", title: "Rescheduled Booking", meta: "Immediately after an appointment is moved" },
  { key: "booking_cancelled", title: "Booking Cancelled", meta: "Immediately after a booking is cancelled" },
  { key: "leave_a_review", title: "Leave A Review", meta: "Ask for a Google review after a completed visit", timing: "hours" },
  { key: "waiting_list_alert", title: "Waiting List Alerts", meta: "Tell waiting clients when a suitable slot opens", needsWaitingList: true },
  { key: "rebook_reminder", title: "Re-book Reminder", meta: "Bring clients back after their last visit", timing: "weeks" },
  { key: "lapsed_client_winback", title: "Lapsed Client Win-Back", meta: "Optional message for inactive clients", timing: "weeks" },
];

function Toggle({ value, disabled, onChange }) {
  return <Pressable disabled={disabled} onPress={() => onChange(!value)} style={[styles.toggle, value && styles.toggleOn, disabled && styles.disabled]}><View style={[styles.knob, value && styles.knobOn]} /></Pressable>;
}

function ChannelPill({ label, value, disabled, note, onChange }) {
  return <Pressable disabled={disabled} onPress={() => onChange(!value)} style={[styles.channel, value && styles.channelOn, disabled && styles.channelDisabled]}><Text style={[styles.channelText, value && styles.channelTextOn]}>{label}</Text>{note ? <Text style={styles.channelNote}>{note}</Text> : null}</Pressable>;
}

function Stepper({ value, suffix, min, max, onChange, disabled }) {
  const next = (delta) => onChange(Math.max(min, Math.min(max, Number(value || min) + delta)));
  return <View style={styles.stepper}><Pressable disabled={disabled || value <= min} onPress={() => next(-1)} style={styles.stepButton}><Text style={styles.stepText}>−</Text></Pressable><Text style={styles.stepValue}>{value}{suffix}</Text><Pressable disabled={disabled || value >= max} onPress={() => next(1)} style={styles.stepButton}><Text style={styles.stepText}>＋</Text></Pressable></View>;
}

function channelsFor(item) {
  if (item?.channels) return { push: Boolean(item.channels.push), sms: Boolean(item.channels.sms), email: Boolean(item.channels.email) };
  return { push: item?.channel === "push" || !item?.channel, sms: item?.channel === "sms", email: item?.channel === "email" };
}

export default function NotificationAutomationSettings({ automation = {}, saving, waitingListEnabled, onUpdate }) {
  return <View style={styles.group}>
    <Text style={styles.groupTitle}>NOTIFICATIONS & AUTOMATIONS</Text>
    <View style={styles.infoCard}><Text style={styles.infoTitle}>Choose What Clients Receive</Text><Text style={styles.infoText}>Push is the first live channel. SMS and Email controls are shown now but stay locked until their delivery services are connected and tested.</Text></View>
    <View style={styles.card}>
      {AUTOMATIONS.map((config, index) => {
        const item = automation[config.key] || {};
        const enabled = Boolean(item.enabled);
        const channels = channelsFor(item);
        const disabled = saving || (config.needsWaitingList && !waitingListEnabled);
        const updateChannel = (channel, value) => onUpdate(config.key, { channels: { ...channels, [channel]: value } });
        const timingValue = config.timing === "hours" ? Number(item.timing_hours ?? (config.key === "booking_reminder" ? 24 : 2)) : Number(item.timing_weeks ?? (config.key === "rebook_reminder" ? 3 : 8));
        return <View key={config.key} style={[styles.row, index < AUTOMATIONS.length - 1 && styles.border]}>
          <View style={styles.rowHead}><View style={styles.copy}><Text style={styles.name}>{config.title}</Text><Text style={styles.meta}>{config.needsWaitingList && !waitingListEnabled ? "Turn on Waiting List first" : config.meta}</Text></View><Toggle value={enabled} disabled={disabled} onChange={(value) => onUpdate(config.key, { enabled: value })} /></View>
          {enabled ? <>
            <View style={styles.channels}>
              <ChannelPill label="PUSH" value={channels.push} disabled={disabled} onChange={(value) => updateChannel("push", value)} />
              <ChannelPill label="SMS" value={channels.sms} disabled note="NOT CONNECTED" onChange={() => {}} />
              <ChannelPill label="EMAIL" value={channels.email} disabled note="NOT CONNECTED" onChange={() => {}} />
            </View>
            {config.timing ? <View style={styles.timing}><View><Text style={styles.timingLabel}>SEND TIMING</Text><Text style={styles.timingMeta}>{config.timing === "hours" ? "Hours from the relevant appointment event" : "Weeks after the last completed visit"}</Text></View><Stepper value={timingValue} suffix={config.timing === "hours" ? "h" : "w"} min={1} max={config.timing === "hours" ? 168 : 12} disabled={saving} onChange={(value) => onUpdate(config.key, config.timing === "hours" ? { timing_hours: value } : { timing_weeks: value })} /></View> : null}
          </> : null}
        </View>;
      })}
    </View>
  </View>;
}

const styles = StyleSheet.create({
  group: { marginTop: 20 },
  groupTitle: { color: GOLD, fontSize: 7.5, letterSpacing: 1.7, fontWeight: "900", marginBottom: 8 },
  infoCard: { borderRadius: 16, borderWidth: 1, borderColor: "#3A3020", backgroundColor: "#0B0906", padding: 14, marginBottom: 9 },
  infoTitle: { color: "#F1EEE8", fontSize: 12.5, fontWeight: "750" },
  infoText: { color: "#8F887D", fontSize: 8.5, lineHeight: 14, marginTop: 5 },
  card: { borderRadius: 18, borderWidth: 1, borderColor: BORDER, backgroundColor: PANEL, overflow: "hidden" },
  row: { paddingHorizontal: 15, paddingVertical: 14 },
  border: { borderBottomWidth: 1, borderBottomColor: "#1D1D1D" },
  rowHead: { flexDirection: "row", alignItems: "center", gap: 12 },
  copy: { flex: 1 },
  name: { color: "#ECECEC", fontSize: 12.5, fontWeight: "700" },
  meta: { color: "#777", fontSize: 8.5, lineHeight: 13, marginTop: 4 },
  toggle: { width: 42, height: 24, borderRadius: 12, backgroundColor: "#272727", padding: 3, justifyContent: "center" },
  toggleOn: { backgroundColor: GOLD },
  knob: { width: 18, height: 18, borderRadius: 9, backgroundColor: "#777" },
  knobOn: { backgroundColor: "#090909", alignSelf: "flex-end" },
  disabled: { opacity: .42 },
  channels: { flexDirection: "row", gap: 6, marginTop: 12 },
  channel: { flex: 1, minHeight: 43, borderRadius: 11, borderWidth: 1, borderColor: "#333", alignItems: "center", justifyContent: "center", paddingHorizontal: 4 },
  channelOn: { borderColor: "#6B582B", backgroundColor: "#171207" },
  channelDisabled: { opacity: .42 },
  channelText: { color: "#777", fontSize: 7, letterSpacing: .8, fontWeight: "900" },
  channelTextOn: { color: GOLD_LIGHT },
  channelNote: { color: "#666", fontSize: 4.8, letterSpacing: .35, marginTop: 3, fontWeight: "800" },
  timing: { marginTop: 11, paddingTop: 11, borderTopWidth: 1, borderTopColor: "#1D1D1D", flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  timingLabel: { color: "#8D7751", fontSize: 6.2, letterSpacing: 1, fontWeight: "900" },
  timingMeta: { color: "#666", fontSize: 6.8, marginTop: 3, maxWidth: 185 },
  stepper: { minWidth: 104, height: 34, borderRadius: 12, borderWidth: 1, borderColor: "#30291E", backgroundColor: "#0A0907", flexDirection: "row", alignItems: "center", justifyContent: "space-between", overflow: "hidden" },
  stepButton: { width: 32, height: 34, alignItems: "center", justifyContent: "center" },
  stepText: { color: GOLD_LIGHT, fontSize: 16, fontWeight: "700" },
  stepValue: { color: "#ECECEC", fontSize: 9, fontWeight: "800" },
});
