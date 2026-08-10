import React from "react";
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

const BG = "#050505";
const PANEL = "#0D0D0D";
const BORDER = "#242424";
const GOLD = "#C99B4A";
const GOLD_LIGHT = "#E7C77A";
const MUTED = "#9A9A9A";

const links = {
  booking: "https://www.barbr.me/quincyfadez",
  whatsapp: "https://wa.me/447490194682",
  instagram: "https://www.instagram.com/QuincyFadez",
  directions:
    "https://www.google.com/maps/dir/?api=1&destination=51.7402247,-1.2202434",
  website: "https://quincyfadez.com",
  reviews: "https://g.page/r/CbQwl91s8_vqEBM/review",
  phone: "tel:+447490194682",
};

const hours = [
  ["Monday", "17:45 – 22:00"],
  ["Tuesday", "17:45 – 22:00"],
  ["Wednesday", "17:45 – 22:00"],
  ["Thursday", "17:45 – 22:00"],
  ["Friday", "Closed"],
  ["Saturday", "09:00 – 12:00"],
  ["Sunday", "Closed"],
];

const open = (url) => Linking.openURL(url).catch(() => {});

function Header({ onBack }) {
  return (
    <View style={styles.header}>
      <Pressable onPress={onBack} hitSlop={12} style={styles.backButton}>
        <Text style={styles.backIcon}>‹</Text>
      </Pressable>
      <Text style={styles.headerTitle}>CONTACT</Text>
      <View style={styles.headerSpacer} />
    </View>
  );
}

function ActionRow({ icon, title, subtitle, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.actionRow, pressed && styles.pressed]}
    >
      <View style={styles.actionIconWrap}>
        <Text style={styles.actionIcon}>{icon}</Text>
      </View>
      <View style={styles.actionCopy}>
        <Text style={styles.actionTitle}>{title}</Text>
        <Text style={styles.actionSubtitle}>{subtitle}</Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

export default function ContactScreen({ onBack }) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={BG} />
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Header onBack={onBack} />

        <View style={styles.intro}>
          <Text style={styles.eyebrow}>GET IN TOUCH</Text>
          <Text style={styles.heading}>Easy To Book. Easy To Find.</Text>
          <Text style={styles.subtitle}>
            QuincyFadez is appointment-only. Book online, message directly or get directions to your appointment.
          </Text>
        </View>

        <Pressable
          onPress={() => open(links.booking)}
          style={({ pressed }) => [styles.goldButton, pressed && styles.goldPressed]}
        >
          <Text style={styles.goldButtonText}>BOOK APPOINTMENT</Text>
          <Text style={styles.goldArrow}>›</Text>
        </Pressable>

        <View style={styles.actionsCard}>
          <ActionRow
            icon="◉"
            title="WhatsApp"
            subtitle="Message QuincyFadez"
            onPress={() => open(links.whatsapp)}
          />
          <View style={styles.divider} />
          <ActionRow
            icon="◎"
            title="Instagram"
            subtitle="@QuincyFadez"
            onPress={() => open(links.instagram)}
          />
          <View style={styles.divider} />
          <ActionRow
            icon="⌖"
            title="Directions"
            subtitle="8 Gillians Way, Oxford OX4 2YD"
            onPress={() => open(links.directions)}
          />
          <View style={styles.divider} />
          <ActionRow
            icon="☎"
            title="Call"
            subtitle="07490 194682"
            onPress={() => open(links.phone)}
          />
          <View style={styles.divider} />
          <ActionRow
            icon="★"
            title="Leave A Review"
            subtitle="Share your experience on Google"
            onPress={() => open(links.reviews)}
          />
          <View style={styles.divider} />
          <ActionRow
            icon="↗"
            title="Website"
            subtitle="quincyfadez.com"
            onPress={() => open(links.website)}
          />
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.eyebrow}>OPENING HOURS</Text>
          <Text style={styles.sectionTitle}>Plan Your Appointment.</Text>
        </View>

        <View style={styles.hoursCard}>
          {hours.map(([day, time], index) => (
            <View key={day}>
              {index > 0 ? <View style={styles.divider} /> : null}
              <View style={styles.hoursRow}>
                <Text style={styles.day}>{day}</Text>
                <Text style={[styles.time, time === "Closed" && styles.closed]}>{time}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.noticeCard}>
          <Text style={styles.noticeTitle}>BOOKINGS ONLY · NO WALK-INS</Text>
          <Text style={styles.noticeText}>
            Appointments are confirmed through Barbr so availability stays accurate in real time.
          </Text>
        </View>

        <Text style={styles.footer}>QUINCYFADEZ · PREMIUM BARBER IN OXFORD</Text>
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
  headerTitle: { color: "#F4F4F4", fontSize: 13, letterSpacing: 2.1, fontWeight: "700" },
  headerSpacer: { width: 44 },
  intro: { paddingTop: 28, paddingBottom: 18 },
  eyebrow: { color: GOLD, fontSize: 9, letterSpacing: 2.2, fontWeight: "700" },
  heading: { color: "#F5F5F5", fontSize: 28, lineHeight: 34, fontWeight: "600", marginTop: 8 },
  subtitle: { color: MUTED, fontSize: 13, lineHeight: 20, marginTop: 10, maxWidth: 340 },
  goldButton: {
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
  goldPressed: { opacity: 0.86, transform: [{ scale: 0.995 }] },
  goldButtonText: { color: "#090909", fontSize: 13, fontWeight: "800", letterSpacing: 1.1 },
  goldArrow: { color: "#090909", fontSize: 31, lineHeight: 31 },
  actionsCard: {
    marginTop: 18,
    backgroundColor: PANEL,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 18,
    overflow: "hidden",
  },
  actionRow: {
    minHeight: 76,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  pressed: { opacity: 0.7 },
  actionIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#15120C",
    borderWidth: 1,
    borderColor: "#3B2F1D",
    alignItems: "center",
    justifyContent: "center",
  },
  actionIcon: { color: GOLD_LIGHT, fontSize: 18 },
  actionCopy: { flex: 1, marginLeft: 13 },
  actionTitle: { color: "#F1F1F1", fontSize: 14, fontWeight: "600" },
  actionSubtitle: { color: MUTED, fontSize: 10, marginTop: 4 },
  chevron: { color: GOLD_LIGHT, fontSize: 25, marginLeft: 10 },
  divider: { height: 1, backgroundColor: "#1B1B1B", marginHorizontal: 16 },
  sectionHeader: { marginTop: 30, marginBottom: 14 },
  sectionTitle: { color: "#F5F5F5", fontSize: 22, fontWeight: "600", marginTop: 6 },
  hoursCard: {
    backgroundColor: PANEL,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 18,
    paddingVertical: 3,
  },
  hoursRow: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 17,
  },
  day: { color: "#E8E8E8", fontSize: 12, fontWeight: "500" },
  time: { color: GOLD_LIGHT, fontSize: 11, fontWeight: "600" },
  closed: { color: "#777777" },
  noticeCard: {
    marginTop: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#332817",
    backgroundColor: "#0B0906",
    padding: 16,
  },
  noticeTitle: { color: GOLD_LIGHT, fontSize: 9, letterSpacing: 1.3, fontWeight: "700" },
  noticeText: { color: "#A5A098", fontSize: 11, lineHeight: 18, marginTop: 8 },
  footer: { color: "#665437", fontSize: 8, letterSpacing: 2.5, textAlign: "center", marginTop: 34 },
});