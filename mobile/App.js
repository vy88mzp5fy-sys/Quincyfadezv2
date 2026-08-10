import React, { useState } from "react";
import {
  Image,
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

const links = {
  booking: "https://www.barbr.me/quincyfadez",
  gallery: "https://quincyfadez.com/#work",
  reviews: "https://g.page/r/CbQwl91s8_vqEBM/review",
  whatsapp: "https://wa.me/447490194682",
  directions:
    "https://www.google.com/maps/dir/?api=1&destination=51.7402247,-1.2202434",
  website: "https://quincyfadez.com",
};

const services = [
  {
    name: "Haircut",
    price: "£20",
    duration: "45 Minutes",
    description: "A tailored haircut finished with clean detail and sharp edges.",
  },
  {
    name: "Haircut & Beard",
    price: "£25",
    duration: "60 Minutes",
    description: "Full haircut plus beard shaping for a complete polished finish.",
  },
  {
    name: "Shape Up",
    price: "£10",
    duration: "15 Minutes",
    description: "Freshen up your hairline and edges between full appointments.",
  },
  {
    name: "Beard Trim",
    price: "£10",
    duration: "15 Minutes",
    description: "Clean beard shaping, tidy lines and a sharper overall finish.",
  },
];

const open = (url) => Linking.openURL(url).catch(() => {});

function Header({ title, onBack }) {
  return (
    <View style={styles.pageHeader}>
      <Pressable onPress={onBack} hitSlop={12} style={styles.backButton}>
        <Text style={styles.backIcon}>‹</Text>
      </Pressable>
      <Text style={styles.pageTitle}>{title}</Text>
      <View style={styles.headerSpacer} />
    </View>
  );
}

function ServicesScreen({ onBack }) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={BG} />
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.servicesContent}
        showsVerticalScrollIndicator={false}
      >
        <Header title="SERVICES" onBack={onBack} />

        <View style={styles.servicesIntro}>
          <Text style={styles.sectionEyebrow}>CHOOSE YOUR SERVICE</Text>
          <Text style={styles.servicesTitle}>Premium Cuts. Clean Detail.</Text>
          <Text style={styles.servicesSubtitle}>
            Straightforward pricing with every appointment focused on a clean, confident finish.
          </Text>
        </View>

        <View style={styles.serviceList}>
          {services.map((service) => (
            <View key={service.name} style={styles.serviceCard}>
              <View style={styles.serviceCardTop}>
                <View style={styles.serviceCardCopy}>
                  <Text style={styles.serviceCardName}>{service.name}</Text>
                  <Text style={styles.serviceCardDuration}>{service.duration}</Text>
                </View>
                <Text style={styles.serviceCardPrice}>{service.price}</Text>
              </View>

              <Text style={styles.serviceDescription}>{service.description}</Text>

              <Pressable
                onPress={() => open(links.booking)}
                style={({ pressed }) => [styles.serviceBookButton, pressed && styles.pressed]}
              >
                <Text style={styles.serviceBookText}>BOOK THIS SERVICE</Text>
                <Text style={styles.serviceBookArrow}>›</Text>
              </Pressable>
            </View>
          ))}
        </View>

        <View style={styles.servicesNotice}>
          <Text style={styles.servicesNoticeTitle}>BOOKINGS ONLY · NO WALK-INS</Text>
          <Text style={styles.servicesNoticeText}>
            Appointments are currently completed through Barbr so availability stays accurate in real time.
          </Text>
        </View>

        <Pressable
          onPress={() => open(links.booking)}
          style={({ pressed }) => [styles.bookButton, pressed && styles.bookPressed]}
        >
          <Text style={styles.bookButtonText}>VIEW AVAILABLE APPOINTMENTS</Text>
          <Text style={styles.bookArrow}>›</Text>
        </Pressable>

        <Text style={styles.footer}>QUINCYFADEZ · PREMIUM BARBER IN OXFORD</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function HomeScreen({ onServices }) {
  const quickActions = [
    { icon: "✂", label: "Services", action: onServices },
    { icon: "▣", label: "Gallery", action: () => open(links.gallery) },
    { icon: "★", label: "Reviews", action: () => open(links.reviews) },
    { icon: "◉", label: "WhatsApp", action: () => open(links.whatsapp) },
    { icon: "⌖", label: "Directions", action: () => open(links.directions) },
    { icon: "↗", label: "Website", action: () => open(links.website) },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={BG} />
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topBar}>
          <View>
            <Text style={styles.eyebrow}>QUINCYFADEZ</Text>
            <Text style={styles.subBrand}>PREMIUM BARBER IN OXFORD</Text>
          </View>
          <View style={styles.logoCircle}>
            <Image
              source={{ uri: "https://quincyfadez.com/apple-touch-icon.png" }}
              style={styles.logo}
            />
          </View>
        </View>

        <View style={styles.heroCard}>
          <Image
            source={{ uri: "https://quincyfadez.com/media/gallery-replacement-01.jpg" }}
            style={styles.heroImage}
          />
          <View style={styles.heroShade} />
          <View style={styles.heroCopy}>
            <Text style={styles.heroTitle}>CLEAN CUTS.{"\n"}SHARP STYLES.</Text>
            <Text style={styles.heroGold}>PREMIUM EXPERIENCE.</Text>
            <Text style={styles.heroText}>
              Precision barbering with clean detail, sharp finishes and a relaxed one-to-one experience.
            </Text>
          </View>
        </View>

        <Pressable
          onPress={() => open(links.booking)}
          style={({ pressed }) => [styles.bookButton, pressed && styles.bookPressed]}
        >
          <Text style={styles.bookButtonText}>BOOK APPOINTMENT</Text>
          <Text style={styles.bookArrow}>›</Text>
        </Pressable>

        <View style={styles.infoRow}>
          <View style={styles.infoPill}>
            <Text style={styles.infoLabel}>BOOKINGS ONLY</Text>
            <Text style={styles.infoValue}>No Walk-Ins</Text>
          </View>
          <View style={styles.infoPill}>
            <Text style={styles.infoLabel}>FROM</Text>
            <Text style={styles.infoValue}>£10</Text>
          </View>
          <View style={styles.infoPill}>
            <Text style={styles.infoLabel}>LOCATION</Text>
            <Text style={styles.infoValue}>Oxford</Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionEyebrow}>QUICK ACCESS</Text>
          <Text style={styles.sectionTitle}>Everything You Need.</Text>
        </View>

        <View style={styles.actionsGrid}>
          {quickActions.map((item) => (
            <Pressable
              key={item.label}
              onPress={item.action}
              style={({ pressed }) => [styles.actionCard, pressed && styles.pressed]}
            >
              <Text style={styles.actionIcon}>{item.icon}</Text>
              <Text style={styles.actionLabel}>{item.label}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.reviewCard}>
          <View>
            <Text style={styles.reviewScore}>5.0</Text>
            <Text style={styles.stars}>★★★★★</Text>
            <Text style={styles.reviewCaption}>Google Reviews</Text>
          </View>
          <Pressable onPress={() => open(links.reviews)} style={styles.reviewButton}>
            <Text style={styles.reviewButtonText}>READ REVIEWS</Text>
          </Pressable>
        </View>

        <View style={styles.servicePreview}>
          <Text style={styles.sectionEyebrow}>POPULAR SERVICES</Text>
          <View style={styles.serviceLine}>
            <View>
              <Text style={styles.serviceName}>Haircut</Text>
              <Text style={styles.serviceMeta}>45 Minutes</Text>
            </View>
            <Text style={styles.servicePrice}>£20</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.serviceLine}>
            <View>
              <Text style={styles.serviceName}>Haircut & Beard</Text>
              <Text style={styles.serviceMeta}>60 Minutes</Text>
            </View>
            <Text style={styles.servicePrice}>£25</Text>
          </View>
          <Pressable onPress={onServices}>
            <Text style={styles.viewAll}>VIEW ALL SERVICES  →</Text>
          </Pressable>
        </View>

        <Text style={styles.footer}>YOUR STYLE. YOUR TIME. YOUR APP.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

export default function App() {
  const [screen, setScreen] = useState("home");

  if (screen === "services") {
    return <ServicesScreen onBack={() => setScreen("home")} />;
  }

  return <HomeScreen onServices={() => setScreen("services")} />;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: BG },
  screen: { flex: 1, backgroundColor: BG },
  content: { paddingHorizontal: 18, paddingTop: 10, paddingBottom: 42 },
  servicesContent: { paddingHorizontal: 18, paddingTop: 6, paddingBottom: 42 },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  eyebrow: { color: "#F5F5F5", fontSize: 18, letterSpacing: 4, fontWeight: "600" },
  subBrand: { color: GOLD, fontSize: 8, letterSpacing: 2.4, marginTop: 5 },
  logoCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#5E4824",
    overflow: "hidden",
    backgroundColor: "#0A0A0A",
  },
  logo: { width: "100%", height: "100%" },
  heroCard: {
    height: 360,
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: PANEL,
  },
  heroImage: { ...StyleSheet.absoluteFillObject, width: "100%", height: "100%" },
  heroShade: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.40)" },
  heroCopy: { position: "absolute", left: 20, right: 20, bottom: 24 },
  heroTitle: { color: "white", fontSize: 29, lineHeight: 31, fontWeight: "700", letterSpacing: 0.4 },
  heroGold: { color: GOLD_LIGHT, fontSize: 19, fontWeight: "600", marginTop: 5, letterSpacing: 0.4 },
  heroText: { color: "#E2E2E2", fontSize: 13, lineHeight: 20, marginTop: 12, maxWidth: 310 },
  bookButton: {
    marginTop: 14,
    minHeight: 58,
    borderRadius: 15,
    backgroundColor: GOLD,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    shadowColor: GOLD,
    shadowOpacity: 0.18,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  bookPressed: { opacity: 0.86, transform: [{ scale: 0.995 }] },
  bookButtonText: { color: "#090909", fontSize: 13, fontWeight: "800", letterSpacing: 1.1, flexShrink: 1 },
  bookArrow: { color: "#090909", fontSize: 31, lineHeight: 31 },
  infoRow: { flexDirection: "row", gap: 8, marginTop: 10 },
  infoPill: {
    flex: 1,
    backgroundColor: PANEL,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: 10,
    paddingVertical: 12,
  },
  infoLabel: { color: "#6F6F6F", fontSize: 7, letterSpacing: 1.1 },
  infoValue: { color: "#E9E9E9", fontSize: 11, fontWeight: "600", marginTop: 4 },
  sectionHeader: { marginTop: 30, marginBottom: 14 },
  sectionEyebrow: { color: GOLD, fontSize: 9, letterSpacing: 2.2, fontWeight: "700" },
  sectionTitle: { color: "#F5F5F5", fontSize: 24, fontWeight: "600", marginTop: 6 },
  actionsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  actionCard: {
    width: "31.4%",
    minHeight: 105,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: PANEL,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  pressed: { opacity: 0.72 },
  actionIcon: { color: GOLD_LIGHT, fontSize: 24, marginBottom: 10 },
  actionLabel: { color: "#E4E4E4", fontSize: 9, letterSpacing: 0.7, textTransform: "uppercase" },
  reviewCard: {
    marginTop: 22,
    backgroundColor: "#0A0A0A",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  reviewScore: { color: "white", fontSize: 34, fontWeight: "600" },
  stars: { color: GOLD_LIGHT, letterSpacing: 2, marginTop: 2 },
  reviewCaption: { color: MUTED, fontSize: 10, marginTop: 5 },
  reviewButton: { borderWidth: 1, borderColor: "#6A522C", borderRadius: 20, paddingHorizontal: 15, paddingVertical: 10 },
  reviewButtonText: { color: GOLD_LIGHT, fontSize: 9, letterSpacing: 1.1, fontWeight: "700" },
  servicePreview: {
    marginTop: 22,
    backgroundColor: PANEL,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 20,
  },
  serviceLine: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 18 },
  serviceName: { color: "#EFEFEF", fontSize: 16, fontWeight: "600" },
  serviceMeta: { color: MUTED, fontSize: 10, marginTop: 4 },
  servicePrice: { color: GOLD_LIGHT, fontSize: 17, fontWeight: "700" },
  divider: { height: 1, backgroundColor: "#1D1D1D", marginTop: 17 },
  viewAll: { color: GOLD_LIGHT, fontSize: 9, letterSpacing: 1.4, marginTop: 20, fontWeight: "700" },
  footer: { color: "#665437", fontSize: 8, letterSpacing: 2.5, textAlign: "center", marginTop: 34 },
  pageHeader: {
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#151515",
  },
  backButton: { width: 44, height: 44, alignItems: "flex-start", justifyContent: "center" },
  backIcon: { color: "#F5F5F5", fontSize: 34, lineHeight: 34 },
  pageTitle: { color: "#F4F4F4", fontSize: 13, letterSpacing: 2.1, fontWeight: "700" },
  headerSpacer: { width: 44 },
  servicesIntro: { paddingTop: 28, paddingBottom: 18 },
  servicesTitle: { color: "#F5F5F5", fontSize: 28, lineHeight: 34, fontWeight: "600", marginTop: 8 },
  servicesSubtitle: { color: MUTED, fontSize: 13, lineHeight: 20, marginTop: 10, maxWidth: 340 },
  serviceList: { gap: 12 },
  serviceCard: {
    backgroundColor: PANEL,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 18,
    padding: 18,
  },
  serviceCardTop: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 12 },
  serviceCardCopy: { flex: 1 },
  serviceCardName: { color: "#F3F3F3", fontSize: 19, fontWeight: "600" },
  serviceCardDuration: { color: GOLD, fontSize: 9, letterSpacing: 1.2, marginTop: 6, textTransform: "uppercase" },
  serviceCardPrice: { color: GOLD_LIGHT, fontSize: 21, fontWeight: "700" },
  serviceDescription: { color: MUTED, fontSize: 12, lineHeight: 19, marginTop: 14 },
  serviceBookButton: {
    marginTop: 18,
    borderTopWidth: 1,
    borderTopColor: "#1C1C1C",
    paddingTop: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  serviceBookText: { color: GOLD_LIGHT, fontSize: 9, letterSpacing: 1.4, fontWeight: "700" },
  serviceBookArrow: { color: GOLD_LIGHT, fontSize: 24, lineHeight: 24 },
  servicesNotice: {
    marginTop: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#332817",
    backgroundColor: "#0B0906",
    padding: 16,
  },
  servicesNoticeTitle: { color: GOLD_LIGHT, fontSize: 9, letterSpacing: 1.3, fontWeight: "700" },
  servicesNoticeText: { color: "#A5A098", fontSize: 11, lineHeight: 18, marginTop: 8 },
});
