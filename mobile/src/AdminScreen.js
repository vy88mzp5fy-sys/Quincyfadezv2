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

const GOLD = "#C99B4A";
const GOLD_LIGHT = "#E7C77A";
const BG = "#050505";
const PANEL = "#0D0D0D";
const BORDER = "#242424";
const MUTED = "#929292";
const API_URL = (process.env.EXPO_PUBLIC_API_URL || "").replace(/\/$/, "");
const TOKEN_KEY = "quincyfadez.adminToken";

const TABS = [
  { key: "home", icon: "⌂", label: "Home" },
  { key: "schedule", icon: "▦", label: "Schedule" },
  { key: "insights", icon: "↗", label: "Insights" },
  { key: "clients", icon: "◎", label: "Clients" },
  { key: "settings", icon: "⚙", label: "Settings" },
];

function money(value) {
  const number = Number(value || 0);
  return `£${number.toFixed(number % 1 ? 2 : 0)}`;
}

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
}

function formatTime(value) {
  if (!value) return "—";
  return new Date(value).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false });
}

function MetricCard({ label, value = "—", meta }) {
  return <View style={styles.metricCard}><Text style={styles.metricLabel}>{label}</Text><Text style={styles.metricValue}>{value}</Text>{meta ? <Text style={styles.metricMeta}>{meta}</Text> : null}</View>;
}

function Toggle({ value, onChange, disabled }) {
  return <Pressable disabled={disabled} onPress={() => onChange(!value)} style={[styles.toggle, value && styles.toggleOn, disabled && styles.disabled]}><View style={[styles.toggleKnob, value && styles.toggleKnobOn]} /></Pressable>;
}

function Stepper({ value, suffix = "", min = 0, max = 999, step = 1, onChange, disabled }) {
  const change = (delta) => onChange(Math.max(min, Math.min(max, Number(value || 0) + delta)));
  return <View style={styles.stepper}><Pressable disabled={disabled || Number(value || 0) <= min} onPress={() => change(-step)} style={styles.stepButton}><Text style={styles.stepText}>−</Text></Pressable><Text style={styles.stepValue}>{value}{suffix}</Text><Pressable disabled={disabled || Number(value || 0) >= max} onPress={() => change(step)} style={styles.stepButton}><Text style={styles.stepText}>＋</Text></Pressable></View>;
}

function SettingRow({ title, meta, control, last = false }) {
  return <View style={[styles.settingRow, !last && styles.settingBorder]}><View style={styles.settingCopy}><Text style={styles.settingName}>{title}</Text><Text style={styles.settingMeta}>{meta}</Text></View>{control}</View>;
}

function AppointmentCard({ booking, compact = false, onAction, actionBusy }) {
  const status = booking.status || "confirmed";
  const busy = actionBusy === booking.id;
  return (
    <View style={[styles.bookingCard, compact && styles.bookingCardCompact]}>
      <View style={styles.bookingMain}>
        <View style={styles.bookingTimeWrap}><Text style={styles.bookingTime}>{formatTime(booking.start_at)}</Text><Text style={styles.bookingDuration}>{booking.duration_minutes || 0} MIN</Text></View>
        <View style={styles.bookingCopy}><Text style={styles.bookingName}>{booking.customer_name || "Client"}</Text><Text style={styles.bookingService}>{booking.service}</Text><Text style={styles.bookingMeta}>{formatDate(booking.start_at)} · {money(booking.price)}</Text></View>
        <View style={[styles.statusPill, status === "pending" && styles.statusPending]}><Text style={styles.statusText}>{status.replace("_", " ").toUpperCase()}</Text></View>
      </View>
      {!compact && onAction && (status === "confirmed" || status === "pending") ? (
        <View style={styles.bookingActions}>
          {status === "pending" ? <Pressable disabled={busy} onPress={() => onAction(booking, "confirmed")} style={[styles.bookingActionPrimary, busy && styles.disabled]}><Text style={styles.bookingActionPrimaryText}>APPROVE</Text></Pressable> : <Pressable disabled={busy} onPress={() => onAction(booking, "completed")} style={[styles.bookingActionPrimary, busy && styles.disabled]}><Text style={styles.bookingActionPrimaryText}>COMPLETE</Text></Pressable>}
          {status === "confirmed" ? <Pressable disabled={busy} onPress={() => onAction(booking, "no_show")} style={[styles.bookingAction, busy && styles.disabled]}><Text style={styles.bookingActionText}>NO-SHOW</Text></Pressable> : null}
          <Pressable disabled={busy} onPress={() => onAction(booking, "cancelled")} style={[styles.bookingActionDanger, busy && styles.disabled]}><Text style={styles.bookingActionDangerText}>{status === "pending" ? "DECLINE" : "CANCEL"}</Text></Pressable>
        </View>
      ) : null}
    </View>
  );
}

