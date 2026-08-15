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
    <Text style={s.section}>⭐ YOUR USUAL SERVICE</Text><Surface style={s.card}>{SERVICES.map((x,i)=><View key={x}>{i?<View style={s.line}/>:null}<Choice title={x} sub={x==="Haircut"?"45 min · £20":x==="Haircut & Beard"?"60 min · £25":"15 min · £10"} active={service===x} onPress={()=>{setSaved(false);setService(x)}}/></View>)}</Surface>
    <Text style={s.section}>🕒 PREFERRED TIME</Text><Surface style={s.card}>{TIMES.map((x,i)=><View key={x.key}>{i?<View style={s.line}/>:null}<Choice title={x.title} sub={x.sub} active={time===x.key} onPress={()=>{setSaved(false);setTime(x.key)}}/></View>)}</Surface>
    <Surface style={s.note}><View style={s.spark}><Text style={s.sparkText}>✨</Text></View><View style={{flex:1}}><Text style={s.noteTitle}>Smarter repeat booking</Text><Text style={s.noteText}>These preferences don’t lock you in. They simply help QuincyFadez surface the most relevant availability first.</Text></View></Surface>
    <PrimaryButton title={busy?"Saving…":"SAVE PREFERENCES"} subtitle={`${service} · ${time==="Any"?"Any time":time}`} onPress={save} disabled={busy} style={s.primary} right="✓"/>
  </ScrollView></SafeAreaView></Marble>;
}

const s=StyleSheet.create({
  safe:{flex:1},content:{paddingHorizontal:18,paddingTop:4,paddingBottom:84},saved:{height:46,borderRadius:14,borderWidth:1,borderColor:"rgba(120,214,164,.22)",backgroundColor:"rgba(120,214,164,.08)",alignItems:"center",justifyContent:"center",marginTop:7},savedText:{color:M.green,fontSize:11,fontWeight:"900"},section:{color:M.text2,fontSize:10.5,fontWeight:"900",letterSpacing:1,marginTop:24,marginBottom:10},card:{overflow:"hidden",backgroundColor:M.panel2},choice:{minHeight:82,paddingHorizontal:15,flexDirection:"row",alignItems:"center",gap:13},choiceOn:{backgroundColor:M.panel3},radio:{width:24,height:24,borderRadius:12,borderWidth:1,borderColor:"rgba(255,255,255,.17)",alignItems:"center",justifyContent:"center"},radioOn:{borderColor:"rgba(255,255,255,.28)",backgroundColor:"#34363B"},dot:{width:11,height:11,borderRadius:6,backgroundColor:M.accent},choiceTitle:{color:M.text2,fontSize:14.5,fontWeight:"700"},choiceTitleOn:{color:M.text,fontWeight:"800"},choiceSub:{color:M.muted,fontSize:11,marginTop:5},line:{height:1,backgroundColor:"rgba(255,255,255,.075)",marginLeft:52},note:{padding:17,marginTop:21,flexDirection:"row",gap:13,alignItems:"flex-start",backgroundColor:M.panel2,borderColor:"rgba(255,255,255,.11)"},spark:{width:46,height:46,borderRadius:15,backgroundColor:M.panel3,borderWidth:1,borderColor:"rgba(255,255,255,.11)",alignItems:"center",justifyContent:"center"},sparkText:{fontSize:20},noteTitle:{color:M.text,fontSize:14.5,fontWeight:"800"},noteText:{color:M.muted,fontSize:11,lineHeight:16,marginTop:5},primary:{marginTop:18}
});
