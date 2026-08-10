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
            <Text style={styles.stepText}>STEP 1 OF 2</Text>
          </View>
          <Text style={styles.title}>Choose Your Service.</Text>
          <Text style={styles.subtitle}>Select your cut here, then continue to live availability to choose the date and time that suits you.</Text>
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

        <Pressable onPress={continueToLiveBooking} style={({ pressed }) => [styles.continueButton, pressed && styles.continuePressed]}>
          <View>
            <Text style={styles.continueText}>CHOOSE DATE & TIME</Text>
            <Text style={styles.continueSubtext}>Live availability via Barbr</Text>
          </View>
          <View style={styles.arrowCircle}><Text style={styles.continueArrow}>›</Text></View>
        </Pressable>

        <View style={styles.trustRow}>
          <View style={styles.trustItem}><Text style={styles.trustIcon}>✓</Text><Text style={styles.trustText}>LIVE SLOTS</Text></View>
          <View style={styles.trustDivider} />
          <View style={styles.trustItem}><Text style={styles.trustIcon}>✓</Text><Text style={styles.trustText}>SECURE BOOKING</Text></View>
          <View style={styles.trustDivider} />
          <View style={styles.trustItem}><Text style={styles.trustIcon}>✓</Text><Text style={styles.trustText}>NO WALK-INS</Text></View>
        </View>

        <View style={styles.noteCard}>
          <Text style={styles.noteTitle}>HOW IT WORKS</Text>
          <Text style={styles.noteText}>Your service choice is made in the QuincyFadez app. The final booking step opens Barbr so the date and time shown are always up to date.</Text>
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
  continueButton: { marginTop: 14, minHeight: 66, borderRadius: 18, backgroundColor: GOLD, paddingHorizontal: 19, flexDirection: "row", alignItems: "center", justifyContent: "space-between", shadowColor: GOLD, shadowOpacity: 0.16, shadowRadius: 14, shadowOffset: { width: 0, height: 6 }, elevation: 4 },
  continuePressed: { opacity: 0.86, transform: [{ scale: 0.995 }] },
  continueText: { color: "#090909", fontSize: 12, letterSpacing: 1.1, fontWeight: "800" },
  continueSubtext: { color: "#493514", fontSize: 9, marginTop: 4 },
  arrowCircle: { width: 34, height: 34, borderRadius: 17, backgroundColor: "rgba(0,0,0,0.12)", alignItems: "center", justifyContent: "center" },
  continueArrow: { color: "#090909", fontSize: 29, lineHeight: 29, marginTop: -2 },
  trustRow: { minHeight: 52, marginTop: 10, borderRadius: 15, borderWidth: 1, borderColor: "#1F1F1F", backgroundColor: "#090909", flexDirection: "row", alignItems: "center", justifyContent: "space-around", paddingHorizontal: 8 },
  trustItem: { flex: 1, alignItems: "center", justifyContent: "center" },
  trustIcon: { color: GOLD_LIGHT, fontSize: 9, fontWeight: "800" },
  trustText: { color: "#777", fontSize: 6.5, letterSpacing: 0.8, fontWeight: "700", marginTop: 3 },
  trustDivider: { width: 1, height: 22, backgroundColor: "#202020" },
  noteCard: { marginTop: 12, borderRadius: 16, borderWidth: 1, borderColor: "#302717", backgroundColor: "#0B0906", padding: 15 },
  noteTitle: { color: GOLD_LIGHT, fontSize: 8, letterSpacing: 1.5, fontWeight: "700" },
  noteText: { color: "#A5A098", fontSize: 10, lineHeight: 17, marginTop: 7 },
});
