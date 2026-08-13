import React, { useEffect, useState } from "react";
import { ActivityIndicator, Linking, Pressable, StyleSheet, Text, View } from "react-native";

const GOLD = "#C99B4A";
const GOLD_LIGHT = "#E7C77A";
const BORDER = "#242424";

function money(value) {
  const number = Number(value || 0);
  return `£${number.toFixed(number % 1 ? 2 : 0)}`;
}

function clean(value) {
  return String(value || "not_charged").replaceAll("_", " ").toUpperCase();
}

function shortId(value) {
  const text = String(value || "");
  if (!text) return "—";
  return text.length > 12 ? `${text.slice(0, 7)}…${text.slice(-4)}` : text;
}

function londonDateTime(value) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Europe/London",
    });
  } catch (_) {
    return "—";
  }
}

function whatsappNumber(phone) {
  const digits = String(phone || "").replace(/\D/g, "");
  if (digits.startsWith("44")) return digits;
  if (digits.startsWith("0")) return `44${digits.slice(1)}`;
  return digits;
}

function DetailRow({ label, value, strong = false }) {
  return <View style={styles.detailRow}><Text style={styles.detailLabel}>{label}</Text><Text style={[styles.detailValue, strong && styles.detailValueStrong]}>{value}</Text></View>;
}

function ContactButton({ label, icon, disabled, onPress }) {
  return <Pressable disabled={disabled} onPress={onPress} style={({ pressed }) => [styles.contactButton, disabled && styles.contactDisabled, pressed && !disabled && styles.contactPressed]}><Text style={styles.contactIcon}>{icon}</Text><Text style={styles.contactText}>{label}</Text></Pressable>;
}

