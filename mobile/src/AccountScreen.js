import React, { useEffect, useState } from "react";
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

export default function AccountScreen({ onBack }) {
  const [clientKey, setClientKey] = useState("");
  const [paymentSummary, setPaymentSummary] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const request = async (path, options = {}) => {
    if (!API_URL) throw new Error("Secure account services are still being connected.");
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(typeof data.detail === "string" ? data.detail : "Account service unavailable.");
    }
    return data;
  };

  const refreshPayment = async (key, silent = false) => {
    if (!key || !API_URL) return;
    try {
      const data = await request("/api/payments/verify", {
        method: "POST",
        body: JSON.stringify({ client_key: key }),
      });
      setPaymentSummary(data.verified ? data.payment_method || null : null);
      if (!silent) setError("");
    } catch (err) {
      if (!silent) setError(err.message);
    }
  };

  useEffect(() => {
    let active = true;
    getClientKey()
      .then(async (key) => {
        if (!active) return;
        setClientKey(key);
        await refreshPayment(key, true);
      })
      .catch(() => {
        if (active) setError("Account setup could not start on this device.");
      });
    return () => {
      active = false;
    };
  }, []);

  const managePaymentMethods = async () => {
    if (!clientKey || busy) return;
    setBusy(true);
    setError("");

    try {
      const clientSecretProvider = {
        async provideCustomerSessionClientSecret() {
          const data = await request("/api/payments/customer-session", {
            method: "POST",
            body: JSON.stringify({ client_key: clientKey }),
          });
          return {
            customerId: data.customer,
            clientSecret: data.customer_session_client_secret,
          };
        },
        async provideSetupIntentClientSecret() {
          const data = await request("/api/payments/customer-sheet-setup", {
            method: "POST",
            body: JSON.stringify({ client_key: clientKey }),
          });
          return data.setup_intent_client_secret;
        },
      };

      const { error: initError } = await CustomerSheet.initialize({
        intentConfiguration: { paymentMethodTypes: ["card"] },
        clientSecretProvider,
        headerTextForSelectionScreen: "Manage your payment method",
        returnURL: "quincyfadez://stripe-redirect",
        appearance: {
          colors: {
            primary: GOLD,
            background: "#0A0A0A",
            componentBackground: "#111111",
            componentBorder: "#2A2A2A",
            primaryText: "#F5F5F5",
            secondaryText: "#9A9A9A",
            componentText: "#F5F5F5",
          },
          shapes: { borderRadius: 14, borderWidth: 1 },
        },
      });

      if (initError) throw new Error(initError.message || "Payment settings could not be opened.");

      const result = await CustomerSheet.present();
      if (result.error && result.error.code !== CustomerSheetError.Canceled) {
        throw new Error(result.error.message || "Payment settings could not be updated.");
      }

      await refreshPayment(clientKey, true);
    } catch (err) {
      setError(err.message || "Payment settings could not be opened.");
    } finally {
      setBusy(false);
    }
  };

  const cardLabel = paymentSummary?.last4
    ? `${(paymentSummary.brand || "Card").toUpperCase()}  •••• ${paymentSummary.last4}`
    : "No Saved Payment Method";

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={BG} />
      <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable onPress={onBack} hitSlop={12} style={styles.backButton}><Text style={styles.backIcon}>‹</Text></Pressable>
          <Text style={styles.headerTitle}>ACCOUNT</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.intro}>
          <Text style={styles.eyebrow}>YOUR QUINCYFADEZ</Text>
          <Text style={styles.title}>Everything In One Place.</Text>
          <Text style={styles.subtitle}>Manage the payment method used for booking protection and keep your QuincyFadez links close at hand.</Text>
        </View>

        <View style={styles.paymentCard}>
          <View style={styles.rowBetween}>
            <View>
              <Text style={styles.cardEyebrow}>PAYMENT METHOD</Text>
              <Text style={styles.cardTitle}>{cardLabel}</Text>
            </View>
            <View style={[styles.statusBadge, paymentSummary && styles.statusBadgeReady]}>
              <Text style={[styles.statusText, paymentSummary && styles.statusTextReady]}>{paymentSummary ? "READY" : "NOT SET"}</Text>
            </View>
          </View>
          <Text style={styles.cardText}>{paymentSummary ? "Saved securely with Stripe. Your full card number and CVC are never stored by QuincyFadez." : "Add a payment method to make future booking verification quicker."}</Text>
          <Pressable onPress={managePaymentMethods} disabled={busy || !clientKey} style={({ pressed }) => [styles.goldButton, pressed && styles.pressed, busy && styles.disabled]}>
            <Text style={styles.goldButtonText}>{busy ? "OPENING STRIPE…" : "MANAGE PAYMENT METHODS"}</Text>
            <Text style={styles.goldArrow}>›</Text>
          </Pressable>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Links</Text>
          <Pressable onPress={() => Linking.openURL(links.whatsapp)} style={({ pressed }) => [styles.linkRow, pressed && styles.pressed]}>
            <View><Text style={styles.linkTitle}>WhatsApp QuincyFadez</Text><Text style={styles.linkMeta}>Questions, changes or help</Text></View><Text style={styles.linkArrow}>›</Text>
          </Pressable>
          <Pressable onPress={() => Linking.openURL(links.website)} style={({ pressed }) => [styles.linkRow, pressed && styles.pressed]}>
            <View><Text style={styles.linkTitle}>QuincyFadez Website</Text><Text style={styles.linkMeta}>Services, gallery and information</Text></View><Text style={styles.linkArrow}>›</Text>
          </Pressable>
          <Pressable onPress={() => Linking.openURL(links.reviews)} style={({ pressed }) => [styles.linkRow, pressed && styles.pressed]}>
            <View><Text style={styles.linkTitle}>Leave A Google Review</Text><Text style={styles.linkMeta}>Share your experience</Text></View><Text style={styles.linkArrow}>›</Text>
          </Pressable>
        </View>

        <View style={styles.securityCard}>
          <Text style={styles.securityTitle}>SECURE BY STRIPE</Text>
          <Text style={styles.securityText}>Payment details are collected and managed by Stripe. QuincyFadez only receives safe references and limited display details such as card brand and last four digits.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: BG },
  screen: { flex: 1, backgroundColor: BG },
  content: { paddingHorizontal: 18, paddingTop: 6, paddingBottom: 36 },
  header: { minHeight: 54, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderBottomWidth: 1, borderBottomColor: "#151515" },
  backButton: { width: 44, height: 44, justifyContent: "center" },
  backIcon: { color: "#F5F5F5", fontSize: 34, lineHeight: 34 },
  headerTitle: { color: "#F4F4F4", fontSize: 13, letterSpacing: 2.1, fontWeight: "700" },
  headerSpacer: { width: 44 },
  intro: { paddingTop: 27, paddingBottom: 18 },
  eyebrow: { color: GOLD, fontSize: 8.5, letterSpacing: 2, fontWeight: "800" },
  title: { color: "#F5F5F5", fontSize: 29, lineHeight: 34, fontWeight: "700", marginTop: 8 },
  subtitle: { color: MUTED, fontSize: 12.5, lineHeight: 19, marginTop: 9, maxWidth: 350 },
  paymentCard: { backgroundColor: "#0B0906", borderRadius: 20, borderWidth: 1, borderColor: "#342A19", padding: 18 },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 12 },
  cardEyebrow: { color: "#B99150", fontSize: 8, letterSpacing: 1.7, fontWeight: "800" },
  cardTitle: { color: "#F2F2F2", fontSize: 16, fontWeight: "700", marginTop: 7 },
  statusBadge: { borderRadius: 14, borderWidth: 1, borderColor: "#333", paddingHorizontal: 9, paddingVertical: 5 },
  statusBadgeReady: { borderColor: "#66502A", backgroundColor: "#151006" },
  statusText: { color: "#777", fontSize: 7, letterSpacing: 1, fontWeight: "800" },
  statusTextReady: { color: GOLD_LIGHT },
  cardText: { color: "#A5A098", fontSize: 10.5, lineHeight: 17, marginTop: 15 },
  goldButton: { minHeight: 54, borderRadius: 15, marginTop: 16, backgroundColor: GOLD, paddingHorizontal: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  goldButtonText: { color: "#090909", fontSize: 10.5, letterSpacing: 1, fontWeight: "900" },
  goldArrow: { color: "#090909", fontSize: 26 },
  pressed: { opacity: 0.76 },
  disabled: { opacity: 0.55 },
  errorText: { color: "#E29A8F", fontSize: 9.5, lineHeight: 15, marginTop: 10 },
  section: { marginTop: 23 },
  sectionTitle: { color: "#F2F2F2", fontSize: 19, fontWeight: "700", marginBottom: 10 },
  linkRow: { minHeight: 69, borderRadius: 16, borderWidth: 1, borderColor: BORDER, backgroundColor: PANEL, paddingHorizontal: 16, marginBottom: 9, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  linkTitle: { color: "#EDEDED", fontSize: 13, fontWeight: "650" },
  linkMeta: { color: MUTED, fontSize: 9, marginTop: 4 },
  linkArrow: { color: GOLD_LIGHT, fontSize: 24 },
  securityCard: { marginTop: 13, borderRadius: 16, borderWidth: 1, borderColor: "#26231D", backgroundColor: "#090806", padding: 15 },
  securityTitle: { color: GOLD_LIGHT, fontSize: 8, letterSpacing: 1.5, fontWeight: "800" },
  securityText: { color: "#918D86", fontSize: 9.5, lineHeight: 16, marginTop: 7 },
});