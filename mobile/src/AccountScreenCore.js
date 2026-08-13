import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CustomerSheet, CustomerSheetError } from "@stripe/stripe-react-native";

const GOLD = "#C99B4A";
const GOLD_LIGHT = "#E7C77A";
const BG = "#050505";
const PANEL = "#0D0D0D";
const BORDER = "#242424";
const MUTED = "#9A9A9A";
const API_URL = (process.env.EXPO_PUBLIC_API_URL || "").replace(/\/$/, "");
const CLIENT_KEY_STORAGE = "quincyfadez.paymentClientKey";

const links = {
  whatsapp: "https://wa.me/447490194682",
  website: "https://quincyfadez.com",
  reviews: "https://g.page/r/CbQwl91s8_vqEBM/review",
};

function makeClientKey() {
  return `qfz_${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}_${Math.random().toString(36).slice(2)}`;
}

async function getClientKey() {
  const existing = await AsyncStorage.getItem(CLIENT_KEY_STORAGE);
  if (existing) return existing;
  const created = makeClientKey();
  await AsyncStorage.setItem(CLIENT_KEY_STORAGE, created);
  return created;
}

function formatBookingDate(value) {
  return new Date(value).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Europe/London",
  });
}

function formatBookingTime(value) {
  return new Date(value).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Europe/London",
  });
}

function bookingStatusLabel(status) {
  if (status === "pending") return "AWAITING APPROVAL";
  if (status === "confirmed") return "CONFIRMED";
  if (status === "cancelled") return "CANCELLED";
  if (status === "expired") return "EXPIRED";
  if (status === "no_show") return "NO-SHOW";
  return "COMPLETED";
}

function bookingPaymentLabel(booking) {
  const captured = Number(booking?.captured_amount || 0);
  if (captured > 0) return `£${captured.toFixed(2)} CAPTURED`;
  if (booking?.payment_status === "not_charged" || booking?.payment_method_verified) return "CARD VERIFIED · NO CHARGE YET";
  return "NO PAYMENT RECORDED";
}

