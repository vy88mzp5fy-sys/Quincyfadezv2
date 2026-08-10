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
  {
    id: "01",
    image: "https://quincyfadez.com/media/gallery-replacement-01.jpg",
    label: "Clean Fade",
  },
  {
    id: "02",
    image: `${CDN}/8656d667-9c99-4d1b-b20b-bf8f1b2ec44c/thumbnail.jpg`,
    label: "Sharp Finish",
  },
  {
    id: "03",
    image: `${CDN}/ed50b0aa-31d1-4496-925f-35cf0b30f816/thumbnail.jpg`,
    label: "Fresh Detail",
  },
  {
    id: "04",
    image: "https://quincyfadez.com/media/work-04-replacement.jpg",
    label: "Precision Cut",
  },
  {
    id: "05",
    image: "https://quincyfadez.com/media/work-05-replacement.jpg",
    label: "Clean Lines",
  },
  {
    id: "06",
    image: `${CDN}/534917f9-0536-445d-a979-82f12cafcd75/thumbnail.jpg`,
    label: "Premium Finish",
  },
];

const open = (url) => Linking.openURL(url).catch(() => {});

export default function GalleryScreen({ onBack }) {
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
          <Text style={styles.headerTitle}>GALLERY</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.intro}>
          <Text style={styles.eyebrow}>RECENT WORK</Text>
          <Text style={styles.title}>Cuts That Speak For Themselves.</Text>
          <Text style={styles.subtitle}>
            A selection of recent QuincyFadez work — clean fades, sharp edges and detailed finishes.
          </Text>
        </View>

        <View style={styles.grid}>
          {GALLERY.map((item, index) => (
            <View key={item.id} style={[styles.card, index % 3 === 0 && styles.cardTall]}>
              <Image source={{ uri: item.image }} style={styles.image} resizeMode="cover" />
              <View style={styles.shade} />
              <View style={styles.cardTop}>
                <Text style={styles.number}>{item.id}</Text>
              </View>
              <View style={styles.cardBottom}>
                <Text style={styles.cardLabel}>{item.label}</Text>
                <Text style={styles.cardBrand}>QUINCYFADEZ</Text>
              </View>
            </View>
          ))}
        </View>

        <Pressable
          onPress={() => open(BOOKING_URL)}
          style={({ pressed }) => [styles.bookButton, pressed && styles.pressed]}
        >
          <Text style={styles.bookText}>BOOK YOUR NEXT CUT</Text>
          <Text style={styles.bookArrow}>›</Text>
        </Pressable>

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
  content: { paddingHorizontal: 16, paddingTop: 6, paddingBottom: 42 },
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
  headerTitle: { color: "#F4F4F4", fontSize: 13, letterSpacing: 2.1, fontWeight: "700" },
  headerSpacer: { width: 44 },
  intro: { paddingTop: 28, paddingBottom: 20 },
  eyebrow: { color: GOLD, fontSize: 9, letterSpacing: 2.2, fontWeight: "700" },
  title: { color: "#F5F5F5", fontSize: 29, lineHeight: 35, fontWeight: "600", marginTop: 8 },
  subtitle: { color: MUTED, fontSize: 13, lineHeight: 20, marginTop: 10, maxWidth: 350 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  card: {
    width: "48.5%",
    height: 218,
    overflow: "hidden",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: PANEL,
  },
  cardTall: { height: 250 },
  image: { ...StyleSheet.absoluteFillObject, width: "100%", height: "100%" },
  shade: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.20)" },
  cardTop: { position: "absolute", top: 11, left: 11 },
  number: {
    color: GOLD_LIGHT,
    fontSize: 8,
    letterSpacing: 1.2,
    backgroundColor: "rgba(5,5,5,0.72)",
    borderWidth: 1,
    borderColor: "rgba(201,155,74,0.35)",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  cardBottom: {
    position: "absolute",
    left: 11,
    right: 11,
    bottom: 11,
    backgroundColor: "rgba(5,5,5,0.76)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    paddingHorizontal: 10,
    paddingVertical: 9,
  },
  cardLabel: { color: "#F4F4F4", fontSize: 11, fontWeight: "600" },
  cardBrand: { color: GOLD, fontSize: 6.5, letterSpacing: 1.5, marginTop: 4 },
  bookButton: {
    marginTop: 22,
    minHeight: 60,
    borderRadius: 16,
    backgroundColor: GOLD,
    paddingHorizontal: 19,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  bookText: { color: "#090909", fontSize: 12, letterSpacing: 1.1, fontWeight: "800" },
  bookArrow: { color: "#090909", fontSize: 31, lineHeight: 31 },
  websiteButton: {
    marginTop: 10,
    minHeight: 50,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#3A3020",
    alignItems: "center",
    justifyContent: "center",
  },
  websiteText: { color: GOLD_LIGHT, fontSize: 9, letterSpacing: 1.3, fontWeight: "700" },
  pressed: { opacity: 0.82 },
  footer: { color: "#665437", fontSize: 7.5, letterSpacing: 2.2, textAlign: "center", marginTop: 30 },
});