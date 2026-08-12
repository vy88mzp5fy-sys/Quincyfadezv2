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

function AppointmentCard({ booking, compact = false }) {
  return (
    <View style={[styles.bookingCard, compact && styles.bookingCardCompact]}>
      <View style={styles.bookingTimeWrap}><Text style={styles.bookingTime}>{formatTime(booking.start_at)}</Text><Text style={styles.bookingDuration}>{booking.duration_minutes || 0} MIN</Text></View>
      <View style={styles.bookingCopy}><Text style={styles.bookingName}>{booking.customer_name || "Client"}</Text><Text style={styles.bookingService}>{booking.service}</Text><Text style={styles.bookingMeta}>{formatDate(booking.start_at)} · {money(booking.price)}</Text></View>
      <View style={styles.statusPill}><Text style={styles.statusText}>{(booking.status || "confirmed").replace("_", " ").toUpperCase()}</Text></View>
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
      await AsyncStorage.setItem(TOKEN_KEY, data.token);
      onLogin(data.token);
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  };

  return (
    <SafeAreaView style={styles.safeArea}><StatusBar barStyle="light-content" backgroundColor={BG} /><View style={styles.loginWrap}>
      <View style={styles.loginMark}><Text style={styles.loginMarkText}>Q</Text></View>
      <Text style={styles.loginEyebrow}>QUINCYFADEZ OWNER</Text><Text style={styles.loginTitle}>Barber Admin.</Text>
      <Text style={styles.loginText}>Private access to bookings, clients, insights and your live schedule.</Text>
      <View style={styles.pinCard}><Text style={styles.pinLabel}>ADMIN PIN</Text><TextInput value={pin} onChangeText={setPin} keyboardType="number-pad" secureTextEntry maxLength={12} placeholder="••••" placeholderTextColor="#555" style={styles.pinInput} onSubmitEditing={submit} /></View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      <Pressable disabled={busy || pin.length < 4 || !API_URL} onPress={submit} style={[styles.loginButton, (busy || pin.length < 4 || !API_URL) && styles.disabled]}>{busy ? <ActivityIndicator color="#090909" /> : <><Text style={styles.loginButtonText}>OPEN ADMIN</Text><Text style={styles.loginArrow}>›</Text></>}</Pressable>
      <Text style={styles.securityNote}>Owner access is protected by a server-verified PIN and temporary secure session.</Text>
    </View></SafeAreaView>
  );
}

