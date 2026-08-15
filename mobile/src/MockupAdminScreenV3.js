import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  Share,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BrandLogo, GoldButton, M, Marble, cardShadow, shadow } from "./MockupTheme";

const API = (process.env.EXPO_PUBLIC_API_URL || "").replace(/\/$/, "");
const TOKEN = "quincyfadez.adminToken";
const NAV = [
  ["home", "Dashboard", "⌂"],
  ["schedule", "Schedule", "▦"],
  ["insights", "Insights", "▥"],
  ["clients", "Clients", "♙"],
  ["settings", "More", "≡"],
];
const DAYS = [
  ["0", "Monday"], ["1", "Tuesday"], ["2", "Wednesday"], ["3", "Thursday"],
  ["4", "Friday"], ["5", "Saturday"], ["6", "Sunday"],
];

const read = (r) => r.json().catch(() => ({}));
const money = (v) => `£${Number(v || 0).toFixed(Number(v || 0) % 1 ? 2 : 0)}`;
const dateKey = (v) => String(v || "").slice(0, 10);
const fmtTime = (v) => v ? new Date(v).toLocaleTimeString("en-GB", {
  hour: "numeric", minute: "2-digit", hour12: true, timeZone: "Europe/London"
}).replace(":00", "") : "—";
const fmtDate = (v) => v ? new Date(v).toLocaleDateString("en-GB", {
  weekday: "short", day: "numeric", month: "short", timeZone: "Europe/London"
}) : "—";
const sortBookings = (a) => [...(a || [])].sort((x, y) => String(x.start_at_utc || x.start_at || "").localeCompare(String(y.start_at_utc || y.start_at || "")));
const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
};
const statusLabel = (v) => String(v || "confirmed").replaceAll("_", " ").toUpperCase();
const minutesLabel = (v) => {
  const n = Number(v || 0);
  return n < 60 ? `${n} Minutes` : n % 60 ? `${Math.floor(n / 60)}h ${n % 60}m` : `${n / 60} Hours`;
};

