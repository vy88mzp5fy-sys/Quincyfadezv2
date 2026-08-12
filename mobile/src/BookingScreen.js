import React, { useEffect, useMemo, useState } from "react";
import {
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
import { useStripe } from "@stripe/stripe-react-native";

const GOLD = "#C99B4A";
const GOLD_LIGHT = "#E7C77A";
const BG = "#050505";
const PANEL = "#0D0D0D";
const BORDER = "#242424";
const MUTED = "#9A9A9A";
const BOOKING_URL = "https://www.barbr.me/quincyfadez";
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

export default function BookingScreen({ onBack, initialService = "Haircut" }) {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [selectedService, setSelectedService] = useState(initialService);
  const [clientKey, setClientKey] = useState("");
  const [paymentVerified, setPaymentVerified] = useState(false);
  const [paymentSummary, setPaymentSummary] = useState(null);
  const [paymentBusy, setPaymentBusy] = useState(false);
  const [paymentError, setPaymentError] = useState("");

  const service = useMemo(
    () => SERVICES.find((item) => item.name === selectedService) || SERVICES[0],
    [selectedService]
  );

  const request = async (path, options = {}) => {
    if (!API_URL) throw new Error("Secure payments are still being connected to the app.");
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const message = typeof data.detail === "string" ? data.detail : "Something went wrong with payment setup.";
      throw new Error(message);
    }
    return data;
  };

  const verifyPaymentMethod = async (key, silent = false) => {
    if (!key || !API_URL) return false;
    try {
      const data = await request("/api/payments/verify", {
        method: "POST",
        body: JSON.stringify({ client_key: key }),
      });
      if (data.verified) {
        setPaymentVerified(true);
        setPaymentSummary(data.payment_method || null);
        setPaymentError("");
        return true;
      }
    } catch (error) {
      if (!silent) setPaymentError(error.message);
    }
    return false;
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
    return () => {
      active = false;
    };
  }, []);

  const confirmHandler = async (confirmationToken, intentCreationCallback) => {
    try {
      const data = await request("/api/payments/confirm-setup", {
        method: "POST",
        body: JSON.stringify({
          client_key: clientKey,
          confirmation_token_id: confirmationToken.id,
        }),
      });

      if (!data.client_secret) throw new Error("Stripe did not return a setup confirmation.");
      intentCreationCallback({ clientSecret: data.client_secret });
    } catch (error) {
      intentCreationCallback({
        error: {
          localizedMessage: error.message || "Your payment method could not be set up.",
        },
      });
    }
  };

  const addPaymentMethod = async () => {
    if (!clientKey) return;
    setPaymentBusy(true);
    setPaymentError("");

    try {
      if (!API_URL) throw new Error("Secure payments are still being connected to the app.");

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
          shapes: {
            borderRadius: 14,
            borderWidth: 1,
          },
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
      if (!verified) {
        throw new Error("Stripe finished, but the server has not verified the payment method yet. Please try again.");
      }
    } catch (error) {
      setPaymentError(error.message || "Payment setup could not be completed.");
    } finally {
      setPaymentBusy(false);
    }
  };

  const continueToLiveBooking = () => {
    if (!paymentVerified) {
      setPaymentError("Add and verify a payment method before choosing a live booking slot.");
      return;
    }
    Linking.openURL(BOOKING_URL).catch(() => {});
  };

  const paymentLabel = paymentSummary?.last4
    ? `${(paymentSummary.brand || "Card").toUpperCase()}  •••• ${paymentSummary.last4}`
    : "PAYMENT METHOD VERIFIED";

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={BG} />
      <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable onPress={onBack} hitSlop={12} style={styles.backButton}>
            <Text style={styles.backIcon}>‹</Text>
          </Pressable>
          <Text style={styles.headerTitle}>BOOK APPOINTMENT</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.intro}>
          <View style={styles.stepPill}>
            <Text style={styles.stepText}>STEP 1 OF 3</Text>
          </View>
          <Text style={styles.title}>Choose Your Service.</Text>
          <Text style={styles.subtitle}>Select your cut, securely verify a payment method, then continue to live availability for your date and time.</Text>
        </View>

        <View style={styles.serviceList}>
          {SERVICES.map((item) => {
            const active = item.name === selectedService;
            return (
              <Pressable
                key={item.name}
                onPress={() => setSelectedService(item.name)}
                style={({ pressed }) => [styles.serviceOption, active && styles.serviceOptionActive, pressed && styles.pressed]}
              >
                <View style={[styles.radioOuter, active && styles.radioOuterActive]}>
                  {active ? <View style={styles.radioInner} /> : null}
                </View>
                <View style={styles.serviceCopy}>
                  <Text style={[styles.serviceName, active && styles.serviceNameActive]}>{item.name}</Text>
                  <Text style={styles.serviceDuration}>{item.duration}</Text>
                </View>
                <View style={styles.priceWrap}>
                  <Text style={styles.servicePrice}>£{item.price}</Text>
                  {active ? <Text style={styles.selectedLabel}>SELECTED</Text> : null}
                </View>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Text style={styles.summaryEyebrow}>YOUR SELECTION</Text>
            <View style={styles.summaryStatus}><Text style={styles.summaryStatusText}>READY</Text></View>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Service</Text>
            <Text style={styles.summaryValue}>{service.name}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Duration</Text>
            <Text style={styles.summaryValue}>{service.duration}</Text>
          </View>
          <View style={[styles.summaryRow, styles.summaryTotal]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalPrice}>£{service.price}</Text>
          </View>
        </View>

        <View style={[styles.paymentCard, paymentVerified && styles.paymentCardVerified]}>
          <View style={styles.paymentHeader}>
            <View>
              <Text style={styles.paymentEyebrow}>STEP 2 · SECURE PAYMENT</Text>
              <Text style={styles.paymentTitle}>{paymentVerified ? "Payment Method Ready" : "Add Payment Method"}</Text>
            </View>
            <View style={[styles.paymentBadge, paymentVerified && styles.paymentBadgeVerified]}>
              <Text style={[styles.paymentBadgeText, paymentVerified && styles.paymentBadgeTextVerified]}>
                {paymentVerified ? "VERIFIED" : "REQUIRED"}
              </Text>
            </View>
          </View>

          {paymentVerified ? (
            <View style={styles.savedMethodRow}>
              <View style={styles.cardGlyph}><Text style={styles.cardGlyphText}>▰</Text></View>
              <View style={styles.savedMethodCopy}>
                <Text style={styles.savedMethodLabel}>{paymentLabel}</Text>
                <Text style={styles.savedMethodMeta}>Saved securely with Stripe</Text>
              </View>
              <Text style={styles.verifiedTick}>✓</Text>
            </View>
          ) : (
            <>
              <Text style={styles.paymentText}>Your card is verified by Stripe before booking is unlocked. QuincyFadez never receives or stores your full card number or CVC.</Text>
              <Pressable
                disabled={paymentBusy || !clientKey}
                onPress={addPaymentMethod}
                style={({ pressed }) => [styles.paymentButton, pressed && !paymentBusy && styles.paymentButtonPressed, paymentBusy && styles.paymentButtonDisabled]}
              >
                <Text style={styles.paymentButtonText}>{paymentBusy ? "OPENING STRIPE…" : "ADD PAYMENT METHOD"}</Text>
                <Text style={styles.paymentButtonArrow}>›</Text>
              </Pressable>
              <Text style={styles.consentText}>Adding a payment method saves it securely with Stripe for future payments you authorise. You are not charged by this step.</Text>
            </>
          )}

          {paymentError ? <Text style={styles.paymentError}>{paymentError}</Text> : null}
        </View>

        <Pressable
          disabled={!paymentVerified}
          onPress={continueToLiveBooking}
          style={({ pressed }) => [styles.continueButton, !paymentVerified && styles.continueDisabled, pressed && paymentVerified && styles.continuePressed]}
        >
          <View>
            <Text style={[styles.continueText, !paymentVerified && styles.continueTextDisabled]}>CHOOSE DATE & TIME</Text>
            <Text style={[styles.continueSubtext, !paymentVerified && styles.continueSubtextDisabled]}>
              {paymentVerified ? "Step 3 · Live availability via Barbr" : "Unlocks after Stripe verification"}
            </Text>
          </View>
          <View style={[styles.arrowCircle, !paymentVerified && styles.arrowCircleDisabled]}><Text style={[styles.continueArrow, !paymentVerified && styles.continueArrowDisabled]}>›</Text></View>
        </Pressable>

        <View style={styles.trustRow}>
          <View style={styles.trustItem}><Text style={styles.trustIcon}>✓</Text><Text style={styles.trustText}>LIVE SLOTS</Text></View>
          <View style={styles.trustDivider} />
          <View style={styles.trustItem}><Text style={styles.trustIcon}>✓</Text><Text style={styles.trustText}>STRIPE SECURED</Text></View>
          <View style={styles.trustDivider} />
          <View style={styles.trustItem}><Text style={styles.trustIcon}>✓</Text><Text style={styles.trustText}>NO WALK-INS</Text></View>
        </View>

        <View style={styles.noteCard}>
          <Text style={styles.noteTitle}>HOW IT WORKS</Text>
          <Text style={styles.noteText}>Choose your service, verify a payment method securely with Stripe, then open Barbr for the live date and time slots. Adding your card does not charge you.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: BG },
  screen: { flex: 1, backgroundColor: BG },
  content: { paddingHorizontal: 18, paddingTop: 6, paddingBottom: 34 },
  header: { minHeight: 54, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderBottomWidth: 1, borderBottomColor: "#151515" },
  backButton: { width: 44, height: 44, justifyContent: "center" },
  backIcon: { color: "#F5F5F5", fontSize: 34, lineHeight: 34 },
  headerTitle: { color: "#F4F4F4", fontSize: 13, letterSpacing: 1.8, fontWeight: "700" },
  headerSpacer: { width: 44 },
  intro: { paddingTop: 24, paddingBottom: 18 },
  stepPill: { alignSelf: "flex-start", borderRadius: 20, borderWidth: 1, borderColor: "#3C301B", backgroundColor: "#0D0A06", paddingHorizontal: 10, paddingVertical: 6 },
  stepText: { color: GOLD, fontSize: 8, letterSpacing: 1.7, fontWeight: "800" },
  title: { color: "#F5F5F5", fontSize: 30, lineHeight: 35, fontWeight: "650", marginTop: 12 },
  subtitle: { color: MUTED, fontSize: 12.5, lineHeight: 19, marginTop: 9, maxWidth: 350 },
  serviceList: { gap: 10 },
  serviceOption: { minHeight: 78, borderRadius: 18, borderWidth: 1, borderColor: BORDER, backgroundColor: PANEL, paddingHorizontal: 16, flexDirection: "row", alignItems: "center" },
  serviceOptionActive: { borderColor: "#73582C", backgroundColor: "#120F09", shadowColor: GOLD, shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 5 }, elevation: 2 },
  pressed: { opacity: 0.78 },
  radioOuter: { width: 21, height: 21, borderRadius: 11, borderWidth: 1, borderColor: "#4A4A4A", alignItems: "center", justifyContent: "center" },
  radioOuterActive: { borderColor: GOLD_LIGHT },
  radioInner: { width: 11, height: 11, borderRadius: 6, backgroundColor: GOLD_LIGHT },
  serviceCopy: { flex: 1, marginLeft: 13 },
  serviceName: { color: "#E8E8E8", fontSize: 15, fontWeight: "600" },
  serviceNameActive: { color: "#FFF5DF" },
  serviceDuration: { color: MUTED, fontSize: 9, marginTop: 5, letterSpacing: 0.5 },
  priceWrap: { alignItems: "flex-end" },
  servicePrice: { color: GOLD_LIGHT, fontSize: 18, fontWeight: "750" },
  selectedLabel: { color: "#8F7444", fontSize: 6.5, letterSpacing: 1.1, fontWeight: "700", marginTop: 5 },
  summaryCard: { marginTop: 20, borderRadius: 20, borderWidth: 1, borderColor: "#29251D", backgroundColor: "#090806", padding: 18 },
  summaryHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 7 },
  summaryEyebrow: { color: GOLD, fontSize: 8.5, letterSpacing: 1.8, fontWeight: "700" },
  summaryStatus: { borderRadius: 12, borderWidth: 1, borderColor: "#3A3327", paddingHorizontal: 8, paddingVertical: 4 },
  summaryStatusText: { color: "#9A8A6E", fontSize: 6.5, letterSpacing: 1.1, fontWeight: "700" },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 9 },
  summaryLabel: { color: MUTED, fontSize: 11 },
  summaryValue: { color: "#E8E8E8", fontSize: 11, fontWeight: "600" },
  summaryTotal: { borderTopWidth: 1, borderTopColor: "#1E1B16", marginTop: 4, paddingTop: 14 },
  totalLabel: { color: "#F2F2F2", fontSize: 13, fontWeight: "600" },
  totalPrice: { color: GOLD_LIGHT, fontSize: 20, fontWeight: "800" },
  paymentCard: { marginTop: 14, borderRadius: 20, borderWidth: 1, borderColor: "#34302A", backgroundColor: "#0A0907", padding: 17 },
  paymentCardVerified: { borderColor: "#465336", backgroundColor: "#090D07" },
  paymentHeader: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 12 },
  paymentEyebrow: { color: GOLD, fontSize: 7.5, letterSpacing: 1.4, fontWeight: "800" },
  paymentTitle: { color: "#F4F4F4", fontSize: 17, fontWeight: "700", marginTop: 5 },
  paymentBadge: { borderRadius: 12, borderWidth: 1, borderColor: "#493B24", backgroundColor: "#171108", paddingHorizontal: 8, paddingVertical: 5 },
  paymentBadgeVerified: { borderColor: "#40502E", backgroundColor: "#10170B" },
  paymentBadgeText: { color: GOLD_LIGHT, fontSize: 6.5, letterSpacing: 1.1, fontWeight: "800" },
  paymentBadgeTextVerified: { color: "#B5D48F" },
  paymentText: { color: "#AAA39A", fontSize: 10.5, lineHeight: 17, marginTop: 13 },
  paymentButton: { minHeight: 52, marginTop: 14, borderRadius: 15, borderWidth: 1, borderColor: "#6A542C", backgroundColor: "#171108", paddingHorizontal: 15, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  paymentButtonPressed: { opacity: 0.8 },
  paymentButtonDisabled: { opacity: 0.55 },
  paymentButtonText: { color: GOLD_LIGHT, fontSize: 10, letterSpacing: 1.1, fontWeight: "800" },
  paymentButtonArrow: { color: GOLD_LIGHT, fontSize: 24, lineHeight: 24 },
  consentText: { color: "#716D66", fontSize: 8.5, lineHeight: 13, marginTop: 10 },
  paymentError: { color: "#E7A2A2", fontSize: 9.5, lineHeight: 15, marginTop: 10 },
  savedMethodRow: { marginTop: 14, borderRadius: 15, borderWidth: 1, borderColor: "#2A3720", backgroundColor: "#0D120A", minHeight: 58, paddingHorizontal: 13, flexDirection: "row", alignItems: "center" },
  cardGlyph: { width: 34, height: 34, borderRadius: 10, borderWidth: 1, borderColor: "#44552F", backgroundColor: "#11190C", alignItems: "center", justifyContent: "center" },
  cardGlyphText: { color: "#C7DBA8", fontSize: 15 },
  savedMethodCopy: { flex: 1, marginLeft: 11 },
  savedMethodLabel: { color: "#EDF3E4", fontSize: 11, fontWeight: "700", letterSpacing: 0.3 },
  savedMethodMeta: { color: "#7C8A6B", fontSize: 8.5, marginTop: 4 },
  verifiedTick: { color: "#B8D78E", fontSize: 18, fontWeight: "800" },
  continueButton: { marginTop: 14, minHeight: 66, borderRadius: 18, backgroundColor: GOLD, paddingHorizontal: 19, flexDirection: "row", alignItems: "center", justifyContent: "space-between", shadowColor: GOLD, shadowOpacity: 0.16, shadowRadius: 14, shadowOffset: { width: 0, height: 6 }, elevation: 4 },
  continueDisabled: { backgroundColor: "#23201B", shadowOpacity: 0, elevation: 0 },
  continuePressed: { opacity: 0.86, transform: [{ scale: 0.995 }] },
  continueText: { color: "#090909", fontSize: 12, letterSpacing: 1.1, fontWeight: "800" },
  continueTextDisabled: { color: "#77716A" },
  continueSubtext: { color: "#493514", fontSize: 9, marginTop: 4 },
  continueSubtextDisabled: { color: "#5C5750" },
  arrowCircle: { width: 34, height: 34, borderRadius: 17, backgroundColor: "rgba(0,0,0,0.12)", alignItems: "center", justifyContent: "center" },
  arrowCircleDisabled: { backgroundColor: "#2D2923" },
  continueArrow: { color: "#090909", fontSize: 29, lineHeight: 29, marginTop: -2 },
  continueArrowDisabled: { color: "#69645D" },
  trustRow: { minHeight: 52, marginTop: 10, borderRadius: 15, borderWidth: 1, borderColor: "#1F1F1F", backgroundColor: "#090909", flexDirection: "row", alignItems: "center", justifyContent: "space-around", paddingHorizontal: 8 },
  trustItem: { flex: 1, alignItems: "center", justifyContent: "center" },
  trustIcon: { color: GOLD_LIGHT, fontSize: 9, fontWeight: "800" },
  trustText: { color: "#777", fontSize: 6.5, letterSpacing: 0.8, fontWeight: "700", marginTop: 3 },
  trustDivider: { width: 1, height: 22, backgroundColor: "#202020" },
  noteCard: { marginTop: 12, borderRadius: 16, borderWidth: 1, borderColor: "#302717", backgroundColor: "#0B0906", padding: 15 },
  noteTitle: { color: GOLD_LIGHT, fontSize: 8, letterSpacing: 1.5, fontWeight: "700" },
  noteText: { color: "#A5A098", fontSize: 10, lineHeight: 17, marginTop: 7 },
});
