import React, { useEffect, useMemo, useState } from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
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

function dateLabel(value) {
  const date = new Date(`${value}T12:00:00`);
  return {
    day: date.toLocaleDateString("en-GB", { weekday: "short" }).toUpperCase(),
    number: date.toLocaleDateString("en-GB", { day: "2-digit" }),
    month: date.toLocaleDateString("en-GB", { month: "short" }).toUpperCase(),
  };
}

function timeLabel(value) {
  return new Date(value).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false });
}

export default function BookingScreen({ onBack, initialService = "Haircut" }) {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [selectedService, setSelectedService] = useState(initialService);
  const [clientKey, setClientKey] = useState("");
  const [availability, setAvailability] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [availabilityBusy, setAvailabilityBusy] = useState(false);
  const [availabilityError, setAvailabilityError] = useState("");
  const [scheduleSetupRequired, setScheduleSetupRequired] = useState(false);
  const [paymentVerified, setPaymentVerified] = useState(false);
  const [paymentSummary, setPaymentSummary] = useState(null);
  const [paymentBusy, setPaymentBusy] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [bookingBusy, setBookingBusy] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  const service = useMemo(
    () => SERVICES.find((item) => item.name === selectedService) || SERVICES[0],
    [selectedService]
  );

  const selectedDay = availability.find((item) => item.date === selectedDate);
  const visibleDays = availability.filter((item) => item.slots?.length > 0).slice(0, 12);

  const request = async (path, options = {}) => {
    if (!API_URL) throw new Error("The QuincyFadez booking service is still being connected.");
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(typeof data.detail === "string" ? data.detail : "Something went wrong. Please try again.");
    }
    return data;
  };

  const loadAvailability = async (serviceName = selectedService) => {
    setAvailabilityBusy(true);
    setAvailabilityError("");
    setSelectedDate("");
    setSelectedSlot("");
    try {
      const data = await request(`/api/booking/availability?service=${encodeURIComponent(serviceName)}&days=21`);
      const days = data.days || [];
      setAvailability(days);
      setScheduleSetupRequired(Boolean(data.setup_required));
      const first = days.find((item) => item.slots?.length > 0);
      if (first) setSelectedDate(first.date);
    } catch (error) {
      setAvailabilityError(error.message || "Availability could not be loaded.");
    } finally {
      setAvailabilityBusy(false);
    }
  };

  const verifyPaymentMethod = async (key, silent = false) => {
    if (!key || !API_URL) return false;
    try {
      const data = await request("/api/payments/verify", {
        method: "POST",
        body: JSON.stringify({ client_key: key }),
      });
      setPaymentVerified(Boolean(data.verified));
      setPaymentSummary(data.verified ? data.payment_method || null : null);
      if (data.verified) setPaymentError("");
      return Boolean(data.verified);
    } catch (error) {
      if (!silent) setPaymentError(error.message);
      return false;
    }
  };

  useEffect(() => {
    let active = true;
    getClientKey()
      .then(async (key) => {
        if (!active) return;
        setClientKey(key);
        await verifyPaymentMethod(key, true);
      })
      .catch(() => {
        if (active) setPaymentError("Secure payment setup could not start on this device.");
      });
    loadAvailability(initialService);
    return () => {
      active = false;
    };
  }, []);

  const chooseService = (name) => {
    setSelectedService(name);
    setConfirmedBooking(null);
    loadAvailability(name);
  };

  const confirmHandler = async (confirmationToken, intentCreationCallback) => {
    try {
      const data = await request("/api/payments/confirm-setup", {
        method: "POST",
        body: JSON.stringify({ client_key: clientKey, confirmation_token_id: confirmationToken.id }),
      });
      if (!data.client_secret) throw new Error("Stripe did not return a setup confirmation.");
      intentCreationCallback({ clientSecret: data.client_secret });
    } catch (error) {
      intentCreationCallback({ error: { localizedMessage: error.message || "Your payment method could not be set up." } });
    }
  };

  const addPaymentMethod = async () => {
    if (!clientKey) return;
    setPaymentBusy(true);
    setPaymentError("");
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
        intentConfiguration: {
          mode: { currencyCode: "GBP" },
          confirmHandler,
        },
      });
      if (initError) throw new Error(initError.message || "Payment setup could not be opened.");
      const { error: presentError } = await presentPaymentSheet();
      if (presentError) {
        if (presentError.code === "Canceled") return;
        throw new Error(presentError.message || "Payment setup was not completed.");
      }
      const verified = await verifyPaymentMethod(clientKey);
      if (!verified) throw new Error("Stripe finished, but the payment method is not verified yet.");
    } catch (error) {
      setPaymentError(error.message || "Payment setup could not be completed.");
    } finally {
      setPaymentBusy(false);
    }
  };

  const confirmBooking = async () => {
    if (!selectedSlot || !paymentVerified || bookingBusy) return;
    setBookingBusy(true);
    setBookingError("");
    try {
      const booking = await request("/api/booking/appointments", {
        method: "POST",
        body: JSON.stringify({ client_key: clientKey, service: selectedService, start_at: selectedSlot }),
      });
      setConfirmedBooking(booking);
      await loadAvailability(selectedService);
    } catch (error) {
      setBookingError(error.message || "Your booking could not be confirmed.");
      if ((error.message || "").toLowerCase().includes("available")) {
        await loadAvailability(selectedService);
      }
    } finally {
      setBookingBusy(false);
    }
  };

  const paymentLabel = paymentSummary?.last4
    ? `${(paymentSummary.brand || "Card").toUpperCase()}  •••• ${paymentSummary.last4}`
    : "PAYMENT METHOD VERIFIED";

  if (confirmedBooking) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor={BG} />
        <View style={styles.confirmationWrap}>
          <View style={styles.confirmationHalo}><Text style={styles.confirmationTick}>✓</Text></View>
          <Text style={styles.confirmationEyebrow}>BOOKING CONFIRMED</Text>
          <Text style={styles.confirmationTitle}>You're Locked In.</Text>
          <Text style={styles.confirmationSub}>Your QuincyFadez appointment has been reserved successfully.</Text>
          <View style={styles.confirmationCard}>
            <View style={styles.confirmationRow}><Text style={styles.confirmationLabel}>SERVICE</Text><Text style={styles.confirmationValue}>{confirmedBooking.service}</Text></View>
            <View style={styles.confirmationDivider} />
            <View style={styles.confirmationRow}><Text style={styles.confirmationLabel}>DATE</Text><Text style={styles.confirmationValue}>{new Date(confirmedBooking.start_at).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "long" })}</Text></View>
            <View style={styles.confirmationDivider} />
            <View style={styles.confirmationRow}><Text style={styles.confirmationLabel}>TIME</Text><Text style={styles.confirmationValue}>{timeLabel(confirmedBooking.start_at)}</Text></View>
            <View style={styles.confirmationDivider} />
            <View style={styles.confirmationRow}><Text style={styles.confirmationLabel}>TOTAL</Text><Text style={styles.confirmationPrice}>£{confirmedBooking.price}</Text></View>
          </View>
          <Pressable onPress={onBack} style={({ pressed }) => [styles.doneButton, pressed && styles.pressed]}><Text style={styles.doneButtonText}>DONE</Text></Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={BG} />
      <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable onPress={onBack} hitSlop={12} style={styles.backButton}><Text style={styles.backIcon}>‹</Text></Pressable>
          <Text style={styles.headerTitle}>BOOK APPOINTMENT</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.intro}>
          <Text style={styles.eyebrow}>QUINCYFADEZ BOOKING</Text>
          <Text style={styles.title}>Your Cut. Your Time.</Text>
          <Text style={styles.subtitle}>Book directly with QuincyFadez in a few clean steps — no external booking app.</Text>
          <View style={styles.progressTrack}>
            {["SERVICE", "DATE", "TIME", "CARD", "CONFIRM"].map((label, index) => {
              const complete = index === 0 || (index === 1 && selectedDate) || (index === 2 && selectedSlot) || (index === 3 && paymentVerified);
              return <View key={label} style={styles.progressItem}><View style={[styles.progressDot, complete && styles.progressDotActive]} /><Text style={[styles.progressLabel, complete && styles.progressLabelActive]}>{label}</Text></View>;
            })}
          </View>
        </View>

        <View style={styles.sectionHead}><Text style={styles.stepNo}>01</Text><View><Text style={styles.sectionTitle}>Choose Your Service</Text><Text style={styles.sectionMeta}>Select what you're coming in for.</Text></View></View>
        <View style={styles.serviceList}>
          {SERVICES.map((item) => {
            const active = item.name === selectedService;
            return (
              <Pressable key={item.name} onPress={() => chooseService(item.name)} style={({ pressed }) => [styles.serviceOption, active && styles.serviceOptionActive, pressed && styles.pressed]}>
                <View style={[styles.radioOuter, active && styles.radioOuterActive]}>{active ? <View style={styles.radioInner} /> : null}</View>
                <View style={styles.serviceCopy}><Text style={[styles.serviceName, active && styles.serviceNameActive]}>{item.name}</Text><Text style={styles.serviceDuration}>{item.duration}</Text></View>
                <Text style={styles.servicePrice}>£{item.price}</Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.sectionHead}><Text style={styles.stepNo}>02</Text><View><Text style={styles.sectionTitle}>Pick A Date</Text><Text style={styles.sectionMeta}>Only days with live availability appear.</Text></View></View>
        {availabilityBusy ? <View style={styles.stateCard}><Text style={styles.stateTitle}>CHECKING AVAILABILITY…</Text><Text style={styles.stateText}>Finding the cleanest available slots for you.</Text></View> : null}
        {!availabilityBusy && scheduleSetupRequired ? <View style={styles.stateCard}><Text style={styles.stateTitle}>SCHEDULE SETUP IN PROGRESS</Text><Text style={styles.stateText}>The native booking engine is ready. Working hours still need to be configured before customers can reserve live slots.</Text></View> : null}
        {!availabilityBusy && availabilityError ? <View style={styles.errorCard}><Text style={styles.errorText}>{availabilityError}</Text><Pressable onPress={() => loadAvailability()}><Text style={styles.retryText}>TRY AGAIN</Text></Pressable></View> : null}
        {!availabilityBusy && visibleDays.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateRail}>
            {visibleDays.map((item) => {
              const label = dateLabel(item.date);
              const active = item.date === selectedDate;
              return <Pressable key={item.date} onPress={() => { setSelectedDate(item.date); setSelectedSlot(""); }} style={({ pressed }) => [styles.dateCard, active && styles.dateCardActive, pressed && styles.pressed]}><Text style={[styles.dateDay, active && styles.dateTextActive]}>{label.day}</Text><Text style={[styles.dateNumber, active && styles.dateTextActive]}>{label.number}</Text><Text style={[styles.dateMonth, active && styles.dateTextActive]}>{label.month}</Text><Text style={[styles.dateSlots, active && styles.dateSlotsActive]}>{item.slots.length} SLOTS</Text></Pressable>;
            })}
          </ScrollView>
        ) : null}

        <View style={styles.sectionHead}><Text style={styles.stepNo}>03</Text><View><Text style={styles.sectionTitle}>Choose Your Time</Text><Text style={styles.sectionMeta}>Times update live to help prevent double-booking.</Text></View></View>
        {selectedDay?.slots?.length ? (
          <View style={styles.timeGrid}>{selectedDay.slots.map((slot) => { const active = selectedSlot === slot; return <Pressable key={slot} onPress={() => setSelectedSlot(slot)} style={({ pressed }) => [styles.timeChip, active && styles.timeChipActive, pressed && styles.pressed]}><Text style={[styles.timeText, active && styles.timeTextActive]}>{timeLabel(slot)}</Text></Pressable>; })}</View>
        ) : <View style={styles.emptyTime}><Text style={styles.emptyTimeText}>{scheduleSetupRequired ? "Live times will appear here once your working hours are configured." : "Choose an available date to see times."}</Text></View>}

        <View style={styles.sectionHead}><Text style={styles.stepNo}>04</Text><View><Text style={styles.sectionTitle}>Secure Your Booking</Text><Text style={styles.sectionMeta}>Stripe protects your card details.</Text></View></View>
        <View style={[styles.paymentCard, paymentVerified && styles.paymentCardVerified]}>
          <View style={styles.paymentTop}><View><Text style={styles.paymentEyebrow}>PAYMENT METHOD</Text><Text style={styles.paymentTitle}>{paymentVerified ? paymentLabel : "Card Required"}</Text></View><View style={[styles.paymentBadge, paymentVerified && styles.paymentBadgeReady]}><Text style={[styles.paymentBadgeText, paymentVerified && styles.paymentBadgeTextReady]}>{paymentVerified ? "READY" : "REQUIRED"}</Text></View></View>
          <Text style={styles.paymentText}>{paymentVerified ? "Your saved method is ready for booking protection." : "Add a payment method securely with Stripe. QuincyFadez never stores your full card number or CVC."}</Text>
          {!paymentVerified ? <Pressable onPress={addPaymentMethod} disabled={paymentBusy || !clientKey} style={({ pressed }) => [styles.paymentButton, pressed && styles.pressed, paymentBusy && styles.disabled]}><Text style={styles.paymentButtonText}>{paymentBusy ? "OPENING STRIPE…" : "ADD PAYMENT METHOD"}</Text><Text style={styles.paymentArrow}>›</Text></Pressable> : null}
          {paymentError ? <Text style={styles.inlineError}>{paymentError}</Text> : null}
        </View>

        <View style={styles.sectionHead}><Text style={styles.stepNo}>05</Text><View><Text style={styles.sectionTitle}>Confirm Appointment</Text><Text style={styles.sectionMeta}>One final check before it's yours.</Text></View></View>
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Service</Text><Text style={styles.summaryValue}>{service.name}</Text></View>
          <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Date</Text><Text style={styles.summaryValue}>{selectedDate ? new Date(`${selectedDate}T12:00:00`).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" }) : "Not Selected"}</Text></View>
          <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Time</Text><Text style={styles.summaryValue}>{selectedSlot ? timeLabel(selectedSlot) : "Not Selected"}</Text></View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryRow}><Text style={styles.totalLabel}>Total</Text><Text style={styles.totalPrice}>£{service.price}</Text></View>
        </View>

        <Pressable disabled={!selectedSlot || !paymentVerified || bookingBusy} onPress={confirmBooking} style={({ pressed }) => [styles.confirmButton, (!selectedSlot || !paymentVerified) && styles.confirmDisabled, pressed && selectedSlot && paymentVerified && styles.confirmPressed]}>
          <View><Text style={[styles.confirmButtonText, (!selectedSlot || !paymentVerified) && styles.confirmButtonTextDisabled]}>{bookingBusy ? "CONFIRMING…" : "CONFIRM BOOKING"}</Text><Text style={[styles.confirmButtonSub, (!selectedSlot || !paymentVerified) && styles.confirmButtonSubDisabled]}>{selectedSlot && paymentVerified ? "Reserve this QuincyFadez appointment" : "Choose a time and verify your card first"}</Text></View>
          <View style={styles.confirmArrowWrap}><Text style={styles.confirmArrow}>›</Text></View>
        </Pressable>
        {bookingError ? <Text style={styles.bookingError}>{bookingError}</Text> : null}

        <View style={styles.trustRow}><Text style={styles.trustText}>LIVE AVAILABILITY</Text><Text style={styles.trustDot}>•</Text><Text style={styles.trustText}>STRIPE SECURED</Text><Text style={styles.trustDot}>•</Text><Text style={styles.trustText}>DIRECT BOOKING</Text></View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: BG },
  screen: { flex: 1, backgroundColor: BG },
  content: { paddingHorizontal: 18, paddingTop: 6, paddingBottom: 44 },
  header: { minHeight: 54, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderBottomWidth: 1, borderBottomColor: "#151515" },
  backButton: { width: 44, height: 44, justifyContent: "center" },
  backIcon: { color: "#F5F5F5", fontSize: 34, lineHeight: 34 },
  headerTitle: { color: "#F4F4F4", fontSize: 13, letterSpacing: 1.8, fontWeight: "700" },
  headerSpacer: { width: 44 },
  intro: { paddingTop: 26, paddingBottom: 18 },
  eyebrow: { color: GOLD, fontSize: 8, letterSpacing: 2.1, fontWeight: "800" },
  title: { color: "#F6F6F6", fontSize: 31, lineHeight: 36, fontWeight: "750", marginTop: 9 },
  subtitle: { color: MUTED, fontSize: 12, lineHeight: 18, marginTop: 8, maxWidth: 350 },
  progressTrack: { flexDirection: "row", justifyContent: "space-between", marginTop: 20, borderRadius: 18, borderWidth: 1, borderColor: "#202020", backgroundColor: "#090909", paddingHorizontal: 12, paddingVertical: 11 },
  progressItem: { alignItems: "center", flex: 1 },
  progressDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: "#333" },
  progressDotActive: { backgroundColor: GOLD_LIGHT, shadowColor: GOLD_LIGHT, shadowOpacity: 0.8, shadowRadius: 6 },
  progressLabel: { color: "#555", fontSize: 5.8, letterSpacing: 0.8, fontWeight: "800", marginTop: 5 },
  progressLabelActive: { color: "#CDB57B" },
  sectionHead: { flexDirection: "row", alignItems: "center", gap: 11, marginTop: 24, marginBottom: 11 },
  stepNo: { color: GOLD, fontSize: 9, letterSpacing: 1.4, fontWeight: "900", width: 20 },
  sectionTitle: { color: "#F1F1F1", fontSize: 17, fontWeight: "700" },
  sectionMeta: { color: MUTED, fontSize: 9, marginTop: 3 },
  serviceList: { gap: 9 },
  serviceOption: { minHeight: 74, borderRadius: 17, borderWidth: 1, borderColor: BORDER, backgroundColor: PANEL, paddingHorizontal: 15, flexDirection: "row", alignItems: "center" },
  serviceOptionActive: { borderColor: "#6D542A", backgroundColor: "#120F09", shadowColor: GOLD, shadowOpacity: 0.08, shadowRadius: 10 },
  pressed: { opacity: 0.76 },
  disabled: { opacity: 0.55 },
  radioOuter: { width: 20, height: 20, borderRadius: 10, borderWidth: 1, borderColor: "#444", alignItems: "center", justifyContent: "center" },
  radioOuterActive: { borderColor: GOLD_LIGHT },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: GOLD_LIGHT },
  serviceCopy: { flex: 1, marginLeft: 13 },
  serviceName: { color: "#E7E7E7", fontSize: 14.5, fontWeight: "650" },
  serviceNameActive: { color: "#FFF4DD" },
  serviceDuration: { color: MUTED, fontSize: 8.5, marginTop: 4 },
  servicePrice: { color: GOLD_LIGHT, fontSize: 18, fontWeight: "800" },
  stateCard: { borderRadius: 17, borderWidth: 1, borderColor: "#322A1C", backgroundColor: "#0B0906", padding: 16 },
  stateTitle: { color: GOLD_LIGHT, fontSize: 8, letterSpacing: 1.3, fontWeight: "800" },
  stateText: { color: "#A39C8D", fontSize: 10, lineHeight: 16, marginTop: 7 },
  errorCard: { borderRadius: 16, borderWidth: 1, borderColor: "#482E2A", backgroundColor: "#100908", padding: 15 },
  errorText: { color: "#E2A49A", fontSize: 10, lineHeight: 16 },
  retryText: { color: GOLD_LIGHT, fontSize: 8, letterSpacing: 1.2, fontWeight: "800", marginTop: 9 },
  dateRail: { gap: 9, paddingRight: 12 },
  dateCard: { width: 76, minHeight: 106, borderRadius: 18, borderWidth: 1, borderColor: "#242424", backgroundColor: "#0B0B0B", alignItems: "center", justifyContent: "center" },
  dateCardActive: { borderColor: "#7A5C2E", backgroundColor: "#C99B4A" },
  dateDay: { color: "#7F7F7F", fontSize: 7, letterSpacing: 1, fontWeight: "800" },
  dateNumber: { color: "#F2F2F2", fontSize: 23, fontWeight: "800", marginTop: 4 },
  dateMonth: { color: "#9A9A9A", fontSize: 7, letterSpacing: 1, fontWeight: "700", marginTop: 2 },
  dateSlots: { color: "#6E5A35", fontSize: 5.8, letterSpacing: 0.8, fontWeight: "800", marginTop: 8 },
  dateTextActive: { color: "#090909" },
  dateSlotsActive: { color: "#3E2D12" },
  timeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  timeChip: { width: "23.2%", minHeight: 48, borderRadius: 14, borderWidth: 1, borderColor: "#262626", backgroundColor: "#0B0B0B", alignItems: "center", justifyContent: "center" },
  timeChipActive: { borderColor: GOLD, backgroundColor: "#171108" },
  timeText: { color: "#D7D7D7", fontSize: 12, fontWeight: "700" },
  timeTextActive: { color: GOLD_LIGHT },
  emptyTime: { minHeight: 70, borderRadius: 16, borderWidth: 1, borderColor: "#202020", backgroundColor: "#090909", padding: 16, justifyContent: "center" },
  emptyTimeText: { color: "#777", fontSize: 10, lineHeight: 16 },
  paymentCard: { borderRadius: 19, borderWidth: 1, borderColor: "#2B2924", backgroundColor: "#0B0A08", padding: 17 },
  paymentCardVerified: { borderColor: "#57441F" },
  paymentTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 12 },
  paymentEyebrow: { color: "#9D7B40", fontSize: 7, letterSpacing: 1.4, fontWeight: "800" },
  paymentTitle: { color: "#F0F0F0", fontSize: 14, fontWeight: "700", marginTop: 6 },
  paymentBadge: { borderRadius: 13, borderWidth: 1, borderColor: "#3B3B3B", paddingHorizontal: 8, paddingVertical: 5 },
  paymentBadgeReady: { borderColor: "#6A5127", backgroundColor: "#171108" },
  paymentBadgeText: { color: "#777", fontSize: 6.5, letterSpacing: 0.9, fontWeight: "800" },
  paymentBadgeTextReady: { color: GOLD_LIGHT },
  paymentText: { color: "#96928A", fontSize: 9.5, lineHeight: 15, marginTop: 13 },
  paymentButton: { minHeight: 51, borderRadius: 14, backgroundColor: GOLD, marginTop: 14, paddingHorizontal: 15, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  paymentButtonText: { color: "#090909", fontSize: 9.5, letterSpacing: 1, fontWeight: "900" },
  paymentArrow: { color: "#090909", fontSize: 25 },
  inlineError: { color: "#E2A49A", fontSize: 9, lineHeight: 14, marginTop: 9 },
  summaryCard: { borderRadius: 19, borderWidth: 1, borderColor: "#242424", backgroundColor: "#0A0A0A", padding: 17 },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 7 },
  summaryLabel: { color: MUTED, fontSize: 10 },
  summaryValue: { color: "#E9E9E9", fontSize: 10.5, fontWeight: "650" },
  summaryDivider: { height: 1, backgroundColor: "#202020", marginVertical: 6 },
  totalLabel: { color: "#F2F2F2", fontSize: 13, fontWeight: "700" },
  totalPrice: { color: GOLD_LIGHT, fontSize: 21, fontWeight: "850" },
  confirmButton: { minHeight: 67, borderRadius: 18, backgroundColor: GOLD, marginTop: 13, paddingHorizontal: 18, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  confirmDisabled: { backgroundColor: "#171717", borderWidth: 1, borderColor: "#292929" },
  confirmPressed: { opacity: 0.86, transform: [{ scale: 0.995 }] },
  confirmButtonText: { color: "#090909", fontSize: 11.5, letterSpacing: 1, fontWeight: "900" },
  confirmButtonTextDisabled: { color: "#666" },
  confirmButtonSub: { color: "#493514", fontSize: 8.5, marginTop: 4 },
  confirmButtonSubDisabled: { color: "#555" },
  confirmArrowWrap: { width: 34, height: 34, borderRadius: 17, backgroundColor: "rgba(0,0,0,0.10)", alignItems: "center", justifyContent: "center" },
  confirmArrow: { color: "#090909", fontSize: 28, lineHeight: 28 },
  bookingError: { color: "#E2A49A", fontSize: 9.5, lineHeight: 15, marginTop: 10 },
  trustRow: { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 7, marginTop: 20 },
  trustText: { color: "#6F6045", fontSize: 6, letterSpacing: 0.9, fontWeight: "800" },
  trustDot: { color: "#3D3426", fontSize: 8 },
  confirmationWrap: { flex: 1, paddingHorizontal: 22, alignItems: "center", justifyContent: "center", backgroundColor: BG },
  confirmationHalo: { width: 74, height: 74, borderRadius: 37, borderWidth: 1, borderColor: "#765A2C", backgroundColor: "#171108", alignItems: "center", justifyContent: "center", shadowColor: GOLD, shadowOpacity: 0.22, shadowRadius: 22 },
  confirmationTick: { color: GOLD_LIGHT, fontSize: 31, fontWeight: "800" },
  confirmationEyebrow: { color: GOLD, fontSize: 8, letterSpacing: 2, fontWeight: "900", marginTop: 22 },
  confirmationTitle: { color: "#F7F7F7", fontSize: 31, fontWeight: "800", marginTop: 8 },
  confirmationSub: { color: MUTED, fontSize: 11.5, lineHeight: 18, textAlign: "center", maxWidth: 300, marginTop: 8 },
  confirmationCard: { width: "100%", borderRadius: 21, borderWidth: 1, borderColor: "#2D2922", backgroundColor: "#0B0A08", padding: 18, marginTop: 24 },
  confirmationRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 8 },
  confirmationLabel: { color: "#777", fontSize: 7, letterSpacing: 1.2, fontWeight: "800" },
  confirmationValue: { color: "#ECECEC", fontSize: 11, fontWeight: "700" },
  confirmationPrice: { color: GOLD_LIGHT, fontSize: 18, fontWeight: "850" },
  confirmationDivider: { height: 1, backgroundColor: "#1E1C18" },
  doneButton: { width: "100%", minHeight: 56, borderRadius: 16, backgroundColor: GOLD, alignItems: "center", justifyContent: "center", marginTop: 14 },
  doneButtonText: { color: "#090909", fontSize: 10.5, letterSpacing: 1.3, fontWeight: "900" },
});
