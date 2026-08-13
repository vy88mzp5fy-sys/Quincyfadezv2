import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const GOLD = "#C99B4A";
const GOLD_LIGHT = "#E7C77A";
const PANEL = "#0D0D0D";
const BORDER = "#242424";
const MUTED = "#929292";
const API_URL = (process.env.EXPO_PUBLIC_API_URL || "").replace(/\/$/, "");
const TOKEN_KEY = "quincyfadez.adminToken";

function money(value) {
  const number = Number(value || 0);
  return `£${number.toFixed(number % 1 ? 2 : 0)}`;
}

function londonDate(value) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Europe/London" });
  } catch (_) {
    return "—";
  }
}

function statusFor(configured, live) {
  if (!configured) return { label: "OFF", tone: "off" };
  if (live) return { label: "LIVE CHARGING", tone: "live" };
  return { label: "CONFIGURED · NOT LIVE", tone: "configured" };
}

function StatusBadge({ configured, live }) {
  const status = statusFor(configured, live);
  return (
    <View style={[styles.badge, status.tone === "live" && styles.badgeLive, status.tone === "configured" && styles.badgeConfigured]}>
      <View style={[styles.dot, status.tone === "live" && styles.dotLive, status.tone === "configured" && styles.dotConfigured]} />
      <Text style={[styles.badgeText, status.tone === "live" && styles.badgeTextLive, status.tone === "configured" && styles.badgeTextConfigured]}>{status.label}</Text>
    </View>
  );
}

function Toggle({ value, disabled, onChange }) {
  return (
    <Pressable disabled={disabled} onPress={() => onChange(!value)} style={[styles.toggle, value && styles.toggleOn, disabled && styles.disabled]}>
      <View style={[styles.toggleKnob, value && styles.toggleKnobOn]} />
    </Pressable>
  );
}

function MoneyStepper({ value, disabled, onChange, max = 100 }) {
  const number = Number(value || 0);
  const change = (delta) => onChange(Math.max(0, Math.min(max, number + delta)));
  return (
    <View style={styles.stepper}>
      <Pressable disabled={disabled || number <= 0} onPress={() => change(-5)} style={styles.stepButton}><Text style={styles.stepText}>−</Text></Pressable>
      <Text style={styles.stepValue}>{money(number)}</Text>
      <Pressable disabled={disabled || number >= max} onPress={() => change(5)} style={styles.stepButton}><Text style={styles.stepText}>＋</Text></Pressable>
    </View>
  );
}

function PaymentFeature({ title, description, configured, live, amount, amountLabel, saving, onToggle, onAmountChange, last = false }) {
  return (
    <View style={[styles.feature, !last && styles.borderBottom]}>
      <View style={styles.featureTop}>
        <View style={styles.featureCopy}>
          <Text style={styles.featureTitle}>{title}</Text>
          <Text style={styles.featureDescription}>{description}</Text>
        </View>
        <Toggle value={configured} disabled={saving} onChange={onToggle} />
      </View>
      <View style={styles.statusRow}>
        <StatusBadge configured={configured} live={live} />
        {configured ? <Text style={styles.amountSummary}>{money(amount)}</Text> : null}
      </View>
      {configured ? (
        <View style={styles.amountRow}>
          <View style={styles.amountCopy}>
            <Text style={styles.amountLabel}>{amountLabel}</Text>
            <Text style={styles.amountMeta}>{live ? "This amount can be charged through the live payment flow." : "Saved as a policy only. No customer will be charged yet."}</Text>
          </View>
          <MoneyStepper value={amount} disabled={saving} onChange={onAmountChange} />
        </View>
      ) : null}
      {configured && !live ? (
        <View style={styles.guardNotice}>
          <Text style={styles.guardIcon}>⌁</Text>
          <View style={styles.guardCopy}>
            <Text style={styles.guardTitle}>Charging Is Protected</Text>
            <Text style={styles.guardText}>You can prepare this policy now, but QuincyFadez will not treat it as money due or charged until the secure Stripe capture path is enabled on the server.</Text>
          </View>
        </View>
      ) : null}
    </View>
  );
}

