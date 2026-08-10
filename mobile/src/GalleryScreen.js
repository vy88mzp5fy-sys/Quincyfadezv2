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

const CDN = "https://vz-d1735d3f-314.b-cdn.net";
const WEBSITE_GALLERY = "https://quincyfadez.com/#work";
const BOOKING_URL = "https://www.barbr.me/quincyfadez";

const GALLERY = [
  { id: "01", image: "https://quincyfadez.com/media/gallery-replacement-01.jpg", label: "Clean Fade" },
  { id: "02", image: `${CDN}/8656d667-9c99-4d1b-b20b-bf8f1b2ec44c/thumbnail.jpg`, label: "Sharp Finish" },
  { id: "03", image: `${CDN}/ed50b0aa-31d1-4496-925f-35cf0b30f816/thumbnail.jpg`, label: "Fresh Detail" },
  { id: "04", image: "https://quincyfadez.com/media/work-04-replacement.jpg", label: "Precision Cut" },
  { id: "05", image: "https://quincyfadez.com/media/work-05-replacement.jpg", label: "Clean Lines" },
  { id: "06", image: `${CDN}/534917f9-0536-445d-a979-82f12cafcd75/thumbnail.jpg`, label: "Premium Finish" },
];

const open = (url) => Linking.openURL(url).catch(() => {});

