import React, { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

const GOLD = "#C99B4A";
const GOLD_LIGHT = "#E7C77A";
const PANEL = "#0D0D0D";
const BORDER = "#242424";
const MUTED = "#858585";

const QUICK_TAGS = ["Regular", "VIP", "New", "Late Risk", "No-Show Risk", "Prefers Quiet"];
const BLOCK_REASONS = ["Repeated No-Shows", "Late Cancellations", "Payment Issue", "Booking Misuse"];

function cleanTags(tags) {
  return Array.from(new Set((tags || []).map((tag) => String(tag || "").trim()).filter(Boolean))).slice(0, 20);
}

function reliabilityFor(client) {
  const completed = Number(client?.completed_count || 0);
  const noShows = Number(client?.no_show_count || 0);
  const cancelled = Number(client?.cancelled_count || 0);
  if (noShows >= 2) return { label: "NEEDS ATTENTION", tone: "risk", text: `${noShows} no-shows recorded` };
  if (noShows === 1 || cancelled >= 3) return { label: "WATCH", tone: "watch", text: noShows ? "1 no-show recorded" : `${cancelled} cancellations recorded` };
  if (completed >= 3) return { label: "RELIABLE", tone: "good", text: `${completed} completed visits with no no-shows` };
  return { label: "BUILDING HISTORY", tone: "neutral", text: `${completed} completed visit${completed === 1 ? "" : "s"} so far` };
}

export default function ClientManagementPanel({ client, busy, onUpdate }) {
  const [tags, setTags] = useState(cleanTags(client?.tags));
  const [customTag, setCustomTag] = useState("");
  const [blockReason, setBlockReason] = useState(client?.block_reason || "");
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    setTags(cleanTags(client?.tags));
    setBlockReason(client?.block_reason || "");
    setCustomTag("");
    setDirty(false);
  }, [client?.client_key, client?.tags, client?.block_reason, client?.blocked]);

  const tagSet = useMemo(() => new Set(tags.map((tag) => tag.toLowerCase())), [tags]);
  const reliability = useMemo(() => reliabilityFor(client), [client?.completed_count, client?.no_show_count, client?.cancelled_count]);

  const toggleTag = (tag) => {
    setTags((current) => {
      const exists = current.some((item) => item.toLowerCase() === tag.toLowerCase());
      return exists ? current.filter((item) => item.toLowerCase() !== tag.toLowerCase()) : cleanTags([...current, tag]);
    });
    setDirty(true);
  };

  const addCustomTag = () => {
    const next = customTag.trim();
    if (!next || tagSet.has(next.toLowerCase())) return;
    setTags((current) => cleanTags([...current, next]));
    setCustomTag("");
    setDirty(true);
  };

  const clearTags = () => {
    if (!tags.length || busy) return;
    Alert.alert(
      "Clear Client Tags?",
      "This removes all private tags from this client. Their booking history and notes are not affected.",
      [
        { text: "Keep Tags", style: "cancel" },
        { text: "Clear Tags", style: "destructive", onPress: () => { setTags([]); setDirty(true); } },
      ],
    );
  };

  const saveTags = async () => {
    if (!dirty || busy) return;
    const ok = await onUpdate({ tags });
    if (ok) setDirty(false);
  };

  const requestBlockChange = () => {
    if (busy) return;
    if (client?.blocked) {
      Alert.alert(
        "Unblock Client?",
        "This will allow this client to make new online bookings again.",
        [
          { text: "Keep Blocked", style: "cancel" },
          { text: "Unblock", onPress: () => onUpdate({ blocked: false, block_reason: "" }) },
        ],
      );
      return;
    }

    const reason = blockReason.trim();
    Alert.alert(
      "Block Online Booking?",
      "This stops new online bookings and reschedules for this client. Existing appointments are not cancelled automatically.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Block Client", style: "destructive", onPress: () => onUpdate({ blocked: true, block_reason: reason || "Blocked By Barber" }) },
      ],
    );
  };

  return <View style={styles.card}>
    <View style={styles.header}>
      <View style={styles.headerCopy}>
        <Text style={styles.eyebrow}>MANAGEMENT</Text>
        <Text style={styles.title}>Client Controls</Text>
      </View>
      <View style={[styles.statusPill, client?.blocked && styles.statusPillBlocked]}>
        <Text style={[styles.statusText, client?.blocked && styles.statusTextBlocked]}>{client?.blocked ? "BLOCKED" : "ACTIVE"}</Text>
      </View>
    </View>

    {client?.blocked ? <View style={styles.blockedBanner}>
      <Text style={styles.blockedTitle}>Online Booking Blocked</Text>
      <Text style={styles.blockedText}>{client.block_reason || "No reason saved."}</Text>
      <Text style={styles.blockedMeta}>Existing appointments stay in the schedule unless you cancel them separately.</Text>
    </View> : null}

    <View style={styles.reliabilityCard}>
      <View style={styles.reliabilityTop}>
        <View><Text style={styles.sectionLabelTop}>CLIENT RELIABILITY</Text><Text style={styles.reliabilityText}>{reliability.text}</Text></View>
        <View style={[styles.reliabilityPill, reliability.tone === "good" && styles.reliabilityGood, reliability.tone === "watch" && styles.reliabilityWatch, reliability.tone === "risk" && styles.reliabilityRisk]}><Text style={[styles.reliabilityPillText, reliability.tone === "good" && styles.reliabilityGoodText, reliability.tone === "watch" && styles.reliabilityWatchText, reliability.tone === "risk" && styles.reliabilityRiskText]}>{reliability.label}</Text></View>
      </View>
      <View style={styles.reliabilityStats}>
        <View style={styles.reliabilityStat}><Text style={styles.reliabilityNumber}>{client?.completed_count || 0}</Text><Text style={styles.reliabilityStatLabel}>COMPLETED</Text></View>
        <View style={styles.reliabilityStat}><Text style={styles.reliabilityNumber}>{client?.no_show_count || 0}</Text><Text style={styles.reliabilityStatLabel}>NO-SHOWS</Text></View>
        <View style={styles.reliabilityStat}><Text style={styles.reliabilityNumber}>{client?.cancelled_count || 0}</Text><Text style={styles.reliabilityStatLabel}>CANCELLED</Text></View>
      </View>
    </View>

    <View style={styles.sectionHeadingRow}><Text style={styles.sectionLabel}>CLIENT TAGS</Text>{tags.length ? <Pressable disabled={busy} onPress={clearTags}><Text style={styles.clearText}>CLEAR</Text></Pressable> : null}</View>
    <Text style={styles.help}>Use tags to spot important client context quickly. They are private and only visible in Admin.</Text>
    <View style={styles.tagsWrap}>
      {QUICK_TAGS.map((tag) => {
        const active = tagSet.has(tag.toLowerCase());
        return <Pressable key={tag} disabled={busy} onPress={() => toggleTag(tag)} style={[styles.tag, active && styles.tagActive]}>
          <Text style={[styles.tagText, active && styles.tagTextActive]}>{active ? "✓ " : ""}{tag}</Text>
        </Pressable>;
      })}
    </View>

    {tags.filter((tag) => !QUICK_TAGS.some((quick) => quick.toLowerCase() === tag.toLowerCase())).length ? <View style={styles.customTagsWrap}>
      {tags.filter((tag) => !QUICK_TAGS.some((quick) => quick.toLowerCase() === tag.toLowerCase())).map((tag) => <Pressable key={tag} disabled={busy} onPress={() => toggleTag(tag)} style={[styles.tag, styles.tagActive]}><Text style={[styles.tagText, styles.tagTextActive]}>× {tag}</Text></Pressable>)}
    </View> : null}

    <View style={styles.customRow}>
      <TextInput
        value={customTag}
        onChangeText={setCustomTag}
        maxLength={28}
        placeholder="Add Custom Tag"
        placeholderTextColor="#555"
        style={styles.input}
        onSubmitEditing={addCustomTag}
        returnKeyType="done"
      />
      <Pressable disabled={!customTag.trim() || busy} onPress={addCustomTag} style={[styles.addButton, (!customTag.trim() || busy) && styles.disabled]}><Text style={styles.addButtonText}>ADD</Text></Pressable>
    </View>
    <Pressable disabled={!dirty || busy} onPress={saveTags} style={[styles.saveButton, (!dirty || busy) && styles.disabled]}><Text style={styles.saveButtonText}>{busy ? "SAVING…" : dirty ? "SAVE CLIENT TAGS" : "TAGS SAVED"}</Text></Pressable>

    <View style={styles.divider} />
    <Text style={styles.sectionLabel}>BOOKING ACCESS</Text>
    <Text style={styles.help}>Blocking is for clients you do not want making new bookings through the app. It does not erase their history.</Text>
    {!client?.blocked ? <>
      <Text style={styles.reasonLabel}>QUICK REASON</Text>
      <View style={styles.reasonPresets}>{BLOCK_REASONS.map((reason) => <Pressable key={reason} disabled={busy} onPress={() => setBlockReason(reason)} style={[styles.reasonChip, blockReason === reason && styles.reasonChipActive]}><Text style={[styles.reasonChipText, blockReason === reason && styles.reasonChipTextActive]}>{reason}</Text></Pressable>)}</View>
      <TextInput
        value={blockReason}
        onChangeText={setBlockReason}
        maxLength={300}
        multiline
        placeholder="Optional Private Reason — e.g. Repeated No-Shows"
        placeholderTextColor="#555"
        style={[styles.input, styles.reasonInput]}
      />
    </> : null}
    <Pressable disabled={busy} onPress={requestBlockChange} style={[styles.accessButton, client?.blocked ? styles.unblockButton : styles.blockButton, busy && styles.disabled]}>
      <Text style={[styles.accessButtonText, client?.blocked ? styles.unblockText : styles.blockText]}>{busy ? "UPDATING…" : client?.blocked ? "UNBLOCK ONLINE BOOKING" : "BLOCK ONLINE BOOKING"}</Text>
    </Pressable>
  </View>;
}

