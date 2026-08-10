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

function BottomNav({ screen, onHome, onBook, onGallery, onReviews }) {
  const items = [
    { key: "home", icon: "⌂", label: "Home", action: onHome },
    { key: "booking", icon: "＋", label: "Book", action: onBook },
    { key: "gallery", icon: "▣", label: "Gallery", action: onGallery },
    { key: "reviews", icon: "★", label: "Reviews", action: onReviews },
  ];

  return (
    <View style={styles.bottomNavWrap}>
      <View style={styles.bottomNav}>
        {items.map((item) => {
          const active = screen === item.key;
          return (
            <Pressable
              key={item.key}
              onPress={item.action}
              style={({ pressed }) => [styles.navItem, pressed && styles.navPressed]}
            >
              <View style={[styles.navIconWrap, active && styles.navIconWrapActive]}>
                <Text style={[styles.navIcon, active && styles.navIconActive]}>{item.icon}</Text>
              </View>
              <Text style={[styles.navLabel, active && styles.navLabelActive]}>{item.label}</Text>
              {active ? <View style={styles.navIndicator} /> : null}
            </Pressable>
          );
        })}
      </View>
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
          <Text style={styles.pageSubtitle}>Straightforward pricing with every appointment focused on a clean, confident finish.</Text>
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
          <View style={styles.brandBlock}>
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
          <View style={styles.heroTopTag}><Text style={styles.heroTopTagText}>OXFORD · APPOINTMENT ONLY</Text></View>
          <View style={styles.heroCopy}>
            <Text style={styles.heroTitle}>CLEAN CUTS.{"\n"}SHARP STYLES.</Text>
            <Text style={styles.heroGold}>PREMIUM EXPERIENCE.</Text>
            <Text style={styles.heroText}>Precision barbering with clean detail, sharp finishes and a relaxed one-to-one experience.</Text>
          </View>
        </View>

        <Pressable onPress={() => onBooking("Haircut")} style={({ pressed }) => [styles.goldButton, pressed && styles.goldPressed]}>
          <View>
            <Text style={styles.goldButtonText}>BOOK APPOINTMENT</Text>
            <Text style={styles.goldButtonSubtext}>Choose your service and check availability</Text>
          </View>
          <Text style={styles.goldArrow}>›</Text>
        </Pressable>

        <View style={styles.infoRow}>
          <View style={styles.infoPill}><Text style={styles.infoLabel}>BOOKINGS ONLY</Text><Text style={styles.infoValue}>No Walk-Ins</Text></View>
          <View style={styles.infoPill}><Text style={styles.infoLabel}>PRICES FROM</Text><Text style={styles.infoValue}>£10</Text></View>
          <View style={styles.infoPill}><Text style={styles.infoLabel}>LOCATION</Text><Text style={styles.infoValue}>Oxford</Text></View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionEyebrow}>QUICK ACCESS</Text>
          <Text style={styles.sectionTitle}>Everything You Need.</Text>
        </View>

        <View style={styles.actionsGrid}>
          {actions.map((item) => (
            <Pressable key={item.label} onPress={item.action} style={({ pressed }) => [styles.actionCard, pressed && styles.pressed]}>
              <View style={styles.actionIconWrap}><Text style={styles.actionIcon}>{item.icon}</Text></View>
              <Text style={styles.actionLabel}>{item.label}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.servicePreview}>
          <View style={styles.cardHeadingRow}>
            <Text style={styles.sectionEyebrow}>POPULAR SERVICES</Text>
            <Pressable onPress={onServices}><Text style={styles.cardLink}>VIEW ALL</Text></Pressable>
          </View>
          {services.slice(0, 2).map((service, index) => (
            <View key={service.name}>
              {index > 0 ? <View style={styles.divider} /> : null}
              <Pressable onPress={() => onBooking(service.name)} style={styles.previewRow}>
                <View>
                  <Text style={styles.previewName}>{service.name}</Text>
                  <Text style={styles.previewMeta}>{service.duration}</Text>
                </View>
                <View style={styles.previewRight}>
                  <Text style={styles.previewPrice}>{service.price}</Text>
                  <Text style={styles.previewArrow}>›</Text>
                </View>
              </Pressable>
            </View>
          ))}
        </View>

        <Pressable onPress={onReviews} style={({ pressed }) => [styles.reviewCard, pressed && styles.pressed]}>
          <View style={styles.reviewCopy}>
            <Text style={styles.reviewLabel}>GOOGLE REVIEWS</Text>
            <Text style={styles.stars}>★★★★★</Text>
            <Text style={styles.reviewText}>See genuine client feedback in the app.</Text>
          </View>
          <View style={styles.reviewButton}><Text style={styles.reviewButtonText}>OPEN</Text></View>
        </Pressable>

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

  const renderScreen = () => {
    if (screen === "services") return <ServicesScreen onBack={() => setScreen("home")} onBook={openBooking} />;
    if (screen === "booking") return <BookingScreen initialService={bookingService} onBack={() => setScreen("home")} />;
    if (screen === "gallery") return <GalleryScreen onBack={() => setScreen("home")} />;
    if (screen === "reviews") return <ReviewsScreen onBack={() => setScreen("home")} />;

    return (
      <HomeScreen
        onServices={() => setScreen("services")}
        onBooking={openBooking}
        onGallery={() => setScreen("gallery")}
        onReviews={() => setScreen("reviews")}
      />
    );
  };

  return (
    <View style={styles.appShell}>
      <View style={styles.screenStage}>{renderScreen()}</View>
      {screen !== "services" ? (
        <BottomNav
          screen={screen}
          onHome={() => setScreen("home")}
          onBook={() => openBooking(bookingService)}
          onGallery={() => setScreen("gallery")}
          onReviews={() => setScreen("reviews")}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  appShell: { flex: 1, backgroundColor: BG },
  screenStage: { flex: 1 },
  safeArea: { flex: 1, backgroundColor: BG },
  screen: { flex: 1, backgroundColor: BG },
  homeContent: { paddingHorizontal: 18, paddingTop: 8, paddingBottom: 36 },
  pageContent: { paddingHorizontal: 18, paddingTop: 6, paddingBottom: 42 },
  topBar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  brandBlock: { paddingLeft: 1 },
  brand: { color: "#F7F7F7", fontSize: 18, letterSpacing: 3.7, fontWeight: "700" },
  subBrand: { color: "#B99150", fontSize: 7.5, letterSpacing: 2.1, marginTop: 5, fontWeight: "600" },
  logoCircle: { width: 48, height: 48, borderRadius: 24, borderWidth: 1, borderColor: "#57441F", overflow: "hidden", backgroundColor: "#0A0A0A" },
  logo: { width: "100%", height: "100%" },
  heroCard: { height: 350, borderRadius: 22, overflow: "hidden", borderWidth: 1, borderColor: "#2B261D", backgroundColor: PANEL },
  heroImage: { ...StyleSheet.absoluteFillObject, width: "100%", height: "100%" },
  heroShade: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.43)" },
  heroTopTag: { position: "absolute", top: 16, left: 16, borderRadius: 15, borderWidth: 1, borderColor: "rgba(231,199,122,0.30)", backgroundColor: "rgba(5,5,5,0.72)", paddingHorizontal: 11, paddingVertical: 7 },
  heroTopTagText: { color: "#E0C98D", fontSize: 7.5, letterSpacing: 1.35, fontWeight: "700" },
  heroCopy: { position: "absolute", left: 20, right: 20, bottom: 22 },
  heroTitle: { color: "#FFFFFF", fontSize: 28, lineHeight: 30, fontWeight: "800", letterSpacing: 0.2 },
  heroGold: { color: "#E4C16D", fontSize: 18, fontWeight: "700", marginTop: 5, letterSpacing: 0.2 },
  heroText: { color: "#D8D8D8", fontSize: 12.5, lineHeight: 19, marginTop: 11, maxWidth: 300 },
  goldButton: { marginTop: 13, minHeight: 64, borderRadius: 16, backgroundColor: GOLD, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 19, paddingVertical: 13, borderWidth: 1, borderColor: "#D8AE5E", shadowColor: GOLD, shadowOpacity: 0.12, shadowRadius: 12, shadowOffset: { width: 0, height: 5 }, elevation: 3 },
  goldPressed: { opacity: 0.88, transform: [{ scale: 0.995 }] },
  goldButtonText: { color: "#090909", fontSize: 12.5, fontWeight: "900", letterSpacing: 1.05 },
  goldButtonSubtext: { color: "#3A2A12", fontSize: 9, marginTop: 4, fontWeight: "600" },
  goldArrow: { color: "#090909", fontSize: 30, lineHeight: 30 },
  infoRow: { flexDirection: "row", gap: 8, marginTop: 9 },
  infoPill: { flex: 1, backgroundColor: "#0A0A0A", borderRadius: 13, borderWidth: 1, borderColor: "#202020", paddingHorizontal: 10, paddingVertical: 11 },
  infoLabel: { color: "#777", fontSize: 6.7, letterSpacing: 0.9, fontWeight: "600" },
  infoValue: { color: "#ECECEC", fontSize: 10.8, fontWeight: "700", marginTop: 4 },
  sectionHeader: { marginTop: 27, marginBottom: 13 },
  sectionEyebrow: { color: "#B99150", fontSize: 8.5, letterSpacing: 2, fontWeight: "800" },
  sectionTitle: { color: "#F5F5F5", fontSize: 23, fontWeight: "700", marginTop: 6, letterSpacing: -0.2 },
  actionsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 9 },
  actionCard: { width: "31.5%", minHeight: 100, borderRadius: 15, borderWidth: 1, borderColor: "#202020", backgroundColor: "#0B0B0B", alignItems: "center", justifyContent: "center", paddingHorizontal: 7 },
  actionIconWrap: { width: 35, height: 35, borderRadius: 18, borderWidth: 1, borderColor: "#342A19", backgroundColor: "#121008", alignItems: "center", justifyContent: "center", marginBottom: 9 },
  pressed: { opacity: 0.74 },
  actionIcon: { color: "#E3C16F", fontSize: 18 },
  actionLabel: { color: "#E2E2E2", fontSize: 8.5, letterSpacing: 0.65, textTransform: "uppercase", fontWeight: "600" },
  servicePreview: { marginTop: 20, backgroundColor: "#0B0B0B", borderRadius: 18, borderWidth: 1, borderColor: "#232323", padding: 18 },
  cardHeadingRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  cardLink: { color: "#D8B563", fontSize: 8, letterSpacing: 1.1, fontWeight: "800" },
  previewRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingTop: 17, paddingBottom: 1 },
  previewName: { color: "#F0F0F0", fontSize: 15.5, fontWeight: "700" },
  previewMeta: { color: MUTED, fontSize: 9.5, marginTop: 4 },
  previewRight: { flexDirection: "row", alignItems: "center", gap: 9 },
  previewPrice: { color: GOLD_LIGHT, fontSize: 16.5, fontWeight: "800" },
  previewArrow: { color: "#74603B", fontSize: 22, lineHeight: 22 },
  divider: { height: 1, backgroundColor: "#1C1C1C", marginTop: 16 },
  reviewCard: { marginTop: 20, backgroundColor: "#0A0907", borderRadius: 18, borderWidth: 1, borderColor: "#302717", padding: 18, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  reviewCopy: { flex: 1, paddingRight: 12 },
  reviewLabel: { color: "#BA9450", fontSize: 8, letterSpacing: 1.45, fontWeight: "800" },
  stars: { color: GOLD_LIGHT, letterSpacing: 1.7, marginTop: 6 },
  reviewText: { color: "#989898", fontSize: 9.8, marginTop: 6, lineHeight: 15 },
  reviewButton: { borderWidth: 1, borderColor: "#66502A", backgroundColor: "#141008", borderRadius: 18, paddingHorizontal: 14, paddingVertical: 9 },
  reviewButtonText: { color: GOLD_LIGHT, fontSize: 8.5, letterSpacing: 1, fontWeight: "800" },
  footer: { color: "#5C4C31", fontSize: 7.5, letterSpacing: 2.3, textAlign: "center", marginTop: 30 },
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
  bottomNavWrap: { backgroundColor: BG, borderTopWidth: 1, borderTopColor: "#171717", paddingHorizontal: 12, paddingTop: 7, paddingBottom: 7 },
  bottomNav: { minHeight: 62, flexDirection: "row", alignItems: "center", justifyContent: "space-around", borderRadius: 20, backgroundColor: "#0A0A0A", borderWidth: 1, borderColor: "#202020", paddingHorizontal: 5 },
  navItem: { flex: 1, minHeight: 54, alignItems: "center", justifyContent: "center", position: "relative" },
  navPressed: { opacity: 0.72 },
  navIconWrap: { width: 28, height: 25, alignItems: "center", justifyContent: "center", borderRadius: 10 },
  navIconWrapActive: { backgroundColor: "#181207", borderWidth: 1, borderColor: "#4D3B1E" },
  navIcon: { color: "#777", fontSize: 17, lineHeight: 19 },
  navIconActive: { color: GOLD_LIGHT },
  navLabel: { color: "#777", fontSize: 8, letterSpacing: 0.7, marginTop: 2, fontWeight: "600" },
  navLabelActive: { color: "#EFE5D3" },
  navIndicator: { position: "absolute", bottom: 1, width: 18, height: 2, borderRadius: 2, backgroundColor: GOLD },
});