function Login({ onLogin }) {
  const [pin, setPin] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const submit = async () => {
    if (!API_URL || pin.length < 4 || busy) return;
    setBusy(true); setError("");
    try {
      const response = await fetch(`${API_URL}/api/admin/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ pin }) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.detail || "Admin sign-in failed.");
      await AsyncStorage.setItem(TOKEN_KEY, data.token); onLogin(data.token);
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  };
  return <SafeAreaView style={styles.safeArea}><StatusBar barStyle="light-content" backgroundColor={BG} /><View style={styles.loginWrap}><View style={styles.loginMark}><Text style={styles.loginMarkText}>Q</Text></View><Text style={styles.loginEyebrow}>QUINCYFADEZ OWNER</Text><Text style={styles.loginTitle}>Barber Admin.</Text><Text style={styles.loginText}>Private access to bookings, clients, insights and your live schedule.</Text><View style={styles.pinCard}><Text style={styles.pinLabel}>ADMIN PIN</Text><TextInput value={pin} onChangeText={setPin} keyboardType="number-pad" secureTextEntry maxLength={12} placeholder="••••" placeholderTextColor="#555" style={styles.pinInput} onSubmitEditing={submit} /></View>{error ? <Text style={styles.errorText}>{error}</Text> : null}<Pressable disabled={busy || pin.length < 4 || !API_URL} onPress={submit} style={[styles.loginButton, (busy || pin.length < 4 || !API_URL) && styles.disabled]}>{busy ? <ActivityIndicator color="#090909" /> : <><Text style={styles.loginButtonText}>OPEN ADMIN</Text><Text style={styles.loginArrow}>›</Text></>}</Pressable><Text style={styles.securityNote}>Owner access is protected by a server-verified PIN and temporary secure session.</Text></View></SafeAreaView>;
}

function SettingsSection({ title, children }) {
  return <View style={styles.settingsGroup}><Text style={styles.settingsTitle}>{title}</Text><View style={styles.settingsCard}>{children}</View></View>;
}

export default function AdminScreen({ onExit }) {
  const [token, setToken] = useState("");
  const [checking, setChecking] = useState(true);
  const [tab, setTab] = useState("home");
  const [overview, setOverview] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [clients, setClients] = useState([]);
  const [clientSearch, setClientSearch] = useState("");
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [actionBusy, setActionBusy] = useState("");
  const [error, setError] = useState("");
  const [savedMessage, setSavedMessage] = useState("");

  const adminRequest = async (path, options = {}) => {
    const response = await fetch(`${API_URL}${path}`, { ...options, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...(options.headers || {}) } });
    const data = await response.json().catch(() => ({}));
    if (response.status === 401) { await AsyncStorage.removeItem(TOKEN_KEY); setToken(""); throw new Error("Admin session expired. Please sign in again."); }
    if (!response.ok) throw new Error(data.detail || "Admin data could not be loaded.");
    return data;
  };

  useEffect(() => { AsyncStorage.getItem(TOKEN_KEY).then((stored) => { if (stored) setToken(stored); }).finally(() => setChecking(false)); }, []);

  const loadTab = async () => {
    if (!token) return;
    setLoading(true); setError(""); setSavedMessage("");
    try {
      if (tab === "home" || tab === "insights") setOverview(await adminRequest("/api/admin/overview"));
      if (tab === "schedule") setBookings((await adminRequest("/api/admin/bookings?days=7")).bookings || []);
      if (tab === "clients") setClients((await adminRequest("/api/admin/clients")).clients || []);
      if (tab === "settings") setSettings((await adminRequest("/api/admin/settings")).settings || null);
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  useEffect(() => { loadTab(); }, [token, tab]);

  const logout = async () => {
    try { if (token) await fetch(`${API_URL}/api/admin/logout`, { method: "POST", headers: { Authorization: `Bearer ${token}` } }); } catch (_) {}
    await AsyncStorage.removeItem(TOKEN_KEY); setToken(""); setOverview(null); setBookings([]); setClients([]); setSettings(null);
  };

  const updateBookingStatus = async (booking, status) => {
    if (!booking?.id || actionBusy) return;
    setActionBusy(booking.id); setError("");
    try {
      await adminRequest(`/api/admin/bookings/${booking.id}/status`, { method: "PATCH", body: JSON.stringify({ status }) });
      await loadTab();
    } catch (err) { setError(err.message); } finally { setActionBusy(""); }
  };

  const saveSettings = async (patch) => {
    if (!token || saving) return;
    const optimistic = { ...(settings || {}), ...patch };
    if (patch.automations) optimistic.automations = { ...(settings?.automations || {}), ...patch.automations };
    if (patch.growth_settings) optimistic.growth_settings = { ...(settings?.growth_settings || {}), ...patch.growth_settings };
    setSettings(optimistic); setSaving(true); setError(""); setSavedMessage("");
    try {
      const data = await adminRequest("/api/admin/settings", { method: "PUT", body: JSON.stringify(patch) });
      setSettings(data.settings || optimistic); setSavedMessage("Saved"); setTimeout(() => setSavedMessage(""), 1600);
    } catch (err) { setError(err.message); await loadTab(); } finally { setSaving(false); }
  };

  const updateAutomation = (key, patch) => {
    const current = settings?.automations?.[key] || {};
    saveSettings({ automations: { [key]: { ...current, ...patch } } });
  };

  const filteredClients = useMemo(() => {
    const q = clientSearch.trim().toLowerCase();
    if (!q) return clients;
    return clients.filter((client) => [client.name, client.phone, client.email].some((value) => String(value || "").toLowerCase().includes(q)));
  }, [clients, clientSearch]);

  const body = useMemo(() => {
    if (tab === "home") {
      const next = overview?.next_booking;
      const appointments = overview?.appointments || [];
      return <><View style={styles.heroRow}><View style={styles.heroCopy}><Text style={styles.kicker}>BARBER DASHBOARD</Text><Text style={styles.heroTitle}>Your Day, At A Glance.</Text><Text style={styles.heroText}>Live business data, today’s appointments and the next thing that needs your attention.</Text></View><View style={styles.livePill}><View style={styles.liveDot} /><Text style={styles.liveText}>LIVE</Text></View></View><View style={styles.metricsGrid}><MetricCard label="TODAY'S REVENUE" value={money(overview?.today_revenue)} meta="Completed appointments" /><MetricCard label="TODAY'S BOOKINGS" value={String(overview?.today_bookings ?? 0)} meta="Today" /><MetricCard label="NEW CLIENTS" value={String(overview?.new_clients ?? 0)} meta="First-time clients" /><MetricCard label="UTILISATION" value={overview?.utilisation_percent == null ? "—" : `${overview.utilisation_percent}%`} meta="Booked working time" /></View>{Number(overview?.pending_requests || 0) > 0 ? <View style={styles.requestBanner}><View><Text style={styles.requestLabel}>BOOKING REQUESTS</Text><Text style={styles.requestTitle}>{overview.pending_requests} Awaiting Your Approval</Text></View><Pressable onPress={() => setTab("schedule")} style={styles.requestButton}><Text style={styles.requestButtonText}>REVIEW</Text></Pressable></View> : null}<View style={styles.focusCard}><View style={styles.sectionTopRow}><View><Text style={styles.sectionEyebrow}>NEXT UP</Text><Text style={styles.sectionTitle}>{next ? `${formatTime(next.start_at)} · ${next.customer_name || "Client"}` : "No Appointment Waiting"}</Text></View><Pressable onPress={loadTab} style={styles.smallPill}><Text style={styles.smallPillText}>REFRESH</Text></Pressable></View>{next ? <AppointmentCard booking={next} compact /> : <Text style={styles.emptyLine}>Your next confirmed booking will appear here automatically.</Text>}</View><View style={styles.focusCard}><View style={styles.sectionTopRow}><View><Text style={styles.sectionEyebrow}>TODAY</Text><Text style={styles.sectionTitle}>Today’s Schedule</Text></View><Text style={styles.mutedSmall}>{appointments.length} BOOKINGS</Text></View>{appointments.length ? appointments.slice(0, 5).map((item) => <AppointmentCard key={item.id} booking={item} />) : <Text style={styles.emptyLine}>No appointments to show yet.</Text>}</View></>;
    }

    if (tab === "schedule") return <><Text style={styles.kicker}>SCHEDULE</Text><Text style={styles.pageTitle}>Control Your Time.</Text><Text style={styles.pageText}>Your next seven days with fast owner actions for approvals, completed cuts, no-shows and cancellations.</Text><View style={styles.segmentRow}>{["DAY", "WEEK", "AGENDA"].map((x, i) => <View key={x} style={[styles.segment, i === 1 && styles.segmentActive]}><Text style={[styles.segmentText, i === 1 && styles.segmentTextActive]}>{x}</Text></View>)}</View><View style={styles.focusCard}><View style={styles.sectionTopRow}><View><Text style={styles.sectionEyebrow}>UPCOMING</Text><Text style={styles.sectionTitle}>Next 7 Days</Text></View><Text style={styles.mutedSmall}>{bookings.length} BOOKINGS</Text></View>{bookings.length ? bookings.map((item) => <AppointmentCard key={item.id} booking={item} onAction={updateBookingStatus} actionBusy={actionBusy} />) : <Text style={styles.emptyLine}>No appointments booked in this period.</Text>}</View><View style={styles.scheduleActions}><Pressable onPress={() => setTab("settings")} style={styles.actionRow}><View><Text style={styles.actionTitle}>Working Hours</Text><Text style={styles.actionMeta}>Set normal weekly availability</Text></View><Text style={styles.rowArrow}>›</Text></Pressable><Pressable onPress={() => setTab("settings")} style={styles.actionRow}><View><Text style={styles.actionTitle}>Block Time</Text><Text style={styles.actionMeta}>Breaks, holidays and closures</Text></View><Text style={styles.rowArrow}>›</Text></Pressable><Pressable onPress={() => setTab("settings")} style={styles.actionRow}><View><Text style={styles.actionTitle}>Booking Preferences</Text><Text style={styles.actionMeta}>Approval, notice, window and slot spacing</Text></View><Text style={styles.rowArrow}>›</Text></Pressable></View></>;

    if (tab === "insights") return <><Text style={styles.kicker}>INSIGHTS</Text><Text style={styles.pageTitle}>Know Your Business.</Text><Text style={styles.pageText}>No fake demo numbers. This area only shows data created by real QuincyFadez bookings.</Text><View style={styles.segmentRow}>{["DAY", "WEEK", "MONTH"].map((x, i) => <View key={x} style={[styles.segment, i === 1 && styles.segmentActive]}><Text style={[styles.segmentText, i === 1 && styles.segmentTextActive]}>{x}</Text></View>)}</View><View style={[styles.metricsGrid, { marginTop: 12 }]}><MetricCard label="TODAY'S REVENUE" value={money(overview?.today_revenue)} /><MetricCard label="TODAY'S BOOKINGS" value={String(overview?.today_bookings ?? 0)} /><MetricCard label="NEW CLIENTS" value={String(overview?.new_clients ?? 0)} /><MetricCard label="UTILISATION" value={overview?.utilisation_percent == null ? "—" : `${overview.utilisation_percent}%`} /></View><View style={styles.emptyCard}><Text style={styles.emptyEyebrow}>PERFORMANCE</Text><Text style={styles.emptyTitle}>{overview?.today_bookings ? "Insights Are Building" : "No Insights Yet"}</Text><Text style={styles.emptyText}>Revenue, bookings, average booking value, hours, utilisation, cancellations, no-shows and client retention will build from real activity.</Text></View></>;

    if (tab === "clients") return <><View style={styles.sectionTopRow}><View><Text style={styles.kicker}>CLIENTS</Text><Text style={styles.pageTitle}>Your Client Book.</Text></View><View style={styles.addCircle}><Text style={styles.addCircleText}>＋</Text></View></View><Text style={styles.pageText}>Search real client profiles, booking history and spend.</Text><View style={styles.searchShell}><Text style={styles.searchIcon}>⌕</Text><TextInput value={clientSearch} onChangeText={setClientSearch} placeholder="Search Name, Phone Or Email" placeholderTextColor="#666" style={styles.searchInput} /></View>{filteredClients.length ? filteredClients.map((client) => <View key={client.client_key} style={styles.clientCard}><View style={styles.clientAvatar}><Text style={styles.clientAvatarText}>{(client.name || "C").slice(0, 1).toUpperCase()}</Text></View><View style={styles.clientCopy}><Text style={styles.clientName}>{client.name || "Client"}</Text><Text style={styles.clientMeta}>{client.phone || client.email || "No contact saved"}</Text><Text style={styles.clientStats}>{client.booking_count || 0} BOOKINGS · {money(client.total_spend)} SPEND{client.regular ? " · REGULAR" : ""}</Text></View><Text style={styles.rowArrow}>›</Text></View>) : <View style={styles.emptyCard}><Text style={styles.emptyEyebrow}>CLIENT DIRECTORY</Text><Text style={styles.emptyTitle}>{clientSearch ? "No Matching Clients" : "No Clients Yet"}</Text><Text style={styles.emptyText}>{clientSearch ? "Try another name, number or email." : "Clients appear here automatically after their first in-app booking."}</Text></View>}</>;

    const automation = settings?.automations || {};
    return <><View style={styles.settingsHeader}><View><Text style={styles.kicker}>SETTINGS</Text><Text style={styles.pageTitle}>Run QuincyFadez Your Way.</Text></View>{saving ? <ActivityIndicator color={GOLD_LIGHT} /> : savedMessage ? <Text style={styles.savedText}>✓ SAVED</Text> : null}</View><Text style={styles.pageText}>Only useful controls for running the business — no filler settings.</Text>
      <SettingsSection title="PROFILE"><SettingRow title="Profile" meta="Business details and owner profile" control={<Text style={styles.rowArrow}>›</Text>} /><SettingRow title="Services" meta="Pricing, duration and service availability" control={<Text style={styles.rowArrow}>›</Text>} /><SettingRow title="Location" meta="Business address and map details" control={<Text style={styles.rowArrow}>›</Text>} /><SettingRow last title="Share Booking Link" meta="Copy or share your direct QuincyFadez booking link" control={<Text style={styles.rowArrow}>›</Text>} /></SettingsSection>
      <SettingsSection title="BOOKINGS"><SettingRow title="Schedule" meta="Working hours, breaks and blocked time" control={<Text style={styles.rowArrow}>›</Text>} /><SettingRow title="Slot Frequency" meta="How often appointment start times appear" control={<Stepper value={settings?.slot_interval_minutes ?? 15} suffix="m" min={5} max={60} step={5} disabled={saving} onChange={(value) => saveSettings({ slot_interval_minutes: value })} />} /><SettingRow title="Minimum Notice" meta="How close to an appointment clients can book" control={<Stepper value={settings?.minimum_notice_minutes ?? 60} suffix="m" min={0} max={1440} step={15} disabled={saving} onChange={(value) => saveSettings({ minimum_notice_minutes: value })} />} /><SettingRow title="Booking Horizon" meta="How far ahead clients can book" control={<Stepper value={settings?.booking_window_days ?? 60} suffix="d" min={7} max={365} step={7} disabled={saving} onChange={(value) => saveSettings({ booking_window_days: value })} />} /><SettingRow title="Booking Approval" meta="Require you to approve requests before they become confirmed" control={<Toggle value={Boolean(settings?.booking_approval_required)} disabled={saving} onChange={(value) => saveSettings({ booking_approval_required: value })} />} />{settings?.booking_approval_required ? <SettingRow title="Approval Expiry" meta="Automatically expire unanswered booking requests" control={<Stepper value={settings?.booking_approval_expiry_minutes ?? 30} suffix="m" min={5} max={1440} step={5} disabled={saving} onChange={(value) => saveSettings({ booking_approval_expiry_minutes: value })} />} /> : null}<SettingRow title="Waiting List" meta="Let clients join a list when suitable times are unavailable" control={<Toggle value={Boolean(settings?.waiting_list_enabled)} disabled={saving} onChange={(value) => saveSettings({ waiting_list_enabled: value })} />} /><SettingRow title="Cancellation Notice" meta="Minimum notice clients need to cancel in-app" control={<Stepper value={settings?.cancellation_notice_hours ?? 12} suffix="h" min={0} max={168} step={1} disabled={saving} onChange={(value) => saveSettings({ cancellation_notice_hours: value })} />} /><SettingRow last title="Reschedule Notice" meta="Minimum notice clients need to move a booking" control={<Stepper value={settings?.reschedule_notice_hours ?? 12} suffix="h" min={0} max={168} step={1} disabled={saving} onChange={(value) => saveSettings({ reschedule_notice_hours: value })} />} /></SettingsSection>
      <SettingsSection title="AUTOMATIONS"><SettingRow title="Booking Confirmed" meta="Automatic confirmation after a successful booking" control={<Toggle value={Boolean(automation.booking_confirmed?.enabled)} disabled={saving} onChange={(value) => updateAutomation("booking_confirmed", { enabled: value })} />} /><SettingRow title="Booking Reminder" meta={`${automation.booking_reminder?.timing_hours ?? 24} hours before the appointment`} control={<Toggle value={Boolean(automation.booking_reminder?.enabled)} disabled={saving} onChange={(value) => updateAutomation("booking_reminder", { enabled: value })} />} />{automation.booking_reminder?.enabled ? <SettingRow title="Reminder Timing" meta="Choose when the reminder is sent" control={<Stepper value={automation.booking_reminder?.timing_hours ?? 24} suffix="h" min={1} max={168} step={1} disabled={saving} onChange={(value) => updateAutomation("booking_reminder", { timing_hours: value })} />} /> : null}<SettingRow title="Rescheduled Booking" meta="Notify the client immediately after a booking moves" control={<Toggle value={Boolean(automation.rescheduled_booking?.enabled)} disabled={saving} onChange={(value) => updateAutomation("rescheduled_booking", { enabled: value })} />} /><SettingRow title="Leave A Review" meta="Ask for a review after a completed appointment" control={<Toggle value={Boolean(automation.leave_a_review?.enabled)} disabled={saving} onChange={(value) => updateAutomation("leave_a_review", { enabled: value })} />} /><SettingRow title="Waiting List Alerts" meta="Notify waiting clients when a suitable slot opens" control={<Toggle value={Boolean(automation.waiting_list_alert?.enabled)} disabled={saving || !settings?.waiting_list_enabled} onChange={(value) => updateAutomation("waiting_list_alert", { enabled: value })} />} /><SettingRow title="Re-book Reminder" meta={`${automation.rebook_reminder?.timing_weeks ?? 3} weeks after the last visit`} control={<Toggle value={Boolean(automation.rebook_reminder?.enabled)} disabled={saving} onChange={(value) => updateAutomation("rebook_reminder", { enabled: value })} />} />{automation.rebook_reminder?.enabled ? <SettingRow title="Re-book Timing" meta="Choose between 1 and 6 weeks" control={<Stepper value={automation.rebook_reminder?.timing_weeks ?? 3} suffix="w" min={1} max={6} step={1} disabled={saving} onChange={(value) => updateAutomation("rebook_reminder", { timing_weeks: value })} />} /> : null}<SettingRow title="Lapsed Client Win-Back" meta="Optional return-client automation for inactive clients" control={<Toggle value={Boolean(automation.lapsed_client_winback?.enabled)} disabled={saving} onChange={(value) => updateAutomation("lapsed_client_winback", { enabled: value })} />} /><SettingRow last title="Google Review Booster" meta="Optional follow-up for clients who have not reviewed yet" control={<Toggle value={Boolean(automation.google_review_booster?.enabled)} disabled={saving} onChange={(value) => updateAutomation("google_review_booster", { enabled: value })} />} /></SettingsSection>
      <SettingsSection title="PAYMENTS"><SettingRow title="Payment Methods" meta="Stripe and booking protection" control={<Text style={styles.rowArrow}>›</Text>} /><SettingRow title="Deposits" meta="Require a deposit before confirming selected bookings" control={<Toggle value={Boolean(settings?.deposits_enabled)} disabled={saving} onChange={(value) => saveSettings({ deposits_enabled: value })} />} />{settings?.deposits_enabled ? <SettingRow title="Deposit Amount" meta="Flat deposit amount" control={<Stepper value={settings?.deposit_amount ?? 0} suffix="£" min={0} max={100} step={5} disabled={saving} onChange={(value) => saveSettings({ deposit_amount: value })} />} /> : null}<SettingRow title="Cancellation Fee" meta="Enable a configurable cancellation fee" control={<Toggle value={Boolean(settings?.cancellation_fee_enabled)} disabled={saving} onChange={(value) => saveSettings({ cancellation_fee_enabled: value })} />} />{settings?.cancellation_fee_enabled ? <SettingRow last title="Cancellation Fee Amount" meta="Flat cancellation fee" control={<Stepper value={settings?.cancellation_fee_amount ?? 0} suffix="£" min={0} max={100} step={5} disabled={saving} onChange={(value) => saveSettings({ cancellation_fee_amount: value })} />} /> : null}</SettingsSection>
      <SettingsSection title="BUSINESS & GROWTH">{[["Client Subscriptions", "Plans, allowances and member benefits"],["Reviews", "Review prompts and Google review flow"],["Promotions", "Create controlled client offers"],["Referral Programme", "Reward client referrals"],["Digital Business Card", "Shareable QuincyFadez contact card"]].map(([title, meta], index, arr) => <SettingRow key={title} last={index === arr.length - 1} title={title} meta={meta} control={<Text style={styles.rowArrow}>›</Text>} />)}</SettingsSection>
      <SettingsSection title="BUSINESS SETTINGS"><SettingRow title="Notifications" meta="Master control for business alerts and client automation" control={<Toggle value={Boolean(settings?.notifications_enabled)} disabled={saving} onChange={(value) => saveSettings({ notifications_enabled: value })} />} /><SettingRow last title="Policies" meta="Booking, lateness, cancellation and payment policies" control={<Text style={styles.rowArrow}>›</Text>} /></SettingsSection>
      <SettingsSection title="ACCOUNT & HELP">{[["Account", "Admin security and owner access"],["Help & Support", "Support and diagnostics"],["FAQs", "Common QuincyFadez admin questions"],["Send Feedback", "Send product feedback"]].map(([title, meta]) => <SettingRow key={title} title={title} meta={meta} control={<Text style={styles.rowArrow}>›</Text>} />)}<Pressable onPress={logout}><SettingRow last title="Log Out" meta="End this secure admin session" control={<Text style={[styles.rowArrow, { color: "#D98778" }]}>›</Text>} /></Pressable></SettingsSection>
    </>;
  }, [tab, overview, bookings, filteredClients, clientSearch, settings, saving, savedMessage, actionBusy]);

  if (checking) return <SafeAreaView style={styles.safeArea}><View style={styles.center}><ActivityIndicator color={GOLD_LIGHT} /></View></SafeAreaView>;
  if (!token) return <Login onLogin={setToken} />;

  return <SafeAreaView style={styles.safeArea}><StatusBar barStyle="light-content" backgroundColor={BG} /><View style={styles.shell}><View style={styles.adminHeader}><View><Text style={styles.brand}>QUINCYFADEZ</Text><Text style={styles.adminLabel}>BARBER ADMIN</Text></View><View style={styles.headerActions}><Pressable onPress={logout} style={styles.exitButton}><Text style={styles.exitText}>LOG OUT</Text></Pressable>{onExit ? <Pressable onPress={onExit} style={styles.exitButton}><Text style={styles.exitText}>EXIT</Text></Pressable> : null}</View></View><ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>{loading ? <View style={styles.loadingBar}><ActivityIndicator color={GOLD_LIGHT} size="small" /><Text style={styles.loadingText}>SYNCING LIVE DATA…</Text></View> : null}{error ? <Text style={styles.errorText}>{error}</Text> : null}{body}</ScrollView><View style={styles.bottomWrap}><View style={styles.bottomNav}>{TABS.map((item) => { const active = tab === item.key; return <Pressable key={item.key} onPress={() => setTab(item.key)} style={({ pressed }) => [styles.navItem, pressed && styles.pressed]}><View style={[styles.navIconWrap, active && styles.navIconWrapActive]}><Text style={[styles.navIcon, active && styles.navIconActive]}>{item.icon}</Text></View><Text style={[styles.navLabel, active && styles.navLabelActive]}>{item.label}</Text>{active ? <View style={styles.navIndicator} /> : null}</Pressable>; })}</View></View></View></SafeAreaView>;
}

const styles = StyleSheet.create({
  safeArea:{flex:1,backgroundColor:BG},shell:{flex:1,backgroundColor:BG},scroll:{flex:1},content:{paddingHorizontal:18,paddingBottom:34},center:{flex:1,alignItems:"center",justifyContent:"center"},
  adminHeader:{minHeight:68,paddingHorizontal:18,flexDirection:"row",alignItems:"center",justifyContent:"space-between",borderBottomWidth:1,borderBottomColor:"#161616"},brand:{color:"#F7F7F7",fontSize:16,letterSpacing:3.1,fontWeight:"800"},adminLabel:{color:GOLD,fontSize:7,letterSpacing:2,fontWeight:"800",marginTop:4},headerActions:{flexDirection:"row",gap:7},exitButton:{borderRadius:15,borderWidth:1,borderColor:"#333",paddingHorizontal:10,paddingVertical:8},exitText:{color:"#A8A8A8",fontSize:7,letterSpacing:1,fontWeight:"800"},
  loginWrap:{flex:1,paddingHorizontal:24,justifyContent:"center"},loginMark:{width:72,height:72,borderRadius:36,borderWidth:1,borderColor:"#5D4825",backgroundColor:"#151006",alignItems:"center",justifyContent:"center"},loginMarkText:{color:GOLD_LIGHT,fontSize:27,fontWeight:"900"},loginEyebrow:{color:GOLD,fontSize:8,letterSpacing:2.1,fontWeight:"900",marginTop:24},loginTitle:{color:"#F5F5F5",fontSize:34,fontWeight:"750",marginTop:7},loginText:{color:MUTED,fontSize:12,lineHeight:19,marginTop:9,maxWidth:330},pinCard:{borderRadius:18,borderWidth:1,borderColor:"#2D281F",backgroundColor:PANEL,padding:15,marginTop:24},pinLabel:{color:"#927A4E",fontSize:7.5,letterSpacing:1.5,fontWeight:"900"},pinInput:{color:"#F4F4F4",fontSize:28,letterSpacing:8,paddingVertical:12},loginButton:{minHeight:60,borderRadius:16,backgroundColor:GOLD,marginTop:12,paddingHorizontal:18,flexDirection:"row",alignItems:"center",justifyContent:"space-between"},loginButtonText:{color:"#090909",fontSize:11,letterSpacing:1.2,fontWeight:"900"},loginArrow:{color:"#090909",fontSize:28},securityNote:{color:"#666",fontSize:8.5,lineHeight:14,textAlign:"center",marginTop:13},disabled:{opacity:.45},errorText:{color:"#E5A29A",fontSize:9.5,lineHeight:15,marginTop:10},
  loadingBar:{marginTop:12,minHeight:40,borderRadius:12,borderWidth:1,borderColor:"#26221A",backgroundColor:"#0C0A07",flexDirection:"row",alignItems:"center",justifyContent:"center",gap:8},loadingText:{color:"#9A845C",fontSize:7,letterSpacing:1.2,fontWeight:"800"},
  heroRow:{paddingTop:26,paddingBottom:19,flexDirection:"row",alignItems:"flex-start",gap:12},heroCopy:{flex:1},kicker:{color:GOLD,fontSize:8,letterSpacing:2,fontWeight:"900",marginTop:24},heroTitle:{color:"#F5F5F5",fontSize:30,lineHeight:35,fontWeight:"750",marginTop:8},heroText:{color:MUTED,fontSize:11.5,lineHeight:18,marginTop:9,maxWidth:315},livePill:{marginTop:3,flexDirection:"row",alignItems:"center",borderRadius:16,borderWidth:1,borderColor:"#45371E",backgroundColor:"#120E07",paddingHorizontal:9,paddingVertical:6,gap:6},liveDot:{width:5,height:5,borderRadius:3,backgroundColor:GOLD_LIGHT},liveText:{color:GOLD_LIGHT,fontSize:6.5,letterSpacing:1.1,fontWeight:"900"},
  metricsGrid:{flexDirection:"row",flexWrap:"wrap",gap:9},metricCard:{width:"48.6%",minHeight:108,borderRadius:18,borderWidth:1,borderColor:BORDER,backgroundColor:PANEL,padding:15,justifyContent:"space-between"},metricLabel:{color:"#8D7751",fontSize:7,letterSpacing:1.2,fontWeight:"800"},metricValue:{color:"#F2F2F2",fontSize:27,fontWeight:"750",marginTop:10},metricMeta:{color:"#666",fontSize:8.5,marginTop:8},
  requestBanner:{marginTop:12,minHeight:76,borderRadius:17,borderWidth:1,borderColor:"#5A4523",backgroundColor:"#130F07",paddingHorizontal:15,flexDirection:"row",alignItems:"center",justifyContent:"space-between"},requestLabel:{color:GOLD,fontSize:7,letterSpacing:1.3,fontWeight:"900"},requestTitle:{color:"#F0E7D6",fontSize:13,fontWeight:"700",marginTop:5},requestButton:{borderRadius:13,backgroundColor:GOLD,paddingHorizontal:12,paddingVertical:9},requestButtonText:{color:"#090909",fontSize:7,letterSpacing:1,fontWeight:"900"},
  focusCard:{marginTop:17,borderRadius:20,borderWidth:1,borderColor:"#2B261D",backgroundColor:"#0B0A08",padding:17},sectionTopRow:{flexDirection:"row",alignItems:"flex-start",justifyContent:"space-between",gap:12},sectionEyebrow:{color:GOLD,fontSize:7.5,letterSpacing:1.6,fontWeight:"900"},sectionTitle:{color:"#F0F0F0",fontSize:18,fontWeight:"700",marginTop:5},smallPill:{borderRadius:14,borderWidth:1,borderColor:"#373021",paddingHorizontal:9,paddingVertical:6},smallPillText:{color:"#A28A5C",fontSize:6.5,letterSpacing:1,fontWeight:"800"},mutedSmall:{color:"#666",fontSize:7,letterSpacing:1},emptyLine:{color:"#777",fontSize:10.5,paddingVertical:24,textAlign:"center"},
  bookingCard:{marginTop:10,borderRadius:15,borderWidth:1,borderColor:"#222",backgroundColor:"#0A0A0A",padding:12},bookingCardCompact:{borderColor:"#4B3A20",backgroundColor:"#100D07"},bookingMain:{flexDirection:"row",alignItems:"center",gap:12},bookingTimeWrap:{width:52},bookingTime:{color:GOLD_LIGHT,fontSize:15,fontWeight:"800"},bookingDuration:{color:"#70654F",fontSize:6.5,marginTop:4},bookingCopy:{flex:1},bookingName:{color:"#EFEFEF",fontSize:12.5,fontWeight:"700"},bookingService:{color:"#A9A9A9",fontSize:9,marginTop:3},bookingMeta:{color:"#666",fontSize:7.5,marginTop:4},statusPill:{borderRadius:12,borderWidth:1,borderColor:"#3A3020",paddingHorizontal:7,paddingVertical:5},statusPending:{borderColor:"#6A4F20",backgroundColor:"#171005"},statusText:{color:"#A78C58",fontSize:5.7,letterSpacing:.6,fontWeight:"800"},bookingActions:{flexDirection:"row",gap:7,marginTop:11,paddingTop:10,borderTopWidth:1,borderTopColor:"#1D1D1D"},bookingAction:{flex:1,minHeight:34,borderRadius:10,borderWidth:1,borderColor:"#333",alignItems:"center",justifyContent:"center"},bookingActionText:{color:"#A8A8A8",fontSize:6.5,letterSpacing:.7,fontWeight:"800"},bookingActionPrimary:{flex:1,minHeight:34,borderRadius:10,backgroundColor:GOLD,alignItems:"center",justifyContent:"center"},bookingActionPrimaryText:{color:"#090909",fontSize:6.5,letterSpacing:.7,fontWeight:"900"},bookingActionDanger:{flex:1,minHeight:34,borderRadius:10,borderWidth:1,borderColor:"#56302A",backgroundColor:"#140B0A",alignItems:"center",justifyContent:"center"},bookingActionDangerText:{color:"#D48F83",fontSize:6.5,letterSpacing:.7,fontWeight:"800"},
  pageTitle:{color:"#F5F5F5",fontSize:29,lineHeight:35,fontWeight:"750",marginTop:7},pageText:{color:MUTED,fontSize:11.5,lineHeight:18,marginTop:9,marginBottom:18,maxWidth:340},segmentRow:{minHeight:42,borderRadius:14,borderWidth:1,borderColor:"#232323",backgroundColor:"#0A0A0A",flexDirection:"row",padding:4,gap:4},segment:{flex:1,alignItems:"center",justifyContent:"center",borderRadius:10},segmentActive:{backgroundColor:"#1A1409",borderWidth:1,borderColor:"#4B391C"},segmentText:{color:"#666",fontSize:7,letterSpacing:1,fontWeight:"800"},segmentTextActive:{color:GOLD_LIGHT},
  scheduleActions:{marginTop:13,borderRadius:18,borderWidth:1,borderColor:BORDER,backgroundColor:PANEL,overflow:"hidden"},actionRow:{minHeight:73,paddingHorizontal:16,flexDirection:"row",alignItems:"center",justifyContent:"space-between",borderBottomWidth:1,borderBottomColor:"#1D1D1D"},actionTitle:{color:"#EDEDED",fontSize:13,fontWeight:"700"},actionMeta:{color:"#777",fontSize:8.5,marginTop:4},rowArrow:{color:GOLD_LIGHT,fontSize:24},
  emptyCard:{marginTop:17,borderRadius:21,borderWidth:1,borderColor:"#29251D",backgroundColor:"#0B0A08",paddingHorizontal:22,paddingVertical:28,alignItems:"center"},emptyEyebrow:{color:GOLD,fontSize:7,letterSpacing:1.6,fontWeight:"900"},emptyTitle:{color:"#F0F0F0",fontSize:19,fontWeight:"700",marginTop:6},emptyText:{color:MUTED,fontSize:10,lineHeight:16,textAlign:"center",marginTop:8,maxWidth:290},
  addCircle:{width:38,height:38,borderRadius:19,backgroundColor:GOLD,alignItems:"center",justifyContent:"center",marginTop:24},addCircleText:{color:"#080808",fontSize:22,fontWeight:"700"},searchShell:{minHeight:52,borderRadius:15,borderWidth:1,borderColor:"#272727",backgroundColor:PANEL,flexDirection:"row",alignItems:"center",paddingHorizontal:15,gap:10},searchIcon:{color:"#8C744A",fontSize:19},searchInput:{flex:1,color:"#E6E6E6",fontSize:10},clientCard:{marginTop:9,minHeight:78,borderRadius:16,borderWidth:1,borderColor:BORDER,backgroundColor:PANEL,padding:12,flexDirection:"row",alignItems:"center"},clientAvatar:{width:42,height:42,borderRadius:21,borderWidth:1,borderColor:"#4B3A20",backgroundColor:"#151006",alignItems:"center",justifyContent:"center"},clientAvatarText:{color:GOLD_LIGHT,fontSize:16,fontWeight:"800"},clientCopy:{flex:1,marginLeft:11},clientName:{color:"#EFEFEF",fontSize:13,fontWeight:"700"},clientMeta:{color:"#888",fontSize:8.5,marginTop:3},clientStats:{color:"#8D7751",fontSize:6.8,letterSpacing:.45,marginTop:5,fontWeight:"800"},
  settingsHeader:{flexDirection:"row",alignItems:"center",justifyContent:"space-between"},savedText:{color:GOLD_LIGHT,fontSize:7.5,letterSpacing:1.2,fontWeight:"900",marginTop:24},settingsGroup:{marginTop:20},settingsTitle:{color:"#8C744A",fontSize:7.5,letterSpacing:1.7,fontWeight:"900",marginBottom:8},settingsCard:{borderRadius:18,borderWidth:1,borderColor:BORDER,backgroundColor:PANEL,overflow:"hidden"},settingRow:{minHeight:74,flexDirection:"row",alignItems:"center",justifyContent:"space-between",paddingHorizontal:15,paddingVertical:12,gap:12},settingBorder:{borderBottomWidth:1,borderBottomColor:"#1D1D1D"},settingCopy:{flex:1},settingName:{color:"#ECECEC",fontSize:12.5,fontWeight:"700"},settingMeta:{color:"#777",fontSize:8.5,lineHeight:13,marginTop:4},toggle:{width:42,height:24,borderRadius:12,backgroundColor:"#272727",padding:3,justifyContent:"center"},toggleOn:{backgroundColor:GOLD},toggleKnob:{width:18,height:18,borderRadius:9,backgroundColor:"#777"},toggleKnobOn:{backgroundColor:"#090909",alignSelf:"flex-end"},stepper:{minWidth:106,height:34,borderRadius:12,borderWidth:1,borderColor:"#30291E",backgroundColor:"#0A0907",flexDirection:"row",alignItems:"center",justifyContent:"space-between",overflow:"hidden"},stepButton:{width:32,height:34,alignItems:"center",justifyContent:"center"},stepText:{color:GOLD_LIGHT,fontSize:16,fontWeight:"700"},stepValue:{color:"#ECECEC",fontSize:9,fontWeight:"800"},
  bottomWrap:{borderTopWidth:1,borderTopColor:"#171717",paddingHorizontal:8,paddingTop:7,paddingBottom:7,backgroundColor:BG},bottomNav:{minHeight:62,flexDirection:"row",borderRadius:20,borderWidth:1,borderColor:"#202020",backgroundColor:"#0A0A0A",paddingHorizontal:2},navItem:{flex:1,minHeight:54,alignItems:"center",justifyContent:"center",position:"relative"},navIconWrap:{width:27,height:24,alignItems:"center",justifyContent:"center",borderRadius:10},navIconWrapActive:{backgroundColor:"#181207",borderWidth:1,borderColor:"#4D3B1E"},navIcon:{color:"#777",fontSize:15},navIconActive:{color:GOLD_LIGHT},navLabel:{color:"#777",fontSize:7,marginTop:2,fontWeight:"600"},navLabelActive:{color:"#EFE5D3"},navIndicator:{position:"absolute",bottom:1,width:16,height:2,borderRadius:2,backgroundColor:GOLD},pressed:{opacity:.72},
});