const styles = StyleSheet.create({
  card:{marginTop:14,borderRadius:19,borderWidth:1,borderColor:"#2D281F",backgroundColor:"#0B0A08",padding:16},
  header:{flexDirection:"row",alignItems:"flex-start",justifyContent:"space-between",gap:12},headerCopy:{flex:1},eyebrow:{color:GOLD,fontSize:7.5,letterSpacing:1.6,fontWeight:"900"},title:{color:"#F0F0F0",fontSize:18,fontWeight:"700",marginTop:5},
  statusPill:{borderRadius:13,borderWidth:1,borderColor:"#3E452F",backgroundColor:"#0E130B",paddingHorizontal:9,paddingVertical:6},statusPillBlocked:{borderColor:"#5D2D27",backgroundColor:"#160B09"},statusText:{color:"#91A76D",fontSize:6.3,letterSpacing:.9,fontWeight:"900"},statusTextBlocked:{color:"#D98778"},
  blockedBanner:{marginTop:13,borderRadius:14,borderWidth:1,borderColor:"#502B27",backgroundColor:"#130A09",padding:13},blockedTitle:{color:"#E4A095",fontSize:11,fontWeight:"800"},blockedText:{color:"#C98B82",fontSize:9,marginTop:5},blockedMeta:{color:"#7D625E",fontSize:7.5,lineHeight:12,marginTop:7},
  reliabilityCard:{marginTop:13,borderRadius:15,borderWidth:1,borderColor:"#26231D",backgroundColor:"#0D0C09",padding:13},reliabilityTop:{flexDirection:"row",alignItems:"flex-start",justifyContent:"space-between",gap:10},sectionLabelTop:{color:"#8C744A",fontSize:6.8,letterSpacing:1.3,fontWeight:"900"},reliabilityText:{color:MUTED,fontSize:8.5,marginTop:5,maxWidth:190},reliabilityPill:{borderRadius:11,borderWidth:1,borderColor:"#343434",backgroundColor:"#111",paddingHorizontal:8,paddingVertical:6},reliabilityPillText:{color:"#8C8C8C",fontSize:5.8,letterSpacing:.7,fontWeight:"900"},reliabilityGood:{borderColor:"#3D4D2E",backgroundColor:"#0F140B"},reliabilityGoodText:{color:"#9BAE79"},reliabilityWatch:{borderColor:"#5A4523",backgroundColor:"#171107"},reliabilityWatchText:{color:GOLD_LIGHT},reliabilityRisk:{borderColor:"#5D2D27",backgroundColor:"#160B09"},reliabilityRiskText:{color:"#D98778"},reliabilityStats:{flexDirection:"row",gap:8,marginTop:13},reliabilityStat:{flex:1,borderRadius:11,borderWidth:1,borderColor:"#222",backgroundColor:"#090909",paddingVertical:9,alignItems:"center"},reliabilityNumber:{color:"#EFEFEF",fontSize:16,fontWeight:"800"},reliabilityStatLabel:{color:"#6F6554",fontSize:5.6,letterSpacing:.7,fontWeight:"900",marginTop:3},
  sectionHeadingRow:{marginTop:17,flexDirection:"row",alignItems:"center",justifyContent:"space-between"},sectionLabel:{color:"#8C744A",fontSize:6.8,letterSpacing:1.3,fontWeight:"900",marginTop:17},sectionHeadingRow:{marginTop:17,flexDirection:"row",alignItems:"center",justifyContent:"space-between"},sectionHeadingRowSection:{marginTop:0},clearText:{color:"#9B665F",fontSize:6.2,letterSpacing:.8,fontWeight:"900"},help:{color:MUTED,fontSize:8.8,lineHeight:14,marginTop:6},tagsWrap:{flexDirection:"row",flexWrap:"wrap",gap:7,marginTop:11},customTagsWrap:{flexDirection:"row",flexWrap:"wrap",gap:7,marginTop:7},tag:{borderRadius:13,borderWidth:1,borderColor:BORDER,backgroundColor:PANEL,paddingHorizontal:10,paddingVertical:8},tagActive:{borderColor:"#5A4523",backgroundColor:"#171107"},tagText:{color:"#777",fontSize:7.3,fontWeight:"800"},tagTextActive:{color:GOLD_LIGHT},
  customRow:{flexDirection:"row",gap:8,marginTop:10},input:{flex:1,minHeight:46,borderRadius:12,borderWidth:1,borderColor:"#282828",backgroundColor:"#090909",paddingHorizontal:12,color:"#EFEFEF",fontSize:9.5},addButton:{width:62,borderRadius:12,backgroundColor:"#171107",borderWidth:1,borderColor:"#4D3B1E",alignItems:"center",justifyContent:"center"},addButtonText:{color:GOLD_LIGHT,fontSize:7,letterSpacing:.8,fontWeight:"900"},saveButton:{minHeight:44,borderRadius:12,backgroundColor:GOLD,alignItems:"center",justifyContent:"center",marginTop:9},saveButtonText:{color:"#090909",fontSize:7.5,letterSpacing:.9,fontWeight:"900"},
  divider:{height:1,backgroundColor:"#211D17",marginTop:18},reasonLabel:{color:"#6F6554",fontSize:5.9,letterSpacing:.9,fontWeight:"900",marginTop:12},reasonPresets:{flexDirection:"row",flexWrap:"wrap",gap:7,marginTop:8},reasonChip:{borderRadius:12,borderWidth:1,borderColor:"#2A2A2A",backgroundColor:"#0B0B0B",paddingHorizontal:9,paddingVertical:7},reasonChipActive:{borderColor:"#5D2D27",backgroundColor:"#160B09"},reasonChipText:{color:"#777",fontSize:6.6,fontWeight:"800"},reasonChipTextActive:{color:"#D98778"},reasonInput:{minHeight:78,marginTop:10,paddingTop:12,textAlignVertical:"top"},accessButton:{minHeight:48,borderRadius:13,alignItems:"center",justifyContent:"center",marginTop:10,borderWidth:1},blockButton:{borderColor:"#5D2D27",backgroundColor:"#160B09"},unblockButton:{borderColor:"#4D3B1E",backgroundColor:"#171107"},accessButtonText:{fontSize:7.5,letterSpacing:.9,fontWeight:"900"},blockText:{color:"#E09A8F"},unblockText:{color:GOLD_LIGHT},disabled:{opacity:.42},
});