function ActivityMetric({ label, value, meta }) {
  return <View style={styles.activityMetric}><Text style={styles.activityMetricLabel}>{label}</Text><Text style={styles.activityMetricValue}>{value}</Text><Text style={styles.activityMetricMeta}>{meta}</Text></View>;
}

function transactionLabel(kind) {
  if (kind === "deposit") return "Deposit";
  if (kind === "cancellation_fee") return "Cancellation Fee";
  if (kind === "refund") return "Refund";
  if (kind === "appointment_payment") return "Appointment Payment";
  return "Payment";
}

function PaymentActivity({ loading, error, activity, onRefresh }) {
  const totals = useMemo(() => {
    return (activity || []).reduce((sum, item) => {
      const amount = Number(item.amount || 0);
      if (item.kind === "refund") sum.refunded += amount;
      else if (["captured", "succeeded"].includes(item.status)) sum.captured += amount;
      return sum;
    }, { captured: 0, refunded: 0 });
  }, [activity]);
  const net = Math.max(0, totals.captured - totals.refunded);

  return (
    <View style={styles.activityCard}>
      <View style={styles.activityHeader}>
        <View style={styles.activityHeaderCopy}>
          <Text style={styles.cardEyebrow}>REAL PAYMENT ACTIVITY</Text>
          <Text style={styles.cardTitle}>Last 30 Days</Text>
          <Text style={styles.cardText}>Only successful ledger transactions appear here. Appointment prices on their own are not counted as money received.</Text>
        </View>
        <Pressable disabled={loading} onPress={onRefresh} style={[styles.refreshButton, loading && styles.disabled]}><Text style={styles.refreshText}>{loading ? "…" : "REFRESH"}</Text></Pressable>
      </View>

      <View style={styles.activityMetrics}>
        <ActivityMetric label="CAPTURED" value={money(totals.captured)} meta="Successful charges" />
        <ActivityMetric label="REFUNDED" value={money(totals.refunded)} meta="Returned money" />
        <ActivityMetric label="NET CAPTURED" value={money(net)} meta="Captured minus refunds" />
      </View>

      {loading ? <View style={styles.activityState}><ActivityIndicator color={GOLD_LIGHT} /><Text style={styles.activityStateText}>CHECKING PAYMENT LEDGER…</Text></View> : null}
      {!loading && error ? <View style={styles.activityError}><Text style={styles.activityErrorTitle}>Payment Activity Unavailable</Text><Text style={styles.activityErrorText}>{error}</Text></View> : null}
      {!loading && !error && !activity.length ? <View style={styles.activityEmpty}><Text style={styles.activityEmptyTitle}>No Captured Payments Yet</Text><Text style={styles.activityEmptyText}>That is expected while charging is protected. Verified cards and completed appointments will not create fake payment activity.</Text></View> : null}
      {!loading && !error && activity.length ? <View style={styles.activityList}>{activity.slice(0, 25).map((item) => <View key={item.id || `${item.booking_id}-${item.created_at}-${item.kind}`} style={styles.activityItem}><View style={styles.activityIcon}><Text style={styles.activityIconText}>{item.kind === "refund" ? "↩" : "£"}</Text></View><View style={styles.activityItemCopy}><View style={styles.activityItemTop}><Text style={styles.activityItemTitle}>{transactionLabel(item.kind)}</Text><Text style={[styles.activityAmount, item.kind === "refund" && styles.activityAmountRefund]}>{item.kind === "refund" ? "−" : "+"}{money(item.amount)}</Text></View><Text style={styles.activityClient}>{item.customer_name || "Client"} · {item.service || "Booking"}</Text><Text style={styles.activityMeta}>{londonDate(item.created_at)} · {(item.status || "recorded").replaceAll("_", " ").toUpperCase()}</Text></View></View>)}</View> : null}
    </View>
  );
}

