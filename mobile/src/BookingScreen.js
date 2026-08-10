import React, { useMemo, useState } from "react";
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

const GOLD = "#C99B4A";
const GOLD_LIGHT = "#E7C77A";
const BG = "#050505";
const PANEL = "#0D0D0D";
const BORDER = "#242424";
const MUTED = "#9A9A9A";
const BOOKING_URL = "https://www.barbr.me/quincyfadez";

const SERVICES = [
  { name: "Haircut", price: 20, duration: "45 Minutes" },
  { name: "Haircut & Beard", price: 25, duration: "60 Minutes" },
  { name: "Shape Up", price: 10, duration: "15 Minutes" },
  { name: "Beard Trim", price: 10, duration: "15 Minutes" },
];

export default function BookingScreen({ onBack, initialService = "Haircut" }) {
  const [selectedService, setSelectedService] = useState(initialService);
  const service = useMemo(
    () => SERVICES.find((item) => item.name === selectedService) || SERVICES[0],
    [selectedService]
  );

  const continueToLiveBooking = () => {
    Linking.openURL(BOOKING_URL).catch(() => {});
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={BG} />
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable onPress={onBack} hitSlop={12} style={styles.backButton}>
            <Text style={styles.backIcon}>‹</Text>
          </Pressable>
          <Text style={styles.headerTitle}>BOOK APPOINTMENT</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.intro}>
          <Text style={styles.eyebrow}>STEP 1 OF 2</Text>
          <Text style={styles.title}>Choose Your Service.</Text>
          <Text style={styles.subtitle}>
            Pick what you need, then continue to live availability to choose your date and time.
          </Text>
        </View>

        <View style={styles.serviceList}>
          {SERVICES.map((item) => {
            const active = item.name === selectedService;
            return (
              <Pressable
                key={item.name}
                onPress={() => setSelectedService(item.name)}
                style={({ pressed }) => [
                  styles.serviceOption,
                  active && styles.serviceOptionActive,
                  pressed && styles.pressed,
                ]}
              >
                <View style={styles.radioOuter}>
                  {active ? <View style={styles.radioInner} /> : null}
                </View>
                <View style={styles.serviceCopy}>
                  <Text style={[styles.serviceName, active && styles.serviceNameActive]}>
                    {item.name}
                  </Text>
                  <Text style={styles.serviceDuration}>{item.duration}</Text>
                </View>
                <Text style={styles.servicePrice}>£{item.price}</Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryEyebrow}>YOUR SELECTION</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Service</Text>
            <Text style={styles.summaryValue}>{service.name}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Duration</Text>
            <Text style={styles.summaryValue}>{service.duration}</Text>
          </View>
          <View style={[styles.summaryRow, styles.summaryTotal]}>
            <Text style={styles.totalLabel}>Price</Text>
            <Text style={styles.totalPrice}>£{service.price}</Text>
          </View>
        </View>

        <Pressable
          onPress={continueToLiveBooking}
          style={({ pressed }) => [styles.continueButton, pressed && styles.continuePressed]}
        >
          <View>
            <Text style={styles.continueText}>CHOOSE DATE & TIME</Text>
            <Text style={styles.continueSubtext}>Continue securely with Barbr</Text>
          </View>
          <Text style={styles.continueArrow}>›</Text>
        </Pressable>

        <View style={styles.noteCard}>
          <Text style={styles.noteTitle}>LIVE AVAILABILITY</Text>
          <Text style={styles.noteText}>
            QuincyFadez appointments are synced through Barbr. The final step opens live slots so clients never choose a time that is already taken.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: BG },
  screen: { flex: 1, backgroundColor: BG },
  content: { paddingHorizontal: 18, paddingTop: 6, paddingBottom: 42 },
  header: {
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#151515",
  },
  backButton: { width: 44, height: 44, justifyContent: "center" },
  backIcon: { color: "#F5F5F5", fontSize: 34, lineHeight: 34 },
  headerTitle: { color: "#F4F4F4", fontSize: 13, letterSpacing: 1.8, fontWeight: "700" },
  headerSpacer: { width: 44 },
  intro: { paddingTop: 28, paddingBottom: 20 },
  eyebrow: { color: GOLD, fontSize: 9, letterSpacing: 2.1, fontWeight: "700" },
  title: { color: "#F5F5F5", fontSize: 29, lineHeight: 35, fontWeight: "600", marginTop: 8 },
  subtitle: { color: MUTED, fontSize: 13, lineHeight: 20, marginTop: 10, maxWidth: 350 },
  serviceList: { gap: 10 },
  serviceOption: {
    minHeight: 76,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: PANEL,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  serviceOptionActive: {
    borderColor: "#745A2D",
    backgroundColor: "#120F09",
  },
  pressed: { opacity: 0.78 },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: GOLD,
    alignItems: "center",
    justifyContent: "center",
  },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: GOLD_LIGHT },
  serviceCopy: { flex: 1, marginLeft: 13 },
  serviceName: { color: "#E8E8E8", fontSize: 15, fontWeight: "600" },
  serviceNameActive: { color: "#FFF5DF" },
  serviceDuration: { color: MUTED, fontSize: 9, marginTop: 5, letterSpacing: 0.5 },
  servicePrice: { color: GOLD_LIGHT, fontSize: 17, fontWeight: "700" },
  summaryCard: {
    marginTop: 22,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: "#090909",
    padding: 18,
  },
  summaryEyebrow: { color: GOLD, fontSize: 9, letterSpacing: 1.8, fontWeight: "700", marginBottom: 10 },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 9 },
  summaryLabel: { color: MUTED, fontSize: 11 },
  summaryValue: { color: "#E8E8E8", fontSize: 11, fontWeight: "600" },
  summaryTotal: { borderTopWidth: 1, borderTopColor: "#1C1C1C", marginTop: 5, paddingTop: 14 },
  totalLabel: { color: "#F2F2F2", fontSize: 13, fontWeight: "600" },
  totalPrice: { color: GOLD_LIGHT, fontSize: 18, fontWeight: "800" },
  continueButton: {
    marginTop: 14,
    minHeight: 64,
    borderRadius: 16,
    backgroundColor: GOLD,
    paddingHorizontal: 19,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  continuePressed: { opacity: 0.86, transform: [{ scale: 0.995 }] },
  continueText: { color: "#090909", fontSize: 12, letterSpacing: 1.1, fontWeight: "800" },
  continueSubtext: { color: "#3B2B12", fontSize: 9, marginTop: 4 },
  continueArrow: { color: "#090909", fontSize: 31, lineHeight: 31 },
  noteCard: {
    marginTop: 14,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#302717",
    backgroundColor: "#0B0906",
    padding: 15,
  },
  noteTitle: { color: GOLD_LIGHT, fontSize: 8, letterSpacing: 1.5, fontWeight: "700" },
  noteText: { color: "#A5A098", fontSize: 10, lineHeight: 17, marginTop: 7 },
});