function BottomNav({ tab, setTab }) {
  return (
    <SafeAreaView style={s.navSafe}>
      <View style={s.nav}>
        {NAV.map(([key, label, icon]) => {
          const active = tab === key;
          return (
            <Pressable key={key} onPress={() => setTab(key)} style={s.navItem}>
              <Text style={[s.navIcon, active && s.navActive]}>{icon}</Text>
              <Text style={[s.navText, active && s.navActive]}>{label}</Text>
            </Pressable>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

function StandardHeader({ title, subtitle, onBack }) {
  return (
    <>
      <View style={s.standardHeader}>
        <Pressable onPress={onBack} style={s.headerSide}><Text style={s.backIcon}>‹</Text></Pressable>
        <Text style={s.headerTitle}>{title}</Text>
        <View style={s.headerSide}><Text style={s.menuIcon}>☰</Text></View>
      </View>
      {subtitle ? <Text style={s.headerSubtitle}>{subtitle}</Text> : null}
    </>
  );
}

function Status({ value }) {
  const pending = value === "pending";
  const bad = ["cancelled", "no_show", "expired"].includes(value);
  const completed = value === "completed";
  return (
    <View style={[s.status, pending && s.statusPending, bad && s.statusBad, completed && s.statusDone]}>
      <Text style={[s.statusText, pending && { color: M.amber }, bad && { color: M.red }, completed && { color: M.muted }]}>
        {statusLabel(value)}
      </Text>
    </View>
  );
}

function SummaryCard({ label, value, icon, change, note, positive = true }) {
  return (
    <View style={s.summaryCard}>
      <Text style={s.summaryLabel}>{label}</Text>
      <View style={s.summaryMain}>
        <Text style={s.summaryValue}>{value}</Text>
        <Text style={s.summaryIcon}>{icon}</Text>
      </View>
      {change ? (
        <Text style={s.summaryNote}><Text style={{ color: positive ? M.green : M.amber }}>{change}</Text>{note ? ` ${note}` : ""}</Text>
      ) : note ? <Text style={s.summaryNote}>{note}</Text> : null}
    </View>
  );
}

function AppointmentRow({ booking, onAction, busy, compact = false }) {
  return (
    <View style={s.appointmentCard}>
      <View style={s.appointmentRow}>
        <View style={s.appTimeBox}>
          <Text style={s.appTime}>{fmtTime(booking.start_at)}</Text>
          {!compact ? <Text style={s.appDuration}>{booking.duration_minutes || 0} MIN</Text> : null}
        </View>
        <View style={s.appInfo}>
          <Text style={s.appClient}>{booking.customer_name || "Client"}</Text>
          <Text style={s.appService}>{booking.service || "Appointment"}</Text>
          {!compact ? <Text style={s.appMeta}>{fmtDate(booking.start_at)} · {money(booking.price)}</Text> : null}
        </View>
        <Status value={booking.status} />
      </View>
      {booking.status === "pending" && onAction ? (
        <View style={s.pendingActions}>
          <Pressable disabled={busy} onPress={() => onAction(booking, "confirmed")} style={s.approveButton}><Text style={s.approveText}>APPROVE</Text></Pressable>
          <Pressable disabled={busy} onPress={() => onAction(booking, "cancelled")} style={s.declineButton}><Text style={s.declineText}>DECLINE</Text></Pressable>
        </View>
      ) : null}
    </View>
  );
}

function SectionTitle({ title, action, onAction }) {
  return (
    <View style={s.sectionTitleRow}>
      <Text style={s.sectionTitle}>{title}</Text>
      {action ? <Pressable onPress={onAction}><Text style={s.sectionAction}>{action}</Text></Pressable> : null}
    </View>
  );
}

function Toggle({ value, onChange, disabled }) {
  return (
    <Pressable disabled={disabled} onPress={() => onChange(!value)} style={[s.toggle, value && s.toggleOn, disabled && { opacity: .5 }]}>
      <View style={[s.toggleKnob, value && s.toggleKnobOn]} />
    </Pressable>
  );
}

function Select({ value, onPress }) {
  return (
    <Pressable onPress={onPress} style={s.select}>
      <Text style={s.selectText}>{value}</Text>
      <Text style={s.selectArrow}>⌄</Text>
    </Pressable>
  );
}

function SettingSection({ title, children }) {
  return (
    <View style={s.settingSection}>
      <Text style={s.settingSectionTitle}>{title}</Text>
      <View style={s.settingCard}>{children}</View>
    </View>
  );
}

function SettingRow({ title, subtitle, right, onPress, last = false, icon }) {
  const row = (
    <View style={[s.settingRow, !last && s.settingDivider]}>
      <View style={s.settingLeft}>
        {icon ? <Text style={s.settingIcon}>{icon}</Text> : null}
        <View style={{ flex: 1 }}>
          <Text style={s.settingTitle}>{title}</Text>
          {subtitle ? <Text style={s.settingSubtitle}>{subtitle}</Text> : null}
        </View>
      </View>
      {right || <Text style={s.chevron}>›</Text>}
    </View>
  );
  return onPress ? <Pressable onPress={onPress}>{row}</Pressable> : row;
}

function Empty({ title, text }) {
  return <View style={s.empty}><Text style={s.emptyTitle}>{title}</Text><Text style={s.emptyText}>{text}</Text></View>;
}

function WorkingHours({ hours, saving, onSave }) {
  const [draft, setDraft] = useState(hours || {});
  useEffect(() => setDraft(hours || {}), [hours]);
  const toggleDay = (key) => setDraft((d) => ({ ...d, [key]: (d[key] || []).length ? [] : [["09:00", "18:00"]] }));
  const changeTime = (key, index, pos, value) => setDraft((d) => {
    const rows = [...(d[key] || [])];
    const row = [...(rows[index] || ["09:00", "18:00"])];
    row[pos] = value;
    rows[index] = row;
    return { ...d, [key]: rows };
  });
  const addShift = (key) => setDraft((d) => ({ ...d, [key]: [...(d[key] || []), ["18:00", "20:00"]] }));
  const removeShift = (key, index) => setDraft((d) => ({ ...d, [key]: (d[key] || []).filter((_, i) => i !== index) }));
  return (
    <SettingSection title="WORKING HOURS">
      {DAYS.map(([key, name], dayIndex) => {
        const rows = draft[key] || [];
        const open = rows.length > 0;
        return (
          <View key={key} style={[s.hoursDay, dayIndex < DAYS.length - 1 && s.settingDivider]}>
            <View style={s.hoursDayTop}>
              <View><Text style={s.settingTitle}>{name}</Text><Text style={s.hoursState}>{open ? "OPEN" : "CLOSED"}</Text></View>
              <Toggle value={open} onChange={() => toggleDay(key)} disabled={saving} />
            </View>
            {rows.map((row, i) => (
              <View key={`${key}-${i}`} style={s.shiftRow}>
                <TextInput value={row[0]} onChangeText={(v) => changeTime(key, i, 0, v)} style={s.timeInput} keyboardType="numbers-and-punctuation" maxLength={5} />
                <Text style={s.shiftDash}>—</Text>
                <TextInput value={row[1]} onChangeText={(v) => changeTime(key, i, 1, v)} style={s.timeInput} keyboardType="numbers-and-punctuation" maxLength={5} />
                {rows.length > 1 ? <Pressable onPress={() => removeShift(key, i)} style={s.removeShift}><Text style={s.removeShiftText}>×</Text></Pressable> : null}
              </View>
            ))}
            {open ? <Pressable onPress={() => addShift(key)}><Text style={s.addShift}>+ ADD SPLIT SHIFT</Text></Pressable> : null}
          </View>
        );
      })}
      <View style={s.hoursSave}><GoldButton title={saving ? "SAVING…" : "SAVE WORKING HOURS"} onPress={() => onSave(draft)} disabled={saving} /></View>
    </SettingSection>
  );
}

function BusinessModal({ type, settings, services, saving, onClose, onSave }) {
  const profile = settings?.business_profile || {};
  const [draft, setDraft] = useState({});
  useEffect(() => {
    if (type === "profile") setDraft({ business_name: profile.business_name || "QuincyFadez", owner_name: profile.owner_name || "", phone: profile.phone || "", email: profile.email || "" });
    if (type === "location") setDraft({ address: profile.address || "", city: profile.city || "Oxford", postcode: profile.postcode || "", maps_url: profile.maps_url || "" });
  }, [type]);
  if (!type) return null;
  const save = async () => { await onSave({ business_profile: { ...profile, ...draft } }); onClose(); };
  const Field = ({ label, keyName, keyboardType }) => (
    <View style={s.modalField}>
      <Text style={s.modalLabel}>{label}</Text>
      <TextInput value={draft[keyName] || ""} onChangeText={(v) => setDraft((d) => ({ ...d, [keyName]: v }))} style={s.modalInput} keyboardType={keyboardType} placeholderTextColor={M.muted2} />
    </View>
  );
  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <Marble>
        <SafeAreaView style={s.safe}>
          <StatusBar barStyle="light-content" />
          <StandardHeader title={type === "profile" ? "Profile" : type === "location" ? "Location" : "Services"} onBack={onClose} />
          <ScrollView contentContainerStyle={s.modalContent}>
            {type === "profile" ? <>
              <Field label="BUSINESS NAME" keyName="business_name" />
              <Field label="OWNER NAME" keyName="owner_name" />
              <Field label="PHONE" keyName="phone" keyboardType="phone-pad" />
              <Field label="EMAIL" keyName="email" keyboardType="email-address" />
              <GoldButton title={saving ? "SAVING…" : "SAVE PROFILE"} onPress={save} disabled={saving} style={{ marginTop: 18 }} />
            </> : null}
            {type === "location" ? <>
              <Field label="ADDRESS" keyName="address" />
              <Field label="CITY" keyName="city" />
              <Field label="POSTCODE" keyName="postcode" />
              <Field label="GOOGLE MAPS URL" keyName="maps_url" />
              <GoldButton title={saving ? "SAVING…" : "SAVE LOCATION"} onPress={save} disabled={saving} style={{ marginTop: 18 }} />
              {profile.maps_url ? <Pressable onPress={() => Linking.openURL(profile.maps_url).catch(() => {})} style={s.outlineButton}><Text style={s.outlineButtonText}>OPEN DIRECTIONS</Text></Pressable> : null}
            </> : null}
            {type === "services" ? <>
              <Text style={s.modalIntro}>Live QuincyFadez services currently available to clients.</Text>
              {(services || []).map((x) => <View key={x.name} style={s.serviceModalRow}><View><Text style={s.serviceModalName}>{x.name}</Text><Text style={s.serviceModalMeta}>{x.duration_minutes || x.duration || "—"} min</Text></View><Text style={s.serviceModalPrice}>{money(x.price)}</Text></View>)}
            </> : null}
          </ScrollView>
        </SafeAreaView>
      </Marble>
    </Modal>
  );
}

export default function MockupAdminScreenV3({ onExit }) {
  const [token, setToken] = useState("");
  const [checking, setChecking] = useState(true);
  const [tab, setTab] = useState("home");
  const [overview, setOverview] = useState(null);
  const [requests, setRequests] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [clients, setClients] = useState([]);
  const [settings, setSettings] = useState(null);
  const [services, setServices] = useState([]);
  const [weekInsights, setWeekInsights] = useState(null);
  const [monthInsights, setMonthInsights] = useState(null);
  const [search, setSearch] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [picker, setPicker] = useState(null);
  const [detail, setDetail] = useState("");

  useEffect(() => {
    AsyncStorage.getItem(TOKEN).then((v) => { setToken(v || ""); setChecking(false); }).catch(() => setChecking(false));
  }, []);

  const request = useCallback(async (path, opt = {}) => {
    if (!token || !API) throw new Error("Admin connection is unavailable.");
    const r = await fetch(`${API}${path}`, {
      ...opt,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...(opt.headers || {}) },
    });
    const d = await read(r);
    if (r.status === 401) {
      await AsyncStorage.removeItem(TOKEN);
      setToken("");
      onExit?.();
      throw new Error("Your owner session expired.");
    }
    if (!r.ok) throw new Error(typeof d.detail === "string" ? d.detail : "That action could not be completed.");
    return d;
  }, [token, onExit]);

  const loadHome = useCallback(async () => {
    const [o, r] = await Promise.all([request("/api/admin/overview"), request("/api/admin/booking-requests")]);
    o.appointments = sortBookings(o.appointments || []);
    setOverview(o);
    setRequests(sortBookings(r.bookings || []));
  }, [request]);

  const loadSchedule = useCallback(async () => {
    const [b, st] = await Promise.all([request("/api/admin/bookings?days=30"), request("/api/admin/settings")]);
    const list = sortBookings(b.bookings || []);
    setBookings(list);
    setSettings(st.settings || null);
    setServices(st.services || []);
    setSelectedDate((v) => v || dateKey(list[0]?.start_at) || new Date().toISOString().slice(0, 10));
  }, [request]);

  const loadInsights = useCallback(async () => {
    const [w, m, b, c] = await Promise.all([
      request("/api/admin/insights?period=week"),
      request("/api/admin/insights?period=month"),
      request("/api/admin/bookings?days=30"),
      request("/api/admin/clients"),
    ]);
    setWeekInsights(w);
    setMonthInsights(m);
    setBookings(sortBookings(b.bookings || []));
    setClients(c.clients || []);
  }, [request]);

  const loadSettings = useCallback(async () => {
    const st = await request("/api/admin/settings");
    setSettings(st.settings || null);
    setServices(st.services || []);
  }, [request]);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true); setError("");
    try {
      if (tab === "home") await loadHome();
      if (tab === "schedule") await loadSchedule();
      if (tab === "insights") await loadInsights();
      if (tab === "clients") setClients((await request("/api/admin/clients")).clients || []);
      if (tab === "settings") await loadSettings();
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, [token, tab, loadHome, loadSchedule, loadInsights, loadSettings, request]);

  useEffect(() => { load(); }, [load]);

  const saveSettings = useCallback(async (patch) => {
    if (saving) return false;
    setSaving(true); setError("");
    try {
      const d = await request("/api/admin/settings", { method: "PUT", body: JSON.stringify(patch) });
      setSettings(d.settings || settings);
      return true;
    } catch (e) { setError(e.message); return false; }
    finally { setSaving(false); }
  }, [saving, request, settings]);

  const automation = (key, enabled) => saveSettings({ automations: { [key]: { ...(settings?.automations?.[key] || {}), enabled } } });

  const updateStatus = async (booking, next) => {
    if (busy) return;
    const run = async () => {
      setBusy(booking.id);
      try {
        await request(`/api/admin/bookings/${booking.id}/status`, { method: "PATCH", body: JSON.stringify({ status: next }) });
        if (tab === "home") await loadHome(); else await loadSchedule();
      } catch (e) { setError(e.message); }
      finally { setBusy(""); }
    };
    if (next === "cancelled") {
      return Alert.alert("Decline booking?", "This releases the appointment slot.", [
        { text: "Keep", style: "cancel" }, { text: "Decline", style: "destructive", onPress: run },
      ]);
    }
    await run();
  };

  const choose = (title, value, options, key) => setPicker({ title, value, options, key });
  const chooseValue = (value) => { if (!picker) return; saveSettings({ [picker.key]: value }); setPicker(null); };
  const logout = async () => {
    try { await fetch(`${API}/api/admin/logout`, { method: "POST", headers: { Authorization: `Bearer ${token}` } }); } catch (_) {}
    await AsyncStorage.removeItem(TOKEN); onExit?.();
  };

  const grouped = useMemo(() => {
    const g = {};
    bookings.forEach((x) => { const k = dateKey(x.start_at); (g[k] || (g[k] = [])).push(x); });
    return Object.entries(g).sort(([a], [b]) => a.localeCompare(b));
  }, [bookings]);
  const dateKeys = grouped.slice(0, 7).map(([k]) => k);
  const shownBookings = bookings.filter((x) => dateKey(x.start_at) === selectedDate);
  const filteredClients = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return clients;
    return clients.filter((c) => [c.name, c.phone, c.email].some((v) => String(v || "").toLowerCase().includes(q)));
  }, [clients, search]);

  const serviceStats = useMemo(() => {
    const map = {};
    bookings.filter((x) => !["cancelled", "expired"].includes(x.status)).forEach((x) => {
      const key = x.service || "Haircut";
      if (!map[key]) map[key] = { name: key, count: 0, revenue: 0 };
      map[key].count += 1; map[key].revenue += Number(x.price || 0);
    });
    return Object.values(map).sort((a, b) => b.count - a.count).slice(0, 3);
  }, [bookings]);

  const peakHours = useMemo(() => {
    const slots = [{ label: "10:00 – 12:00", from: 10, to: 12 }, { label: "1:00 – 3:00", from: 13, to: 15 }, { label: "4:00 – 6:00", from: 16, to: 18 }];
    return slots.map((slot) => ({ ...slot, count: bookings.filter((x) => { const h = new Date(x.start_at).getHours(); return h >= slot.from && h < slot.to && !["cancelled", "expired"].includes(x.status); }).length }));
  }, [bookings]);

  const repeatPercent = useMemo(() => {
    if (!clients.length) return 0;
    return Math.round((clients.filter((c) => Number(c.completed_count || 0) > 1 || c.regular).length / clients.length) * 100);
  }, [clients]);

  if (checking) return <Marble><View style={s.center}><ActivityIndicator color={M.gold} /></View></Marble>;
  if (!token) return null;

  let page;

  if (tab === "home") {
    const appointments = overview?.appointments || [];
    page = (
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <View style={s.dashboardTop}>
          <Pressable style={s.dashSide}><Text style={s.hamburger}>☰</Text></Pressable>
          <BrandLogo size={68} compact />
          <View style={s.dashSide}><Text style={s.bell}>♧</Text>{requests.length ? <View style={s.badge}><Text style={s.badgeText}>{Math.min(requests.length, 9)}</Text></View> : null}</View>
        </View>
        <Text style={s.greeting}>{greeting()}, Quincy 👋</Text>
        <Text style={s.greetingSub}>Here’s what’s happening today.</Text>
        <View style={s.summaryGrid}>
          <SummaryCard label="TODAY’S BOOKINGS" value={overview?.today_bookings ?? 0} icon="▦" note="Live schedule" />
          <SummaryCard label="TODAY’S REVENUE" value={money(overview?.today_revenue)} icon="♙" note="Completed value" />
          <SummaryCard label="PENDING REQUESTS" value={requests.length} icon="☆" note={requests.length ? "Tap to review" : "All caught up"} />
          <SummaryCard label="UTILISATION" value={overview?.utilisation_percent == null ? "—" : `${overview.utilisation_percent}%`} icon="♧" note="Today’s capacity" />
        </View>
        <SectionTitle title="UPCOMING APPOINTMENTS" action="View all" onAction={() => setTab("schedule")} />
        {appointments.length ? appointments.slice(0, 6).map((x) => <AppointmentRow key={x.id} booking={x} compact />) : <Empty title="NO BOOKINGS TODAY" text="Today’s appointments will appear here in time order." />}
        {requests.length ? <><SectionTitle title="BOOKING REQUESTS" /><View style={{ gap: 8 }}>{requests.slice(0, 4).map((x) => <AppointmentRow key={x.id} booking={x} onAction={updateStatus} busy={busy === x.id} />)}</View></> : null}
        {error ? <Text style={s.error}>{error}</Text> : null}
      </ScrollView>
    );
  } else if (tab === "schedule") {
    const selectedLabel = selectedDate ? new Date(`${selectedDate}T12:00:00`).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).toUpperCase() : "SCHEDULE";
    page = (
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <StandardHeader title="Schedule" subtitle="Daily schedule at a glance. Clear, chronological, and easy." onBack={() => setTab("home")} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.dateStrip}>
          {dateKeys.length ? dateKeys.map((k) => {
            const d = new Date(`${k}T12:00:00`); const active = k === selectedDate;
            return <Pressable key={k} onPress={() => setSelectedDate(k)} style={[s.dateChip, active && s.dateChipActive]}><Text style={[s.dateDay, active && s.dateActiveText]}>{d.toLocaleDateString("en-GB", { weekday: "short" })}</Text><Text style={[s.dateNum, active && s.dateActiveText]}>{d.getDate()}</Text></Pressable>;
          }) : <Text style={s.muted}>No appointments yet.</Text>}
        </ScrollView>
        <Text style={s.dateHeading}>{selectedLabel}</Text>
        {shownBookings.length ? shownBookings.map((x) => <AppointmentRow key={x.id} booking={x} />) : <Empty title="NO APPOINTMENTS" text="There are no bookings on this date." />}
        {error ? <Text style={s.error}>{error}</Text> : null}
      </ScrollView>
    );
  } else if (tab === "insights") {
    const maxPeak = Math.max(1, ...peakHours.map((x) => x.count));
    page = (
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <StandardHeader title="Insights" subtitle="Business performance at a glance." onBack={() => setTab("home")} />
        <View style={s.summaryGrid}>
          <SummaryCard label="THIS WEEK’S REVENUE" value={money(weekInsights?.revenue)} icon="♙" note="completed value" />
          <SummaryCard label="BOOKINGS THIS WEEK" value={weekInsights?.bookings ?? 0} icon="▦" note="appointments" />
          <SummaryCard label="REPEAT CLIENTS" value={`${repeatPercent}%`} icon="⟳" note="of client base" />
          <SummaryCard label="NO-SHOWS" value={weekInsights?.no_shows ?? 0} icon="⊗" note="this week" />
        </View>
        <SectionTitle title="TOP SERVICES" action="View all" />
        <View style={s.listCard}>
          {(serviceStats.length ? serviceStats : [{ name: weekInsights?.top_service || "No data yet", count: weekInsights?.bookings || 0, revenue: weekInsights?.revenue || 0 }]).map((x, i, arr) => (
            <View key={`${x.name}-${i}`} style={[s.serviceRankRow, i < arr.length - 1 && s.listDivider]}>
              <View style={s.rankCircle}><Text style={s.rankText}>{i + 1}</Text></View>
              <Text style={s.serviceRankIcon}>{i === 0 ? "✂" : i === 1 ? "♚" : "◔"}</Text>
              <View style={{ flex: 1 }}><Text style={s.serviceRankName}>{x.name}</Text><Text style={s.serviceRankMeta}>{x.count} booking{x.count === 1 ? "" : "s"}</Text></View>
              <Text style={s.serviceRankRevenue}>{money(x.revenue)}</Text><Text style={s.goldChevron}>›</Text>
            </View>
          ))}
        </View>
        <SectionTitle title="PEAK HOURS" />
        <View style={s.listCard}>
          {peakHours.map((x, i) => {
            const bars = Math.max(1, Math.round((x.count / maxPeak) * 8));
            return <View key={x.label} style={[s.peakRow, i < peakHours.length - 1 && s.listDivider]}><Text style={s.peakClock}>◷</Text><Text style={s.peakLabel}>{x.label}</Text><View style={s.bars}>{Array.from({ length: 8 }).map((_, bi) => <View key={bi} style={[s.bar, bi < bars && s.barOn]} />)}</View><Text style={s.peakCount}>{x.count} bookings</Text></View>;
          })}
        </View>
        <SectionTitle title="CLIENT INSIGHTS" />
        <View style={s.summaryGridNoTop}>
          <SummaryCard label="NEW CLIENTS THIS MONTH" value={monthInsights?.new_clients ?? 0} icon="♙+" note="new clients" />
          <SummaryCard label="AVERAGE SPEND" value={money(monthInsights?.average_booking_value)} icon="↗" note="per booking" />
        </View>
        {error ? <Text style={s.error}>{error}</Text> : null}
      </ScrollView>
    );
  } else if (tab === "clients") {
    page = (
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <StandardHeader title="Clients" subtitle="Your client book, organised and easy to manage." onBack={() => setTab("home")} />
        <TextInput value={search} onChangeText={setSearch} placeholder="Search clients" placeholderTextColor={M.muted2} style={s.search} />
        <SectionTitle title={`${filteredClients.length} CLIENT${filteredClients.length === 1 ? "" : "S"}`} />
        {filteredClients.length ? filteredClients.map((c) => (
          <View key={c.client_key || c.email || c.phone} style={s.clientCard}>
            <View style={s.avatar}><Text style={s.avatarText}>{(c.name || "C")[0].toUpperCase()}</Text></View>
            <View style={{ flex: 1 }}><Text style={s.clientName}>{c.name || "Client"}</Text><Text style={s.clientMeta}>{c.phone || c.email || "No contact detail"}</Text><Text style={s.clientMeta}>{c.completed_count || 0} visits · {money(c.total_spend)} spend</Text></View>
            {c.regular || Number(c.completed_count || 0) > 1 ? <View style={s.regularPill}><Text style={s.regularText}>REGULAR</Text></View> : <Text style={s.goldChevron}>›</Text>}
          </View>
        )) : <Empty title="NO CLIENTS YET" text="Client profiles build automatically from real bookings." />}
        {error ? <Text style={s.error}>{error}</Text> : null}
      </ScrollView>
    );
  } else {
    page = (
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <StandardHeader title="Settings" subtitle="Powerful settings. Simple controls, total control." onBack={() => setTab("home")} />
        <SettingSection title="BOOKING OPTIONS">
          <SettingRow title="Minimum Notice" right={<Select value={minutesLabel(settings?.minimum_notice_minutes || 120)} onPress={() => choose("Minimum Notice", settings?.minimum_notice_minutes || 120, [0, 60, 120, 240, 720, 1440], "minimum_notice_minutes")} />} />
          <SettingRow title="Slot Frequency" right={<Select value={`${settings?.slot_interval_minutes || 15} Minutes`} onPress={() => choose("Slot Frequency", settings?.slot_interval_minutes || 15, [10, 15, 20, 30, 45, 60], "slot_interval_minutes")} />} />
          <SettingRow title="Cancellation Notice" right={<Select value={`${settings?.cancellation_notice_hours || 24} Hours`} onPress={() => choose("Cancellation Notice", settings?.cancellation_notice_hours || 24, [0, 2, 6, 12, 24, 48, 72], "cancellation_notice_hours")} />} />
          <SettingRow title="Booking Reminder SMS" right={<Toggle value={!!settings?.automations?.booking_reminder?.enabled} onChange={(v) => automation("booking_reminder", v)} />} />
          <SettingRow title="Booking Confirmed" right={<Toggle value={!!settings?.automations?.booking_confirmed?.enabled} onChange={(v) => automation("booking_confirmed", v)} />} />
          <SettingRow title="Rescheduled" right={<Toggle value={!!settings?.automations?.rescheduled_booking?.enabled} onChange={(v) => automation("rescheduled_booking", v)} />} />
          <SettingRow title="Leave A Review" right={<Toggle value={!!settings?.automations?.leave_a_review?.enabled} onChange={(v) => automation("leave_a_review", v)} />} />
          <SettingRow title="Waitlist Alerts" last right={<Toggle value={!!settings?.automations?.waiting_list_alert?.enabled} onChange={(v) => automation("waiting_list_alert", v)} />} />
        </SettingSection>
        <SettingSection title="SHARE & MANAGE">
          <SettingRow title="Share Booking Link" icon="♧" last onPress={() => Share.share({ message: "Book QuincyFadez: https://quincyfadez.com" })} />
        </SettingSection>
        <SettingSection title="BUSINESS">
          <SettingRow title="Profile" icon="♙" onPress={() => setDetail("profile")} />
          <SettingRow title="Services" icon="▣" onPress={() => setDetail("services")} />
          <SettingRow title="Location" icon="⌖" last onPress={() => setDetail("location")} />
        </SettingSection>
        <WorkingHours hours={settings?.weekly_hours || {}} saving={saving} onSave={(v) => saveSettings({ weekly_hours: v })} />
        <Pressable onPress={logout} style={s.logout}><Text style={s.logoutText}>LOG OUT</Text></Pressable>
        {saving ? <Text style={s.saving}>Saving changes…</Text> : null}
        {error ? <Text style={s.error}>{error}</Text> : null}
      </ScrollView>
    );
  }

  return (
    <Marble>
      <View style={s.shell}>
        <SafeAreaView style={s.safe}>
          <StatusBar barStyle="light-content" backgroundColor="transparent" />
          <View style={{ flex: 1 }}>{loading && !overview && !settings && !bookings.length && !weekInsights ? <View style={s.center}><ActivityIndicator color={M.gold} /></View> : page}</View>
          <BottomNav tab={tab} setTab={setTab} />
        </SafeAreaView>
        {picker ? (
          <Modal transparent visible animationType="fade" onRequestClose={() => setPicker(null)}>
            <Pressable onPress={() => setPicker(null)} style={s.backdrop}>
              <Pressable onPress={() => {}} style={s.sheet}>
                <View style={s.sheetHandle} />
                <Text style={s.sheetKicker}>CHOOSE A VALUE</Text>
                <Text style={s.sheetTitle}>{picker.title}</Text>
                {picker.options.map((v) => {
                  const active = String(v) === String(picker.value);
                  const text = picker.key.includes("minutes") ? minutesLabel(v) : picker.key.includes("hours") ? `${v} Hours` : String(v);
                  return <Pressable key={String(v)} onPress={() => chooseValue(v)} style={[s.option, active && s.optionActive]}><Text style={[s.optionText, active && s.optionTextActive]}>{text}</Text>{active ? <Text style={s.optionCheck}>✓</Text> : null}</Pressable>;
                })}
              </Pressable>
            </Pressable>
          </Modal>
        ) : null}
        <BusinessModal type={detail} settings={settings} services={services} saving={saving} onClose={() => setDetail("")} onSave={saveSettings} />
      </View>
    </Marble>
  );
}