export default function AdminScreen({ onExit }) {
  const [token, setToken] = useState("");
  const [checking, setChecking] = useState(true);
  const [tab, setTab] = useState("home");
  const [overview, setOverview] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [clients, setClients] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const adminRequest = async (path) => {
    const response = await fetch(`${API_URL}${path}`, { headers: { Authorization: `Bearer ${token}` } });
    const data = await response.json().catch(() => ({}));
    if (response.status === 401) {
      await AsyncStorage.removeItem(TOKEN_KEY); setToken(""); throw new Error("Admin session expired. Please sign in again.");
    }
    if (!response.ok) throw new Error(data.detail || "Admin data could not be loaded.");
    return data;
  };

  useEffect(() => {
    AsyncStorage.getItem(TOKEN_KEY).then((stored) => { if (stored) setToken(stored); }).finally(() => setChecking(false));
  }, []);

  const loadHome = async () => {
    if (!token) return;
    setLoading(true); setError("");
    try { setOverview(await adminRequest("/api/admin/overview")); } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  const loadTab = async () => {
    if (!token) return;
    setLoading(true); setError("");
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

  const body = useMemo(() => {
    if (tab === "home") {
      const next = overview?.next_booking;
      const appointments = overview?.appointments || [];
      return <>
        <View style={styles.heroRow}><View style={styles.heroCopy}><Text style={styles.kicker}>BARBER DASHBOARD</Text><Text style={styles.heroTitle}>Your Day, At A Glance.</Text><Text style={styles.heroText}>Live business data, today’s appointments and the next thing that needs your attention.</Text></View><View style={styles.livePill}><View style={styles.liveDot} /><Text style={styles.liveText}>LIVE</Text></View></View>
        <View style={styles.metricsGrid}><MetricCard label="TODAY'S REVENUE" value={money(overview?.today_revenue)} meta="Completed appointments" /><MetricCard label="TODAY'S BOOKINGS" value={String(overview?.today_bookings ?? 0)} meta="Today" /><MetricCard label="NEW CLIENTS" value={String(overview?.new_clients ?? 0)} meta="First-time clients" /><MetricCard label="UTILISATION" value={overview?.utilisation_percent == null ? "—" : `${overview.utilisation_percent}%`} meta="Booked working time" /></View>
        <View style={styles.focusCard}><View style={styles.sectionTopRow}><View><Text style={styles.sectionEyebrow}>NEXT UP</Text><Text style={styles.sectionTitle}>{next ? `${formatTime(next.start_at)} · ${next.customer_name || "Client"}` : "No Appointment Waiting"}</Text></View><Pressable onPress={loadHome} style={styles.smallPill}><Text style={styles.smallPillText}>REFRESH</Text></Pressable></View>{next ? <AppointmentCard booking={next} compact /> : <Text style={styles.emptyLine}>Your next confirmed booking will appear here automatically.</Text>}</View>
        <View style={styles.focusCard}><View style={styles.sectionTopRow}><View><Text style={styles.sectionEyebrow}>TODAY</Text><Text style={styles.sectionTitle}>Today’s Schedule</Text></View><Text style={styles.mutedSmall}>{appointments.length} BOOKINGS</Text></View>{appointments.length ? appointments.slice(0, 5).map((item) => <AppointmentCard key={item.id} booking={item} />) : <Text style={styles.emptyLine}>No appointments to show yet.</Text>}</View>
      </>;
    }
    if (tab === "schedule") return <><Text style={styles.kicker}>SCHEDULE</Text><Text style={styles.pageTitle}>Control Your Time.</Text><Text style={styles.pageText}>Your next seven days, pulled directly from the QuincyFadez booking system.</Text><View style={styles.segmentRow}>{["DAY", "WEEK", "MONTH"].map((x, i) => <View key={x} style={[styles.segment, i === 1 && styles.segmentActive]}><Text style={[styles.segmentText, i === 1 && styles.segmentTextActive]}>{x}</Text></View>)}</View><View style={styles.focusCard}><View style={styles.sectionTopRow}><View><Text style={styles.sectionEyebrow}>UPCOMING</Text><Text style={styles.sectionTitle}>Next 7 Days</Text></View><Text style={styles.mutedSmall}>{bookings.length} BOOKINGS</Text></View>{bookings.length ? bookings.map((item) => <AppointmentCard key={item.id} booking={item} />) : <Text style={styles.emptyLine}>No appointments booked in this period.</Text>}</View><View style={styles.scheduleActions}><View style={styles.actionRow}><View><Text style={styles.actionTitle}>Working Hours</Text><Text style={styles.actionMeta}>Set your normal weekly availability</Text></View><Text style={styles.rowArrow}>›</Text></View><View style={styles.actionRow}><View><Text style={styles.actionTitle}>Block Time</Text><Text style={styles.actionMeta}>Breaks, holidays and one-off closures</Text></View><Text style={styles.rowArrow}>›</Text></View><View style={styles.actionRow}><View><Text style={styles.actionTitle}>Booking Rules</Text><Text style={styles.actionMeta}>Notice, booking window and slot spacing</Text></View><Text style={styles.rowArrow}>›</Text></View></View></>;
    if (tab === "insights") return <><Text style={styles.kicker}>INSIGHTS</Text><Text style={styles.pageTitle}>Know Your Business.</Text><Text style={styles.pageText}>No fake demo numbers. This area only shows data created by real QuincyFadez bookings.</Text><View style={styles.metricsGrid}><MetricCard label="TODAY'S REVENUE" value={money(overview?.today_revenue)} /><MetricCard label="TODAY'S BOOKINGS" value={String(overview?.today_bookings ?? 0)} /><MetricCard label="NEW CLIENTS" value={String(overview?.new_clients ?? 0)} /><MetricCard label="UTILISATION" value={overview?.utilisation_percent == null ? "—" : `${overview.utilisation_percent}%`} /></View><View style={styles.emptyCard}><Text style={styles.emptyEyebrow}>PERFORMANCE</Text><Text style={styles.emptyTitle}>{overview?.today_bookings ? "Insights Are Building" : "No Insights Yet"}</Text><Text style={styles.emptyText}>Day, week and month trends will grow from completed bookings, cancellations, no-shows, spend and client retention.</Text></View></>;
    if (tab === "clients") return <><View style={styles.sectionTopRow}><View><Text style={styles.kicker}>CLIENTS</Text><Text style={styles.pageTitle}>Your Client Book.</Text></View><View style={styles.addCircle}><Text style={styles.addCircleText}>＋</Text></View></View><Text style={styles.pageText}>Real client profiles built automatically from QuincyFadez appointments.</Text><View style={styles.searchShell}><Text style={styles.searchIcon}>⌕</Text><Text style={styles.searchText}>Search is next — live client data is connected now</Text></View>{clients.length ? clients.map((client) => <View key={client.client_key} style={styles.clientCard}><View style={styles.clientAvatar}><Text style={styles.clientAvatarText}>{(client.name || "C").slice(0, 1).toUpperCase()}</Text></View><View style={styles.clientCopy}><Text style={styles.clientName}>{client.name || "Client"}</Text><Text style={styles.clientMeta}>{client.phone || client.email || "No contact saved"}</Text><Text style={styles.clientStats}>{client.booking_count || 0} BOOKINGS · {money(client.total_spend)} SPEND{client.regular ? " · REGULAR" : ""}</Text></View><Text style={styles.rowArrow}>›</Text></View>) : <View style={styles.emptyCard}><Text style={styles.emptyEyebrow}>CLIENT DIRECTORY</Text><Text style={styles.emptyTitle}>No Clients Yet</Text><Text style={styles.emptyText}>Clients appear here automatically after their first in-app booking.</Text></View>}</>;
    return <><Text style={styles.kicker}>SETTINGS</Text><Text style={styles.pageTitle}>Run QuincyFadez Your Way.</Text><Text style={styles.pageText}>Live booking controls and business settings in one place.</Text><View style={styles.settingsSummary}><MetricCard label="SLOT INTERVAL" value={settings ? `${settings.slot_interval_minutes}m` : "—"} /><MetricCard label="MIN NOTICE" value={settings ? `${settings.minimum_notice_minutes}m` : "—"} /><MetricCard label="BOOKING WINDOW" value={settings ? `${settings.booking_window_days}d` : "—"} /><MetricCard label="CHANGE NOTICE" value={settings ? `${settings.reschedule_notice_hours}h` : "—"} /></View>{["PROFILE", "BOOKINGS", "PAYMENTS", "GROWTH", "ACCOUNT & SUPPORT"].map((group) => <View key={group} style={styles.settingsGroup}><Text style={styles.settingsTitle}>{group}</Text><View style={styles.settingsCard}><View style={styles.settingsRow}><View><Text style={styles.settingsName}>{group === "BOOKINGS" ? "Working Hours & Booking Rules" : group === "PROFILE" ? "Business Profile & Services" : group === "PAYMENTS" ? "Stripe & Memberships" : group === "GROWTH" ? "Reviews & Rebooking" : "Admin Security & Help"}</Text><Text style={styles.settingsMeta}>Open controls and configuration</Text></View><Text style={styles.rowArrow}>›</Text></View></View></View>)}</>;
  }, [tab, overview, bookings, clients, settings]);

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
  focusCard:{marginTop:17,borderRadius:20,borderWidth:1,borderColor:"#2B261D",backgroundColor:"#0B0A08",padding:17},sectionTopRow:{flexDirection:"row",alignItems:"flex-start",justifyContent:"space-between",gap:12},sectionEyebrow:{color:GOLD,fontSize:7.5,letterSpacing:1.6,fontWeight:"900"},sectionTitle:{color:"#F0F0F0",fontSize:18,fontWeight:"700",marginTop:5},smallPill:{borderRadius:14,borderWidth:1,borderColor:"#373021",paddingHorizontal:9,paddingVertical:6},smallPillText:{color:"#A28A5C",fontSize:6.5,letterSpacing:1,fontWeight:"800"},mutedSmall:{color:"#666",fontSize:7,letterSpacing:1},emptyLine:{color:"#777",fontSize:10.5,paddingVertical:24,textAlign:"center"},
  bookingCard:{marginTop:10,minHeight:72,borderRadius:15,borderWidth:1,borderColor:"#222",backgroundColor:"#0A0A0A",padding:12,flexDirection:"row",alignItems:"center",gap:12},bookingCardCompact:{borderColor:"#4B3A20",backgroundColor:"#100D07"},bookingTimeWrap:{width:52},bookingTime:{color:GOLD_LIGHT,fontSize:15,fontWeight:"800"},bookingDuration:{color:"#70654F",fontSize:6.5,marginTop:4},bookingCopy:{flex:1},bookingName:{color:"#EFEFEF",fontSize:12.5,fontWeight:"700"},bookingService:{color:"#A9A9A9",fontSize:9,marginTop:3},bookingMeta:{color:"#666",fontSize:7.5,marginTop:4},statusPill:{borderRadius:12,borderWidth:1,borderColor:"#3A3020",paddingHorizontal:7,paddingVertical:5},statusText:{color:"#A78C58",fontSize:5.7,letterSpacing:.6,fontWeight:"800"},
  pageTitle:{color:"#F5F5F5",fontSize:29,lineHeight:35,fontWeight:"750",marginTop:7},pageText:{color:MUTED,fontSize:11.5,lineHeight:18,marginTop:9,marginBottom:18,maxWidth:340},segmentRow:{minHeight:42,borderRadius:14,borderWidth:1,borderColor:"#232323",backgroundColor:"#0A0A0A",flexDirection:"row",padding:4,gap:4},segment:{flex:1,alignItems:"center",justifyContent:"center",borderRadius:10},segmentActive:{backgroundColor:"#1A1409",borderWidth:1,borderColor:"#4B391C"},segmentText:{color:"#666",fontSize:7,letterSpacing:1,fontWeight:"800"},segmentTextActive:{color:GOLD_LIGHT},
  scheduleActions:{marginTop:13,borderRadius:18,borderWidth:1,borderColor:BORDER,backgroundColor:PANEL,overflow:"hidden"},actionRow:{minHeight:73,paddingHorizontal:16,flexDirection:"row",alignItems:"center",justifyContent:"space-between",borderBottomWidth:1,borderBottomColor:"#1D1D1D"},actionTitle:{color:"#EDEDED",fontSize:13,fontWeight:"700"},actionMeta:{color:"#777",fontSize:8.5,marginTop:4},rowArrow:{color:GOLD_LIGHT,fontSize:24},
  emptyCard:{marginTop:17,borderRadius:21,borderWidth:1,borderColor:"#29251D",backgroundColor:"#0B0A08",paddingHorizontal:22,paddingVertical:28,alignItems:"center"},emptyEyebrow:{color:GOLD,fontSize:7,letterSpacing:1.6,fontWeight:"900"},emptyTitle:{color:"#F0F0F0",fontSize:19,fontWeight:"700",marginTop:6},emptyText:{color:MUTED,fontSize:10,lineHeight:16,textAlign:"center",marginTop:8,maxWidth:290},
  addCircle:{width:38,height:38,borderRadius:19,backgroundColor:GOLD,alignItems:"center",justifyContent:"center",marginTop:24},addCircleText:{color:"#080808",fontSize:22,fontWeight:"700"},searchShell:{minHeight:52,borderRadius:15,borderWidth:1,borderColor:"#272727",backgroundColor:PANEL,flexDirection:"row",alignItems:"center",paddingHorizontal:15,gap:10},searchIcon:{color:"#8C744A",fontSize:19},searchText:{color:"#666",fontSize:9,letterSpacing:.4},clientCard:{marginTop:9,minHeight:78,borderRadius:16,borderWidth:1,borderColor:BORDER,backgroundColor:PANEL,padding:12,flexDirection:"row",alignItems:"center"},clientAvatar:{width:42,height:42,borderRadius:21,borderWidth:1,borderColor:"#4B3A20",backgroundColor:"#151006",alignItems:"center",justifyContent:"center"},clientAvatarText:{color:GOLD_LIGHT,fontSize:16,fontWeight:"800"},clientCopy:{flex:1,marginLeft:11},clientName:{color:"#EFEFEF",fontSize:13,fontWeight:"700"},clientMeta:{color:"#888",fontSize:8.5,marginTop:3},clientStats:{color:"#8D7751",fontSize:6.8,letterSpacing:.45,marginTop:5,fontWeight:"800"},
  settingsSummary:{flexDirection:"row",flexWrap:"wrap",gap:9},settingsGroup:{marginTop:20},settingsTitle:{color:"#8C744A",fontSize:7.5,letterSpacing:1.7,fontWeight:"900",marginBottom:8},settingsCard:{borderRadius:18,borderWidth:1,borderColor:BORDER,backgroundColor:PANEL,overflow:"hidden"},settingsRow:{minHeight:72,flexDirection:"row",alignItems:"center",justifyContent:"space-between",paddingHorizontal:15},settingsName:{color:"#ECECEC",fontSize:12.5,fontWeight:"700"},settingsMeta:{color:"#777",fontSize:8.5,marginTop:4},
  bottomWrap:{borderTopWidth:1,borderTopColor:"#171717",paddingHorizontal:8,paddingTop:7,paddingBottom:7,backgroundColor:BG},bottomNav:{minHeight:62,flexDirection:"row",borderRadius:20,borderWidth:1,borderColor:"#202020",backgroundColor:"#0A0A0A",paddingHorizontal:2},navItem:{flex:1,minHeight:54,alignItems:"center",justifyContent:"center",position:"relative"},navIconWrap:{width:27,height:24,alignItems:"center",justifyContent:"center",borderRadius:10},navIconWrapActive:{backgroundColor:"#181207",borderWidth:1,borderColor:"#4D3B1E"},navIcon:{color:"#777",fontSize:15},navIconActive:{color:GOLD_LIGHT},navLabel:{color:"#777",fontSize:7,marginTop:2,fontWeight:"600"},navLabelActive:{color:"#EFE5D3"},navIndicator:{position:"absolute",bottom:1,width:16,height:2,borderRadius:2,backgroundColor:GOLD},pressed:{opacity:.72},
});