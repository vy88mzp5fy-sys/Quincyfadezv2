import React,{useEffect,useState} from "react";
import {Pressable,SafeAreaView,ScrollView,StatusBar,StyleSheet,Text,View} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {BrandLogo,M,Marble,Surface} from "./QFTheme";
import {ClientHeader} from "./ClientLuxuryUI";
import QFIcon from "./QFIcons";

const PREFS="quincyfadez.clientPrefs";
const defaults={confirmations:true,reminders:true,reschedule:true,waitlist:true,reviews:true};
function Toggle({value,onPress}){return <Pressable onPress={onPress} style={[s.toggle,value&&s.toggleOn]}><View style={[s.knob,value&&s.knobOn]}/></Pressable>}
function Row({icon,title,sub,value,onPress,last=false}){return <View style={[s.row,!last&&s.line]}><View style={s.icon}><QFIcon name={icon} size={24}/></View><View style={{flex:1}}><Text style={s.rowTitle}>{title}</Text><Text style={s.rowSub}>{sub}</Text></View><Toggle value={value} onPress={onPress}/></View>}

export default function ClientNotificationsScreen({onBack}){
  const[prefs,setPrefs]=useState(defaults),[saved,setSaved]=useState(false);
  useEffect(()=>{AsyncStorage.getItem(PREFS).then(v=>{if(v)try{setPrefs({...defaults,...JSON.parse(v)})}catch(_){}})},[]);
  const toggle=k=>setPrefs(p=>{const n={...p,[k]:!p[k]};AsyncStorage.setItem(PREFS,JSON.stringify(n)).then(()=>{setSaved(true);setTimeout(()=>setSaved(false),1300)});return n});
  return <Marble><SafeAreaView style={s.safe}><StatusBar barStyle="light-content"/><ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
    <ClientHeader title="Notifications" subtitle="Choose which appointment updates and useful reminders you want to receive." onBack={onBack}/>
    {saved?<View style={s.saved}><QFIcon name="check" size={17} color={M.green}/><Text style={s.savedText}>Saved</Text></View>:null}
    <Surface style={s.card}><Row icon="check" title="Booking confirmations" sub="Know when a booking request is accepted or confirmed." value={prefs.confirmations} onPress={()=>toggle("confirmations")}/><Row icon="clock" title="Appointment reminders" sub="Helpful reminders before your upcoming appointment." value={prefs.reminders} onPress={()=>toggle("reminders")}/><Row icon="repeat" title="Reschedule updates" sub="Be alerted if an appointment time changes." value={prefs.reschedule} onPress={()=>toggle("reschedule")}/><Row icon="bell" title="Waitlist alerts" sub="Hear quickly when a suitable cancellation opens up." value={prefs.waitlist} onPress={()=>toggle("waitlist")}/><Row icon="star" title="Review reminders" sub="A light reminder after a completed visit." value={prefs.reviews} onPress={()=>toggle("reviews")} last/></Surface>
    <Surface style={s.note}><BrandLogo size={46}/><View style={{flex:1}}><Text style={s.noteTitle}>Only useful updates</Text><Text style={s.noteText}>QuincyFadez notifications are designed around your booking, not marketing noise.</Text></View></Surface>
  </ScrollView></SafeAreaView></Marble>;
}

const s=StyleSheet.create({safe:{flex:1},content:{paddingHorizontal:18,paddingTop:4,paddingBottom:86},saved:{alignSelf:"flex-end",height:36,borderRadius:18,borderWidth:1,borderColor:"rgba(85,216,117,.22)",backgroundColor:M.greenBg,paddingHorizontal:12,alignItems:"center",justifyContent:"center",marginTop:5,marginBottom:8,flexDirection:"row",gap:7},savedText:{color:M.green,fontSize:11.5,fontWeight:"700"},card:{overflow:"hidden",marginTop:9,backgroundColor:M.panel2,borderColor:M.warmBorderSoft},row:{minHeight:94,paddingHorizontal:15,paddingVertical:15,flexDirection:"row",alignItems:"center",gap:14},line:{borderBottomWidth:1,borderBottomColor:"rgba(255,255,255,.08)"},icon:{width:48,height:48,borderRadius:15,backgroundColor:M.panel3,borderWidth:1,borderColor:M.border,alignItems:"center",justifyContent:"center"},rowTitle:{color:M.text,fontSize:15.5,fontWeight:"700"},rowSub:{color:M.muted,fontSize:12.5,lineHeight:17,marginTop:5,paddingRight:8},toggle:{width:55,height:32,borderRadius:16,borderWidth:1,borderColor:M.border,backgroundColor:M.panel4,padding:3,justifyContent:"center"},toggleOn:{backgroundColor:M.accent,borderColor:M.accentBright},knob:{width:24,height:24,borderRadius:12,backgroundColor:M.muted},knobOn:{alignSelf:"flex-end",backgroundColor:M.bg},note:{padding:18,marginTop:16,flexDirection:"row",gap:13,alignItems:"center",backgroundColor:M.panel2,borderColor:M.warmBorderSoft},noteTitle:{color:M.text,fontSize:15.5,fontWeight:"700"},noteText:{color:M.muted,fontSize:12.5,lineHeight:18,marginTop:5}});
