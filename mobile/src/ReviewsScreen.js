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

  const reviewItems = data?.reviews || [];

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
          <View style={styles.eyebrowRow}>
            <Text style={styles.eyebrow}>CLIENT FEEDBACK</Text>
            <View style={styles.livePill}><View style={styles.liveDot} /><Text style={styles.liveText}>GOOGLE DATA</Text></View>
          </View>
          <Text style={styles.title}>Real Reviews. Real Clients.</Text>
          <Text style={styles.subtitle}>Google rating data is live now. Written review content will appear here automatically once the Business Profile review connection is approved.</Text>
        </View>

        {loading ? (
          <View style={styles.stateCard}>
            <ActivityIndicator color={GOLD_LIGHT} />
            <Text style={styles.stateTitle}>Loading Google Reviews</Text>
            <Text style={styles.stateText}>Checking the latest QuincyFadez rating and review information.</Text>
          </View>
        ) : error ? (
          <View style={styles.stateCard}>
            <Text style={styles.stateIcon}>!</Text>
            <Text style={styles.stateTitle}>Reviews are temporarily unavailable.</Text>
            <Text style={styles.stateText}>The app could not reach the live Google reviews service just now.</Text>
            <Pressable onPress={loadReviews} style={styles.secondaryButton}>
              <Text style={styles.secondaryText}>TRY AGAIN</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <View style={styles.ratingCard}>
              <View style={styles.ratingCopy}>
                <Text style={styles.rating}>{data?.rating?.toFixed?.(1) || data?.rating || "—"}</Text>
                <Text style={styles.ratingStars}>{stars(data?.rating)}</Text>
                <Text style={styles.reviewCount}>{data?.reviewCount || 0} Google reviews</Text>
              </View>
              <View style={styles.googleBadge}>
                <Text style={styles.googleBadgeTop}>LIVE RATING</Text>
                <Text style={styles.googleBadgeText}>Google Maps</Text>
              </View>
            </View>

            {reviewItems.length > 0 ? (
              <>
                <View style={styles.listHeadingRow}>
                  <Text style={styles.listHeading}>CLIENT REVIEWS</Text>
                  <Text style={styles.listCount}>{reviewItems.length} SHOWN</Text>
                </View>
                <View style={styles.reviewList}>
                  {reviewItems.map((review) => (
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
                            <Text style={styles.authorName}>{review.author?.name || "Google reviewer"}</Text>
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
            ) : (
              <View style={styles.pendingCard}>
                <View style={styles.pendingIcon}><Text style={styles.pendingIconText}>★</Text></View>
                <View style={styles.pendingCopy}>
                  <Text style={styles.pendingEyebrow}>WRITTEN REVIEWS COMING NEXT</Text>
                  <Text style={styles.pendingTitle}>Your live rating is already connected.</Text>
                  <Text style={styles.pendingText}>Individual Google review comments will populate this screen once the Business Profile API access is approved.</Text>
                </View>
              </View>
            )}

            {data?.orderingNotice ? <Text style={styles.orderingNotice}>{data.orderingNotice}</Text> : null}
          </>
        )}

        <View style={styles.actionCard}>
          <Text style={styles.actionEyebrow}>HAD A GREAT CUT?</Text>
          <Text style={styles.actionTitle}>Share Your Experience.</Text>
          <Text style={styles.actionText}>Your Google review helps new clients choose QuincyFadez with confidence.</Text>
          <Pressable onPress={() => open(LEAVE_REVIEW_URL)} style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}>
            <Text style={styles.primaryText}>LEAVE A GOOGLE REVIEW</Text>
            <View style={styles.arrowCircle}><Text style={styles.primaryArrow}>›</Text></View>
          </Pressable>
        </View>

        {data?.googleMapsUrl ? (
          <Pressable onPress={() => open(data.googleMapsUrl)} style={styles.secondaryButton}>
            <Text style={styles.secondaryText}>VIEW ALL ON GOOGLE MAPS</Text>
          </Pressable>
        ) : null}

        <Text style={styles.disclaimer}>Google rating and review information is shown from the connected QuincyFadez business profile.</Text>
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
  headerTitle: { color: "#F4F4F4", fontSize: 13, letterSpacing: 2.1, fontWeight: "700" },
  headerSpacer: { width: 44 },
  intro: { paddingTop: 24, paddingBottom: 18 },
  eyebrowRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  eyebrow: { color: GOLD, fontSize: 9, letterSpacing: 2.2, fontWeight: "700" },
  livePill: { flexDirection: "row", alignItems: "center", borderRadius: 14, borderWidth: 1, borderColor: "#283323", backgroundColor: "#090D08", paddingHorizontal: 8, paddingVertical: 5 },
  liveDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: "#84A66D", marginRight: 5 },
  liveText: { color: "#879B79", fontSize: 6.5, letterSpacing: 1.1, fontWeight: "800" },
  title: { color: "#F5F5F5", fontSize: 30, lineHeight: 35, fontWeight: "650", marginTop: 9 },
  subtitle: { color: MUTED, fontSize: 12.5, lineHeight: 19, marginTop: 9, maxWidth: 350 },
  stateCard: { borderRadius: 20, borderWidth: 1, borderColor: BORDER, backgroundColor: PANEL, padding: 22, alignItems: "center" },
  stateIcon: { width: 32, height: 32, borderRadius: 16, borderWidth: 1, borderColor: "#514026", color: GOLD_LIGHT, textAlign: "center", textAlignVertical: "center", lineHeight: 30, fontWeight: "800" },
  stateTitle: { color: "#F2F2F2", fontSize: 16, fontWeight: "650", textAlign: "center", marginTop: 10 },
  stateText: { color: MUTED, fontSize: 10.5, lineHeight: 17, textAlign: "center", marginTop: 8, maxWidth: 300 },
  ratingCard: { borderRadius: 21, borderWidth: 1, borderColor: "#3A3020", backgroundColor: "#0B0906", padding: 20, flexDirection: "row", alignItems: "center", justifyContent: "space-between", shadowColor: GOLD, shadowOpacity: 0.06, shadowRadius: 14, shadowOffset: { width: 0, height: 5 }, elevation: 2 },
  ratingCopy: { flex: 1 },
  rating: { color: "#FFF4DE", fontSize: 44, lineHeight: 47, fontWeight: "800" },
  ratingStars: { color: GOLD_LIGHT, letterSpacing: 2, marginTop: 2, fontSize: 15 },
  reviewCount: { color: MUTED, fontSize: 10, marginTop: 7 },
  googleBadge: { borderWidth: 1, borderColor: "#3B352B", borderRadius: 16, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: "#11100D", alignItems: "flex-end" },
  googleBadgeTop: { color: GOLD, fontSize: 6.5, letterSpacing: 1.1, fontWeight: "800" },
  googleBadgeText: { color: "#F1F1F1", fontSize: 10, fontWeight: "650", marginTop: 3 },
  listHeadingRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 21, marginBottom: 10 },
  listHeading: { color: "#D8D8D8", fontSize: 8, letterSpacing: 1.6, fontWeight: "800" },
  listCount: { color: "#666", fontSize: 7, letterSpacing: 1.1, fontWeight: "700" },
  reviewList: { gap: 12 },
  reviewCard: { borderRadius: 18, borderWidth: 1, borderColor: BORDER, backgroundColor: PANEL, padding: 17 },
  authorRow: { flexDirection: "row", alignItems: "center" },
  avatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: "#1A1A1A" },
  avatarFallback: { width: 38, height: 38, borderRadius: 19, backgroundColor: "#1A160E", borderWidth: 1, borderColor: "#4B3A1E", alignItems: "center", justifyContent: "center" },
  avatarLetter: { color: GOLD_LIGHT, fontWeight: "700" },
  authorCopy: { flex: 1, marginLeft: 11 },
  authorName: { color: "#F1F1F1", fontSize: 12, fontWeight: "650" },
  reviewMeta: { color: MUTED, fontSize: 9, marginTop: 4 },
  cardStars: { color: GOLD_LIGHT, fontSize: 10, letterSpacing: 1 },
  reviewText: { color: "#D9D9D9", fontSize: 12, lineHeight: 19, marginTop: 14 },
  reviewLinks: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 15, borderTopWidth: 1, borderTopColor: "#1C1C1C", paddingTop: 13 },
  reviewLink: { color: GOLD_LIGHT, fontSize: 8, letterSpacing: 1.1, fontWeight: "700" },
  reportLink: { color: "#777", fontSize: 8, letterSpacing: 1 },
  pendingCard: { marginTop: 14, borderRadius: 19, borderWidth: 1, borderColor: "#2C2A25", backgroundColor: "#0B0B0A", padding: 17, flexDirection: "row", alignItems: "flex-start" },
  pendingIcon: { width: 38, height: 38, borderRadius: 19, backgroundColor: "#181308", borderWidth: 1, borderColor: "#4B3A1E", alignItems: "center", justifyContent: "center", marginRight: 12 },
  pendingIconText: { color: GOLD_LIGHT, fontSize: 15 },
  pendingCopy: { flex: 1 },
  pendingEyebrow: { color: GOLD, fontSize: 7, letterSpacing: 1.3, fontWeight: "800" },
  pendingTitle: { color: "#ECEAE5", fontSize: 14, lineHeight: 19, fontWeight: "650", marginTop: 5 },
  pendingText: { color: MUTED, fontSize: 10, lineHeight: 16, marginTop: 6 },
  orderingNotice: { color: "#676767", fontSize: 8.5, lineHeight: 14, marginTop: 12 },
  actionCard: { marginTop: 20, borderRadius: 20, borderWidth: 1, borderColor: "#312817", backgroundColor: "#0B0906", padding: 18 },
  actionEyebrow: { color: GOLD, fontSize: 8, letterSpacing: 1.6, fontWeight: "800" },
  actionTitle: { color: "#F2EEE7", fontSize: 20, lineHeight: 25, fontWeight: "650", marginTop: 7 },
  actionText: { color: "#9D968B", fontSize: 11, lineHeight: 17, marginTop: 7 },
  primaryButton: { marginTop: 15, minHeight: 58, borderRadius: 16, backgroundColor: GOLD, paddingHorizontal: 17, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  primaryText: { color: "#090909", fontSize: 11.5, letterSpacing: 1.1, fontWeight: "800" },
  arrowCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: "rgba(0,0,0,0.12)", alignItems: "center", justifyContent: "center" },
  primaryArrow: { color: "#090909", fontSize: 28, lineHeight: 28, marginTop: -2 },
  secondaryButton: { marginTop: 10, minHeight: 48, borderRadius: 15, borderWidth: 1, borderColor: "#3A3020", alignItems: "center", justifyContent: "center", paddingHorizontal: 18 },
  secondaryText: { color: GOLD_LIGHT, fontSize: 8.5, letterSpacing: 1.2, fontWeight: "700" },
  pressed: { opacity: 0.84 },
  disclaimer: { color: "#656565", fontSize: 8.5, lineHeight: 14, textAlign: "center", marginTop: 20, paddingHorizontal: 10 },
});
