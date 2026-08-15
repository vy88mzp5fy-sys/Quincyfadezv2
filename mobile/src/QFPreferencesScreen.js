import React,{useEffect,useState} from "react";
import {Pressable,SafeAreaView,ScrollView,StatusBar,StyleSheet,Text,View} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {M,Marble,PrimaryButton,Surface} from "./QFTheme";
import {ClientHeader} from "./ClientLuxuryUI";

const PREFS="quincyfadez.preferences";
const SERVICES=["Haircut","Haircut & Beard","Shape Up","Beard Trim"];
const TIMES=[{key:"Any",title:"Any time",sub:"Show me the first available slot"},{key:"Morning",title:"Morning",sub:"Before 12pm"},{key:"Afternoon",title:"Afternoon",sub:"12pm – 5pm"},{key:"Evening",title:"Evening",sub:"After 5pm"}];

function Choice({title,sub,active,onPress}){return <Pressable onPress={onPress} style={[s.choice,active&&s.choiceOn]}><View style={[s.radio,active&&s.radioOn]}>{active?<View style={s.dot}/>:null}</View><View style={{flex:1}}><Text style={[s.choiceTitle,active&&s.choiceTitleOn]}>{title}</Text>{sub?<Text style={s.choiceSub}>{sub}</Text>:null}</View></Pressable>}

export default function QFPreferencesScreen({onBack}){
  const[service,setService]=useState("Haircut"),[time,setTime]=useState("Any"),[saved,setSaved]=useState(false),[busy,setBusy]=useState(false);
  useEffect(()=>{AsyncStorage.getItem(PREFS).then(v=>{if(!v)return;try{const p=JSON.parse(v);if(SERVICES.includes(p.favoriteService))setService(p.favoriteService);if(TIMES.some(x=>x.key===p.preferredTime))setTime(p.preferredTime)}catch(_){}})},[]);
  const save=async()=>{if(busy)return;setBusy(true);setSaved(false);try{await AsyncStorage.setItem(PREFS,JSON.stringify({favoriteService:service,preferredTime:time,updatedAt:new Date().toISOString()}));setSaved(true)}finally{setBusy(false)}};
  return <Marble><SafeAreaView style={s.safe}><StatusBar barStyle="light-content"/><ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
    <ClientHeader title="Booking preferences" subtitle="Set your usual service and preferred time so repeat bookings start closer to what you want." onBack={onBack}/>
    {saved?<View style={s.saved}><Text style={s.savedText}>✓ Preferences saved</Text></View>:null}
    <Text style={s.section}>YOUR USUAL SERVICE</Text><Surface style={s.card}>{SERVICES.map((x,i)=><View key={x}>{i?<View style={s.line}/>:null}<Choice title={x} sub={x==="Haircut"?"45 min · £20":x==="Haircut & Beard"?"60 min · £25":"15 min · £10"} active={service===x} onPress={()=>{setSaved(false);setService(x)}}/></View>)}</Surface>
    <Text style={s.section}>PREFERRED TIME</Text><Surface style={s.card}>{TIMES.map((x,i)=><View key={x.key}>{i?<View style={s.line}/>:null}<Choice title={x.title} sub={x.sub} active={time===x.key} onPress={()=>{setSaved(false);setTime(x.key)}}/></View>)}</Surface>
    <Surface style={s.note}><View style={s.spark}><Text style={s.sparkText}>✦</Text></View><View style={{flex:1}}><Text style={s.noteTitle}>Smarter repeat booking</Text><Text style={s.noteText}>These preferences don’t lock you in. They simply help QuincyFadez surface the most relevant availability first.</Text></View></Surface>
    <PrimaryButton title={busy?"Saving…":"Save preferences"} subtitle={`${service} · ${time==="Any"?"Any time":time}`} onPress={save} disabled={busy} style={s.primary}/>
  </ScrollView></SafeAreaView></Marble>;
}

const s=StyleSheet.create({
  safe:{flex:1},content:{paddingHorizontal:18,paddingTop:4,paddingBottom:80},saved:{height:42,borderRadius:13,borderWidth:1,borderColor:"rgba(110,231,190,.18)",backgroundColor:"rgba(110,231,190,.06)",alignItems:"center",justifyContent:"center",marginTop:6},savedText:{color:M.green,fontSize:9.5,fontWeight:"800"},section:{color:M.muted,fontSize:8.5,fontWeight:"900",letterSpacing:1.15,marginTop:22,marginBottom:9},card:{overflow:"hidden"},choice:{minHeight:72,paddingHorizontal:14,flexDirection:"row",alignItems:"center",gap:12},choiceOn:{backgroundColor:"rgba(169,184,255,.045)"},radio:{width:22,height:22,borderRadius:11,borderWidth:1,borderColor:"rgba(255,255,255,.14)",alignItems:"center",justifyContent:"center"},radioOn:{borderColor:M.accent},dot:{width:10,height:10,borderRadius:5,backgroundColor:M.accent},choiceTitle:{color:M.text2,fontSize:12.5,fontWeight:"700"},choiceTitleOn:{color:M.text},choiceSub:{color:M.muted,fontSize:9,marginTop:4},line:{height:1,backgroundColor:"rgba(255,255,255,.055)",marginLeft:48},note:{padding:15,marginTop:20,flexDirection:"row",gap:12,alignItems:"flex-start"},spark:{width:40,height:40,borderRadius:13,backgroundColor:"rgba(169,184,255,.10)",borderWidth:1,borderColor:"rgba(169,184,255,.15)",alignItems:"center",justifyContent:"center"},sparkText:{color:M.accentSoft,fontSize:15},noteTitle:{color:M.text,fontSize:12.5,fontWeight:"700"},noteText:{color:M.muted,fontSize:9.5,lineHeight:14,marginTop:4},primary:{marginTop:16}
});