export default function GalleryScreen({ onBack }) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={BG} />
      <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable onPress={onBack} hitSlop={12} style={styles.backButton}>
            <Text style={styles.backIcon}>‹</Text>
          </Pressable>
          <Text style={styles.headerTitle}>GALLERY</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.intro}>
          <View style={styles.eyebrowRow}>
            <Text style={styles.eyebrow}>RECENT WORK</Text>
            <Text style={styles.count}>06 LOOKS</Text>
          </View>
          <Text style={styles.title}>Cuts That Speak For Themselves.</Text>
          <Text style={styles.subtitle}>A closer look at recent QuincyFadez work — clean fades, sharp edges and detailed finishes.</Text>
        </View>

        <View style={styles.featureCard}>
          <Image source={{ uri: GALLERY[0].image }} style={styles.featureImage} resizeMode="cover" />
          <View style={styles.featureShade} />
          <View style={styles.featureBadge}><Text style={styles.featureBadgeText}>FEATURED CUT</Text></View>
          <View style={styles.featureCopy}>
            <Text style={styles.featureTitle}>{GALLERY[0].label}</Text>
            <Text style={styles.featureBrand}>QUINCYFADEZ · OXFORD</Text>
          </View>
        </View>

        <View style={styles.sectionRow}>
          <Text style={styles.sectionLabel}>MORE RECENT WORK</Text>
          <Text style={styles.sectionLine}>────</Text>
        </View>

        <View style={styles.grid}>
          {GALLERY.slice(1).map((item, index) => (
            <View key={item.id} style={[styles.card, index === 2 && styles.cardWide]}>
              <Image source={{ uri: item.image }} style={styles.image} resizeMode="cover" />
              <View style={styles.shade} />
              <View style={styles.cardTop}><Text style={styles.number}>{item.id}</Text></View>
              <View style={styles.cardBottom}>
                <Text style={styles.cardLabel}>{item.label}</Text>
                <Text style={styles.cardBrand}>QUINCYFADEZ</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.ctaCard}>
          <Text style={styles.ctaEyebrow}>LIKE WHAT YOU SEE?</Text>
          <Text style={styles.ctaTitle}>Make Your Next Cut Yours.</Text>
          <Text style={styles.ctaText}>Choose your service and check the latest appointment availability.</Text>
          <Pressable onPress={() => open(BOOKING_URL)} style={({ pressed }) => [styles.bookButton, pressed && styles.pressed]}>
            <Text style={styles.bookText}>BOOK YOUR NEXT CUT</Text>
            <View style={styles.arrowCircle}><Text style={styles.bookArrow}>›</Text></View>
          </Pressable>
        </View>

        <Pressable onPress={() => open(WEBSITE_GALLERY)} style={styles.websiteButton}>
          <Text style={styles.websiteText}>VIEW FULL WEBSITE GALLERY</Text>
        </Pressable>

        <Text style={styles.footer}>CLEAN DETAIL · SHARP FINISHES · OXFORD</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: BG },
  screen: { flex: 1, backgroundColor: BG },
  content: { paddingHorizontal: 16, paddingTop: 6, paddingBottom: 34 },
  header: { minHeight: 54, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderBottomWidth: 1, borderBottomColor: "#151515" },
  backButton: { width: 44, height: 44, justifyContent: "center" },
  backIcon: { color: "#F5F5F5", fontSize: 34, lineHeight: 34 },
  headerTitle: { color: "#F4F4F4", fontSize: 13, letterSpacing: 2.1, fontWeight: "700" },
  headerSpacer: { width: 44 },
  intro: { paddingTop: 24, paddingBottom: 18 },
  eyebrowRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  eyebrow: { color: GOLD, fontSize: 9, letterSpacing: 2.2, fontWeight: "700" },
  count: { color: "#666", fontSize: 7, letterSpacing: 1.3, fontWeight: "700" },
  title: { color: "#F5F5F5", fontSize: 30, lineHeight: 35, fontWeight: "650", marginTop: 9 },
  subtitle: { color: MUTED, fontSize: 12.5, lineHeight: 19, marginTop: 9, maxWidth: 350 },
  featureCard: { height: 330, overflow: "hidden", borderRadius: 22, borderWidth: 1, borderColor: "#302A20", backgroundColor: PANEL },
  featureImage: { ...StyleSheet.absoluteFillObject, width: "100%", height: "100%" },
  featureShade: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.24)" },
  featureBadge: { position: "absolute", top: 14, left: 14, borderRadius: 14, borderWidth: 1, borderColor: "rgba(231,199,122,0.42)", backgroundColor: "rgba(6,6,6,0.72)", paddingHorizontal: 10, paddingVertical: 6 },
  featureBadgeText: { color: GOLD_LIGHT, fontSize: 7, letterSpacing: 1.4, fontWeight: "800" },
  featureCopy: { position: "absolute", left: 16, right: 16, bottom: 16, borderRadius: 15, borderWidth: 1, borderColor: "rgba(255,255,255,0.09)", backgroundColor: "rgba(5,5,5,0.78)", paddingHorizontal: 14, paddingVertical: 12 },
  featureTitle: { color: "#F5F5F5", fontSize: 17, fontWeight: "650" },
  featureBrand: { color: GOLD, fontSize: 7, letterSpacing: 1.6, fontWeight: "700", marginTop: 5 },
  sectionRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 22, marginBottom: 12 },
  sectionLabel: { color: "#C6C6C6", fontSize: 8, letterSpacing: 1.7, fontWeight: "700" },
  sectionLine: { color: "#3A3020", fontSize: 9 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  card: { width: "48.5%", height: 216, overflow: "hidden", borderRadius: 18, borderWidth: 1, borderColor: BORDER, backgroundColor: PANEL },
  cardWide: { width: "100%", height: 235 },
  image: { ...StyleSheet.absoluteFillObject, width: "100%", height: "100%" },
  shade: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.17)" },
  cardTop: { position: "absolute", top: 10, left: 10 },
  number: { color: GOLD_LIGHT, fontSize: 7.5, letterSpacing: 1.2, backgroundColor: "rgba(5,5,5,0.70)", borderWidth: 1, borderColor: "rgba(201,155,74,0.32)", borderRadius: 12, paddingHorizontal: 8, paddingVertical: 5 },
  cardBottom: { position: "absolute", left: 10, right: 10, bottom: 10, backgroundColor: "rgba(5,5,5,0.76)", borderRadius: 12, borderWidth: 1, borderColor: "rgba(255,255,255,0.07)", paddingHorizontal: 10, paddingVertical: 9 },
  cardLabel: { color: "#F4F4F4", fontSize: 11, fontWeight: "600" },
  cardBrand: { color: GOLD, fontSize: 6.5, letterSpacing: 1.5, marginTop: 4 },
  ctaCard: { marginTop: 22, borderRadius: 20, borderWidth: 1, borderColor: "#312817", backgroundColor: "#0B0906", padding: 18 },
  ctaEyebrow: { color: GOLD, fontSize: 8, letterSpacing: 1.6, fontWeight: "800" },
  ctaTitle: { color: "#F2EEE7", fontSize: 20, lineHeight: 25, fontWeight: "650", marginTop: 7 },
  ctaText: { color: "#9D968B", fontSize: 11, lineHeight: 17, marginTop: 7 },
  bookButton: { marginTop: 15, minHeight: 58, borderRadius: 16, backgroundColor: GOLD, paddingHorizontal: 17, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  bookText: { color: "#090909", fontSize: 11.5, letterSpacing: 1.1, fontWeight: "800" },
  arrowCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: "rgba(0,0,0,0.12)", alignItems: "center", justifyContent: "center" },
  bookArrow: { color: "#090909", fontSize: 28, lineHeight: 28, marginTop: -2 },
  websiteButton: { marginTop: 10, minHeight: 48, borderRadius: 15, borderWidth: 1, borderColor: "#3A3020", alignItems: "center", justifyContent: "center" },
  websiteText: { color: GOLD_LIGHT, fontSize: 8.5, letterSpacing: 1.3, fontWeight: "700" },
  pressed: { opacity: 0.82 },
  footer: { color: "#665437", fontSize: 7.5, letterSpacing: 2.2, textAlign: "center", marginTop: 26 },
});
