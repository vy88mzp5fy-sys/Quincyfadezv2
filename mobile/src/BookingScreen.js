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
import { useStripe } from "@stripe/stripe-react-native";

const GOLD = "#C99B4A";
const GOLD_LIGHT = "#E7C77A";
const BG = "#050505";
const PANEL = "#0D0D0D";
const BORDER = "#242424";
const MUTED = "#9A9A9A";
const API_URL = (process.env.EXPO_PUBLIC_API_URL || "").replace(/\/$/, "");
const CLIENT_KEY_STORAGE = "quincyfadez.paymentClientKey";
const PROFILE_STORAGE = "quincyfadez.bookingProfile";

const SERVICES = [
  { name: "Haircut", price: 20, duration: "45 Minutes" },
  { name: "Haircut & Beard", price: 25, duration: "60 Minutes" },
  { name: "Shape Up", price: 10, duration: "15 Minutes" },
  { name: "Beard Trim", price: 10, duration: "15 Minutes" },
];

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

function formatDay(isoDate) {
  const date = new Date(`${isoDate}T12:00:00`);
  return {
    weekday: date.toLocaleDateString("en-GB", { weekday: "short" }).toUpperCase(),
    day: date.toLocaleDateString("en-GB", { day: "2-digit" }),
    month: date.toLocaleDateString("en-GB", { month: "short" }).toUpperCase(),
    long: date.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" }),
  };
}

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false });
}

