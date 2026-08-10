import React from "react";
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

const quickActions = [
  { icon: "✂", label: "Services", url: "https://quincyfadez.com/#services" },
  { icon: "▣", label: "Gallery", url: links.gallery },
  { icon: "★", label: "Reviews", url: links.reviews },
  { icon: "◉", label: "WhatsApp", url: links.whatsapp },
  { icon: "⌖", label: "Directions", url: links.directions },
  { icon: "↗", label: "Website", url: links.website },
];

const open = (url) => Linking.openURL(url).catch(() => {});

function ActionCard({ icon, label, url }) {
  return (
    <Pressable
      onPress={() => open(url)}
      style={({ pressed }) => [styles.actionCard, pressed && styles.pressed]}
    >
      <Text style={styles.actionIcon}>{icon}</Text>
      <Text style={styles.actionLabel}>{label}</Text>
    </Pressable>
  );
}

export default function App() {
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
            <ActionCard key={item.label} {...item} />
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
          <Pressable onPress={() => open("https://quincyfadez.com/#services")}>
            <Text style={styles.viewAll}>VIEW ALL SERVICES  →</Text>
          </Pressable>
        </View>

        <Text style={styles.footer}>YOUR STYLE. YOUR TIME. YOUR APP.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: BG },
  screen: { flex: 1, backgroundColor: BG },
  content: { paddingHorizontal: 18, paddingTop: 10, paddingBottom: 42 },
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
    height: 58,
    borderRadius: 15,
    backgroundColor: GOLD,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    shadowColor: GOLD,
    shadowOpacity: 0.18,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  bookPressed: { opacity: 0.86, transform: [{ scale: 0.995 }] },
  bookButtonText: { color: "#090909", fontSize: 14, fontWeight: "800", letterSpacing: 1.2 },
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
});
