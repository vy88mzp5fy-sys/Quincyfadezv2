import React, { useMemo, useState } from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";

const GOLD = "#C99B4A";
const GOLD_LIGHT = "#E7C77A";
const BG = "#050505";
const PANEL = "#0D0D0D";
const BORDER = "#242424";
const MUTED = "#929292";

const TABS = [
  { key: "home", icon: "⌂", label: "Home" },
  { key: "schedule", icon: "▦", label: "Schedule" },
  { key: "insights", icon: "↗", label: "Insights" },
  { key: "clients", icon: "◎", label: "Clients" },
  { key: "settings", icon: "⚙", label: "Settings" },
];

function MetricCard({ label, value = "—", meta }) {
  return (
    <View style={styles.metricCard}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
      {meta ? <Text style={styles.metricMeta}>{meta}</Text> : null}
    </View>
  );
}

function EmptyState({ eyebrow, title, text, actionLabel }) {
  return (
    <View style={styles.emptyCard}>
      <View style={styles.emptyIcon}><Text style={styles.emptyIconText}>Q</Text></View>
      <Text style={styles.emptyEyebrow}>{eyebrow}</Text>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyText}>{text}</Text>
      {actionLabel ? (
        <View style={styles.emptyAction}><Text style={styles.emptyActionText}>{actionLabel}</Text></View>
      ) : null}
    </View>
  );
}

function HomeTab() {
  return (
    <>
      <View style={styles.heroRow}>
        <View style={styles.heroCopy}>
          <Text style={styles.kicker}>BARBER DASHBOARD</Text>
          <Text style={styles.heroTitle}>Your Day, At A Glance.</Text>
          <Text style={styles.heroText}>A focused view of today’s appointments, money in, client activity and anything that needs your attention.</Text>
        </View>
        <View style={styles.livePill}><View style={styles.liveDot} /><Text style={styles.liveText}>LIVE</Text></View>
      </View>

      <View style={styles.metricsGrid}>
        <MetricCard label="TODAY'S REVENUE" meta="Real booking data" />
        <MetricCard label="TODAY'S BOOKINGS" meta="Confirmed appointments" />
        <MetricCard label="NEW CLIENTS" meta="First-time clients" />
        <MetricCard label="UTILISATION" meta="Booked working time" />
      </View>

      <View style={styles.focusCard}>
        <View style={styles.sectionTopRow}>
          <View><Text style={styles.sectionEyebrow}>NEXT UP</Text><Text style={styles.sectionTitle}>Today’s Schedule</Text></View>
          <View style={styles.smallPill}><Text style={styles.smallPillText}>TODAY</Text></View>
        </View>
        <Text style={styles.emptyLine}>No appointments to show yet.</Text>
      </View>

      <View style={styles.quickGrid}>
        <View style={styles.quickCard}><Text style={styles.quickIcon}>＋</Text><Text style={styles.quickTitle}>Add Booking</Text><Text style={styles.quickMeta}>Create a client appointment</Text></View>
        <View style={styles.quickCard}><Text style={styles.quickIcon}>◫</Text><Text style={styles.quickTitle}>Block Time</Text><Text style={styles.quickMeta}>Break, holiday or time off</Text></View>
        <View style={styles.quickCard}><Text style={styles.quickIcon}>◎</Text><Text style={styles.quickTitle}>Find Client</Text><Text style={styles.quickMeta}>Open a client profile fast</Text></View>
        <View style={styles.quickCard}><Text style={styles.quickIcon}>↗</Text><Text style={styles.quickTitle}>View Insights</Text><Text style={styles.quickMeta}>Performance and trends</Text></View>
      </View>
    </>
  );
}

