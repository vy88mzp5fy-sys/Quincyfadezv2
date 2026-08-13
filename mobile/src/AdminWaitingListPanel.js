import React from "react";
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

const GOLD = "#D6BD7A";
const GOLD_LIGHT = "#F1DDA2";
const BG = "#050505";
const PANEL = "#0D0D0D";
const BORDER = "#242424";

function preference(entry) {
  const parts = [];
  if (entry.preferred_date) parts.push(entry.preferred_date);
  if (entry.earliest_time || entry.latest_time) parts.push(`${entry.earliest_time || "Any"}–${entry.latest_time || "Any"}`);
  return parts.length ? parts.join(" · ") : "Any suitable date and time";
}

export default function AdminWaitingListPanel({ visible, enabled, entries = [], loading, busyId, onClose, onRefresh, onOpenSchedule, onRemove }) {
  return <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
    <View style={styles.screen}>
      <View style={styles.header}>
        <View><Text style={styles.eyebrow}>QUINCYFADEZ ADMIN</Text><Text style={styles.title}>Waiting List</Text></View>
        <Pressable onPress={onClose} style={styles.close}><Text style={styles.closeText}>×</Text></Pressable>
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.state, enabled && styles.stateOn]}>
          <View style={{flex:1}}><Text style={styles.stateTitle}>{enabled ? "WAITING LIST ON" : "WAITING LIST OFF"}</Text><Text style={styles.stateText}>{enabled ? "Clients can join when they want a suitable slot." : "Turn Waiting List on in Settings before accepting new requests."}</Text></View>
          <View style={[styles.dot, enabled && styles.dotOn]} />
        </View>
        <View style={styles.sectionHead}>
          <View><Text style={styles.sectionEyebrow}>ACTIVE QUEUE</Text><Text style={styles.sectionTitle}>{entries.length} Waiting</Text></View>
          <Pressable disabled={loading} onPress={onRefresh} style={styles.refresh}><Text style={styles.refreshText}>{loading ? "…" : "REFRESH"}</Text></Pressable>
        </View>
        {loading && !entries.length ? <View style={styles.empty}><ActivityIndicator color={GOLD_LIGHT}/><Text style={styles.emptyText}>Loading waiting list…</Text></View> : entries.length ? <View style={styles.list}>
          {entries.map((entry) => {
            const client = entry.client || {};
            const busy = busyId === entry.id;
            return <View key={entry.id} style={styles.card}>
              <View style={styles.cardTop}><View style={{flex:1}}><Text style={styles.client}>{client.name || "Client"}</Text><Text style={styles.service}>{entry.service}</Text></View><Text style={styles.status}>{entry.status === "notified" ? "ALERT SENT" : "WAITING"}</Text></View>
              <View style={styles.preference}><Text style={styles.preferenceLabel}>PREFERRED SLOT</Text><Text style={styles.preferenceValue}>{preference(entry)}</Text></View>
              <View style={styles.actions}>
                <Pressable disabled={busy} onPress={() => onOpenSchedule?.(entry)} style={[styles.primary,busy&&styles.disabled]}><Text style={styles.primaryText}>FIND MATCHING SLOT</Text><Text style={styles.arrow}>›</Text></Pressable>
                <Pressable disabled={busy} onPress={() => onRemove?.(entry)} style={[styles.remove,busy&&styles.disabled]}><Text style={styles.removeText}>{busy ? "UPDATING…" : "REMOVE"}</Text></Pressable>
              </View>
            </View>;
          })}
        </View> : <View style={styles.empty}><Text style={styles.emptyTitle}>NO CLIENTS WAITING</Text><Text style={styles.emptyText}>New waiting-list requests will appear here with their service and preferred slot window.</Text></View>}
        <View style={styles.info}><Text style={styles.infoTitle}>REAL SLOTS ONLY</Text><Text style={styles.infoText}>Open Schedule and choose a real available slot before sending an alert. The alert must match the client’s saved preferences.</Text></View>
      </ScrollView>
    </View>
  </Modal>;
}

