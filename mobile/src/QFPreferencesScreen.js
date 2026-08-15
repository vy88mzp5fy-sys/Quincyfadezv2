import React,{useEffect,useState} from "react";
import {Pressable,SafeAreaView,ScrollView,StatusBar,StyleSheet,Text,View} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {M,Marble,PrimaryButton,Surface} from "./QFTheme";
import {ClientHeader} from "./ClientLuxuryUI";
import QFIcon from "./QFIcons";

const PREFS="quincyfadez.preferences";
const SERVICES=["Haircut","Haircut & Beard","Shape Up","Beard Trim"];
const TIMES=[{key:"Any",title:"Any time",sub:"Show me the first available slot"},{key:"Morning",title:"Morning",sub:"Before 12pm"},{key:"Afternoon",title:"Afternoon",sub:"12pm – 5pm"},{key:"Evening",title:"Evening",sub:"After 5pm"}];

function Choice({title,sub,active,onPress}){return <Pressable onPress={onPress} style={[s.choice,active&&s.choiceOn]}><View style={[s.radio,active&&s.radioOn]}>{active?<View style={s.dot}/>:null}</View><View style={{flex:1}}><Text style={[s.choiceTitle,active&&s.choiceTitleOn]}>{title}</Text>{sub?<Text style={s.choiceSub}>{sub}</Text>:null}</View><Text style={s.chev}>›</Text></Pressable>}

export default function QFPreferencesScreen({onBack}){
  const[service,setService]=useState("Haircut"),[time,setTime]=useState("Any"),[saved,setSaved]=useState(false),[busy,setBusy]=useState(false);
  useEffect(()=>{AsyncStorage.getItem(PREFS).then(v=>{if(!v)return;try{const p=JSON.parse(v);if(SERVICES.includes(p.favoriteService))setService(p.favoriteService);if(TIMES.some(x=>x.key===p.preferredTime))setTime(p.preferredTime)}catch(_){}})},[]);
  const save=async()=>{if(busy)return;setBusy(true);setSaved(false);try{await AsyncStorage.setItem(PREFS,JSON.stringify({favoriteService:service,preferredTime:time,updatedAt:new Date().toISOString()}));setSaved(true)}finally{setBusy(false)}};
  return <Marble><SafeAreaView style={s.safe}><StatusBar barStyle="light-content"/><ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
    <ClientHeader title="Preferences" subtitle="Set your usual service and preferred time for faster repeat booking." onBack={onBack}/>
    {saved?<View style={s.saved}><QFIcon name="check" size={18} color={M.green}/><Text style={s.savedText}>Preferences saved</Text></View>:null}
    <View style={s.sectionHead}><QFIcon name="star" size={20}/><Text style={s.section}>YOUR USUAL SERVICE</Text></View><Surface style={s.card}>{SERVICES.map((x,i)=><View key={x}>{i?<View style={s.line}/>:null}<Choice title={x} sub={x==="Haircut"?"45 min · £20":x==="Haircut & Beard"?"60 min · £25":"15 min · £10"} active={service===x} onPress={()=>{setSaved(false);setService(x)}}/></View>)}</Surface>
    <View style={s.sectionHead}><QFIcon name="clock" size={20}/><Text style={s.section}>PREFERRED TIME</Text></View><Surface style={s.card}>{TIMES.map((x,i)=><View key={x.key}>{i?<View style={s.line}/>:null}<Choice title={x.title} sub={x.sub} active={time===x.key} onPress={()=>{setSaved(false);setTime(x.key)}}/></View>)}</Surface>
    <Surface style={s.note}><View style={s.spark}><QFIcon name="repeat" size={25}/></View><View style={{flex:1}}><Text style={s.noteTitle}>Smarter repeat booking</Text><Text style={s.noteText}>These preferences never lock you in. They simply surface the most relevant availability first.</Text></View></Surface>
    <PrimaryButton title={busy?"Saving…":"SAVE PREFERENCES"} subtitle={`${service} · ${time==="Any"?"Any time":time}`} onPress={save} disabled={busy} style={s.primary} right={<QFIcon name="check" size={21} color="#090704"/>}/>
  </ScrollView></SafeAreaView></Marble>;
}

const s=StyleSheet.create({
  safe:{flex:1},content:{paddingHorizontal:18,paddingTop:4,paddingBottom:86},saved:{height:48,borderRadius:14,borderWidth:1,borderColor:"rgba(85,216,117,.22)",backgroundColor:M.greenBg,alignItems:"center",justifyContent:"center",marginTop:8,flexDirection:"row",gap:8},savedText:{color:M.green,fontSize:12.5,fontWeight:"700"},sectionHead:{flexDirection:"row",alignItems:"center",gap:8,marginTop:27,marginBottom:11},section:{color:M.text,fontSize:15.5,fontWeight:"800"},card:{overflow:"hidden",backgroundColor:M.panel2,borderColor:M.warmBorderSoft},choice:{minHeight:86,paddingHorizontal:16,flexDirection:"row",alignItems:"center",gap:14},choiceOn:{backgroundColor:"rgba(224,174,79,.05)"},radio:{width:25,height:25,borderRadius:13,borderWidth:1,borderColor:M.border,alignItems:"center",justifyContent:"center"},radioOn:{borderColor:M.warmBorder,backgroundColor:"rgba(224,174,79,.08)"},dot:{width:11,height:11,borderRadius:6,backgroundColor:M.accent},choiceTitle:{color:M.text2,fontSize:15.5,fontWeight:"600"},choiceTitleOn:{color:M.text,fontWeight:"700"},choiceSub:{color:M.muted,fontSize:12.5,marginTop:5},chev:{color:M.accent,fontSize:24,fontWeight:"300"},line:{height:1,backgroundColor:"rgba(255,255,255,.08)",marginLeft:55},note:{padding:18,marginTop:22,flexDirection:"row",gap:14,alignItems:"flex-start",backgroundColor:M.panel2,borderColor:M.warmBorderSoft},spark:{width:50,height:50,borderRadius:15,backgroundColor:M.panel3,borderWidth:1,borderColor:M.border,alignItems:"center",justifyContent:"center"},noteTitle:{color:M.text,fontSize:15.5,fontWeight:"700"},noteText:{color:M.muted,fontSize:12.5,lineHeight:18,marginTop:6},primary:{marginTop:19}
});