function ScheduleTab() {
  return (
    <>
      <Text style={styles.kicker}>SCHEDULE</Text>
      <Text style={styles.pageTitle}>Control Your Time.</Text>
      <Text style={styles.pageText}>A clean day-first schedule built for quick changes while you’re working.</Text>

      <View style={styles.segmentRow}>
        {['DAY', 'WEEK', 'MONTH'].map((item, index) => (
          <View key={item} style={[styles.segment, index === 0 && styles.segmentActive]}><Text style={[styles.segmentText, index === 0 && styles.segmentTextActive]}>{item}</Text></View>
        ))}
      </View>

      <View style={styles.focusCard}>
        <View style={styles.sectionTopRow}>
          <View><Text style={styles.sectionEyebrow}>APPOINTMENTS</Text><Text style={styles.sectionTitle}>Today</Text></View>
          <Text style={styles.mutedSmall}>0 BOOKINGS</Text>
        </View>
        <Text style={styles.emptyLine}>No appointments to show yet.</Text>
      </View>

      <View style={styles.scheduleActions}>
        <View style={styles.actionRow}><View><Text style={styles.actionTitle}>Working Hours</Text><Text style={styles.actionMeta}>Set your normal weekly availability</Text></View><Text style={styles.rowArrow}>›</Text></View>
        <View style={styles.actionRow}><View><Text style={styles.actionTitle}>Block Time</Text><Text style={styles.actionMeta}>Breaks, holidays and one-off closures</Text></View><Text style={styles.rowArrow}>›</Text></View>
        <View style={styles.actionRow}><View><Text style={styles.actionTitle}>Booking Rules</Text><Text style={styles.actionMeta}>Notice period, booking window and slot spacing</Text></View><Text style={styles.rowArrow}>›</Text></View>
      </View>
    </>
  );
}

function InsightsTab() {
  return (
    <>
      <Text style={styles.kicker}>INSIGHTS</Text>
      <Text style={styles.pageTitle}>Know Your Business.</Text>
      <Text style={styles.pageText}>Only real QuincyFadez booking data appears here — no sample numbers or preview mode.</Text>

      <View style={styles.segmentRow}>
        {['DAY', 'WEEK', 'MONTH'].map((item, index) => (
          <View key={item} style={[styles.segment, index === 1 && styles.segmentActive]}><Text style={[styles.segmentText, index === 1 && styles.segmentTextActive]}>{item}</Text></View>
        ))}
      </View>

      <View style={styles.metricsGrid}>
        <MetricCard label="REVENUE" />
        <MetricCard label="BOOKINGS" />
        <MetricCard label="NEW CLIENTS" />
        <MetricCard label="AVG. BOOKING" />
      </View>

      <EmptyState
        eyebrow="PERFORMANCE"
        title="No Insights Yet"
        text="Revenue, bookings, clients, hours, utilisation, cancellations, no-shows and trends will build automatically as real appointments are completed."
      />
    </>
  );
}

function ClientsTab() {
  return (
    <>
      <View style={styles.sectionTopRow}>
        <View><Text style={styles.kicker}>CLIENTS</Text><Text style={styles.pageTitle}>Your Client Book.</Text></View>
        <View style={styles.addCircle}><Text style={styles.addCircleText}>＋</Text></View>
      </View>
      <Text style={styles.pageText}>Searchable client profiles with booking history, spend, notes, last visit, next visit and client status.</Text>

      <View style={styles.searchShell}><Text style={styles.searchIcon}>⌕</Text><Text style={styles.searchText}>Search Name, Phone Or Email</Text></View>

      <View style={styles.clientFilters}>
        {['ALL', 'REGULARS', 'NEW', 'INACTIVE'].map((item, index) => (
          <View key={item} style={[styles.filterPill, index === 0 && styles.filterPillActive]}><Text style={[styles.filterText, index === 0 && styles.filterTextActive]}>{item}</Text></View>
        ))}
      </View>

      <EmptyState
        eyebrow="CLIENT DIRECTORY"
        title="No Clients Yet"
        text="Clients will appear here automatically after their first QuincyFadez booking."
      />
    </>
  );
}