export default function AccountScreen({ onBack }) {
  const [clientKey, setClientKey] = useState("");
  const [paymentSummary, setPaymentSummary] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [busy, setBusy] = useState(false);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [cancellingId, setCancellingId] = useState("");
  const [error, setError] = useState("");

  const request = async (path, options = {}) => {
    if (!API_URL) throw new Error("Secure account services are still being connected.");
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(typeof data.detail === "string" ? data.detail : "Account service unavailable.");
    return data;
  };

  const refreshPayment = async (key, silent = false) => {
    if (!key || !API_URL) return;
    try {
      const data = await request("/api/payments/verify", { method: "POST", body: JSON.stringify({ client_key: key }) });
      setPaymentSummary(data.verified ? data.payment_method || null : null);
      if (!silent) setError("");
    } catch (err) { if (!silent) setError(err.message); }
  };

  const refreshBookings = async (key, silent = false) => {
    if (!key || !API_URL) return;
    if (!silent) setLoadingBookings(true);
    try {
      const data = await request(`/api/booking/appointments/${encodeURIComponent(key)}`);
      setBookings(data.bookings || []);
      if (!silent) setError("");
    } catch (err) { if (!silent) setError(err.message); }
    finally { if (!silent) setLoadingBookings(false); }
  };

  useEffect(() => {
    let active = true;
    getClientKey().then(async (key) => {
      if (!active) return;
      setClientKey(key);
      await Promise.all([refreshPayment(key, true), refreshBookings(key, true)]);
    }).catch(() => { if (active) setError("Account setup could not start on this device."); });
    return () => { active = false; };
  }, []);

  const managePaymentMethods = async () => {
    if (!clientKey || busy) return;
    setBusy(true); setError("");
    try {
      const clientSecretProvider = {
        async provideCustomerSessionClientSecret() {
          const data = await request("/api/payments/customer-session", { method: "POST", body: JSON.stringify({ client_key: clientKey }) });
          return { customerId: data.customer, clientSecret: data.customer_session_client_secret };
        },
        async provideSetupIntentClientSecret() {
          const data = await request("/api/payments/customer-sheet-setup", { method: "POST", body: JSON.stringify({ client_key: clientKey }) });
          return data.setup_intent_client_secret;
        },
      };
      const { error: initError } = await CustomerSheet.initialize({
        intentConfiguration: { paymentMethodTypes: ["card"] },
        clientSecretProvider,
        headerTextForSelectionScreen: "Manage your payment method",
        returnURL: "quincyfadez://stripe-redirect",
        appearance: { colors: { primary: GOLD, background: "#0A0A0A", componentBackground: "#111111", componentBorder: "#2A2A2A", primaryText: "#F5F5F5", secondaryText: "#9A9A9A", componentText: "#F5F5F5" }, shapes: { borderRadius: 14, borderWidth: 1 } },
      });
      if (initError) throw new Error(initError.message || "Payment settings could not be opened.");
      const result = await CustomerSheet.present();
      if (result.error && result.error.code !== CustomerSheetError.Canceled) throw new Error(result.error.message || "Payment settings could not be updated.");
      await refreshPayment(clientKey, true);
    } catch (err) { setError(err.message || "Payment settings could not be opened."); }
    finally { setBusy(false); }
  };

  const cancelBooking = async (bookingId) => {
    if (!clientKey || cancellingId) return;
    setCancellingId(bookingId); setError("");
    try {
      await request(`/api/booking/appointments/${bookingId}/cancel`, { method: "POST", body: JSON.stringify({ client_key: clientKey }) });
      await refreshBookings(clientKey, true);
    } catch (err) { setError(err.message || "This appointment could not be cancelled."); }
    finally { setCancellingId(""); }
  };

  const cardLabel = paymentSummary?.last4 ? `${(paymentSummary.brand || "Card").toUpperCase()}  •••• ${paymentSummary.last4}` : "No Saved Payment Method";
  const now = Date.now();
  const upcoming = bookings.filter((booking) => ["pending", "confirmed"].includes(booking.status) && new Date(booking.start_at).getTime() >= now);
  const past = bookings.filter((booking) => !["pending", "confirmed"].includes(booking.status) || new Date(booking.start_at).getTime() < now);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={BG} />
      <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}><Pressable onPress={onBack} hitSlop={12} style={styles.backButton}><Text style={styles.backIcon}>‹</Text></Pressable><Text style={styles.headerTitle}>ACCOUNT</Text><View style={styles.headerSpacer} /></View>
        <View style={styles.intro}><Text style={styles.eyebrow}>YOUR QUINCYFADEZ</Text><Text style={styles.title}>Everything In One Place.</Text><Text style={styles.subtitle}>Your appointments, booking requests, payment method and QuincyFadez links — all inside the app.</Text></View>

        <View style={styles.sectionHeadingRow}><View><Text style={styles.sectionEyebrow}>APPOINTMENTS</Text><Text style={styles.sectionTitle}>Upcoming Bookings</Text></View><Pressable onPress={() => refreshBookings(clientKey)} disabled={loadingBookings || !clientKey} style={styles.refreshButton}><Text style={styles.refreshText}>{loadingBookings ? "…" : "REFRESH"}</Text></Pressable></View>

        {loadingBookings ? (
          <View style={styles.loadingCard}><ActivityIndicator color={GOLD_LIGHT} /><Text style={styles.loadingText}>Refreshing bookings…</Text></View>
        ) : upcoming.length ? (
          <View style={styles.bookingList}>
            {upcoming.map((booking) => {
              const pending = booking.status === "pending";
              return <View key={booking.id} style={[styles.bookingCard, pending && styles.pendingBookingCard]}>
                <View style={styles.bookingTop}>
                  <View style={styles.bookingCopy}><Text style={styles.bookingService}>{booking.service}</Text><Text style={styles.bookingDate}>{formatBookingDate(booking.start_at)}</Text><Text style={styles.bookingTime}>{formatBookingTime(booking.start_at)} · {booking.duration_minutes} MIN</Text></View>
                  <View style={[styles.confirmedBadge, pending && styles.pendingBadge]}><Text style={[styles.confirmedBadgeText, pending && styles.pendingBadgeText]}>{pending ? "AWAITING APPROVAL" : "CONFIRMED"}</Text></View>
                </View>
                {pending ? <View style={styles.pendingInfo}><Text style={styles.pendingInfoTitle}>REQUEST SENT</Text><Text style={styles.pendingInfoText}>This time is being held while QuincyFadez reviews your request. Refresh this page to see when it becomes confirmed.</Text></View> : null}
                <View style={styles.paymentStateRow}><Text style={styles.paymentStateLabel}>PAYMENT</Text><Text style={styles.paymentStateValue}>{bookingPaymentLabel(booking)}</Text></View>
                <View style={styles.bookingFooter}><View><Text style={styles.serviceValueLabel}>SERVICE VALUE</Text><Text style={styles.bookingPrice}>£{booking.price}</Text></View><Pressable onPress={() => cancelBooking(booking.id)} disabled={Boolean(cancellingId)} style={({ pressed }) => [styles.cancelButton, pressed && styles.pressed, cancellingId === booking.id && styles.disabled]}><Text style={styles.cancelButtonText}>{cancellingId === booking.id ? "CANCELLING…" : pending ? "CANCEL REQUEST" : "CANCEL BOOKING"}</Text></Pressable></View>
              </View>;
            })}
          </View>
        ) : (
          <View style={styles.emptyBookingCard}><Text style={styles.emptyBookingTitle}>NO UPCOMING BOOKINGS</Text><Text style={styles.emptyBookingText}>Confirmed appointments and booking requests waiting for approval will appear here.</Text></View>
        )}

        {past.length ? (
          <View style={styles.historyCard}>
            <Text style={styles.historyTitle}>RECENT ACTIVITY</Text>
            {past.slice(-5).reverse().map((booking, index) => {
              const status = bookingStatusLabel(booking.status);
              const danger = ["cancelled", "expired", "no_show"].includes(booking.status);
              return <View key={booking.id}>{index > 0 ? <View style={styles.historyDivider} /> : null}<View style={styles.historyRow}><View style={styles.historyCopy}><Text style={styles.historyService}>{booking.service}</Text><Text style={styles.historyMeta}>{formatBookingDate(booking.start_at)} · {formatBookingTime(booking.start_at)}</Text><Text style={styles.historyPayment}>{bookingPaymentLabel(booking)}</Text>{booking.status === "expired" ? <Text style={styles.historyHint}>The approval window ended before this request was confirmed.</Text> : null}</View><Text style={[styles.historyStatus, danger && styles.historyStatusCancelled]}>{status}</Text></View></View>;
            })}
          </View>
        ) : null}

        <View style={styles.paymentCard}><View style={styles.rowBetween}><View style={styles.paymentCopy}><Text style={styles.cardEyebrow}>PAYMENT METHOD</Text><Text style={styles.cardTitle}>{cardLabel}</Text></View><View style={[styles.statusBadge, paymentSummary && styles.statusBadgeReady]}><Text style={[styles.statusText, paymentSummary && styles.statusTextReady]}>{paymentSummary ? "VERIFIED" : "NOT SET"}</Text></View></View><Text style={styles.cardText}>{paymentSummary ? "Saved securely with Stripe for booking protection. A verified card is not the same as a payment — no appointment charge is created just by saving or verifying it." : "Add and verify a payment method with Stripe for booking protection. Verification itself does not charge an appointment price."}</Text><Pressable onPress={managePaymentMethods} disabled={busy || !clientKey} style={({ pressed }) => [styles.goldButton, pressed && styles.pressed, busy && styles.disabled]}><Text style={styles.goldButtonText}>{busy ? "OPENING STRIPE…" : "MANAGE PAYMENT METHODS"}</Text><Text style={styles.goldArrow}>›</Text></Pressable></View>

        {error ? <View style={styles.errorCard}><Text style={styles.errorText}>{error}</Text></View> : null}

        <View style={styles.section}><Text style={styles.sectionTitle}>Quick Links</Text><Pressable onPress={() => Linking.openURL(links.whatsapp)} style={({ pressed }) => [styles.linkRow, pressed && styles.pressed]}><View><Text style={styles.linkTitle}>WhatsApp QuincyFadez</Text><Text style={styles.linkMeta}>Questions, changes or help</Text></View><Text style={styles.linkArrow}>›</Text></Pressable><Pressable onPress={() => Linking.openURL(links.website)} style={({ pressed }) => [styles.linkRow, pressed && styles.pressed]}><View><Text style={styles.linkTitle}>QuincyFadez Website</Text><Text style={styles.linkMeta}>Services, gallery and information</Text></View><Text style={styles.linkArrow}>›</Text></Pressable><Pressable onPress={() => Linking.openURL(links.reviews)} style={({ pressed }) => [styles.linkRow, pressed && styles.pressed]}><View><Text style={styles.linkTitle}>Leave A Google Review</Text><Text style={styles.linkMeta}>Share your experience</Text></View><Text style={styles.linkArrow}>›</Text></Pressable></View>
        <View style={styles.securityCard}><Text style={styles.securityTitle}>SECURE BY STRIPE</Text><Text style={styles.securityText}>Payment details are collected and managed by Stripe. QuincyFadez only receives safe references and limited display details such as card brand and last four digits.</Text></View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: BG }, screen: { flex: 1, backgroundColor: BG }, content: { paddingHorizontal: 18, paddingTop: 6, paddingBottom: 36 },
  header: { minHeight: 54, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderBottomWidth: 1, borderBottomColor: "#151515" }, backButton: { width: 44, height: 44, justifyContent: "center" }, backIcon: { color: "#F5F5F5", fontSize: 34, lineHeight: 34 }, headerTitle: { color: "#F4F4F4", fontSize: 13, letterSpacing: 2.1, fontWeight: "700" }, headerSpacer: { width: 44 },
  intro: { paddingTop: 27, paddingBottom: 20 }, eyebrow: { color: GOLD, fontSize: 8.5, letterSpacing: 2, fontWeight: "800" }, title: { color: "#F5F5F5", fontSize: 29, lineHeight: 34, fontWeight: "700", marginTop: 8 }, subtitle: { color: MUTED, fontSize: 12.5, lineHeight: 19, marginTop: 9, maxWidth: 350 },
  sectionHeadingRow: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 11 }, sectionEyebrow: { color: GOLD, fontSize: 7.5, letterSpacing: 1.7, fontWeight: "800" }, sectionTitle: { color: "#F2F2F2", fontSize: 19, fontWeight: "700", marginTop: 4 }, refreshButton: { borderRadius: 14, borderWidth: 1, borderColor: "#3A3020", paddingHorizontal: 10, paddingVertical: 7 }, refreshText: { color: GOLD_LIGHT, fontSize: 7, letterSpacing: 1, fontWeight: "800" },
  loadingCard: { minHeight: 88, borderRadius: 18, borderWidth: 1, borderColor: BORDER, backgroundColor: PANEL, alignItems: "center", justifyContent: "center", gap: 8 }, loadingText: { color: MUTED, fontSize: 9.5 }, bookingList: { gap: 10 }, bookingCard: { borderRadius: 19, borderWidth: 1, borderColor: "#332A1C", backgroundColor: "#0B0906", padding: 16 }, pendingBookingCard: { borderColor: "#5A4523", backgroundColor: "#100D07" }, bookingTop: { flexDirection: "row", justifyContent: "space-between", gap: 10 }, bookingCopy: { flex: 1 }, bookingService: { color: "#F4F4F4", fontSize: 16, fontWeight: "750" }, bookingDate: { color: "#D6D0C4", fontSize: 10.5, marginTop: 7 }, bookingTime: { color: GOLD_LIGHT, fontSize: 8.5, letterSpacing: 0.8, fontWeight: "700", marginTop: 5 }, confirmedBadge: { alignSelf: "flex-start", borderRadius: 12, borderWidth: 1, borderColor: "#67502A", backgroundColor: "#151006", paddingHorizontal: 8, paddingVertical: 5 }, confirmedBadgeText: { color: GOLD_LIGHT, fontSize: 6.2, letterSpacing: 0.9, fontWeight: "800" }, pendingBadge: { borderColor: "#806431", backgroundColor: "#1A1307" }, pendingBadgeText: { color: "#F0D493", fontSize: 5.6 }, pendingInfo: { marginTop: 13, borderRadius: 12, borderWidth: 1, borderColor: "#3E321F", backgroundColor: "#0B0906", padding: 11 }, pendingInfoTitle: { color: GOLD, fontSize: 6.5, letterSpacing: 1.1, fontWeight: "900" }, pendingInfoText: { color: "#9B9285", fontSize: 8.8, lineHeight: 14, marginTop: 5 }, paymentStateRow: { marginTop: 12, borderRadius: 11, borderWidth: 1, borderColor: "#2D281F", backgroundColor: "#090806", paddingHorizontal: 10, paddingVertical: 9, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 }, paymentStateLabel: { color: "#7D6947", fontSize: 6.2, letterSpacing: 1, fontWeight: "900" }, paymentStateValue: { color: "#BDA77E", fontSize: 6.7, letterSpacing: .45, fontWeight: "800", textAlign: "right", flex: 1 }, bookingFooter: { marginTop: 12, paddingTop: 13, borderTopWidth: 1, borderTopColor: "#211D17", flexDirection: "row", alignItems: "center", justifyContent: "space-between" }, serviceValueLabel: { color: "#6F624D", fontSize: 5.8, letterSpacing: .8, fontWeight: "900", marginBottom: 3 }, bookingPrice: { color: GOLD_LIGHT, fontSize: 18, fontWeight: "850" }, cancelButton: { borderRadius: 13, borderWidth: 1, borderColor: "#40342B", paddingHorizontal: 11, paddingVertical: 8 }, cancelButtonText: { color: "#C5B8AA", fontSize: 7, letterSpacing: 0.8, fontWeight: "800" },
  emptyBookingCard: { borderRadius: 18, borderWidth: 1, borderColor: BORDER, backgroundColor: PANEL, padding: 18 }, emptyBookingTitle: { color: "#E9E9E9", fontSize: 9, letterSpacing: 1.5, fontWeight: "800" }, emptyBookingText: { color: MUTED, fontSize: 10.5, lineHeight: 17, marginTop: 7 },
  historyCard: { marginTop: 12, borderRadius: 17, borderWidth: 1, borderColor: "#222", backgroundColor: "#090909", padding: 15 }, historyTitle: { color: "#8B795A", fontSize: 7.5, letterSpacing: 1.5, fontWeight: "800", marginBottom: 5 }, historyRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 9, gap: 12 }, historyCopy: { flex: 1 }, historyService: { color: "#DADADA", fontSize: 11.5, fontWeight: "650" }, historyMeta: { color: "#777", fontSize: 8, marginTop: 3 }, historyPayment: { color: "#7D6A4B", fontSize: 6.5, letterSpacing: .45, marginTop: 4, fontWeight: "800" }, historyHint: { color: "#786A58", fontSize: 7.5, lineHeight: 12, marginTop: 4 }, historyStatus: { color: "#837353", fontSize: 6.5, letterSpacing: 0.8, fontWeight: "800" }, historyStatusCancelled: { color: "#B27C73" }, historyDivider: { height: 1, backgroundColor: "#1B1B1B" },
  paymentCard: { marginTop: 20, backgroundColor: "#0B0906", borderRadius: 20, borderWidth: 1, borderColor: "#342A19", padding: 18 }, rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }, paymentCopy: { flex: 1 }, cardEyebrow: { color: "#B99150", fontSize: 8, letterSpacing: 1.7, fontWeight: "800" }, cardTitle: { color: "#F2F2F2", fontSize: 16, fontWeight: "700", marginTop: 7 }, statusBadge: { borderRadius: 14, borderWidth: 1, borderColor: "#333", paddingHorizontal: 9, paddingVertical: 5 }, statusBadgeReady: { borderColor: "#66502A", backgroundColor: "#151006" }, statusText: { color: "#777", fontSize: 7, letterSpacing: 1, fontWeight: "800" }, statusTextReady: { color: GOLD_LIGHT }, cardText: { color: "#A5A098", fontSize: 10.5, lineHeight: 17, marginTop: 15 }, goldButton: { minHeight: 54, borderRadius: 15, marginTop: 16, backgroundColor: GOLD, paddingHorizontal: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }, goldButtonText: { color: "#090909", fontSize: 10.5, letterSpacing: 1, fontWeight: "900" }, goldArrow: { color: "#090909", fontSize: 26 }, pressed: { opacity: 0.76 }, disabled: { opacity: 0.55 }, errorCard: { marginTop: 12, borderRadius: 13, borderWidth: 1, borderColor: "#4A2723", backgroundColor: "#130B0A", padding: 12 }, errorText: { color: "#E4A29A", fontSize: 9.5, lineHeight: 15 },
  section: { marginTop: 23 }, linkRow: { minHeight: 69, borderRadius: 16, borderWidth: 1, borderColor: BORDER, backgroundColor: PANEL, paddingHorizontal: 16, marginTop: 9, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }, linkTitle: { color: "#EDEDED", fontSize: 13, fontWeight: "650" }, linkMeta: { color: MUTED, fontSize: 9, marginTop: 4 }, linkArrow: { color: GOLD_LIGHT, fontSize: 24 }, securityCard: { marginTop: 13, borderRadius: 16, borderWidth: 1, borderColor: "#26231D", backgroundColor: "#090806", padding: 15 }, securityTitle: { color: GOLD_LIGHT, fontSize: 8, letterSpacing: 1.5, fontWeight: "800" }, securityText: { color: "#918D86", fontSize: 9.5, lineHeight: 16, marginTop: 7 },
});