import React,{useEffect,useState} from "react";
import {Pressable,SafeAreaView,ScrollView,StatusBar,StyleSheet,Text,View} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {M,Marble,Surface} from "./QFTheme";
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
    {saved?<View style={s.saved}><Text style={s.savedText}>Saved</Text></View>:null}
    <Surface style={s.card}><Row icon="✓" title="Booking confirmations" sub="Know when a booking request is accepted or confirmed." value={prefs.confirmations} onPress={()=>toggle("confirmations")}/><Row icon="◷" title="Appointment reminders" sub="Helpful reminders before your upcoming appointment." value={prefs.reminders} onPress={()=>toggle("reminders")}/><Row icon="↻" title="Reschedule updates" sub="Be alerted if an appointment time changes." value={prefs.reschedule} onPress={()=>toggle("reschedule")}/><Row icon="◉" title="Waitlist alerts" sub="Hear quickly when a suitable cancellation opens up." value={prefs.waitlist} onPress={()=>toggle("waitlist")}/><Row icon="☆" title="Review reminders" sub="A light reminder after a completed visit." value={prefs.reviews} onPress={()=>toggle("reviews")} last/></Surface>
    <Surface style={s.note}><View style={s.noteMark}><Text style={s.noteMarkText}>QF</Text></View><View style={{flex:1}}><Text style={s.noteTitle}>Only useful updates</Text><Text style={s.noteText}>QuincyFadez notifications are designed around your booking, not marketing noise.</Text></View></Surface>
  </ScrollView></SafeAreaView></Marble>;
}

const s=StyleSheet.create({safe:{flex:1},content:{paddingHorizontal:18,paddingTop:4,paddingBottom:80},saved:{alignSelf:"flex-end",height:30,borderRadius:15,borderWidth:1,borderColor:"rgba(110,231,190,.18)",backgroundColor:"rgba(110,231,190,.06)",paddingHorizontal:11,alignItems:"center",justifyContent:"center",marginTop:4,marginBottom:7},savedText:{color:M.green,fontSize:8.5,fontWeight:"800"},card:{overflow:"hidden",marginTop:8},row:{minHeight:82,paddingHorizontal:13,paddingVertical:13,flexDirection:"row",alignItems:"center",gap:11},line:{borderBottomWidth:1,borderBottomColor:"rgba(255,255,255,.055)"},icon:{width:40,height:40,borderRadius:13,backgroundColor:"rgba(169,184,255,.09)",borderWidth:1,borderColor:"rgba(169,184,255,.14)",alignItems:"center",justifyContent:"center"},iconText:{color:M.accentSoft,fontSize:14,fontWeight:"800"},rowTitle:{color:M.text,fontSize:12.5,fontWeight:"700"},rowSub:{color:M.muted,fontSize:8.8,lineHeight:13,marginTop:4,paddingRight:8},toggle:{width:50,height:29,borderRadius:15,borderWidth:1,borderColor:"rgba(255,255,255,.08)",backgroundColor:"#202733",padding:3,justifyContent:"center"},toggleOn:{backgroundColor:M.accent,borderColor:M.accent},knob:{width:21,height:21,borderRadius:11,backgroundColor:M.muted},knobOn:{alignSelf:"flex-end",backgroundColor:M.bg},note:{padding:15,marginTop:14,flexDirection:"row",gap:11},noteMark:{width:40,height:40,borderRadius:13,backgroundColor:"rgba(169,184,255,.10)",borderWidth:1,borderColor:"rgba(169,184,255,.15)",alignItems:"center",justifyContent:"center"},noteMarkText:{color:M.accentSoft,fontSize:9,fontWeight:"900"},noteTitle:{color:M.text,fontSize:11.5,fontWeight:"700"},noteText:{color:M.muted,fontSize:9,lineHeight:13.5,marginTop:4}});