function SettingsGroup({ title, items }) {
  return (
    <View style={styles.settingsGroup}>
      <Text style={styles.settingsTitle}>{title}</Text>
      <View style={styles.settingsCard}>
        {items.map((item, index) => (
          <View key={item.title}>
            {index > 0 ? <View style={styles.settingsDivider} /> : null}
            <View style={styles.settingsRow}>
              <View style={styles.settingsIcon}><Text style={styles.settingsIconText}>{item.icon}</Text></View>
              <View style={styles.settingsCopy}><Text style={styles.settingsName}>{item.title}</Text><Text style={styles.settingsMeta}>{item.meta}</Text></View>
              <Text style={styles.rowArrow}>›</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

function SettingsTab() {
  const groups = [
    { title: 'PROFILE', items: [
      { icon: 'Q', title: 'Business Profile', meta: 'Name, photo, location and contact details' },
      { icon: '✂', title: 'Services & Pricing', meta: 'Manage services, durations and prices' },
    ]},
    { title: 'BOOKINGS', items: [
      { icon: '◷', title: 'Working Hours', meta: 'Weekly opening hours and availability' },
      { icon: '▦', title: 'Booking Rules', meta: 'Notice, booking window and slot intervals' },
      { icon: '◫', title: 'Blocked Time', meta: 'Breaks, holidays and closures' },
      { icon: '↻', title: 'Cancellation & Reschedule', meta: 'Client change and cancellation rules' },
    ]},
    { title: 'PAYMENTS', items: [
      { icon: '£', title: 'Payments', meta: 'Stripe status and booking protection' },
      { icon: '◇', title: 'Memberships', meta: 'Plans, allowances and member benefits' },
    ]},
    { title: 'GROWTH', items: [
      { icon: '★', title: 'Reviews', meta: 'Review links and client feedback' },
      { icon: '↗', title: 'Notifications & Rebooking', meta: 'Reminders and return-client prompts' },
    ]},
    { title: 'ACCOUNT & SUPPORT', items: [
      { icon: '⚿', title: 'Admin Security', meta: 'Secure owner access and sessions' },
      { icon: '?', title: 'Help & Support', meta: 'Support, app information and diagnostics' },
    ]},
  ];

  return (
    <>
      <Text style={styles.kicker}>SETTINGS</Text>
      <Text style={styles.pageTitle}>Run QuincyFadez Your Way.</Text>
      <Text style={styles.pageText}>Everything that controls your booking experience, business setup and growth tools in one place.</Text>
      {groups.map((group) => <SettingsGroup key={group.title} {...group} />)}
    </>
  );
}

export default function AdminScreen({ onExit }) {
  const [tab, setTab] = useState('home');
  const body = useMemo(() => {
    if (tab === 'schedule') return <ScheduleTab />;
    if (tab === 'insights') return <InsightsTab />;
    if (tab === 'clients') return <ClientsTab />;
    if (tab === 'settings') return <SettingsTab />;
    return <HomeTab />;
  }, [tab]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={BG} />
      <View style={styles.shell}>
        <View style={styles.adminHeader}>
          <View>
            <Text style={styles.brand}>QUINCYFADEZ</Text>
            <Text style={styles.adminLabel}>BARBER ADMIN</Text>
          </View>
          {onExit ? <Pressable onPress={onExit} style={styles.exitButton}><Text style={styles.exitText}>EXIT</Text></Pressable> : <View />}
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {body}
        </ScrollView>

        <View style={styles.bottomWrap}>
          <View style={styles.bottomNav}>
            {TABS.map((item) => {
              const active = tab === item.key;
              return (
                <Pressable key={item.key} onPress={() => setTab(item.key)} style={({ pressed }) => [styles.navItem, pressed && styles.pressed]}>
                  <View style={[styles.navIconWrap, active && styles.navIconWrapActive]}><Text style={[styles.navIcon, active && styles.navIconActive]}>{item.icon}</Text></View>
                  <Text style={[styles.navLabel, active && styles.navLabelActive]}>{item.label}</Text>
                  {active ? <View style={styles.navIndicator} /> : null}
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: BG },
  shell: { flex: 1, backgroundColor: BG },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 18, paddingBottom: 34 },
  adminHeader: { minHeight: 68, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#161616' },
  brand: { color: '#F7F7F7', fontSize: 16, letterSpacing: 3.1, fontWeight: '800' },
  adminLabel: { color: GOLD, fontSize: 7, letterSpacing: 2, fontWeight: '800', marginTop: 4 },
  exitButton: { borderRadius: 15, borderWidth: 1, borderColor: '#333', paddingHorizontal: 12, paddingVertical: 8 },
  exitText: { color: '#A8A8A8', fontSize: 7.5, letterSpacing: 1.2, fontWeight: '800' },
  heroRow: { paddingTop: 26, paddingBottom: 19, flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  heroCopy: { flex: 1 },
  kicker: { color: GOLD, fontSize: 8, letterSpacing: 2, fontWeight: '900', marginTop: 24 },
  heroTitle: { color: '#F5F5F5', fontSize: 30, lineHeight: 35, fontWeight: '750', marginTop: 8 },
  heroText: { color: MUTED, fontSize: 11.5, lineHeight: 18, marginTop: 9, maxWidth: 315 },
  livePill: { marginTop: 3, flexDirection: 'row', alignItems: 'center', borderRadius: 16, borderWidth: 1, borderColor: '#45371E', backgroundColor: '#120E07', paddingHorizontal: 9, paddingVertical: 6, gap: 6 },
  liveDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: GOLD_LIGHT },
  liveText: { color: GOLD_LIGHT, fontSize: 6.5, letterSpacing: 1.1, fontWeight: '900' },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
  metricCard: { width: '48.6%', minHeight: 112, borderRadius: 18, borderWidth: 1, borderColor: BORDER, backgroundColor: PANEL, padding: 15, justifyContent: 'space-between' },
  metricLabel: { color: '#8D7751', fontSize: 7, letterSpacing: 1.2, fontWeight: '800' },
  metricValue: { color: '#F2F2F2', fontSize: 27, fontWeight: '750', marginTop: 10 },
  metricMeta: { color: '#666', fontSize: 8.5, marginTop: 8 },
  focusCard: { marginTop: 17, borderRadius: 20, borderWidth: 1, borderColor: '#2B261D', backgroundColor: '#0B0A08', padding: 17 },
  sectionTopRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 },
  sectionEyebrow: { color: GOLD, fontSize: 7.5, letterSpacing: 1.6, fontWeight: '900' },
  sectionTitle: { color: '#F0F0F0', fontSize: 18, fontWeight: '700', marginTop: 5 },
  smallPill: { borderRadius: 14, borderWidth: 1, borderColor: '#373021', paddingHorizontal: 9, paddingVertical: 6 },
  smallPillText: { color: '#A28A5C', fontSize: 6.5, letterSpacing: 1, fontWeight: '800' },
  emptyLine: { color: '#777', fontSize: 10.5, paddingVertical: 25, textAlign: 'center' },
  quickGrid: { marginTop: 12, flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
  quickCard: { width: '48.6%', minHeight: 116, borderRadius: 17, borderWidth: 1, borderColor: '#222', backgroundColor: '#0A0A0A', padding: 15 },
  quickIcon: { color: GOLD_LIGHT, fontSize: 20 },
  quickTitle: { color: '#EDEDED', fontSize: 13, fontWeight: '700', marginTop: 10 },
  quickMeta: { color: '#777', fontSize: 8.5, lineHeight: 13, marginTop: 4 },
  pageTitle: { color: '#F5F5F5', fontSize: 29, lineHeight: 35, fontWeight: '750', marginTop: 7 },
  pageText: { color: MUTED, fontSize: 11.5, lineHeight: 18, marginTop: 9, marginBottom: 18, maxWidth: 340 },
  segmentRow: { minHeight: 42, borderRadius: 14, borderWidth: 1, borderColor: '#232323', backgroundColor: '#0A0A0A', flexDirection: 'row', padding: 4, gap: 4, marginBottom: 3 },
  segment: { flex: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 10 },
  segmentActive: { backgroundColor: '#1A1409', borderWidth: 1, borderColor: '#4B391C' },
  segmentText: { color: '#666', fontSize: 7, letterSpacing: 1, fontWeight: '800' },
  segmentTextActive: { color: GOLD_LIGHT },
  mutedSmall: { color: '#666', fontSize: 7, letterSpacing: 1 },
  scheduleActions: { marginTop: 13, borderRadius: 18, borderWidth: 1, borderColor: BORDER, backgroundColor: PANEL, overflow: 'hidden' },
  actionRow: { minHeight: 73, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#1D1D1D' },
  actionTitle: { color: '#EDEDED', fontSize: 13, fontWeight: '700' },
  actionMeta: { color: '#777', fontSize: 8.5, marginTop: 4 },
  rowArrow: { color: GOLD_LIGHT, fontSize: 24 },
  emptyCard: { marginTop: 17, borderRadius: 21, borderWidth: 1, borderColor: '#29251D', backgroundColor: '#0B0A08', paddingHorizontal: 22, paddingVertical: 28, alignItems: 'center' },
  emptyIcon: { width: 50, height: 50, borderRadius: 25, borderWidth: 1, borderColor: '#4B3A1D', backgroundColor: '#151006', alignItems: 'center', justifyContent: 'center' },
  emptyIconText: { color: GOLD_LIGHT, fontSize: 18, fontWeight: '900' },
  emptyEyebrow: { color: GOLD, fontSize: 7, letterSpacing: 1.6, fontWeight: '900', marginTop: 14 },
  emptyTitle: { color: '#F0F0F0', fontSize: 19, fontWeight: '700', marginTop: 6 },
  emptyText: { color: MUTED, fontSize: 10, lineHeight: 16, textAlign: 'center', marginTop: 8, maxWidth: 290 },
  emptyAction: { marginTop: 15, borderRadius: 14, borderWidth: 1, borderColor: '#4C3B20', paddingHorizontal: 14, paddingVertical: 9 },
  emptyActionText: { color: GOLD_LIGHT, fontSize: 7.5, letterSpacing: 1, fontWeight: '900' },
  addCircle: { width: 38, height: 38, borderRadius: 19, backgroundColor: GOLD, alignItems: 'center', justifyContent: 'center', marginTop: 24 },
  addCircleText: { color: '#080808', fontSize: 22, fontWeight: '700' },
  searchShell: { minHeight: 52, borderRadius: 15, borderWidth: 1, borderColor: '#272727', backgroundColor: PANEL, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, gap: 10 },
  searchIcon: { color: '#8C744A', fontSize: 19 },
  searchText: { color: '#666', fontSize: 9, letterSpacing: 0.4 },
  clientFilters: { flexDirection: 'row', gap: 7, marginTop: 10 },
  filterPill: { flex: 1, minHeight: 34, borderRadius: 12, borderWidth: 1, borderColor: '#222', alignItems: 'center', justifyContent: 'center' },
  filterPillActive: { borderColor: '#5A4524', backgroundColor: '#171107' },
  filterText: { color: '#666', fontSize: 6.5, letterSpacing: 0.7, fontWeight: '800' },
  filterTextActive: { color: GOLD_LIGHT },
  settingsGroup: { marginTop: 22 },
  settingsTitle: { color: '#8C744A', fontSize: 7.5, letterSpacing: 1.7, fontWeight: '900', marginBottom: 8 },
  settingsCard: { borderRadius: 18, borderWidth: 1, borderColor: BORDER, backgroundColor: PANEL, overflow: 'hidden' },
  settingsDivider: { height: 1, backgroundColor: '#1E1E1E', marginLeft: 62 },
  settingsRow: { minHeight: 72, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14 },
  settingsIcon: { width: 36, height: 36, borderRadius: 12, borderWidth: 1, borderColor: '#352B1B', backgroundColor: '#121008', alignItems: 'center', justifyContent: 'center' },
  settingsIconText: { color: GOLD_LIGHT, fontSize: 14, fontWeight: '800' },
  settingsCopy: { flex: 1, marginLeft: 12, paddingRight: 8 },
  settingsName: { color: '#ECECEC', fontSize: 12.5, fontWeight: '700' },
  settingsMeta: { color: '#777', fontSize: 8.5, marginTop: 4 },
  bottomWrap: { borderTopWidth: 1, borderTopColor: '#171717', paddingHorizontal: 8, paddingTop: 7, paddingBottom: 7, backgroundColor: BG },
  bottomNav: { minHeight: 62, flexDirection: 'row', borderRadius: 20, borderWidth: 1, borderColor: '#202020', backgroundColor: '#0A0A0A', paddingHorizontal: 2 },
  navItem: { flex: 1, minHeight: 54, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  navIconWrap: { width: 27, height: 24, alignItems: 'center', justifyContent: 'center', borderRadius: 10 },
  navIconWrapActive: { backgroundColor: '#181207', borderWidth: 1, borderColor: '#4D3B1E' },
  navIcon: { color: '#777', fontSize: 15 },
  navIconActive: { color: GOLD_LIGHT },
  navLabel: { color: '#777', fontSize: 7, marginTop: 2, fontWeight: '600' },
  navLabelActive: { color: '#EFE5D3' },
  navIndicator: { position: 'absolute', bottom: 1, width: 16, height: 2, borderRadius: 2, backgroundColor: GOLD },
  pressed: { opacity: 0.72 },
});