const styles = StyleSheet.create({screen:{flex:1,backgroundColor:BG},header:{minHeight:78,paddingHorizontal:18,borderBottomWidth:1,borderBottomColor:"#191919",flexDirection:"row",alignItems:"center",justifyContent:"space-between"},eyebrow:{color:GOLD,fontSize:7,letterSpacing:1.6,fontWeight:"900"},title:{color:"#F4F4F4",fontSize:22,fontWeight:"750",marginTop:4},close:{width:40,height:40,borderRadius:20,borderWidth:1,borderColor:BORDER,backgroundColor:PANEL,alignItems:"center",justifyContent:"center"},closeText:{color:GOLD_LIGHT,fontSize:24},content:{padding:18,paddingBottom:44},state:{borderRadius:16,borderWidth:1,borderColor:"#342424",backgroundColor:"#0D0808",padding:14,flexDirection:"row",alignItems:"center",gap:12},stateOn:{borderColor:"#3C3220",backgroundColor:"#0D0B07"},stateTitle:{color:GOLD_LIGHT,fontSize:7.5,letterSpacing:1.2,fontWeight:"900"},stateText:{color:"#888",fontSize:8,lineHeight:13,marginTop:5},dot:{width:10,height:10,borderRadius:5,backgroundColor:"#4A2929"},dotOn:{backgroundColor:GOLD},sectionHead:{marginTop:23,marginBottom:10,flexDirection:"row",alignItems:"flex-end",justifyContent:"space-between"},sectionEyebrow:{color:GOLD,fontSize:6.5,letterSpacing:1.2,fontWeight:"900"},sectionTitle:{color:"#F2F2F2",fontSize:19,fontWeight:"750",marginTop:4},refresh:{paddingHorizontal:12,paddingVertical:8,borderRadius:12,borderWidth:1,borderColor:"#30291D"},refreshText:{color:GOLD_LIGHT,fontSize:6.5,letterSpacing:.8,fontWeight:"900"},list:{gap:9},card:{borderRadius:17,borderWidth:1,borderColor:BORDER,backgroundColor:PANEL,padding:15},cardTop:{flexDirection:"row",alignItems:"flex-start",gap:10},client:{color:"#F0F0F0",fontSize:14,fontWeight:"800"},service:{color:GOLD_LIGHT,fontSize:9.5,fontWeight:"700",marginTop:4},status:{color:GOLD,fontSize:5.8,letterSpacing:.65,fontWeight:"900"},preference:{marginTop:12,borderRadius:12,backgroundColor:"#090909",borderWidth:1,borderColor:"#1E1E1E",padding:11},preferenceLabel:{color:"#776747",fontSize:5.8,letterSpacing:.9,fontWeight:"900"},preferenceValue:{color:"#D7D7D7",fontSize:9.5,fontWeight:"650",marginTop:5},actions:{marginTop:13,flexDirection:"row",gap:7},primary:{flex:1,minHeight:42,borderRadius:12,backgroundColor:GOLD,flexDirection:"row",alignItems:"center",justifyContent:"space-between",paddingHorizontal:13},primaryText:{color:"#090909",fontSize:6.4,letterSpacing:.65,fontWeight:"900"},arrow:{color:"#090909",fontSize:19},remove:{minWidth:78,minHeight:42,borderRadius:12,borderWidth:1,borderColor:"#3A2A2A",alignItems:"center",justifyContent:"center",paddingHorizontal:11},removeText:{color:"#B88A8A",fontSize:6.2,letterSpacing:.65,fontWeight:"900"},empty:{minHeight:120,borderRadius:17,borderWidth:1,borderColor:BORDER,backgroundColor:PANEL,alignItems:"center",justifyContent:"center",padding:22,gap:9},emptyTitle:{color:"#EDEDED",fontSize:9,letterSpacing:1,fontWeight:"900"},emptyText:{color:"#888",fontSize:8,lineHeight:13,textAlign:"center"},info:{marginTop:13,borderRadius:15,borderWidth:1,borderColor:"#282319",backgroundColor:"#0B0906",padding:14},infoTitle:{color:GOLD,fontSize:6.5,letterSpacing:1,fontWeight:"900"},infoText:{color:"#817A6E",fontSize:7.7,lineHeight:12.5,marginTop:5},disabled:{opacity:.45}});
