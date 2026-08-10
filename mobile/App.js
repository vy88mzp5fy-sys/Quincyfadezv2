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
import BookingScreen from "./src/BookingScreen";
import GalleryScreen from "./src/GalleryScreen";
import ReviewsScreen from "./src/ReviewsScreen";

const GOLD = "#C99B4A";
const GOLD_LIGHT = "#E7C77A";
const BG = "#050505";
const PANEL = "#0D0D0D";
const BORDER = "#242424";
const MUTED = "#9A9A9A";

const links = {
  booking: "https://www.barbr.me/quincyfadez",
  reviews: "https://g.page/r/CbQwl91s8_vqEBM/review",
  whatsapp: "https://wa.me/447490194682",
  directions: "https://www.google.com/maps/dir/?api=1&destination=51.7402247,-1.2202434",
  website: "https://quincyfadez.com",
};

const services = [
  {
    name: "Haircut",
    price: "£20",
    duration: "45 Minutes",
    description: "Any cut you want — skin fades, tapers and clean scissor work, finished sharp.",
  },
  {
    name: "Haircut & Beard",
    price: "£25",
    duration: "60 Minutes",
    description: "A full cut paired with a sharp, lined-up beard trim.",
  },
  {
    name: "Shape Up",
    price: "£10",
    duration: "15 Minutes",
    description: "A quick refresh with crisp lines and edges, without a full trim.",
  },
  {
    name: "Beard Trim",
    price: "£10",
    duration: "15 Minutes",
    description: "Beard groomed, shaped and lined for a clean finish.",
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

function ServicesScreen({ onBack, onBook }) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={BG} />
      <ScrollView style={styles.screen} contentContainerStyle={styles.pageContent} showsVerticalScrollIndicator={false}>
        <Header title="SERVICES" onBack={onBack} />

        <View style={styles.pageIntro}>
          <Text style={styles.sectionEyebrow}>CHOOSE YOUR SERVICE</Text>
          <Text style={styles.pageHeading}>Premium Cuts. Clean Detail.</Text>
          <Text style={styles.pageSubtitle}>
            Straightforward pricing with every appointment focused on a clean, confident finish.
          </Text>
        </View>

        <View style={styles.serviceList}>
          {services.map((service) => (
            <View key={service.name} style={styles.serviceCard}>
              <View style={styles.serviceTop}>
                <View style={styles.serviceCopy}>
                  <Text style={styles.serviceCardName}>{service.name}</Text>
                  <Text style={styles.serviceDuration}>{service.duration}</Text>
                </View>
                <Text style={styles.serviceCardPrice}>{service.price}</Text>
              </View>
              <Text style={styles.serviceDescription}>{service.description}</Text>
              <Pressable onPress={() => onBook(service.name)} style={({ pressed }) => [styles.inlineButton, pressed && styles.pressed]}>
                <Text style={styles.inlineButtonText}>BOOK THIS SERVICE</Text>
                <Text style={styles.inlineArrow}>›</Text>
              </Pressable>
            </View>
          ))}
        </View>

        <View style={styles.noticeCard}>
          <Text style={styles.noticeTitle}>BOOKINGS ONLY · NO WALK-INS</Text>
          <Text style={styles.noticeText}>Choose your service here, then continue to Barbr for live date and time availability.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function HomeScreen({ onServices, onBooking, onGallery, onReviews }) {
  const actions = [
    { icon: "✂", label: "Services", action: onServices },
    { icon: "▣", label: "Gallery", action: onGallery },
    { icon: "★", label: "Reviews", action: onReviews },
    { icon: "◉", label: "WhatsApp", action: () => open(links.whatsapp) },
    { icon: "⌖", label: "Directions", action: () => open(links.directions) },
    { icon: "↗", label: "Website", action: () => open(links.website) },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={BG} />
      <ScrollView style={styles.screen} contentContainerStyle={styles.homeContent} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <View>
            <Text style={styles.brand}>QUINCYFADEZ</Text>
            <Text style={styles.subBrand}>PREMIUM BARBER IN OXFORD</Text>
          </View>
          <View style={styles.logoCircle}>
            <Image source={{ uri: "https://quincyfadez.com/apple-touch-icon.png" }} style={styles.logo} />
          </View>
        </View>

        <View style={styles.heroCard}>
          <Image source={{ uri: "https://quincyfadez.com/media/gallery-replacement-01.jpg" }} style={styles.heroImage} />
          <View style={styles.heroShade} />
          <View style={styles.heroCopy}>
            <Text style={styles.heroTitle}>CLEAN CUTS.{"\n"}SHARP STYLES.</Text>
            <Text style={styles.heroGold}>PREMIUM EXPERIENCE.</Text>
            <Text style={styles.heroText}>Precision barbering with clean detail, sharp finishes and a relaxed one-to-one experience.</Text>
          </View>
        </View>

        <Pressable onPress={() => onBooking("Haircut")} style={({ pressed }) => [styles.goldButton, pressed && styles.goldPressed]}>
          <Text style={styles.goldButtonText}>BOOK APPOINTMENT</Text>
          <Text style={styles.goldArrow}>›</Text>
        </Pressable>

        <View style={styles.infoRow}>
          <View style={styles.infoPill}><Text style={styles.infoLabel}>BOOKINGS ONLY</Text><Text style={styles.infoValue}>No Walk-Ins</Text></View>
          <View style={styles.infoPill}><Text style={styles.infoLabel}>FROM</Text><Text style={styles.infoValue}>£10</Text></View>
          <View style={styles.infoPill}><Text style={styles.infoLabel}>LOCATION</Text><Text style={styles.infoValue}>Oxford</Text></View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionEyebrow}>QUICK ACCESS</Text>
          <Text style={styles.sectionTitle}>Everything You Need.</Text>
        </View>

        <View style={styles.actionsGrid}>
          {actions.map((item) => (
            <Pressable key={item.label} onPress={item.action} style={({ pressed }) => [styles.actionCard, pressed && styles.pressed]}>
              <Text style={styles.actionIcon}>{item.icon}</Text>
              <Text style={styles.actionLabel}>{item.label}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.servicePreview}>
          <Text style={styles.sectionEyebrow}>POPULAR SERVICES</Text>
          {services.slice(0, 2).map((service, index) => (
            <View key={service.name}>
              {index > 0 ? <View style={styles.divider} /> : null}
              <Pressable onPress={() => onBooking(service.name)} style={styles.previewRow}>
                <View>
                  <Text style={styles.previewName}>{service.name}</Text>
                  <Text style={styles.previewMeta}>{service.duration}</Text>
                </View>
                <Text style={styles.previewPrice}>{service.price}</Text>
              </Pressable>
            </View>
          ))}
          <Pressable onPress={onServices}><Text style={styles.viewAll}>VIEW ALL SERVICES  →</Text></Pressable>
        </View>

        <View style={styles.reviewCard}>
          <View>
            <Text style={styles.reviewLabel}>GOOGLE REVIEWS</Text>
            <Text style={styles.stars}>★★★★★</Text>
            <Text style={styles.reviewText}>See what clients are saying about QuincyFadez.</Text>
          </View>
          <Pressable onPress={onReviews} style={styles.reviewButton}><Text style={styles.reviewButtonText}>OPEN</Text></Pressable>
        </View>

        <Text style={styles.footer}>YOUR STYLE. YOUR TIME. YOUR APP.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

export default function App() {
  const [screen, setScreen] = useState("home");
  const [bookingService, setBookingService] = useState("Haircut");

  const openBooking = (service = "Haircut") => {
    setBookingService(service);
    setScreen("booking");
  };

  if (screen === "services") {
    return <ServicesScreen onBack={() => setScreen("home")} onBook={openBooking} />;
  }

  if (screen === "booking") {
    return <BookingScreen initialService={bookingService} onBack={() => setScreen("home")} />;
  }

  if (screen === "gallery") {
    return <GalleryScreen onBack={() => setScreen("home")} />;
  }

  if (screen === "reviews") {
    return <ReviewsScreen onBack={() => setScreen("home")} />;
  }

  return (
    <HomeScreen
      onServices={() => setScreen("services")}
      onBooking={openBooking}
      onGallery={() => setScreen("gallery")}
      onReviews={() => setScreen("reviews")}
    />
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: BG },
  screen: { flex: 1, backgroundColor: BG },
  homeContent: { paddingHorizontal: 18, paddingTop: 10, paddingBottom: 42 },
  pageContent: { paddingHorizontal: 18, paddingTop: 6, paddingBottom: 42 },
  topBar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 18 },
  brand: { color: "#F5F5F5", fontSize: 18, letterSpacing: 4, fontWeight: "600" },
  subBrand: { color: GOLD, fontSize: 8, letterSpacing: 2.4, marginTop: 5 },
  logoCircle: { width: 48, height: 48, borderRadius: 24, borderWidth: 1, borderColor: "#5E4824", overflow: "hidden", backgroundColor: "#0A0A0A" },
  logo: { width: "100%", height: "100%" },
  heroCard: { height: 360, borderRadius: 24, overflow: "hidden", borderWidth: 1, borderColor: BORDER, backgroundColor: PANEL },
  heroImage: { ...StyleSheet.absoluteFillObject, width: "100%", height: "100%" },
  heroShade: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.40)" },
  heroCopy: { position: "absolute", left: 20, right: 20, bottom: 24 },
  heroTitle: { color: "white", fontSize: 29, lineHeight: 31, fontWeight: "700", letterSpacing: 0.4 },
  heroGold: { color: GOLD_LIGHT, fontSize: 19, fontWeight: "600", marginTop: 5 },
  heroText: { color: "#E2E2E2", fontSize: 13, lineHeight: 20, marginTop: 12, maxWidth: 310 },
  goldButton: { marginTop: 14, minHeight: 58, borderRadius: 15, backgroundColor: GOLD, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 15, shadowColor: GOLD, shadowOpacity: 0.18, shadowRadius: 15, shadowOffset: { width: 0, height: 6 }, elevation: 4 },
  goldPressed: { opacity: 0.86, transform: [{ scale: 0.995 }] },
  goldButtonText: { color: "#090909", fontSize: 13, fontWeight: "800", letterSpacing: 1.1 },
  goldArrow: { color: "#090909", fontSize: 31, lineHeight: 31 },
  infoRow: { flexDirection: "row", gap: 8, marginTop: 10 },
  infoPill: { flex: 1, backgroundColor: PANEL, borderRadius: 13, borderWidth: 1, borderColor: BORDER, paddingHorizontal: 10, paddingVertical: 12 },
  infoLabel: { color: "#6F6F6F", fontSize: 7, letterSpacing: 1.1 },
  infoValue: { color: "#E9E9E9", fontSize: 11, fontWeight: "600", marginTop: 4 },
  sectionHeader: { marginTop: 30, marginBottom: 14 },
  sectionEyebrow: { color: GOLD, fontSize: 9, letterSpacing: 2.2, fontWeight: "700" },
  sectionTitle: { color: "#F5F5F5", fontSize: 24, fontWeight: "600", marginTop: 6 },
  actionsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  actionCard: { width: "31.4%", minHeight: 105, borderRadius: 16, borderWidth: 1, borderColor: BORDER, backgroundColor: PANEL, alignItems: "center", justifyContent: "center", paddingHorizontal: 8 },
  pressed: { opacity: 0.74 },
  actionIcon: { color: GOLD_LIGHT, fontSize: 24, marginBottom: 10 },
  actionLabel: { color: "#E4E4E4", fontSize: 9, letterSpacing: 0.7, textTransform: "uppercase" },
  servicePreview: { marginTop: 22, backgroundColor: PANEL, borderRadius: 18, borderWidth: 1, borderColor: BORDER, padding: 20 },
  previewRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingTop: 18 },
  previewName: { color: "#EFEFEF", fontSize: 16, fontWeight: "600" },
  previewMeta: { color: MUTED, fontSize: 10, marginTop: 4 },
  previewPrice: { color: GOLD_LIGHT, fontSize: 17, fontWeight: "700" },
  divider: { height: 1, backgroundColor: "#1D1D1D", marginTop: 17 },
  viewAll: { color: GOLD_LIGHT, fontSize: 9, letterSpacing: 1.4, marginTop: 20, fontWeight: "700" },
  reviewCard: { marginTop: 22, backgroundColor: "#0A0A0A", borderRadius: 18, borderWidth: 1, borderColor: BORDER, padding: 20, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  reviewLabel: { color: GOLD, fontSize: 8, letterSpacing: 1.5, fontWeight: "700" },
  stars: { color: GOLD_LIGHT, letterSpacing: 2, marginTop: 6 },
  reviewText: { color: MUTED, fontSize: 10, marginTop: 6, maxWidth: 230 },
  reviewButton: { borderWidth: 1, borderColor: "#6A522C", borderRadius: 20, paddingHorizontal: 15, paddingVertical: 10 },
  reviewButtonText: { color: GOLD_LIGHT, fontSize: 9, letterSpacing: 1.1, fontWeight: "700" },
  footer: { color: "#665437", fontSize: 8, letterSpacing: 2.5, textAlign: "center", marginTop: 34 },
  pageHeader: { minHeight: 54, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderBottomWidth: 1, borderBottomColor: "#151515" },
  backButton: { width: 44, height: 44, justifyContent: "center" },
  backIcon: { color: "#F5F5F5", fontSize: 34, lineHeight: 34 },
  pageTitle: { color: "#F4F4F4", fontSize: 13, letterSpacing: 2.1, fontWeight: "700" },
  headerSpacer: { width: 44 },
  pageIntro: { paddingTop: 28, paddingBottom: 18 },
  pageHeading: { color: "#F5F5F5", fontSize: 28, lineHeight: 34, fontWeight: "600", marginTop: 8 },
  pageSubtitle: { color: MUTED, fontSize: 13, lineHeight: 20, marginTop: 10, maxWidth: 340 },
  serviceList: { gap: 12 },
  serviceCard: { backgroundColor: PANEL, borderWidth: 1, borderColor: BORDER, borderRadius: 18, padding: 18 },
  serviceTop: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 12 },
  serviceCopy: { flex: 1 },
  serviceCardName: { color: "#F3F3F3", fontSize: 19, fontWeight: "600" },
  serviceDuration: { color: GOLD, fontSize: 9, letterSpacing: 1.2, marginTop: 6, textTransform: "uppercase" },
  serviceCardPrice: { color: GOLD_LIGHT, fontSize: 21, fontWeight: "700" },
  serviceDescription: { color: MUTED, fontSize: 12, lineHeight: 19, marginTop: 14 },
  inlineButton: { marginTop: 18, borderTopWidth: 1, borderTopColor: "#1C1C1C", paddingTop: 15, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  inlineButtonText: { color: GOLD_LIGHT, fontSize: 9, letterSpacing: 1.4, fontWeight: "700" },
  inlineArrow: { color: GOLD_LIGHT, fontSize: 24, lineHeight: 24 },
  noticeCard: { marginTop: 18, borderRadius: 16, borderWidth: 1, borderColor: "#332817", backgroundColor: "#0B0906", padding: 16 },
  noticeTitle: { color: GOLD_LIGHT, fontSize: 9, letterSpacing: 1.3, fontWeight: "700" },
  noticeText: { color: "#A5A098", fontSize: 11, lineHeight: 18, marginTop: 8 },
});