export default function AdminAppointmentDetails({ booking, onClose }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [payment, setPayment] = useState(null);
  const API_URL = (process.env.EXPO_PUBLIC_API_URL || "").replace(/\/$/, "");

  const phone = booking?.customer_phone || booking?.phone || "";
  const email = booking?.customer_email || booking?.email || "";
  const openUrl = (url) => Linking.openURL(url).catch(() => {});

  const load = async () => {
    if (!booking?.id || !booking?.client_key || !API_URL) return;
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_URL}/api/payments/booking/${encodeURIComponent(booking.id)}?client_key=${encodeURIComponent(booking.client_key)}`);
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.detail || "Payment details could not be loaded.");
      setPayment(data);
    } catch (err) {
      setError(err.message || "Payment details could not be loaded.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [booking?.id]);

  const transactions = payment?.transactions || [];
  const plan = payment?.payment_plan || booking?.payment_plan || {};
  const deposit = plan?.deposit || {};
  const cancellationFee = plan?.cancellation_fee || {};

  return <View style={styles.card}>
    <View style={styles.header}>
      <View style={styles.headerCopy}>
        <Text style={styles.eyebrow}>APPOINTMENT DETAILS</Text>
        <Text style={styles.title}>{booking?.customer_name || "Client"}</Text>
        <Text style={styles.subtitle}>{booking?.service || "Appointment"} · {londonDateTime(booking?.start_at)}</Text>
      </View>
      <Pressable onPress={onClose} style={styles.close}><Text style={styles.closeText}>CLOSE</Text></Pressable>
    </View>

    <View style={styles.contactCard}>
      <View style={styles.contactHead}><View><Text style={styles.eyebrow}>QUICK CLIENT ACCESS</Text><Text style={styles.contactTitle}>Contact Without Leaving Schedule</Text></View></View>
      <View style={styles.contactGrid}>
        <ContactButton label="CALL" icon="☎" disabled={!phone} onPress={() => openUrl(`tel:${phone}`)} />
        <ContactButton label="MESSAGE" icon="✉" disabled={!phone} onPress={() => openUrl(`sms:${phone}`)} />
        <ContactButton label="WHATSAPP" icon="◉" disabled={!phone} onPress={() => openUrl(`https://wa.me/${whatsappNumber(phone)}`)} />
        <ContactButton label="EMAIL" icon="@" disabled={!email} onPress={() => openUrl(`mailto:${email}`)} />
      </View>
      {!phone && !email ? <Text style={styles.contactEmpty}>No client contact details were returned with this booking.</Text> : <Text style={styles.contactMeta}>{phone || "No Phone"}{email ? ` · ${email}` : ""}</Text>}
    </View>

    <View style={styles.bookingBlock}>
      <DetailRow label="BOOKING STATUS" value={clean(booking?.status)} strong />
      <DetailRow label="BOOKING REFERENCE" value={shortId(booking?.id)} />
      <DetailRow label="SERVICE VALUE" value={money(payment?.service_value ?? booking?.price)} />
      <DetailRow label="DURATION" value={`${booking?.duration_minutes || 0} min`} />
      {booking?.notes ? <DetailRow label="CLIENT NOTE" value={booking.notes} /> : null}
    </View>

    <View style={styles.paymentHeader}><Text style={styles.eyebrow}>PAYMENT BREAKDOWN</Text><Pressable disabled={loading} onPress={load} style={styles.refresh}><Text style={styles.refreshText}>{loading ? "…" : "REFRESH"}</Text></Pressable></View>
    {loading ? <View style={styles.state}><ActivityIndicator color={GOLD_LIGHT} /><Text style={styles.stateText}>CHECKING PAYMENT STATE…</Text></View> : null}
    {!loading && error ? <View style={styles.error}><Text style={styles.errorTitle}>Payment Details Unavailable</Text><Text style={styles.errorText}>{error}</Text></View> : null}
    {!loading && !error && payment ? <>
      <View style={styles.paymentStatus}><Text style={styles.paymentStatusLabel}>OVERALL PAYMENT STATUS</Text><Text style={styles.paymentStatusValue}>{clean(payment.payment_status)}</Text><Text style={styles.paymentStatusMeta}>{payment.payment_method_verified ? "Card verified" : "No verified card recorded"}</Text></View>
      <View style={styles.moneyGrid}>
        <View style={styles.moneyTile}><Text style={styles.moneyLabel}>CAPTURED</Text><Text style={styles.moneyValue}>{money(payment.captured_amount)}</Text></View>
        <View style={styles.moneyTile}><Text style={styles.moneyLabel}>REFUNDED</Text><Text style={styles.moneyValue}>{money(payment.refunded_amount)}</Text></View>
        <View style={styles.moneyTile}><Text style={styles.moneyLabel}>NET CAPTURED</Text><Text style={styles.moneyValue}>{money(payment.net_captured_amount)}</Text></View>
      </View>

      <View style={styles.policyCard}>
        <Text style={styles.policyTitle}>Payment Policy For This Booking</Text>
        <DetailRow label="DEPOSIT" value={deposit?.configured ? `${money(deposit.requested_amount)} · ${deposit.chargeable ? "LIVE" : "CONFIGURED ONLY"}` : "Off"} />
        <DetailRow label="DUE AT BOOKING" value={money(deposit?.amount_due_now)} />
        <DetailRow label="CANCELLATION FEE" value={cancellationFee?.configured ? `${money(cancellationFee.requested_amount)} · ${cancellationFee.chargeable ? "LIVE" : "CONFIGURED ONLY"}` : "Off"} />
      </View>

      <View style={styles.transactions}>
        <View style={styles.transactionsHeader}><Text style={styles.policyTitle}>Transaction History</Text><Text style={styles.count}>{transactions.length}</Text></View>
        {transactions.length ? transactions.map((item) => <View key={item.id || `${item.created_at}-${item.kind}`} style={styles.transaction}>
          <View style={styles.transactionTop}><Text style={styles.transactionTitle}>{clean(item.kind)}</Text><Text style={styles.transactionAmount}>{item.kind === "refund" ? "−" : "+"}{money(item.amount)}</Text></View>
          <Text style={styles.transactionMeta}>{clean(item.status)} · {londonDateTime(item.created_at)}</Text>
          {item.stripe_payment_intent_id ? <Text style={styles.transactionRef}>Stripe {shortId(item.stripe_payment_intent_id)}</Text> : null}
        </View>) : <Text style={styles.empty}>No real payment transactions exist for this booking yet.</Text>}
      </View>
    </> : null}
  </View>;
}

