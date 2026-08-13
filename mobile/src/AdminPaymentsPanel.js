import React, { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

const GOLD = "#C99B4A";
const GOLD_LIGHT = "#E7C77A";
const PANEL = "#0D0D0D";
const BORDER = "#242424";
const MUTED = "#929292";
const API_URL = (process.env.EXPO_PUBLIC_API_URL || "").replace(/\/$/, "");

function money(value) {
  const number = Number(value || 0);
  return `£${number.toFixed(number % 1 ? 2 : 0)}`;
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

export default function AdminPaymentsPanel({ settings, capabilities: suppliedCapabilities, saving, onSave }) {
  const [remoteCapabilities, setRemoteCapabilities] = useState(null);
  const [capabilityLoading, setCapabilityLoading] = useState(false);
  const [capabilityError, setCapabilityError] = useState("");

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

  useEffect(() => { loadCapabilities(); }, [suppliedCapabilities]);

  const capabilities = suppliedCapabilities || remoteCapabilities || {};
  const depositConfigured = Boolean(settings?.deposits_enabled);
  const feeConfigured = Boolean(settings?.cancellation_fee_enabled);
  const depositLive = Boolean(capabilities?.deposit_capture);
  const feeLive = Boolean(capabilities?.cancellation_fee_capture);
  const anyLive = depositLive || feeLive;
  const capabilityKnown = Boolean(suppliedCapabilities || remoteCapabilities);

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
        <PaymentFeature
          title="Deposits"
          description="Reserve a set amount that will eventually be taken when the booking is made."
          configured={depositConfigured}
          live={depositLive}
          amount={settings?.deposit_amount ?? 0}
          amountLabel="DEPOSIT AMOUNT"
          saving={saving}
          onToggle={(value) => onSave({ deposits_enabled: value })}
          onAmountChange={(value) => onSave({ deposit_amount: value })}
        />
        <PaymentFeature
          last
          title="Cancellation Fee"
          description="Prepare a flat fee policy for qualifying late cancellations."
          configured={feeConfigured}
          live={feeLive}
          amount={settings?.cancellation_fee_amount ?? 0}
          amountLabel="CANCELLATION FEE"
          saving={saving}
          onToggle={(value) => onSave({ cancellation_fee_enabled: value })}
          onAmountChange={(value) => onSave({ cancellation_fee_amount: value })}
        />
      </View>

      <View style={styles.truthCard}>
        <Text style={styles.truthEyebrow}>PAYMENT TRUTH</Text>
        <Text style={styles.truthTitle}>What The App Will Never Pretend</Text>
        <View style={styles.truthRow}><Text style={styles.truthTick}>✓</Text><Text style={styles.truthText}>A verified or saved card is not a payment.</Text></View>
        <View style={styles.truthRow}><Text style={styles.truthTick}>✓</Text><Text style={styles.truthText}>Configured deposits are not shown as money due until deposit capture is live.</Text></View>
        <View style={styles.truthRow}><Text style={styles.truthTick}>✓</Text><Text style={styles.truthText}>Cancellation fees are not marked as charged until a real successful transaction exists.</Text></View>
        <View style={styles.truthRow}><Text style={styles.truthTick}>✓</Text><Text style={styles.truthText}>Captured revenue will come from the payment ledger, not simply from appointment prices.</Text></View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap:{gap:14},hero:{borderRadius:20,borderWidth:1,borderColor:"#3A3020",backgroundColor:"#0E0B07",padding:17},heroTop:{flexDirection:"row",alignItems:"center",gap:12},heroMark:{width:44,height:44,borderRadius:22,borderWidth:1,borderColor:"#604A24",backgroundColor:"#171106",alignItems:"center",justifyContent:"center"},heroMarkText:{color:GOLD_LIGHT,fontSize:20,fontWeight:"900"},heroCopy:{flex:1},eyebrow:{color:GOLD,fontSize:7,letterSpacing:1.5,fontWeight:"900"},title:{color:"#F4F4F4",fontSize:18,fontWeight:"750",marginTop:5},heroText:{color:MUTED,fontSize:9.5,lineHeight:15.5,marginTop:13},systemStatus:{minHeight:62,borderRadius:14,borderWidth:1,borderColor:"#2C281F",backgroundColor:"#090807",marginTop:14,paddingHorizontal:12,paddingVertical:10,flexDirection:"row",alignItems:"center",justifyContent:"space-between",gap:10},systemCopy:{flex:1},systemLabel:{color:"#75664D",fontSize:6,letterSpacing:.9,fontWeight:"900"},systemValue:{color:"#D9D2C5",fontSize:9,fontWeight:"800",marginTop:4},systemError:{color:"#C68A80",fontSize:7.2,lineHeight:11,marginTop:4},systemPill:{borderRadius:11,borderWidth:1,borderColor:"#5A4523",backgroundColor:"#151005",paddingHorizontal:8,paddingVertical:6},systemPillLive:{borderColor:"#315342",backgroundColor:"#09110D"},systemPillText:{color:GOLD_LIGHT,fontSize:5.8,letterSpacing:.7,fontWeight:"900"},systemPillTextLive:{color:"#91D1AD"},
  card:{borderRadius:20,borderWidth:1,borderColor:BORDER,backgroundColor:PANEL,overflow:"hidden"},cardHeader:{padding:16,borderBottomWidth:1,borderBottomColor:"#1D1D1D"},cardEyebrow:{color:GOLD,fontSize:6.8,letterSpacing:1.3,fontWeight:"900"},cardTitle:{color:"#F0F0F0",fontSize:17,fontWeight:"750",marginTop:5},cardText:{color:MUTED,fontSize:9,lineHeight:14.5,marginTop:7},feature:{padding:16},borderBottom:{borderBottomWidth:1,borderBottomColor:"#1D1D1D"},featureTop:{flexDirection:"row",alignItems:"flex-start",gap:12},featureCopy:{flex:1},featureTitle:{color:"#EFEFEF",fontSize:13,fontWeight:"750"},featureDescription:{color:"#777",fontSize:8.5,lineHeight:13,marginTop:5},toggle:{width:42,height:24,borderRadius:12,backgroundColor:"#272727",padding:3,justifyContent:"center"},toggleOn:{backgroundColor:GOLD},toggleKnob:{width:18,height:18,borderRadius:9,backgroundColor:"#777"},toggleKnobOn:{backgroundColor:"#090909",alignSelf:"flex-end"},disabled:{opacity:.45},statusRow:{flexDirection:"row",alignItems:"center",justifyContent:"space-between",marginTop:11},badge:{borderRadius:11,borderWidth:1,borderColor:"#333",backgroundColor:"#111",paddingHorizontal:8,paddingVertical:6,flexDirection:"row",alignItems:"center",gap:6},badgeConfigured:{borderColor:"#5A4523",backgroundColor:"#151005"},badgeLive:{borderColor:"#315342",backgroundColor:"#09110D"},dot:{width:5,height:5,borderRadius:3,backgroundColor:"#666"},dotConfigured:{backgroundColor:GOLD_LIGHT},dotLive:{backgroundColor:"#91D1AD"},badgeText:{color:"#777",fontSize:5.8,letterSpacing:.65,fontWeight:"900"},badgeTextConfigured:{color:GOLD_LIGHT},badgeTextLive:{color:"#91D1AD"},amountSummary:{color:"#E8E0D2",fontSize:11,fontWeight:"800"},amountRow:{marginTop:12,borderRadius:13,borderWidth:1,borderColor:"#242424",backgroundColor:"#090909",padding:11,flexDirection:"row",alignItems:"center",gap:10},amountCopy:{flex:1},amountLabel:{color:"#7C6948",fontSize:6.2,letterSpacing:1,fontWeight:"900"},amountMeta:{color:"#707070",fontSize:7.5,lineHeight:11.5,marginTop:4},stepper:{minWidth:112,height:34,borderRadius:11,borderWidth:1,borderColor:"#30291E",backgroundColor:"#0A0907",flexDirection:"row",alignItems:"center",justifyContent:"space-between",overflow:"hidden"},stepButton:{width:32,height:34,alignItems:"center",justifyContent:"center"},stepText:{color:GOLD_LIGHT,fontSize:15,fontWeight:"800"},stepValue:{color:"#EFEFEF",fontSize:8.5,fontWeight:"800"},guardNotice:{borderRadius:13,borderWidth:1,borderColor:"#4D3B1E",backgroundColor:"#110D06",padding:11,marginTop:10,flexDirection:"row",gap:9},guardIcon:{color:GOLD_LIGHT,fontSize:17},guardCopy:{flex:1},guardTitle:{color:"#E8D8B8",fontSize:9,fontWeight:"800"},guardText:{color:"#907D5C",fontSize:7.8,lineHeight:12.5,marginTop:4},
  truthCard:{borderRadius:19,borderWidth:1,borderColor:"#29251D",backgroundColor:"#0B0A08",padding:16},truthEyebrow:{color:GOLD,fontSize:6.8,letterSpacing:1.2,fontWeight:"900"},truthTitle:{color:"#EFEFEF",fontSize:15,fontWeight:"750",marginTop:5,marginBottom:9},truthRow:{flexDirection:"row",alignItems:"flex-start",gap:8,marginTop:7},truthTick:{color:GOLD_LIGHT,fontSize:10,fontWeight:"900"},truthText:{flex:1,color:"#8A8A8A",fontSize:8.5,lineHeight:13},
});