const s = StyleSheet.create({
  shell: { flex: 1 }, safe: { flex: 1 }, center: { flex: 1, alignItems: "center", justifyContent: "center" },
  content: { paddingHorizontal: 18, paddingTop: 8, paddingBottom: 112 },
  dashboardTop: { minHeight: 82, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 3 },
  dashSide: { width: 44, height: 44, alignItems: "center", justifyContent: "center" }, hamburger: { color: M.text2, fontSize: 26 }, bell: { color: M.text2, fontSize: 25 },
  badge: { position: "absolute", top: 1, right: 1, minWidth: 20, height: 20, borderRadius: 10, backgroundColor: M.goldDeep, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: M.goldSoft },
  badgeText: { color: "#0A0805", fontSize: 10, fontWeight: "900" },
  greeting: { color: M.text, fontSize: 29, fontWeight: "700", marginTop: 8 }, greetingSub: { color: M.muted, fontSize: 14, marginTop: 4 },
  standardHeader: { height: 66, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }, headerSide: { width: 50, height: 50, alignItems: "center", justifyContent: "center" },
  backIcon: { color: M.text2, fontSize: 41, fontWeight: "300", lineHeight: 43 }, headerTitle: { color: M.text, fontSize: 27, fontWeight: "700" }, menuIcon: { color: M.goldSoft, fontSize: 24 },
  headerSubtitle: { color: M.muted, textAlign: "center", fontSize: 14, marginTop: -2, marginBottom: 18 },
  summaryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 24 }, summaryGridNoTop: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  summaryCard: { width: "48.6%", minHeight: 128, borderRadius: 15, borderWidth: 1, borderColor: "rgba(214,189,122,.28)", backgroundColor: "rgba(16,16,15,.92)", padding: 14, ...cardShadow },
  summaryLabel: { color: M.text2, fontSize: 10, fontWeight: "700" }, summaryMain: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 12 },
  summaryValue: { color: M.text, fontSize: 29, fontWeight: "600" }, summaryIcon: { color: M.gold, fontSize: 31 }, summaryNote: { color: M.muted, fontSize: 10.5, marginTop: 9 },
  sectionTitleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 28, marginBottom: 10 }, sectionTitle: { color: M.text2, fontSize: 15.5, fontWeight: "800" }, sectionAction: { color: M.gold, fontSize: 13 },
  appointmentCard: { borderRadius: 13, borderWidth: 1, borderColor: "rgba(214,189,122,.20)", backgroundColor: "rgba(16,16,15,.94)", marginBottom: 9, overflow: "hidden", ...cardShadow },
  appointmentRow: { minHeight: 84, flexDirection: "row", alignItems: "center" }, appTimeBox: { width: 92, alignSelf: "stretch", alignItems: "center", justifyContent: "center", borderRightWidth: 1, borderRightColor: M.border },
  appTime: { color: M.goldSoft, fontSize: 18, fontWeight: "700" }, appDuration: { color: M.muted, fontSize: 9, marginTop: 4 }, appInfo: { flex: 1, paddingHorizontal: 14 }, appClient: { color: M.text, fontSize: 14, fontWeight: "700" }, appService: { color: M.text2, fontSize: 12, marginTop: 3 }, appMeta: { color: M.muted, fontSize: 9.5, marginTop: 4 },
  status: { marginRight: 10, borderRadius: 7, borderWidth: 1, borderColor: "#225A35", backgroundColor: M.greenBg, paddingHorizontal: 7, paddingVertical: 5 }, statusText: { color: M.green, fontSize: 7.5, fontWeight: "900" }, statusPending: { borderColor: "#6E521F", backgroundColor: M.amberBg }, statusBad: { borderColor: "#66372E", backgroundColor: M.redBg }, statusDone: { borderColor: M.border, backgroundColor: M.panel2 },
  pendingActions: { flexDirection: "row", gap: 8, padding: 10, borderTopWidth: 1, borderTopColor: M.borderSoft }, approveButton: { flex: 1, minHeight: 38, borderRadius: 8, backgroundColor: M.gold, alignItems: "center", justifyContent: "center" }, approveText: { color: "#090704", fontSize: 9, fontWeight: "900" }, declineButton: { flex: 1, minHeight: 38, borderRadius: 8, borderWidth: 1, borderColor: M.border, alignItems: "center", justifyContent: "center" }, declineText: { color: M.muted, fontSize: 9, fontWeight: "900" },
  dateStrip: { gap: 8, paddingVertical: 4, paddingRight: 20 }, dateChip: { width: 61, height: 72, borderRadius: 13, borderWidth: 1, borderColor: M.border, backgroundColor: "rgba(12,10,7,.82)", alignItems: "center", justifyContent: "center" }, dateChipActive: { backgroundColor: M.gold, borderColor: M.goldSoft, ...shadow }, dateDay: { color: M.muted, fontSize: 10.5, fontWeight: "700" }, dateNum: { color: M.text, fontSize: 20, fontWeight: "700", marginTop: 4 }, dateActiveText: { color: "#090704" }, dateHeading: { color: M.text2, fontSize: 13, fontWeight: "800", marginTop: 24, marginBottom: 12 },
  listCard: { borderRadius: 15, borderWidth: 1, borderColor: "rgba(214,189,122,.30)", backgroundColor: "rgba(16,16,15,.93)", overflow: "hidden", ...cardShadow }, listDivider: { borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,.08)" },
  serviceRankRow: { minHeight: 78, paddingHorizontal: 13, flexDirection: "row", alignItems: "center", gap: 11 }, rankCircle: { width: 34, height: 34, borderRadius: 17, borderWidth: 1.5, borderColor: M.gold, alignItems: "center", justifyContent: "center" }, rankText: { color: M.goldSoft, fontSize: 14, fontWeight: "700" }, serviceRankIcon: { color: M.gold, fontSize: 24 }, serviceRankName: { color: M.text, fontSize: 15, fontWeight: "700" }, serviceRankMeta: { color: M.muted, fontSize: 10.5, marginTop: 3 }, serviceRankRevenue: { color: M.text, fontSize: 17, fontWeight: "600" }, goldChevron: { color: M.gold, fontSize: 25 },
  peakRow: { minHeight: 62, paddingHorizontal: 13, flexDirection: "row", alignItems: "center", gap: 10 }, peakClock: { color: M.gold, fontSize: 20 }, peakLabel: { color: M.text2, fontSize: 12.5, width: 95 }, bars: { flex: 1, flexDirection: "row", gap: 4, alignItems: "center" }, bar: { width: 6, height: 20, borderRadius: 2, backgroundColor: M.borderSoft }, barOn: { backgroundColor: M.gold }, peakCount: { color: M.text2, fontSize: 10.5, width: 66, textAlign: "right" },
  search: { height: 52, borderRadius: 12, borderWidth: 1, borderColor: M.border, backgroundColor: "rgba(16,16,15,.92)", color: M.text, paddingHorizontal: 14, fontSize: 14 }, clientCard: { minHeight: 78, borderRadius: 13, borderWidth: 1, borderColor: "rgba(214,189,122,.20)", backgroundColor: "rgba(16,16,15,.92)", padding: 11, flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 9 }, avatar: { width: 46, height: 46, borderRadius: 23, borderWidth: 1, borderColor: M.goldDark, backgroundColor: M.panel3, alignItems: "center", justifyContent: "center" }, avatarText: { color: M.goldSoft, fontSize: 17, fontWeight: "900" }, clientName: { color: M.text, fontSize: 14, fontWeight: "700" }, clientMeta: { color: M.muted, fontSize: 9.5, marginTop: 3 }, regularPill: { borderRadius: 7, borderWidth: 1, borderColor: "#225A35", backgroundColor: M.greenBg, paddingHorizontal: 7, paddingVertical: 5 }, regularText: { color: M.green, fontSize: 7.5, fontWeight: "900" },
  settingSection: { marginTop: 22 }, settingSectionTitle: { color: M.gold, fontSize: 13, fontWeight: "800", marginBottom: 9 }, settingCard: { borderRadius: 14, borderWidth: 1, borderColor: "rgba(255,255,255,.06)", backgroundColor: "rgba(20,20,19,.92)", overflow: "hidden", ...cardShadow }, settingRow: { minHeight: 62, paddingHorizontal: 14, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }, settingDivider: { borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,.07)" }, settingLeft: { flex: 1, flexDirection: "row", alignItems: "center", gap: 11 }, settingIcon: { color: M.gold, fontSize: 20 }, settingTitle: { color: M.text2, fontSize: 13.5, fontWeight: "600" }, settingSubtitle: { color: M.muted, fontSize: 9.5, marginTop: 3 }, chevron: { color: M.gold, fontSize: 25 },
  select: { minWidth: 120, height: 38, borderRadius: 9, borderWidth: 1, borderColor: "rgba(214,189,122,.24)", backgroundColor: "rgba(7,7,6,.84)", paddingHorizontal: 10, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 }, selectText: { color: M.text2, fontSize: 11.5, fontWeight: "600" }, selectArrow: { color: M.gold, fontSize: 16 },
  toggle: { width: 52, height: 30, borderRadius: 15, backgroundColor: "#302B22", padding: 3, justifyContent: "center" }, toggleOn: { backgroundColor: M.gold }, toggleKnob: { width: 24, height: 24, borderRadius: 12, backgroundColor: "#B8B3A9" }, toggleKnobOn: { alignSelf: "flex-end", backgroundColor: "#FFF" },
  hoursDay: { padding: 14 }, hoursDayTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" }, hoursState: { color: M.gold, fontSize: 8, fontWeight: "900", marginTop: 3 }, shiftRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 11 }, timeInput: { flex: 1, height: 42, borderRadius: 9, borderWidth: 1, borderColor: M.border, backgroundColor: M.bg2, color: M.text, textAlign: "center", fontSize: 12 }, shiftDash: { color: M.muted }, removeShift: { width: 35, height: 42, borderRadius: 8, borderWidth: 1, borderColor: "#5F312B", alignItems: "center", justifyContent: "center" }, removeShiftText: { color: M.red, fontSize: 19 }, addShift: { color: M.goldSoft, fontSize: 8.5, fontWeight: "900", marginTop: 10 }, hoursSave: { padding: 13, borderTopWidth: 1, borderTopColor: M.borderSoft },
  logout: { height: 52, borderRadius: 11, borderWidth: 1, borderColor: "#5F312B", alignItems: "center", justifyContent: "center", marginTop: 24 }, logoutText: { color: M.red, fontSize: 10, fontWeight: "900", letterSpacing: 1 }, saving: { color: M.gold, fontSize: 9, textAlign: "center", marginTop: 9 },
  empty: { borderRadius: 13, borderWidth: 1, borderColor: M.border, backgroundColor: "rgba(16,16,15,.92)", padding: 18 }, emptyTitle: { color: M.gold, fontSize: 10, fontWeight: "900" }, emptyText: { color: M.muted, fontSize: 11, lineHeight: 17, marginTop: 6 }, muted: { color: M.muted }, error: { color: M.red, fontSize: 10.5, marginTop: 12 },
  navSafe: { backgroundColor: "rgba(4,4,3,.99)", borderTopWidth: 1, borderTopColor: "rgba(255,255,255,.07)" }, nav: { minHeight: 72, flexDirection: "row", alignItems: "center", paddingHorizontal: 5, paddingTop: 5 }, navItem: { flex: 1, minHeight: 56, alignItems: "center", justifyContent: "center" }, navIcon: { color: M.muted, fontSize: 21 }, navText: { color: M.muted, fontSize: 9.5, marginTop: 4 }, navActive: { color: M.goldSoft },
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,.74)", justifyContent: "flex-end" }, sheet: { backgroundColor: M.bg2, borderTopLeftRadius: 22, borderTopRightRadius: 22, borderWidth: 1, borderColor: M.border, padding: 18, paddingBottom: 34 }, sheetHandle: { width: 42, height: 4, borderRadius: 2, backgroundColor: M.border, alignSelf: "center", marginBottom: 16 }, sheetKicker: { color: M.gold, fontSize: 9, fontWeight: "900", letterSpacing: 1 }, sheetTitle: { color: M.text, fontSize: 22, fontWeight: "800", marginTop: 5, marginBottom: 10 }, option: { height: 50, borderRadius: 10, borderWidth: 1, borderColor: M.borderSoft, backgroundColor: M.panel, marginTop: 7, paddingHorizontal: 13, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }, optionActive: { borderColor: M.goldDeep, backgroundColor: M.panel3 }, optionText: { color: M.text2, fontSize: 12 }, optionTextActive: { color: M.goldSoft, fontWeight: "800" }, optionCheck: { color: M.goldSoft, fontSize: 16 },
  modalContent: { paddingHorizontal: 18, paddingBottom: 40 }, modalField: { marginTop: 14 }, modalLabel: { color: M.gold, fontSize: 9, fontWeight: "900", marginBottom: 6 }, modalInput: { height: 52, borderRadius: 10, borderWidth: 1, borderColor: M.border, backgroundColor: M.panel, color: M.text, paddingHorizontal: 13, fontSize: 13 }, modalIntro: { color: M.muted, fontSize: 11, lineHeight: 17, marginTop: 8 }, serviceModalRow: { minHeight: 70, borderRadius: 11, borderWidth: 1, borderColor: M.border, backgroundColor: M.panel, padding: 13, flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 9 }, serviceModalName: { color: M.text, fontSize: 13, fontWeight: "800" }, serviceModalMeta: { color: M.muted, fontSize: 9.5, marginTop: 4 }, serviceModalPrice: { color: M.goldSoft, fontSize: 18, fontWeight: "900" }, outlineButton: { height: 48, borderRadius: 10, borderWidth: 1, borderColor: M.goldDeep, alignItems: "center", justifyContent: "center", marginTop: 10 }, outlineButtonText: { color: M.goldSoft, fontSize: 9, fontWeight: "900" },
});