const styles = StyleSheet.create({
  card:{marginTop:10,borderRadius:16,borderWidth:1,borderColor:"#40331F",backgroundColor:"#0E0B07",padding:14},header:{flexDirection:"row",alignItems:"flex-start",gap:10},headerCopy:{flex:1},eyebrow:{color:GOLD,fontSize:6.2,letterSpacing:1.15,fontWeight:"900"},title:{color:"#F1ECE4",fontSize:16,fontWeight:"800",marginTop:5},subtitle:{color:"#8F8372",fontSize:7.8,lineHeight:12,marginTop:4},close:{borderRadius:10,borderWidth:1,borderColor:"#40331F",paddingHorizontal:8,paddingVertical:6},closeText:{color:GOLD_LIGHT,fontSize:5.8,letterSpacing:.7,fontWeight:"900"},
  contactCard:{marginTop:13,borderRadius:13,borderWidth:1,borderColor:"#2E291F",backgroundColor:"#0A0907",padding:11},contactHead:{flexDirection:"row",alignItems:"center",justifyContent:"space-between"},contactTitle:{color:"#E9E2D6",fontSize:11,fontWeight:"800",marginTop:4},contactGrid:{flexDirection:"row",gap:6,marginTop:10},contactButton:{flex:1,minHeight:48,borderRadius:11,borderWidth:1,borderColor:"#3D321F",backgroundColor:"#120F09",alignItems:"center",justifyContent:"center"},contactDisabled:{opacity:.28},contactPressed:{opacity:.72},contactIcon:{color:GOLD_LIGHT,fontSize:13,fontWeight:"900"},contactText:{color:"#B59B69",fontSize:5.2,letterSpacing:.45,fontWeight:"900",marginTop:4},contactMeta:{color:"#716957",fontSize:6.5,lineHeight:10,marginTop:8},contactEmpty:{color:"#665F54",fontSize:6.8,lineHeight:11,marginTop:8},
  bookingBlock:{marginTop:13,borderRadius:13,borderWidth:1,borderColor:BORDER,backgroundColor:"#090909",overflow:"hidden"},detailRow:{minHeight:42,paddingHorizontal:11,paddingVertical:9,borderBottomWidth:1,borderBottomColor:"#1B1B1B",flexDirection:"row",alignItems:"center",justifyContent:"space-between",gap:10},detailLabel:{color:"#73654C",fontSize:5.8,letterSpacing:.7,fontWeight:"900"},detailValue:{flex:1,color:"#9D9A93",fontSize:7.3,textAlign:"right"},detailValueStrong:{color:"#E7D7B8",fontWeight:"800"},paymentHeader:{marginTop:14,flexDirection:"row",alignItems:"center",justifyContent:"space-between"},refresh:{borderRadius:9,borderWidth:1,borderColor:"#3A3020",paddingHorizontal:8,paddingVertical:6},refreshText:{color:GOLD_LIGHT,fontSize:5.5,letterSpacing:.7,fontWeight:"900"},state:{minHeight:70,alignItems:"center",justifyContent:"center",gap:8},stateText:{color:"#7B6C50",fontSize:5.8,letterSpacing:.7,fontWeight:"900"},error:{marginTop:10,borderRadius:12,borderWidth:1,borderColor:"#51302A",backgroundColor:"#120B0A",padding:11},errorTitle:{color:"#D9988C",fontSize:8.5,fontWeight:"800"},errorText:{color:"#9D716A",fontSize:7,lineHeight:11,marginTop:4},paymentStatus:{marginTop:10,borderRadius:13,borderWidth:1,borderColor:"#315342",backgroundColor:"#09110D",padding:12},paymentStatusLabel:{color:"#688F79",fontSize:5.6,letterSpacing:.7,fontWeight:"900"},paymentStatusValue:{color:"#91D1AD",fontSize:12,fontWeight:"900",marginTop:5},paymentStatusMeta:{color:"#678170",fontSize:6.8,marginTop:4},moneyGrid:{flexDirection:"row",gap:6,marginTop:8},moneyTile:{flex:1,minHeight:64,borderRadius:12,borderWidth:1,borderColor:"#28231B",backgroundColor:"#090807",padding:9},moneyLabel:{color:"#75664D",fontSize:5.2,letterSpacing:.6,fontWeight:"900"},moneyValue:{color:"#F0E6D7",fontSize:13,fontWeight:"800",marginTop:8},policyCard:{marginTop:9,borderRadius:13,borderWidth:1,borderColor:BORDER,backgroundColor:"#090909",overflow:"hidden"},policyTitle:{color:"#E9E2D6",fontSize:9,fontWeight:"800",padding:11,paddingBottom:4},transactions:{marginTop:9,borderRadius:13,borderWidth:1,borderColor:BORDER,backgroundColor:"#090909",padding:11},transactionsHeader:{flexDirection:"row",alignItems:"center",justifyContent:"space-between"},count:{color:GOLD_LIGHT,fontSize:7,fontWeight:"900"},transaction:{marginTop:8,paddingTop:8,borderTopWidth:1,borderTopColor:"#1E1E1E"},transactionTop:{flexDirection:"row",alignItems:"center",justifyContent:"space-between"},transactionTitle:{color:"#CFC8BC",fontSize:7.2,fontWeight:"800"},transactionAmount:{color:"#91D1AD",fontSize:8.5,fontWeight:"900"},transactionMeta:{color:"#666",fontSize:6.2,marginTop:4},transactionRef:{color:"#5F5544",fontSize:5.5,marginTop:4},empty:{color:"#777",fontSize:7.4,lineHeight:12,paddingVertical:12,textAlign:"center"}
});