export default function BookingScreen({ onBack, initialService = "Haircut" }) {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [selectedService, setSelectedService] = useState(initialService);
  const [clientKey, setClientKey] = useState("");
  const [availability, setAvailability] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [setupRequired, setSetupRequired] = useState(false);
  const [paymentVerified, setPaymentVerified] = useState(false);
  const [paymentSummary, setPaymentSummary] = useState(null);
  const [paymentBusy, setPaymentBusy] = useState(false);
  const [bookingBusy, setBookingBusy] = useState(false);
  const [error, setError] = useState("");
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [notes, setNotes] = useState("");

  const service = useMemo(
    () => SERVICES.find((item) => item.name === selectedService) || SERVICES[0],
    [selectedService]
  );
  const selectedDay = availability.find((item) => item.date === selectedDate);
  const slots = selectedDay?.slots || [];
  const detailsReady = customerName.trim().length >= 2 && customerPhone.trim().length >= 7;

  const request = async (path, options = {}) => {
    if (!API_URL) throw new Error("The QuincyFadez booking server is still being connected.");
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(typeof data.detail === "string" ? data.detail : "Something went wrong. Please try again.");
    return data;
  };

  const verifyPaymentMethod = async (key, silent = false) => {
    if (!key || !API_URL) return false;
    try {
      const data = await request("/api/payments/verify", { method: "POST", body: JSON.stringify({ client_key: key }) });
      setPaymentVerified(Boolean(data.verified));
      setPaymentSummary(data.payment_method || null);
      if (!silent) setError("");
      return Boolean(data.verified);
    } catch (err) {
      if (!silent) setError(err.message);
      return false;
    }
  };

  const loadAvailability = async () => {
    if (!API_URL) return;
    setLoadingSlots(true);
    setError("");
    setSelectedSlot("");
    try {
      const data = await request(`/api/booking/availability?service=${encodeURIComponent(selectedService)}&days=21`);
      setAvailability(data.days || []);
      setSetupRequired(Boolean(data.setup_required));
      const firstWithSlots = (data.days || []).find((day) => day.slots?.length);
      setSelectedDate(firstWithSlots?.date || data.days?.[0]?.date || "");
    } catch (err) {
      setError(err.message);
      setAvailability([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  useEffect(() => {
    let active = true;
    Promise.all([getClientKey(), AsyncStorage.getItem(PROFILE_STORAGE)])
      .then(async ([key, savedProfile]) => {
        if (!active) return;
        setClientKey(key);
        if (savedProfile) {
          try {
            const profile = JSON.parse(savedProfile);
            setCustomerName(profile.name || "");
            setCustomerPhone(profile.phone || "");
            setCustomerEmail(profile.email || "");
          } catch (_) {}
        }
        await verifyPaymentMethod(key, true);
      })
      .catch(() => { if (active) setError("Secure booking setup could not start on this device."); });
    return () => { active = false; };
  }, []);

  useEffect(() => { loadAvailability(); }, [selectedService]);

  const confirmHandler = async (confirmationToken, intentCreationCallback) => {
    try {
      const data = await request("/api/payments/confirm-setup", {
        method: "POST",
        body: JSON.stringify({ client_key: clientKey, confirmation_token_id: confirmationToken.id }),
      });
      if (!data.client_secret) throw new Error("Stripe did not return a setup confirmation.");
      intentCreationCallback({ clientSecret: data.client_secret });
    } catch (err) {
      intentCreationCallback({ error: { localizedMessage: err.message || "Your payment method could not be set up." } });
    }
  };

  const addPaymentMethod = async () => {
    if (!clientKey || paymentBusy) return;
    setPaymentBusy(true);
    setError("");
    try {
      const { error: initError } = await initPaymentSheet({
        merchantDisplayName: "QuincyFadez",
        returnURL: "quincyfadez://stripe-redirect",
        appearance: {
          colors: {
            primary: GOLD,
            background: "#0A0A0A",
            componentBackground: "#111111",
            componentBorder: "#2A2A2A",
            componentDivider: "#2A2A2A",
            primaryText: "#F5F5F5",
            secondaryText: "#9A9A9A",
            componentText: "#F5F5F5",
            placeholderText: "#777777",
          },
          shapes: { borderRadius: 14, borderWidth: 1 },
        },
        intentConfiguration: { mode: { currencyCode: "GBP" }, confirmHandler },
      });
      if (initError) throw new Error(initError.message || "Payment setup could not be opened.");
      const { error: presentError } = await presentPaymentSheet();
      if (presentError) {
        if (presentError.code === "Canceled") return;
        throw new Error(presentError.message || "Payment setup was not completed.");
      }
      const verified = await verifyPaymentMethod(clientKey);
      if (!verified) throw new Error("Stripe finished, but the card has not been verified yet. Please try again.");
    } catch (err) {
      setError(err.message || "Payment setup could not be completed.");
    } finally {
      setPaymentBusy(false);
    }
  };

  const confirmBooking = async () => {
    if (!selectedSlot || !paymentVerified || !detailsReady || bookingBusy) return;
    setBookingBusy(true);
    setError("");
    try {
      const profile = { name: customerName.trim(), phone: customerPhone.trim(), email: customerEmail.trim() };
      await AsyncStorage.setItem(PROFILE_STORAGE, JSON.stringify(profile));
      const data = await request("/api/booking/appointments", {
        method: "POST",
        body: JSON.stringify({
          client_key: clientKey,
          service: selectedService,
          start_at: selectedSlot,
          customer_name: profile.name,
          customer_phone: profile.phone,
          customer_email: profile.email || null,
          notes: notes.trim() || null,
        }),
      });
      setConfirmedBooking(data);
    } catch (err) {
      setError(err.message);
      if (err.message.toLowerCase().includes("available") || err.message.toLowerCase().includes("booked")) await loadAvailability();
    } finally {
      setBookingBusy(false);
    }
  };

  if (confirmedBooking) {
    const dateLabel = new Date(confirmedBooking.start_at).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor={BG} />
        <ScrollView contentContainerStyle={styles.confirmedContent}>
          <View style={styles.confirmedMark}><Text style={styles.confirmedTick}>✓</Text></View>
          <Text style={styles.confirmedEyebrow}>BOOKING CONFIRMED</Text>
          <Text style={styles.confirmedTitle}>You’re Locked In.</Text>
          <Text style={styles.confirmedSubtitle}>Your appointment is reserved directly with QuincyFadez.</Text>
          <View style={styles.ticketCard}>
            <View style={styles.ticketRow}><Text style={styles.ticketLabel}>SERVICE</Text><Text style={styles.ticketValue}>{confirmedBooking.service}</Text></View>
            <View style={styles.ticketDivider} />
            <View style={styles.ticketRow}><Text style={styles.ticketLabel}>DATE</Text><Text style={styles.ticketValue}>{dateLabel}</Text></View>
            <View style={styles.ticketDivider} />
            <View style={styles.ticketRow}><Text style={styles.ticketLabel}>TIME</Text><Text style={styles.ticketValue}>{formatTime(confirmedBooking.start_at)}</Text></View>
            <View style={styles.ticketDivider} />
            <View style={styles.ticketRow}><Text style={styles.ticketLabel}>TOTAL</Text><Text style={styles.ticketPrice}>£{confirmedBooking.price}</Text></View>
          </View>
          <View style={styles.confirmationNote}><Text style={styles.confirmationNoteTitle}>MANAGE IT IN ACCOUNT</Text><Text style={styles.confirmationNoteText}>Your appointment now lives inside QuincyFadez. Upcoming bookings, changes and cancellations are managed from Account.</Text></View>
          <Pressable onPress={onBack} style={styles.doneButton}><Text style={styles.doneButtonText}>DONE</Text></Pressable>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const paymentLabel = paymentSummary?.last4 ? `${(paymentSummary.brand || "Card").toUpperCase()}  •••• ${paymentSummary.last4}` : "PAYMENT METHOD VERIFIED";
  const canConfirm = Boolean(selectedSlot && paymentVerified && detailsReady && !bookingBusy);
  const progress = [
    { label: "SERVICE", active: true },
    { label: "DATE", active: Boolean(selectedDate) },
    { label: "TIME", active: Boolean(selectedSlot) },
    { label: "DETAILS", active: detailsReady },
    { label: "CONFIRM", active: canConfirm },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={BG} />
      <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Pressable onPress={onBack} hitSlop={12} style={styles.backButton}><Text style={styles.backIcon}>‹</Text></Pressable>
          <Text style={styles.headerTitle}>BOOK APPOINTMENT</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.progressRow}>
          {progress.map((item) => <View key={item.label} style={styles.progressItem}><View style={[styles.progressDot, item.active && styles.progressDotActive]} /><Text style={[styles.progressLabel, item.active && styles.progressLabelActive]}>{item.label}</Text></View>)}
        </View>

        <View style={styles.intro}>
          <Text style={styles.eyebrow}>QUINCYFADEZ BOOKING</Text>
          <Text style={styles.title}>Book Your Next Cut.</Text>
          <Text style={styles.subtitle}>A fast, private booking experience built directly into QuincyFadez.</Text>
        </View>

        <Text style={styles.sectionTitle}>1. Choose Your Service</Text>
        <View style={styles.serviceList}>
          {SERVICES.map((item) => {
            const active = item.name === selectedService;
            return <Pressable key={item.name} onPress={() => setSelectedService(item.name)} style={({ pressed }) => [styles.serviceOption, active && styles.serviceOptionActive, pressed && styles.pressed]}><View style={[styles.radioOuter, active && styles.radioOuterActive]}>{active ? <View style={styles.radioInner} /> : null}</View><View style={styles.serviceCopy}><Text style={[styles.serviceName, active && styles.serviceNameActive]}>{item.name}</Text><Text style={styles.serviceDuration}>{item.duration}</Text></View><Text style={styles.servicePrice}>£{item.price}</Text></Pressable>;
          })}
        </View>

        <Text style={styles.sectionTitle}>2. Pick A Date</Text>
        {loadingSlots ? <View style={styles.loadingCard}><ActivityIndicator color={GOLD_LIGHT} /><Text style={styles.loadingText}>Checking live availability…</Text></View> : setupRequired ? <View style={styles.setupCard}><Text style={styles.setupTitle}>AVAILABILITY SETUP REQUIRED</Text><Text style={styles.setupText}>Your working hours haven’t been configured yet, so every slot stays safely closed.</Text></View> : <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateStrip}>{availability.map((day) => { const label = formatDay(day.date); const active = selectedDate === day.date; const disabled = !day.slots?.length; return <Pressable key={day.date} disabled={disabled} onPress={() => { setSelectedDate(day.date); setSelectedSlot(""); }} style={[styles.dateCard, active && styles.dateCardActive, disabled && styles.dateCardDisabled]}><Text style={[styles.dateWeekday, active && styles.dateTextActive]}>{label.weekday}</Text><Text style={[styles.dateNumber, active && styles.dateTextActive]}>{label.day}</Text><Text style={[styles.dateMonth, active && styles.dateTextActive]}>{label.month}</Text>{!disabled ? <View style={[styles.availabilityDot, active && styles.availabilityDotActive]} /> : null}</Pressable>; })}</ScrollView>}

        <Text style={styles.sectionTitle}>3. Choose A Time</Text>
        <View style={styles.timePanel}>
          {selectedDate ? <Text style={styles.selectedDateLabel}>{formatDay(selectedDate).long.toUpperCase()}</Text> : null}
          {slots.length ? <View style={styles.timeGrid}>{slots.map((slot) => { const active = selectedSlot === slot; return <Pressable key={slot} onPress={() => setSelectedSlot(slot)} style={[styles.timeChip, active && styles.timeChipActive]}><Text style={[styles.timeText, active && styles.timeTextActive]}>{formatTime(slot)}</Text></Pressable>; })}</View> : <Text style={styles.emptyText}>{selectedDate ? "No slots are available on this date." : "Choose an available date to see times."}</Text>}
        </View>

        <Text style={styles.sectionTitle}>4. Your Details</Text>
        <View style={styles.detailsCard}>
          <Text style={styles.detailsIntro}>We’ll use these details for your appointment and future QuincyFadez booking reminders.</Text>
          <Text style={styles.inputLabel}>NAME</Text>
          <TextInput value={customerName} onChangeText={setCustomerName} placeholder="Your Name" placeholderTextColor="#5E5E5E" autoCapitalize="words" style={styles.input} />
          <Text style={styles.inputLabel}>MOBILE NUMBER</Text>
          <TextInput value={customerPhone} onChangeText={setCustomerPhone} placeholder="07..." placeholderTextColor="#5E5E5E" keyboardType="phone-pad" style={styles.input} />
          <Text style={styles.inputLabel}>EMAIL <Text style={styles.optional}>OPTIONAL</Text></Text>
          <TextInput value={customerEmail} onChangeText={setCustomerEmail} placeholder="you@example.com" placeholderTextColor="#5E5E5E" keyboardType="email-address" autoCapitalize="none" style={styles.input} />
          <Text style={styles.inputLabel}>NOTES <Text style={styles.optional}>OPTIONAL</Text></Text>
          <TextInput value={notes} onChangeText={setNotes} placeholder="Anything I should know before your cut?" placeholderTextColor="#5E5E5E" multiline maxLength={300} style={[styles.input, styles.notesInput]} />
          <View style={[styles.detailsStatus, detailsReady && styles.detailsStatusReady]}><Text style={[styles.detailsStatusText, detailsReady && styles.detailsStatusTextReady]}>{detailsReady ? "✓ DETAILS READY" : "NAME + MOBILE REQUIRED"}</Text></View>
        </View>

        <Text style={styles.sectionTitle}>5. Secure Your Booking</Text>
        <View style={[styles.paymentCard, paymentVerified && styles.paymentCardVerified]}>
          <View style={styles.paymentHeader}><View><Text style={styles.paymentEyebrow}>PAYMENT METHOD</Text><Text style={styles.paymentTitle}>{paymentVerified ? paymentLabel : "Card Verification Required"}</Text></View><View style={[styles.paymentBadge, paymentVerified && styles.paymentBadgeVerified]}><Text style={[styles.paymentBadgeText, paymentVerified && styles.paymentBadgeTextVerified]}>{paymentVerified ? "READY" : "REQUIRED"}</Text></View></View>
          <Text style={styles.paymentText}>{paymentVerified ? "Your payment method is securely saved with Stripe and ready for booking protection." : "Verify a payment method securely with Stripe. QuincyFadez never stores your full card number or CVC."}</Text>
          {!paymentVerified ? <Pressable onPress={addPaymentMethod} disabled={paymentBusy || !clientKey} style={[styles.paymentButton, paymentBusy && styles.disabled]}><Text style={styles.paymentButtonText}>{paymentBusy ? "OPENING STRIPE…" : "ADD PAYMENT METHOD"}</Text><Text style={styles.buttonArrow}>›</Text></Pressable> : null}
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryEyebrow}>YOUR APPOINTMENT</Text>
          <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Service</Text><Text style={styles.summaryValue}>{service.name}</Text></View>
          <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Date</Text><Text style={styles.summaryValue}>{selectedDate ? formatDay(selectedDate).long : "Not Selected"}</Text></View>
          <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Time</Text><Text style={styles.summaryValue}>{selectedSlot ? formatTime(selectedSlot) : "Not Selected"}</Text></View>
          <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Booked For</Text><Text style={styles.summaryValue}>{customerName.trim() || "Not Entered"}</Text></View>
          <View style={[styles.summaryRow, styles.summaryTotal]}><Text style={styles.totalLabel}>Total</Text><Text style={styles.totalPrice}>£{service.price}</Text></View>
        </View>

        {error ? <View style={styles.errorCard}><Text style={styles.errorText}>{error}</Text></View> : null}

        <Pressable disabled={!canConfirm} onPress={confirmBooking} style={({ pressed }) => [styles.confirmButton, !canConfirm && styles.confirmDisabled, pressed && canConfirm && styles.confirmPressed]}><View><Text style={[styles.confirmText, !canConfirm && styles.confirmTextDisabled]}>{bookingBusy ? "CONFIRMING…" : "CONFIRM BOOKING"}</Text><Text style={[styles.confirmSubtext, !canConfirm && styles.confirmSubtextDisabled]}>{!selectedSlot ? "Choose your date and time" : !detailsReady ? "Add your name and mobile" : !paymentVerified ? "Verify your payment method" : "Reserve this appointment now"}</Text></View>{bookingBusy ? <ActivityIndicator color="#090909" /> : <Text style={[styles.confirmArrow, !canConfirm && styles.confirmTextDisabled]}>›</Text>}</Pressable>

        <View style={styles.trustRow}><Text style={styles.trustText}>✓ LIVE SLOTS</Text><Text style={styles.trustText}>✓ PRIVATE DETAILS</Text><Text style={styles.trustText}>✓ STRIPE SECURED</Text></View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: BG }, screen: { flex: 1, backgroundColor: BG }, content: { paddingHorizontal: 18, paddingTop: 6, paddingBottom: 34 },
  header: { minHeight: 54, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderBottomWidth: 1, borderBottomColor: "#151515" }, backButton: { width: 44, height: 44, justifyContent: "center" }, backIcon: { color: "#F5F5F5", fontSize: 34, lineHeight: 34 }, headerTitle: { color: "#F4F4F4", fontSize: 13, letterSpacing: 1.8, fontWeight: "700" }, headerSpacer: { width: 44 },
  progressRow: { flexDirection: "row", justifyContent: "space-between", paddingTop: 15, paddingHorizontal: 3 }, progressItem: { alignItems: "center", flex: 1 }, progressDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#303030", marginBottom: 6 }, progressDotActive: { backgroundColor: GOLD_LIGHT }, progressLabel: { color: "#555", fontSize: 5.8, letterSpacing: 0.6 }, progressLabelActive: { color: "#A88D59" },
  intro: { paddingTop: 24, paddingBottom: 20 }, eyebrow: { color: GOLD, fontSize: 8, letterSpacing: 2, fontWeight: "800" }, title: { color: "#F5F5F5", fontSize: 31, lineHeight: 36, fontWeight: "700", marginTop: 8 }, subtitle: { color: MUTED, fontSize: 12.5, lineHeight: 19, marginTop: 9, maxWidth: 350 }, sectionTitle: { color: "#EFEFEF", fontSize: 17, fontWeight: "700", marginTop: 20, marginBottom: 11 },
  serviceList: { gap: 9 }, serviceOption: { minHeight: 72, borderRadius: 17, borderWidth: 1, borderColor: BORDER, backgroundColor: PANEL, paddingHorizontal: 15, flexDirection: "row", alignItems: "center" }, serviceOptionActive: { borderColor: "#765B2E", backgroundColor: "#120F09" }, pressed: { opacity: 0.76 }, radioOuter: { width: 20, height: 20, borderRadius: 10, borderWidth: 1, borderColor: "#4A4A4A", alignItems: "center", justifyContent: "center" }, radioOuterActive: { borderColor: GOLD_LIGHT }, radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: GOLD_LIGHT }, serviceCopy: { flex: 1, marginLeft: 12 }, serviceName: { color: "#E8E8E8", fontSize: 14.5, fontWeight: "650" }, serviceNameActive: { color: "#FFF4DC" }, serviceDuration: { color: MUTED, fontSize: 8.5, marginTop: 4 }, servicePrice: { color: GOLD_LIGHT, fontSize: 17, fontWeight: "800" },
  loadingCard: { minHeight: 100, borderRadius: 18, backgroundColor: PANEL, borderWidth: 1, borderColor: BORDER, alignItems: "center", justifyContent: "center", gap: 9 }, loadingText: { color: MUTED, fontSize: 10 }, setupCard: { borderRadius: 18, borderWidth: 1, borderColor: "#3C2C1A", backgroundColor: "#0B0906", padding: 16 }, setupTitle: { color: GOLD_LIGHT, fontSize: 8.5, letterSpacing: 1.5, fontWeight: "800" }, setupText: { color: "#AAA39A", fontSize: 10.5, lineHeight: 17, marginTop: 8 },
  dateStrip: { gap: 9, paddingRight: 8 }, dateCard: { width: 68, height: 100, borderRadius: 18, borderWidth: 1, borderColor: BORDER, backgroundColor: PANEL, alignItems: "center", justifyContent: "center" }, dateCardActive: { backgroundColor: GOLD, borderColor: GOLD_LIGHT }, dateCardDisabled: { opacity: 0.28 }, dateWeekday: { color: MUTED, fontSize: 7.5, letterSpacing: 1.2, fontWeight: "700" }, dateNumber: { color: "#F4F4F4", fontSize: 22, fontWeight: "750", marginTop: 4 }, dateMonth: { color: "#777", fontSize: 7.5, letterSpacing: 1, marginTop: 2 }, dateTextActive: { color: "#0A0A0A" }, availabilityDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: GOLD_LIGHT, marginTop: 7 }, availabilityDotActive: { backgroundColor: "#111" },
  timePanel: { borderRadius: 19, borderWidth: 1, borderColor: BORDER, backgroundColor: "#090909", padding: 14 }, selectedDateLabel: { color: "#9B845A", fontSize: 7.5, letterSpacing: 1.4, fontWeight: "800", marginBottom: 11 }, timeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 }, timeChip: { width: "23%", minHeight: 44, borderRadius: 13, borderWidth: 1, borderColor: "#282828", backgroundColor: "#101010", alignItems: "center", justifyContent: "center" }, timeChipActive: { backgroundColor: GOLD, borderColor: GOLD_LIGHT }, timeText: { color: "#D7D7D7", fontSize: 11.5, fontWeight: "700" }, timeTextActive: { color: "#080808" }, emptyText: { color: MUTED, fontSize: 10.5, paddingVertical: 18, textAlign: "center" },
  detailsCard: { borderRadius: 20, borderWidth: 1, borderColor: "#28241D", backgroundColor: "#090806", padding: 16 }, detailsIntro: { color: "#9D978D", fontSize: 10.5, lineHeight: 17, marginBottom: 14 }, inputLabel: { color: "#A98A54", fontSize: 7.5, letterSpacing: 1.4, fontWeight: "800", marginTop: 10, marginBottom: 6 }, optional: { color: "#666", fontSize: 6.5 }, input: { minHeight: 50, borderRadius: 14, borderWidth: 1, borderColor: "#292929", backgroundColor: "#0F0F0F", color: "#F2F2F2", paddingHorizontal: 14, fontSize: 12 }, notesInput: { minHeight: 86, paddingTop: 13, textAlignVertical: "top" }, detailsStatus: { alignSelf: "flex-start", borderRadius: 12, borderWidth: 1, borderColor: "#333", paddingHorizontal: 9, paddingVertical: 6, marginTop: 14 }, detailsStatusReady: { borderColor: "#5B4727", backgroundColor: "#151006" }, detailsStatusText: { color: "#777", fontSize: 7, letterSpacing: 1, fontWeight: "800" }, detailsStatusTextReady: { color: GOLD_LIGHT },
  paymentCard: { borderRadius: 19, borderWidth: 1, borderColor: "#2A251D", backgroundColor: "#0A0907", padding: 16 }, paymentCardVerified: { borderColor: "#4E3C20" }, paymentHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }, paymentEyebrow: { color: "#A8874D", fontSize: 7.5, letterSpacing: 1.5, fontWeight: "800" }, paymentTitle: { color: "#F0F0F0", fontSize: 14.5, fontWeight: "700", marginTop: 6 }, paymentBadge: { borderRadius: 12, borderWidth: 1, borderColor: "#363636", paddingHorizontal: 8, paddingVertical: 5 }, paymentBadgeVerified: { borderColor: "#66502A", backgroundColor: "#151006" }, paymentBadgeText: { color: "#777", fontSize: 6.5, letterSpacing: 1, fontWeight: "800" }, paymentBadgeTextVerified: { color: GOLD_LIGHT }, paymentText: { color: "#999", fontSize: 10, lineHeight: 16, marginTop: 13 }, paymentButton: { minHeight: 52, borderRadius: 14, backgroundColor: GOLD, marginTop: 14, paddingHorizontal: 15, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }, paymentButtonText: { color: "#080808", fontSize: 10, letterSpacing: 1, fontWeight: "900" }, buttonArrow: { color: "#080808", fontSize: 24 }, disabled: { opacity: 0.55 },
  summaryCard: { marginTop: 18, borderRadius: 20, borderWidth: 1, borderColor: "#29251D", backgroundColor: "#090806", padding: 17 }, summaryEyebrow: { color: GOLD, fontSize: 8, letterSpacing: 1.7, fontWeight: "800", marginBottom: 5 }, summaryRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 9, gap: 14 }, summaryLabel: { color: MUTED, fontSize: 10.5 }, summaryValue: { color: "#E8E8E8", fontSize: 10.5, fontWeight: "650", textAlign: "right", flex: 1 }, summaryTotal: { borderTopWidth: 1, borderTopColor: "#1E1B16", marginTop: 4, paddingTop: 13 }, totalLabel: { color: "#F2F2F2", fontSize: 12.5, fontWeight: "700" }, totalPrice: { color: GOLD_LIGHT, fontSize: 19, fontWeight: "850" },
  errorCard: { marginTop: 12, borderRadius: 13, borderWidth: 1, borderColor: "#4A2723", backgroundColor: "#130B0A", padding: 12 }, errorText: { color: "#E4A29A", fontSize: 9.5, lineHeight: 15 }, confirmButton: { minHeight: 66, borderRadius: 17, backgroundColor: GOLD, marginTop: 13, paddingHorizontal: 18, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }, confirmDisabled: { backgroundColor: "#171717", borderWidth: 1, borderColor: "#282828" }, confirmPressed: { opacity: 0.87, transform: [{ scale: 0.995 }] }, confirmText: { color: "#090909", fontSize: 11.5, letterSpacing: 1, fontWeight: "900" }, confirmTextDisabled: { color: "#616161" }, confirmSubtext: { color: "#493514", fontSize: 8.5, marginTop: 4 }, confirmSubtextDisabled: { color: "#555" }, confirmArrow: { color: "#090909", fontSize: 29 }, trustRow: { marginTop: 13, minHeight: 44, borderRadius: 14, borderWidth: 1, borderColor: "#1D1D1D", backgroundColor: "#090909", flexDirection: "row", alignItems: "center", justifyContent: "space-around", paddingHorizontal: 5 }, trustText: { color: "#76684D", fontSize: 6.3, letterSpacing: 0.6, fontWeight: "800" },
  confirmedContent: { flexGrow: 1, paddingHorizontal: 22, paddingTop: 60, paddingBottom: 36, backgroundColor: BG, alignItems: "center" }, confirmedMark: { width: 74, height: 74, borderRadius: 37, borderWidth: 1, borderColor: "#71562B", backgroundColor: "#171107", alignItems: "center", justifyContent: "center" }, confirmedTick: { color: GOLD_LIGHT, fontSize: 32, fontWeight: "800" }, confirmedEyebrow: { color: GOLD, fontSize: 8, letterSpacing: 2.2, fontWeight: "900", marginTop: 24 }, confirmedTitle: { color: "#F5F5F5", fontSize: 31, fontWeight: "750", marginTop: 8 }, confirmedSubtitle: { color: MUTED, fontSize: 11.5, lineHeight: 18, textAlign: "center", marginTop: 9, maxWidth: 310 }, ticketCard: { width: "100%", marginTop: 28, borderRadius: 21, borderWidth: 1, borderColor: "#3A2E1E", backgroundColor: "#0B0906", padding: 18 }, ticketRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 10 }, ticketLabel: { color: "#766A58", fontSize: 7.5, letterSpacing: 1.4, fontWeight: "800" }, ticketValue: { color: "#F0F0F0", fontSize: 11, fontWeight: "650", textAlign: "right", flex: 1 }, ticketPrice: { color: GOLD_LIGHT, fontSize: 18, fontWeight: "850" }, ticketDivider: { height: 1, backgroundColor: "#211D17", marginVertical: 13 }, confirmationNote: { width: "100%", marginTop: 14, borderRadius: 15, borderWidth: 1, borderColor: "#232323", backgroundColor: PANEL, padding: 14 }, confirmationNoteTitle: { color: GOLD_LIGHT, fontSize: 7.5, letterSpacing: 1.4, fontWeight: "800" }, confirmationNoteText: { color: MUTED, fontSize: 9.5, lineHeight: 15.5, marginTop: 7 }, doneButton: { width: "100%", minHeight: 58, borderRadius: 16, backgroundColor: GOLD, alignItems: "center", justifyContent: "center", marginTop: 16 }, doneButtonText: { color: "#090909", fontSize: 11, letterSpacing: 1.3, fontWeight: "900" },
});