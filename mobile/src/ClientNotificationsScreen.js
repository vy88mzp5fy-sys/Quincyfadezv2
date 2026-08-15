import React,{useEffect,useState} from "react";
import {Pressable,SafeAreaView,ScrollView,StatusBar,StyleSheet,Text,View} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {BrandLogo,M,Marble,Surface} from "./QFTheme";
import {ClientHeader} from "./ClientLuxuryUI";

const PREFS="quincyfadez.clientPrefs";
const defaults={confirmations:true,reminders:true,reschedule:true,waitlist:true,reviews:true};
function Toggle({value,onPress}){return <Pressable onPress={onPress} style={[s.toggle,value&&s.toggleOn]}><View style={[s.knob,value&&s.knobOn]}/></Pressable>}
function Row({icon,title,sub,value,onPress,last=false}){return <View style={[s.row,!last&&s.line]}><View style={s.icon}><Text style={s.iconText}>{icon}</Text></View><View style={{flex:1}}><Text style={s.rowTitle}>{title}</Text><Text style={s.rowSub}>{sub}</Text></View><Toggle value={value} onPress={onPress}/></View>}

export default function ClientNotificationsScreen({onBack}){
  const[prefs,setPrefs]=useState(defaults),[saved,setSaved]=useState(false);
  useEffect(()=>{AsyncStorage.getItem(PREFS).then(v=>{if(v)try{setPrefs({...defaults,...JSON.parse(v)})}catch(_){}})},[]);
  const toggle=k=>setPrefs(p=>{const n={...p,[k]:!p[k]};AsyncStorage.setItem(PREFS,JSON.stringify(n)).then(()=>{setSaved(true);setTimeout(()=>setSaved(false),1300)});return n});
  return <Marble><SafeAreaView style={s.safe}><StatusBar barStyle="light-content"/><ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
    <ClientHeader title="Notifications" subtitle="Choose which appointment updates and useful reminders you want to receive." onBack={onBack}/>
    {saved?<View style={s.saved}><Text style={s.savedText}>✓ Saved</Text></View>:null}
    <Surface style={s.card}><Row icon="✅" title="Booking confirmations" sub="Know when a booking request is accepted or confirmed." value={prefs.confirmations} onPress={()=>toggle("confirmations")}/><Row icon="⏰" title="Appointment reminders" sub="Helpful reminders before your upcoming appointment." value={prefs.reminders} onPress={()=>toggle("reminders")}/><Row icon="🔁" title="Reschedule updates" sub="Be alerted if an appointment time changes." value={prefs.reschedule} onPress={()=>toggle("reschedule")}/><Row icon="🔔" title="Waitlist alerts" sub="Hear quickly when a suitable cancellation opens up." value={prefs.waitlist} onPress={()=>toggle("waitlist")}/><Row icon="⭐" title="Review reminders" sub="A light reminder after a completed visit." value={prefs.reviews} onPress={()=>toggle("reviews")} last/></Surface>
    <Surface style={s.note}><BrandLogo size={44}/><View style={{flex:1}}><Text style={s.noteTitle}>Only useful updates</Text><Text style={s.noteText}>QuincyFadez notifications are designed around your booking, not marketing noise.</Text></View></Surface>
  </ScrollView></SafeAreaView></Marble>;
}

const s=StyleSheet.create({safe:{flex:1},content:{paddingHorizontal:18,paddingTop:4,paddingBottom:84},saved:{alignSelf:"flex-end",height:34,borderRadius:17,borderWidth:1,borderColor:"rgba(120,214,164,.22)",backgroundColor:"rgba(120,214,164,.08)",paddingHorizontal:12,alignItems:"center",justifyContent:"center",marginTop:5,marginBottom:8},savedText:{color:M.green,fontSize:10,fontWeight:"900"},card:{overflow:"hidden",marginTop:9,backgroundColor:M.panel2},row:{minHeight:90,paddingHorizontal:14,paddingVertical:14,flexDirection:"row",alignItems:"center",gap:13},line:{borderBottomWidth:1,borderBottomColor:"rgba(255,255,255,.075)"},icon:{width:46,height:46,borderRadius:15,backgroundColor:M.panel3,borderWidth:1,borderColor:"rgba(255,255,255,.11)",alignItems:"center",justifyContent:"center"},iconText:{fontSize:20},rowTitle:{color:M.text,fontSize:14.5,fontWeight:"800"},rowSub:{color:M.muted,fontSize:11,lineHeight:15.5,marginTop:5,paddingRight:8},toggle:{width:54,height:31,borderRadius:16,borderWidth:1,borderColor:"rgba(255,255,255,.11)",backgroundColor:"#31343A",padding:3,justifyContent:"center"},toggleOn:{backgroundColor:M.accent,borderColor:M.accentBright},knob:{width:23,height:23,borderRadius:12,backgroundColor:M.muted},knobOn:{alignSelf:"flex-end",backgroundColor:M.bg},note:{padding:17,marginTop:15,flexDirection:"row",gap:12,alignItems:"center",backgroundColor:M.panel2,borderColor:"rgba(255,255,255,.11)"},noteTitle:{color:M.text,fontSize:14,fontWeight:"800"},noteText:{color:M.muted,fontSize:11,lineHeight:16,marginTop:5}});