export default function AdminPaymentsPanel({ settings, capabilities: suppliedCapabilities, saving, onSave }) {
  const [remoteCapabilities, setRemoteCapabilities] = useState(null);
  const [capabilityLoading, setCapabilityLoading] = useState(false);
  const [capabilityError, setCapabilityError] = useState("");
  const [activity, setActivity] = useState([]);
  const [activityLoading, setActivityLoading] = useState(false);
  const [activityError, setActivityError] = useState("");

  const loadCapabilities = async () => {
    if (!API_URL || suppliedCapabilities) return;
    setCapabilityLoading(true);
    setCapabilityError("");
    try {
      const response = await fetch(`${API_URL}/api/payments/config`);
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.detail || "Payment capability status is unavailable.");
      setRemoteCapabilities(data.capabilities || {});
    } catch (error) {
      setRemoteCapabilities({ deposit_capture: false, cancellation_fee_capture: false });
      setCapabilityError(error.message || "Payment capability status is unavailable.");
    } finally {
      setCapabilityLoading(false);
    }
  };

  const loadPaymentActivity = async () => {
    if (!API_URL || activityLoading) return;
    setActivityLoading(true);
    setActivityError("");
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      if (!token) throw new Error("Admin session is unavailable. Sign in again to view payment activity.");
      const start = new Date();
      start.setDate(start.getDate() - 30);
      const startDate = start.toISOString().slice(0, 10);
      const bookingResponse = await fetch(`${API_URL}/api/admin/bookings?start_date=${startDate}&days=31`, { headers: { Authorization: `Bearer ${token}` } });
      const bookingData = await bookingResponse.json().catch(() => ({}));
      if (!bookingResponse.ok) throw new Error(bookingData.detail || "Recent bookings could not be loaded.");
      const bookings = (bookingData.bookings || []).slice(-50);
      const paymentResults = await Promise.all(bookings.map(async (booking) => {
        try {
          const response = await fetch(`${API_URL}/api/payments/booking/${encodeURIComponent(booking.id)}?client_key=${encodeURIComponent(booking.client_key)}`);
          const data = await response.json().catch(() => ({}));
          if (!response.ok) return [];
          return (data.transactions || []).map((transaction) => ({ ...transaction, booking_id: booking.id, customer_name: booking.customer_name, service: booking.service, appointment_start: booking.start_at }));
        } catch (_) {
          return [];
        }
      }));
      const flattened = paymentResults.flat().sort((a, b) => String(b.created_at || "").localeCompare(String(a.created_at || "")));
      setActivity(flattened);
    } catch (error) {
      setActivity([]);
      setActivityError(error.message || "Payment activity is unavailable right now.");
    } finally {
      setActivityLoading(false);
    }
  };

  useEffect(() => { loadCapabilities(); }, [suppliedCapabilities]);
  useEffect(() => { loadPaymentActivity(); }, []);

  const capabilities = suppliedCapabilities || remoteCapabilities || settings?.payment_capabilities || {};
  const depositConfigured = Boolean(settings?.deposits_enabled);
  const feeConfigured = Boolean(settings?.cancellation_fee_enabled);
  const depositLive = Boolean(capabilities?.deposit_capture || settings?.deposit_capture_live);
  const feeLive = Boolean(capabilities?.cancellation_fee_capture || settings?.cancellation_fee_capture_live);
  const anyLive = depositLive || feeLive;
  const capabilityKnown = Boolean(suppliedCapabilities || remoteCapabilities || settings?.payment_capabilities);

  return (
    <View style={styles.wrap}>
      <View style={styles.hero}>
        <View style={styles.heroTop}>
          <View style={styles.heroMark}><Text style={styles.heroMarkText}>£</Text></View>
          <View style={styles.heroCopy}>
            <Text style={styles.eyebrow}>PAYMENT PROTECTION</Text>
            <Text style={styles.title}>Clear, Safe Money Controls.</Text>
          </View>
        </View>
        <Text style={styles.heroText}>Card verification, deposits and cancellation fees are kept separate. A saved card never counts as a payment, and configured fees do not become chargeable until the real Stripe capture capability is live.</Text>
        <View style={styles.systemStatus}>
          <View style={styles.systemCopy}>
            <Text style={styles.systemLabel}>MONEY-MOVING STATUS</Text>
            <Text style={styles.systemValue}>{capabilityLoading && !capabilityKnown ? "CHECKING LIVE CAPABILITIES…" : anyLive ? "LIVE CAPABILITIES DETECTED" : "SAFE CONFIGURATION MODE"}</Text>
            {capabilityError ? <Text style={styles.systemError}>Could not confirm live charging. The app is staying in protected mode.</Text> : null}
          </View>
          {capabilityLoading && !capabilityKnown ? <ActivityIndicator color={GOLD_LIGHT} size="small" /> : <View style={[styles.systemPill, anyLive && styles.systemPillLive]}><Text style={[styles.systemPillText, anyLive && styles.systemPillTextLive]}>{anyLive ? "LIVE" : "PROTECTED"}</Text></View>}
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardEyebrow}>BOOKING PAYMENTS</Text>
          <Text style={styles.cardTitle}>Protection Rules</Text>
          <Text style={styles.cardText}>Configure the policy you want now. The status badge tells you whether that policy is merely prepared or genuinely able to charge.</Text>
        </View>
        <PaymentFeature title="Deposits" description="Reserve a set amount that will eventually be taken when the booking is made." configured={depositConfigured} live={depositLive} amount={settings?.deposit_amount ?? 0} amountLabel="DEPOSIT AMOUNT" saving={saving} onToggle={(value) => onSave({ deposits_enabled: value })} onAmountChange={(value) => onSave({ deposit_amount: value })} />
        <PaymentFeature last title="Cancellation Fee" description="Prepare a flat fee policy for qualifying late cancellations." configured={feeConfigured} live={feeLive} amount={settings?.cancellation_fee_amount ?? 0} amountLabel="CANCELLATION FEE" saving={saving} onToggle={(value) => onSave({ cancellation_fee_enabled: value })} onAmountChange={(value) => onSave({ cancellation_fee_amount: value })} />
      </View>

      <PaymentActivity loading={activityLoading} error={activityError} activity={activity} onRefresh={loadPaymentActivity} />

      <View style={styles.truthCard}>
        <Text style={styles.truthEyebrow}>PAYMENT TRUTH</Text>
        <Text style={styles.truthTitle}>What The App Will Never Pretend</Text>
        <View style={styles.truthRow}><Text style={styles.truthTick}>✓</Text><Text style={styles.truthText}>A verified or saved card is not a payment.</Text></View>
        <View style={styles.truthRow}><Text style={styles.truthTick}>✓</Text><Text style={styles.truthText}>Configured deposits are not shown as money due until deposit capture is live.</Text></View>
        <View style={styles.truthRow}><Text style={styles.truthTick}>✓</Text><Text style={styles.truthText}>Cancellation fees are not marked as charged until a real successful transaction exists.</Text></View>
        <View style={styles.truthRow}><Text style={styles.truthTick}>✓</Text><Text style={styles.truthText}>Captured revenue comes from the payment ledger, not simply from appointment prices.</Text></View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap:{gap:14},hero:{borderRadius:20,borderWidth:1,borderColor:"#3A3020",backgroundColor:"#0E0B07",padding:17},heroTop:{flexDirection:"row",alignItems:"center",gap:12},heroMark:{width:44,height:44,borderRadius:22,borderWidth:1,borderColor:"#604A24",backgroundColor:"#171106",alignItems:"center",justifyContent:"center"},heroMarkText:{color:GOLD_LIGHT,fontSize:20,fontWeight:"900"},heroCopy:{flex:1},eyebrow:{color:GOLD,fontSize:7,letterSpacing:1.5,fontWeight:"900"},title:{color:"#F4F4F4",fontSize:18,fontWeight:"750",marginTop:5},heroText:{color:MUTED,fontSize:9.5,lineHeight:15.5,marginTop:13},systemStatus:{minHeight:62,borderRadius:14,borderWidth:1,borderColor:"#2C281F",backgroundColor:"#090807",marginTop:14,paddingHorizontal:12,paddingVertical:10,flexDirection:"row",alignItems:"center",justifyContent:"space-between",gap:10},systemCopy:{flex:1},systemLabel:{color:"#75664D",fontSize:6,letterSpacing:.9,fontWeight:"900"},systemValue:{color:"#D9D2C5",fontSize:9,fontWeight:"800",marginTop:4},systemError:{color:"#C68A80",fontSize:7.2,lineHeight:11,marginTop:4},systemPill:{borderRadius:11,borderWidth:1,borderColor:"#5A4523",backgroundColor:"#151005",paddingHorizontal:8,paddingVertical:6},systemPillLive:{borderColor:"#315342",backgroundColor:"#09110D"},systemPillText:{color:GOLD_LIGHT,fontSize:5.8,letterSpacing:.7,fontWeight:"900"},systemPillTextLive:{color:"#91D1AD"},
  card:{borderRadius:20,borderWidth:1,borderColor:BORDER,backgroundColor:PANEL,overflow:"hidden"},cardHeader:{padding:16,borderBottomWidth:1,borderBottomColor:"#1D1D1D"},cardEyebrow:{color:GOLD,fontSize:6.8,letterSpacing:1.3,fontWeight:"900"},cardTitle:{color:"#F0F0F0",fontSize:17,fontWeight:"750",marginTop:5},cardText:{color:MUTED,fontSize:9,lineHeight:14.5,marginTop:7},feature:{padding:16},borderBottom:{borderBottomWidth:1,borderBottomColor:"#1D1D1D"},featureTop:{flexDirection:"row",alignItems:"flex-start",gap:12},featureCopy:{flex:1},featureTitle:{color:"#EFEFEF",fontSize:13,fontWeight:"750"},featureDescription:{color:"#777",fontSize:8.5,lineHeight:13,marginTop:5},toggle:{width:42,height:24,borderRadius:12,backgroundColor:"#272727",padding:3,justifyContent:"center"},toggleOn:{backgroundColor:GOLD},toggleKnob:{width:18,height:18,borderRadius:9,backgroundColor:"#777"},toggleKnobOn:{backgroundColor:"#090909",alignSelf:"flex-end"},disabled:{opacity:.45},statusRow:{flexDirection:"row",alignItems:"center",justifyContent:"space-between",marginTop:11},badge:{borderRadius:11,borderWidth:1,borderColor:"#333",backgroundColor:"#111",paddingHorizontal:8,paddingVertical:6,flexDirection:"row",alignItems:"center",gap:6},badgeConfigured:{borderColor:"#5A4523",backgroundColor:"#151005"},badgeLive:{borderColor:"#315342",backgroundColor:"#09110D"},dot:{width:5,height:5,borderRadius:3,backgroundColor:"#666"},dotConfigured:{backgroundColor:GOLD_LIGHT},dotLive:{backgroundColor:"#91D1AD"},badgeText:{color:"#777",fontSize:5.8,letterSpacing:.65,fontWeight:"900"},badgeTextConfigured:{color:GOLD_LIGHT},badgeTextLive:{color:"#91D1AD"},amountSummary:{color:"#E8E0D2",fontSize:11,fontWeight:"800"},amountRow:{marginTop:12,borderRadius:13,borderWidth:1,borderColor:"#242424",backgroundColor:"#090909",padding:11,flexDirection:"row",alignItems:"center",gap:10},amountCopy:{flex:1},amountLabel:{color:"#7C6948",fontSize:6.2,letterSpacing:1,fontWeight:"900"},amountMeta:{color:"#707070",fontSize:7.5,lineHeight:11.5,marginTop:4},stepper:{minWidth:112,height:34,borderRadius:11,borderWidth:1,borderColor:"#30291E",backgroundColor:"#0A0907",flexDirection:"row",alignItems:"center",justifyContent:"space-between",overflow:"hidden"},stepButton:{width:32,height:34,alignItems:"center",justifyContent:"center"},stepText:{color:GOLD_LIGHT,fontSize:15,fontWeight:"800"},stepValue:{color:"#EFEFEF",fontSize:8.5,fontWeight:"800"},guardNotice:{borderRadius:13,borderWidth:1,borderColor:"#4D3B1E",backgroundColor:"#110D06",padding:11,marginTop:10,flexDirection:"row",gap:9},guardIcon:{color:GOLD_LIGHT,fontSize:17},guardCopy:{flex:1},guardTitle:{color:"#E8D8B8",fontSize:9,fontWeight:"800"},guardText:{color:"#907D5C",fontSize:7.8,lineHeight:12.5,marginTop:4},
  activityCard:{borderRadius:20,borderWidth:1,borderColor:"#2D281F",backgroundColor:"#0B0A08",padding:16},activityHeader:{flexDirection:"row",alignItems:"flex-start",gap:10},activityHeaderCopy:{flex:1},refreshButton:{borderRadius:12,borderWidth:1,borderColor:"#3B3223",paddingHorizontal:9,paddingVertical:7},refreshText:{color:GOLD_LIGHT,fontSize:6,letterSpacing:.8,fontWeight:"900"},activityMetrics:{flexDirection:"row",gap:7,marginTop:13},activityMetric:{flex:1,minHeight:82,borderRadius:13,borderWidth:1,borderColor:"#24211B",backgroundColor:"#090807",padding:10,justifyContent:"space-between"},activityMetricLabel:{color:"#76674D",fontSize:5.8,letterSpacing:.8,fontWeight:"900"},activityMetricValue:{color:"#F0E8DB",fontSize:16,fontWeight:"800",marginTop:6},activityMetricMeta:{color:"#666",fontSize:6.7,lineHeight:10,marginTop:4},activityState:{minHeight:70,alignItems:"center",justifyContent:"center",gap:8},activityStateText:{color:"#8D7751",fontSize:6.5,letterSpacing:1,fontWeight:"800"},activityError:{borderRadius:13,borderWidth:1,borderColor:"#4D2B27",backgroundColor:"#120A09",padding:12,marginTop:12},activityErrorTitle:{color:"#D89B91",fontSize:9,fontWeight:"800"},activityErrorText:{color:"#9C706A",fontSize:7.5,lineHeight:12,marginTop:4},activityEmpty:{borderRadius:14,borderWidth:1,borderColor:"#242424",backgroundColor:"#090909",padding:15,marginTop:12,alignItems:"center"},activityEmptyTitle:{color:"#EDEDED",fontSize:11,fontWeight:"750"},activityEmptyText:{color:"#777",fontSize:8,lineHeight:13,textAlign:"center",marginTop:6},activityList:{marginTop:10},activityItem:{flexDirection:"row",gap:10,paddingVertical:11,borderTopWidth:1,borderTopColor:"#1D1D1D"},activityIcon:{width:34,height:34,borderRadius:17,borderWidth:1,borderColor:"#4C3A1D",backgroundColor:"#151006",alignItems:"center",justifyContent:"center"},activityIconText:{color:GOLD_LIGHT,fontSize:12,fontWeight:"900"},activityItemCopy:{flex:1},activityItemTop:{flexDirection:"row",alignItems:"center",justifyContent:"space-between",gap:8},activityItemTitle:{color:"#EFEFEF",fontSize:10.5,fontWeight:"750"},activityAmount:{color:"#91D1AD",fontSize:10.5,fontWeight:"900"},activityAmountRefund:{color:"#D99A90"},activityClient:{color:"#898989",fontSize:7.8,marginTop:4},activityMeta:{color:"#625A4B",fontSize:6.3,letterSpacing:.4,marginTop:4},
  truthCard:{borderRadius:19,borderWidth:1,borderColor:"#29251D",backgroundColor:"#0B0A08",padding:16},truthEyebrow:{color:GOLD,fontSize:6.8,letterSpacing:1.2,fontWeight:"900"},truthTitle:{color:"#EFEFEF",fontSize:15,fontWeight:"750",marginTop:5,marginBottom:9},truthRow:{flexDirection:"row",alignItems:"flex-start",gap:8,marginTop:7},truthTick:{color:GOLD_LIGHT,fontSize:10,fontWeight:"900"},truthText:{flex:1,color:"#8A8A8A",fontSize:8.5,lineHeight:13},
});