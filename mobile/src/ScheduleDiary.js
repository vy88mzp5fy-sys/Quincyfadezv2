import React, { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

const GOLD = "#C99B4A";
const GOLD_LIGHT = "#E7C77A";
const PANEL = "#0D0D0D";
const BORDER = "#242424";
const LONDON = "Europe/London";

function money(value) {
  const number = Number(value || 0);
  return `£${number.toFixed(number % 1 ? 2 : 0)}`;
}

function londonDateKey(value = new Date()) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: LONDON,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.filter((part) => part.type !== "literal").map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function localDateKey(value) {
  if (!value) return "";
  return londonDateKey(value);
}

function shortDate(value) {
  if (!value) return "—";
  return new Date(`${value}T12:00:00`).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
}

function rangeTitle(startDate, days) {
  if (days === 1) return shortDate(startDate);
  const start = new Date(`${startDate}T12:00:00`);
  const end = new Date(start);
  end.setDate(end.getDate() + days - 1);
  return `${start.toLocaleDateString("en-GB", { day: "numeric", month: "short" })} — ${end.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}`;
}

function formatTime(value) {
  if (!value) return "—";
  return new Date(value).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: LONDON });
}

function formatAppointmentDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", timeZone: LONDON });
}

export default function ScheduleDiary({ bookings = [], view = "week", startDate, onViewChange, onMove, onToday, renderBooking }) {
  const days = view === "day" ? 1 : view === "week" ? 7 : 31;
  const todayKey = londonDateKey();
  const now = Date.now();
  const groups = useMemo(() => {
    const map = new Map();
    bookings.forEach((booking) => {
      const key = localDateKey(booking.start_at);
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(booking);
    });
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([date, items]) => [date, [...items].sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime())]);
  }, [bookings]);

  const confirmedValue = bookings.filter((item) => item.status === "confirmed").reduce((sum, item) => sum + Number(item.price || 0), 0);
  const completedValue = bookings.filter((item) => item.status === "completed").reduce((sum, item) => sum + Number(item.price || 0), 0);
  const nextBooking = useMemo(() => bookings
    .filter((item) => item.status === "confirmed" && new Date(item.start_at).getTime() >= now)
    .sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime())[0] || null, [bookings, now]);
  const viewingToday = startDate === todayKey || (view !== "day" && groups.some(([date]) => date === todayKey));

  return <>
    <View style={styles.viewTabs}>{[["day", "DAY"], ["week", "WEEK"], ["agenda", "AGENDA"]].map(([key, label]) => <Pressable key={key} onPress={() => onViewChange(key)} style={[styles.viewTab, view === key && styles.viewTabActive]}><Text style={[styles.viewTabText, view === key && styles.viewTabTextActive]}>{label}</Text></Pressable>)}</View>

    <View style={styles.navigator}>
      <Pressable accessibilityLabel="Previous period" onPress={() => onMove(-1)} style={styles.navButton}><Text style={styles.navButtonText}>‹</Text></Pressable>
      <View style={styles.navCenter}><Text style={styles.navEyebrow}>{view === "agenda" ? "AGENDA" : view.toUpperCase()}</Text><Text style={styles.navDate}>{rangeTitle(startDate, days)}</Text><Text style={styles.todayHint}>{viewingToday ? "CURRENT PERIOD" : "BROWSING DIARY"}</Text></View>
      <Pressable accessibilityLabel="Next period" onPress={() => onMove(1)} style={styles.navButton}><Text style={styles.navButtonText}>›</Text></Pressable>
    </View>

    <Pressable onPress={onToday} style={[styles.todayButton, viewingToday && styles.todayButtonActive]}>
      <View style={[styles.todayDot, viewingToday && styles.todayDotActive]} />
      <Text style={[styles.todayButtonText, viewingToday && styles.todayButtonTextActive]}>{viewingToday ? "YOU'RE ON TODAY" : "JUMP TO TODAY"}</Text>
    </Pressable>

    {nextBooking ? <View style={styles.nextUpCard}>
      <View style={styles.nextUpCopy}><Text style={styles.nextUpEyebrow}>NEXT UP</Text><Text style={styles.nextUpName}>{nextBooking.customer_name || "Client"}</Text><Text style={styles.nextUpMeta}>{nextBooking.service} · {formatAppointmentDate(nextBooking.start_at)}</Text></View>
      <View style={styles.nextUpTimeWrap}><Text style={styles.nextUpTime}>{formatTime(nextBooking.start_at)}</Text><Text style={styles.nextUpPrice}>{money(nextBooking.price)}</Text></View>
    </View> : null}

    <View style={styles.summaryRow}>
      <View style={styles.summaryCard}><Text style={styles.summaryLabel}>APPOINTMENTS</Text><Text style={styles.summaryValue}>{bookings.length}</Text></View>
      <View style={styles.summaryCard}><Text style={styles.summaryLabel}>BOOKED VALUE</Text><Text style={styles.summaryValue}>{money(confirmedValue)}</Text></View>
      <View style={styles.summaryCard}><Text style={styles.summaryLabel}>COMPLETED</Text><Text style={styles.summaryValue}>{money(completedValue)}</Text></View>
    </View>

    {groups.length ? groups.map(([date, items]) => {
      const isToday = date === todayKey;
      return <View key={date} style={[styles.dayGroup, isToday && styles.dayGroupToday]}>
        <View style={styles.dayHeader}>
          <View>
            <View style={styles.dayEyebrowRow}><Text style={[styles.dayEyebrow, isToday && styles.dayEyebrowToday]}>{new Date(`${date}T12:00:00`).toLocaleDateString("en-GB", { weekday: "long" }).toUpperCase()}</Text>{isToday ? <View style={styles.todayPill}><Text style={styles.todayPillText}>TODAY</Text></View> : null}</View>
            <Text style={styles.dayTitle}>{new Date(`${date}T12:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "long" })}</Text>
          </View>
          <Text style={styles.dayCount}>{items.length} {items.length === 1 ? "BOOKING" : "BOOKINGS"}</Text>
        </View>
        {items.map((booking) => renderBooking(booking))}
      </View>;
    }) : <View style={styles.empty}><Text style={styles.emptyTitle}>No Appointments</Text><Text style={styles.emptyText}>There are no confirmed diary records in this selected period.</Text><Pressable onPress={onToday} style={styles.emptyToday}><Text style={styles.emptyTodayText}>GO TO TODAY</Text></Pressable></View>}
  </>;
}

const styles = StyleSheet.create({
  viewTabs:{flexDirection:"row",gap:5,marginTop:14,borderRadius:14,borderWidth:1,borderColor:"#242424",backgroundColor:"#090909",padding:4},
  viewTab:{flex:1,minHeight:40,borderRadius:10,alignItems:"center",justifyContent:"center"},viewTabActive:{backgroundColor:"#181207",borderWidth:1,borderColor:"#51401F"},viewTabText:{color:"#666",fontSize:6.5,letterSpacing:1,fontWeight:"900"},viewTabTextActive:{color:GOLD_LIGHT},
  navigator:{marginTop:10,minHeight:70,borderRadius:17,borderWidth:1,borderColor:"#2B261D",backgroundColor:"#0B0A08",flexDirection:"row",alignItems:"center"},navButton:{width:54,height:68,alignItems:"center",justifyContent:"center"},navButtonText:{color:GOLD_LIGHT,fontSize:28},navCenter:{flex:1,alignItems:"center",justifyContent:"center"},navEyebrow:{color:GOLD,fontSize:6.3,letterSpacing:1.3,fontWeight:"900"},navDate:{color:"#F0F0F0",fontSize:14,fontWeight:"750",marginTop:4},todayHint:{color:"#62563F",fontSize:5.6,letterSpacing:.8,fontWeight:"800",marginTop:4},
  todayButton:{marginTop:8,minHeight:38,borderRadius:12,borderWidth:1,borderColor:"#292929",backgroundColor:"#0A0A0A",flexDirection:"row",alignItems:"center",justifyContent:"center",gap:7},todayButtonActive:{borderColor:"#4A3A1E",backgroundColor:"#110D06"},todayDot:{width:6,height:6,borderRadius:3,backgroundColor:"#555"},todayDotActive:{backgroundColor:GOLD_LIGHT},todayButtonText:{color:"#777",fontSize:6.2,letterSpacing:1,fontWeight:"900"},todayButtonTextActive:{color:GOLD_LIGHT},
  nextUpCard:{marginTop:9,minHeight:78,borderRadius:16,borderWidth:1,borderColor:"#5A4523",backgroundColor:"#130F07",paddingHorizontal:14,paddingVertical:12,flexDirection:"row",alignItems:"center",justifyContent:"space-between",gap:12},nextUpCopy:{flex:1},nextUpEyebrow:{color:GOLD,fontSize:6.2,letterSpacing:1.2,fontWeight:"900"},nextUpName:{color:"#F0E7D6",fontSize:14,fontWeight:"800",marginTop:4},nextUpMeta:{color:"#8D806C",fontSize:7.2,marginTop:4},nextUpTimeWrap:{alignItems:"flex-end"},nextUpTime:{color:GOLD_LIGHT,fontSize:19,fontWeight:"900"},nextUpPrice:{color:"#8D7751",fontSize:7,marginTop:3,fontWeight:"800"},
  summaryRow:{flexDirection:"row",gap:7,marginTop:10},summaryCard:{flex:1,minHeight:72,borderRadius:14,borderWidth:1,borderColor:BORDER,backgroundColor:PANEL,padding:11,justifyContent:"space-between"},summaryLabel:{color:"#7C6948",fontSize:5.7,letterSpacing:.8,fontWeight:"900"},summaryValue:{color:"#F0F0F0",fontSize:17,fontWeight:"800"},
  dayGroup:{marginTop:13,borderRadius:19,borderWidth:1,borderColor:"#29251D",backgroundColor:"#0B0A08",padding:14},dayGroupToday:{borderColor:"#5A4523",backgroundColor:"#100D07"},dayHeader:{flexDirection:"row",alignItems:"flex-end",justifyContent:"space-between",paddingBottom:5},dayEyebrowRow:{flexDirection:"row",alignItems:"center",gap:7},dayEyebrow:{color:GOLD,fontSize:6.5,letterSpacing:1.25,fontWeight:"900"},dayEyebrowToday:{color:GOLD_LIGHT},todayPill:{borderRadius:9,backgroundColor:GOLD,paddingHorizontal:6,paddingVertical:3},todayPillText:{color:"#090909",fontSize:4.9,letterSpacing:.7,fontWeight:"900"},dayTitle:{color:"#EDEDED",fontSize:15,fontWeight:"750",marginTop:4},dayCount:{color:"#686868",fontSize:6,letterSpacing:.7,fontWeight:"800"},
  empty:{marginTop:14,borderRadius:19,borderWidth:1,borderColor:BORDER,backgroundColor:PANEL,paddingVertical:30,paddingHorizontal:20,alignItems:"center"},emptyTitle:{color:"#EDEDED",fontSize:17,fontWeight:"750"},emptyText:{color:"#808080",fontSize:9,lineHeight:15,textAlign:"center",marginTop:7},emptyToday:{marginTop:14,borderRadius:11,borderWidth:1,borderColor:"#4A3A1E",backgroundColor:"#110D06",paddingHorizontal:13,paddingVertical:9},emptyTodayText:{color:GOLD_LIGHT,fontSize:6.2,letterSpacing:.9,fontWeight:"900"},
});