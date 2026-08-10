import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
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
const REVIEWS_API = "https://quincyfadez.com/api/google-reviews";
const LEAVE_REVIEW_URL = "https://g.page/r/CbQwl91s8_vqEBM/review";

const open = (url) => url && Linking.openURL(url).catch(() => {});
const stars = (rating = 0) => "★".repeat(Math.round(rating)).padEnd(5, "☆");

export default function ReviewsScreen({ onBack }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadReviews = async () => {
    setLoading(true);
    setError(false);
    try {
      const response = await fetch(REVIEWS_API, { cache: "no-store" });
      if (!response.ok) throw new Error("Reviews unavailable");
      setData(await response.json());
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={BG} />
      <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable onPress={onBack} hitSlop={12} style={styles.backButton}>
            <Text style={styles.backIcon}>‹</Text>
          </Pressable>
          <Text style={styles.headerTitle}>REVIEWS</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.intro}>
          <Text style={styles.eyebrow}>CLIENT FEEDBACK</Text>
          <Text style={styles.title}>Real Reviews. Real Clients.</Text>
          <Text style={styles.subtitle}>
            Live feedback from QuincyFadez clients, supplied directly by Google Maps.
          </Text>
        </View>

        {loading ? (
          <View style={styles.stateCard}>
            <ActivityIndicator color={GOLD_LIGHT} />
            <Text style={styles.stateText}>Loading Google reviews…</Text>
          </View>
        ) : error ? (
          <View style={styles.stateCard}>
            <Text style={styles.stateTitle}>Reviews will appear here shortly.</Text>
            <Text style={styles.stateText}>
              The live Google connection still needs its secure server key connected.
            </Text>
            <Pressable onPress={loadReviews} style={styles.secondaryButton}>
              <Text style={styles.secondaryText}>TRY AGAIN</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <View style={styles.ratingCard}>
              <View>
                <Text style={styles.rating}>{data?.rating?.toFixed?.(1) || data?.rating || "—"}</Text>
                <Text style={styles.ratingStars}>{stars(data?.rating)}</Text>
                <Text style={styles.reviewCount}>{data?.reviewCount || 0} Google reviews</Text>
              </View>
              <View style={styles.googleBadge}>
                <Text style={styles.googleBadgeText}>Google Maps</Text>
              </View>
            </View>

            <Text style={styles.orderingNotice}>{data?.orderingNotice}</Text>

            <View style={styles.reviewList}>
              {(data?.reviews || []).map((review) => (
                <View key={review.id} style={styles.reviewCard}>
                  <View style={styles.authorRow}>
                    {review.author?.photoUrl ? (
                      <Image source={{ uri: review.author.photoUrl }} style={styles.avatar} />
                    ) : (
                      <View style={styles.avatarFallback}>
                        <Text style={styles.avatarLetter}>{review.author?.name?.[0] || "G"}</Text>
                      </View>
                    )}
                    <View style={styles.authorCopy}>
                      <Pressable onPress={() => open(review.author?.profileUrl)}>
                        <Text style={styles.authorName}>{review.author?.name}</Text>
                      </Pressable>
                      <Text style={styles.reviewMeta}>{review.relativeTime}</Text>
                    </View>
                    <Text style={styles.cardStars}>{stars(review.rating)}</Text>
                  </View>

                  {review.text ? <Text style={styles.reviewText}>{review.text}</Text> : null}

                  <View style={styles.reviewLinks}>
                    <Pressable onPress={() => open(review.sourceUrl)}>
                      <Text style={styles.reviewLink}>VIEW ON GOOGLE MAPS ↗</Text>
                    </Pressable>
                    {review.reportUrl ? (
                      <Pressable onPress={() => open(review.reportUrl)}>
                        <Text style={styles.reportLink}>REPORT</Text>
                      </Pressable>
                    ) : null}
                  </View>
                </View>
              ))}
            </View>
          </>
        )}

        <Pressable onPress={() => open(LEAVE_REVIEW_URL)} style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}>
          <Text style={styles.primaryText}>LEAVE A GOOGLE REVIEW</Text>
          <Text style={styles.primaryArrow}>›</Text>
        </Pressable>

        {data?.googleMapsUrl ? (
          <Pressable onPress={() => open(data.googleMapsUrl)} style={styles.secondaryButton}>
            <Text style={styles.secondaryText}>VIEW ALL ON GOOGLE MAPS</Text>
          </Pressable>
        ) : null}

        <Text style={styles.disclaimer}>
          Reviews are supplied by Google Maps. Google checks for and removes policy-violating content when identified.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: BG },
  screen: { flex: 1, backgroundColor: BG },
  content: { paddingHorizontal: 18, paddingTop: 6, paddingBottom: 42 },
  header: { minHeight: 54, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderBottomWidth: 1, borderBottomColor: "#151515" },
  backButton: { width: 44, height: 44, justifyContent: "center" },
  backIcon: { color: "#F5F5F5", fontSize: 34, lineHeight: 34 },
  headerTitle: { color: "#F4F4F4", fontSize: 13, letterSpacing: 2.1, fontWeight: "700" },
  headerSpacer: { width: 44 },
  intro: { paddingTop: 28, paddingBottom: 20 },
  eyebrow: { color: GOLD, fontSize: 9, letterSpacing: 2.2, fontWeight: "700" },
  title: { color: "#F5F5F5", fontSize: 29, lineHeight: 35, fontWeight: "600", marginTop: 8 },
  subtitle: { color: MUTED, fontSize: 13, lineHeight: 20, marginTop: 10, maxWidth: 350 },
  stateCard: { borderRadius: 18, borderWidth: 1, borderColor: BORDER, backgroundColor: PANEL, padding: 22, alignItems: "center" },
  stateTitle: { color: "#F2F2F2", fontSize: 17, fontWeight: "600", textAlign: "center" },
  stateText: { color: MUTED, fontSize: 11, lineHeight: 18, textAlign: "center", marginTop: 10 },
  ratingCard: { borderRadius: 18, borderWidth: 1, borderColor: "#3A3020", backgroundColor: "#0B0906", padding: 20, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  rating: { color: "#FFF4DE", fontSize: 40, fontWeight: "700" },
  ratingStars: { color: GOLD_LIGHT, letterSpacing: 2, marginTop: 3 },
  reviewCount: { color: MUTED, fontSize: 10, marginTop: 6 },
  googleBadge: { borderWidth: 1, borderColor: "#3B3B3B", borderRadius: 18, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: "#111" },
  googleBadgeText: { color: "#F1F1F1", fontSize: 10, fontWeight: "600" },
  orderingNotice: { color: "#777", fontSize: 9, lineHeight: 15, marginTop: 12 },
  reviewList: { gap: 12, marginTop: 16 },
  reviewCard: { borderRadius: 18, borderWidth: 1, borderColor: BORDER, backgroundColor: PANEL, padding: 17 },
  authorRow: { flexDirection: "row", alignItems: "center" },
  avatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: "#1A1A1A" },
  avatarFallback: { width: 38, height: 38, borderRadius: 19, backgroundColor: "#1A160E", borderWidth: 1, borderColor: "#4B3A1E", alignItems: "center", justifyContent: "center" },
  avatarLetter: { color: GOLD_LIGHT, fontWeight: "700" },
  authorCopy: { flex: 1, marginLeft: 11 },
  authorName: { color: "#F1F1F1", fontSize: 12, fontWeight: "600" },
  reviewMeta: { color: MUTED, fontSize: 9, marginTop: 4 },
  cardStars: { color: GOLD_LIGHT, fontSize: 10, letterSpacing: 1 },
  reviewText: { color: "#D9D9D9", fontSize: 12, lineHeight: 19, marginTop: 14 },
  reviewLinks: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 15, borderTopWidth: 1, borderTopColor: "#1C1C1C", paddingTop: 13 },
  reviewLink: { color: GOLD_LIGHT, fontSize: 8, letterSpacing: 1.1, fontWeight: "700" },
  reportLink: { color: "#777", fontSize: 8, letterSpacing: 1 },
  primaryButton: { marginTop: 20, minHeight: 60, borderRadius: 16, backgroundColor: GOLD, paddingHorizontal: 19, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  primaryText: { color: "#090909", fontSize: 12, letterSpacing: 1.1, fontWeight: "800" },
  primaryArrow: { color: "#090909", fontSize: 31, lineHeight: 31 },
  secondaryButton: { marginTop: 10, minHeight: 48, borderRadius: 15, borderWidth: 1, borderColor: "#3A3020", alignItems: "center", justifyContent: "center", paddingHorizontal: 18 },
  secondaryText: { color: GOLD_LIGHT, fontSize: 9, letterSpacing: 1.2, fontWeight: "700" },
  pressed: { opacity: 0.84 },
  disclaimer: { color: "#656565", fontSize: 8.5, lineHeight: 14, textAlign: "center", marginTop: 22, paddingHorizontal: 10 },
});
