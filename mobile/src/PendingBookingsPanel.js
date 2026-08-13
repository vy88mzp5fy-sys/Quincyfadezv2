import React from "react";
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

const GOLD = "#C99B4A";
const GOLD_LIGHT = "#E7C77A";
const BG = "#050505";
const PANEL = "#0D0D0D";
const BORDER = "#242424";

function money(value) {
  const number = Number(value || 0);
  return `£${number.toFixed(number % 1 ? 2 : 0)}`;
}

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
}

function formatTime(value) {
  if (!value) return "—";
  return new Date(value).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false });
}

export default function PendingBookingsPanel({ visible, bookings = [], loading, actionBusy, onClose, onRefresh, onAction }) {
  return <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
    <View style={styles.backdrop}>
      <Pressable style={styles.dismissArea} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <View style={styles.header}>
          <View style={styles.headerCopy}>
            <Text style={styles.eyebrow}>BOOKING REQUESTS</Text>
            <Text style={styles.title}>Pending Bookings</Text>
            <Text style={styles.meta}>{bookings.length ? `${bookings.length} Waiting For Your Approval` : "Nothing Waiting Right Now"}</Text>
          </View>
          <Pressable onPress={onClose} style={styles.closeButton}><Text style={styles.closeText}>×</Text></Pressable>
        </View>

        <View style={styles.topActions}>
          <Text style={styles.help}>Pending requests live here on their own, separate from your confirmed diary.</Text>
          <Pressable disabled={loading} onPress={onRefresh} style={styles.refreshButton}>{loading ? <ActivityIndicator size="small" color={GOLD_LIGHT} /> : <Text style={styles.refreshText}>REFRESH</Text>}</Pressable>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
          {loading && !bookings.length ? <View style={styles.emptyCard}><ActivityIndicator color={GOLD_LIGHT} /><Text style={styles.emptyTitle}>Checking Requests…</Text></View> : null}
          {!loading && !bookings.length ? <View style={styles.emptyCard}><Text style={styles.emptyIcon}>✓</Text><Text style={styles.emptyTitle}>All Clear</Text><Text style={styles.emptyText}>New booking requests will appear here automatically when approval is required.</Text></View> : null}
          {bookings.map((booking) => {
            const busy = actionBusy === booking.id;
            return <View key={booking.id} style={styles.requestCard}>
              <View style={styles.requestTop}>
                <View style={styles.timeBadge}><Text style={styles.time}>{formatTime(booking.start_at)}</Text><Text style={styles.duration}>{booking.duration_minutes || 0} MIN</Text></View>
                <View style={styles.requestCopy}><Text style={styles.name}>{booking.customer_name || "Client"}</Text><Text style={styles.service}>{booking.service}</Text><Text style={styles.detail}>{formatDate(booking.start_at)} · {money(booking.price)}</Text>{booking.customer_phone ? <Text style={styles.contact}>{booking.customer_phone}</Text> : null}</View>
                <View style={styles.pendingPill}><Text style={styles.pendingText}>PENDING</Text></View>
              </View>
              <View style={styles.actions}>
                <Pressable disabled={busy} onPress={() => onAction(booking, "confirmed")} style={[styles.approveButton, busy && styles.disabled]}><Text style={styles.approveText}>{busy ? "WORKING…" : "APPROVE"}</Text></Pressable>
                <Pressable disabled={busy} onPress={() => onAction(booking, "cancelled")} style={[styles.declineButton, busy && styles.disabled]}><Text style={styles.declineText}>DECLINE</Text></Pressable>
              </View>
            </View>;
          })}
        </ScrollView>
      </View>
    </View>
  </Modal>;
}

const styles = StyleSheet.create({
  backdrop:{flex:1,backgroundColor:"rgba(0,0,0,.68)",justifyContent:"flex-end"},dismissArea:{flex:1},sheet:{maxHeight:"82%",minHeight:"56%",backgroundColor:BG,borderTopLeftRadius:28,borderTopRightRadius:28,borderWidth:1,borderColor:"#332A1D",paddingHorizontal:18,paddingTop:10,paddingBottom:26},handle:{width:42,height:4,borderRadius:2,backgroundColor:"#3B3328",alignSelf:"center",marginBottom:16},header:{flexDirection:"row",alignItems:"flex-start",justifyContent:"space-between",gap:12},headerCopy:{flex:1},eyebrow:{color:GOLD,fontSize:7.5,letterSpacing:1.7,fontWeight:"900"},title:{color:"#F4F4F4",fontSize:26,fontWeight:"750",marginTop:5},meta:{color:"#8E7A57",fontSize:8.5,marginTop:7,fontWeight:"700"},closeButton:{width:38,height:38,borderRadius:19,borderWidth:1,borderColor:BORDER,backgroundColor:PANEL,alignItems:"center",justifyContent:"center"},closeText:{color:"#B6A078",fontSize:23,lineHeight:25},topActions:{marginTop:15,paddingBottom:12,borderBottomWidth:1,borderBottomColor:"#1B1B1B",flexDirection:"row",alignItems:"center",gap:12},help:{flex:1,color:"#858585",fontSize:9,lineHeight:14},refreshButton:{minWidth:70,height:34,borderRadius:12,borderWidth:1,borderColor:"#40351F",backgroundColor:"#120F08",alignItems:"center",justifyContent:"center"},refreshText:{color:GOLD_LIGHT,fontSize:6.5,letterSpacing:1,fontWeight:"900"},list:{paddingBottom:20},requestCard:{marginTop:11,borderRadius:18,borderWidth:1,borderColor:"#3A3020",backgroundColor:"#0E0B07",padding:13},requestTop:{flexDirection:"row",alignItems:"center",gap:11},timeBadge:{width:54},time:{color:GOLD_LIGHT,fontSize:15,fontWeight:"900"},duration:{color:"#71654D",fontSize:6.3,marginTop:4},requestCopy:{flex:1},name:{color:"#F1F1F1",fontSize:13,fontWeight:"750"},service:{color:"#AEAEAE",fontSize:9,marginTop:3},detail:{color:"#777",fontSize:7.5,marginTop:5},contact:{color:"#806E50",fontSize:7.5,marginTop:4},pendingPill:{borderRadius:11,borderWidth:1,borderColor:"#6A4F20",backgroundColor:"#171005",paddingHorizontal:7,paddingVertical:5},pendingText:{color:GOLD_LIGHT,fontSize:5.8,letterSpacing:.7,fontWeight:"900"},actions:{flexDirection:"row",gap:8,marginTop:12,paddingTop:11,borderTopWidth:1,borderTopColor:"#221D15"},approveButton:{flex:1,minHeight:42,borderRadius:12,backgroundColor:GOLD,alignItems:"center",justifyContent:"center"},approveText:{color:"#090909",fontSize:7.2,letterSpacing:.9,fontWeight:"900"},declineButton:{flex:1,minHeight:42,borderRadius:12,borderWidth:1,borderColor:"#58322C",backgroundColor:"#150B0A",alignItems:"center",justifyContent:"center"},declineText:{color:"#D88D82",fontSize:7.2,letterSpacing:.9,fontWeight:"900"},emptyCard:{marginTop:18,borderRadius:20,borderWidth:1,borderColor:BORDER,backgroundColor:PANEL,paddingHorizontal:22,paddingVertical:32,alignItems:"center"},emptyIcon:{color:GOLD_LIGHT,fontSize:25,fontWeight:"900"},emptyTitle:{color:"#EFEFEF",fontSize:17,fontWeight:"750",marginTop:7},emptyText:{color:"#858585",fontSize:9,lineHeight:15,textAlign:"center",marginTop:7,maxWidth:270},disabled:{opacity:.45},
});
