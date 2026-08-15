import React,{useEffect,useState}from"react";
import{Pressable,SafeAreaView,ScrollView,StatusBar,StyleSheet,Text,View}from"react-native";
import AsyncStorage from"@react-native-async-storage/async-storage";
import{BrandLogo,LuxuryBackButton,M,Marble,cardShadow}from"./MockupTheme";

const PREFS="quincyfadez.clientPrefs";
const defaults={confirmations:true,reminders:true,reschedule:true,waitlist:true,reviews:true};

function Toggle({value,onPress}){return <Pressable onPress={onPress} style={[s.toggle,value&&s.toggleOn]}><View style={[s.knob,value&&s.knobOn]}/></Pressable>}
function Row({title,sub,value,onPress,last}){return <View style={[s.row,!last&&s.rowDivider]}><View style={{flex:1,paddingRight:14}}><Text style={s.rowTitle}>{title}</Text><Text style={s.rowSub}>{sub}</Text></View><Toggle value={value} onPress={onPress}/></View>}

export default function ClientNotificationsScreen({onBack}){
 const[prefs,setPrefs]=useState(defaults);
 useEffect(()=>{AsyncStorage.getItem(PREFS).then(v=>{if(v)try{setPrefs({...defaults,...JSON.parse(v)})}catch(_){}})},[]);
 const toggle=k=>setPrefs(p=>{const n={...p,[k]:!p[k]};AsyncStorage.setItem(PREFS,JSON.stringify(n));return n});
 return <Marble><SafeAreaView style={s.safe}><StatusBar barStyle="light-content"/><ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
   <View style={s.header}><LuxuryBackButton onPress={onBack}/><View style={s.headerLogo}><BrandLogo size={66} compact/></View><View style={s.headerSpacer}/></View>
   <Text style={s.title}>NOTIFICATIONS</Text><Text style={s.subtitle}>Choose which QuincyFadez appointment updates you want to receive.</Text>
   <View style={s.card}><Row title="Booking Confirmations" sub="Confirmation updates when a booking is accepted." value={prefs.confirmations} onPress={()=>toggle("confirmations")}/><Row title="Appointment Reminders" sub="Helpful reminders before your upcoming appointment." value={prefs.reminders} onPress={()=>toggle("reminders")}/><Row title="Reschedule Updates" sub="Be notified if an appointment time changes." value={prefs.reschedule} onPress={()=>toggle("reschedule")}/><Row title="Waiting List Alerts" sub="Hear when a suitable cancelled slot becomes available." value={prefs.waitlist} onPress={()=>toggle("waitlist")}/><Row title="Review Reminders" sub="A simple reminder after a completed visit." value={prefs.reviews} onPress={()=>toggle("reviews")} last/></View>
  </ScrollView></SafeAreaView></Marble>;
}

const s=StyleSheet.create({
 safe:{flex:1},content:{paddingHorizontal:22,paddingTop:12,paddingBottom:110},header:{height:76,flexDirection:"row",alignItems:"center",justifyContent:"space-between"},headerLogo:{flex:1,alignItems:"center"},headerSpacer:{width:42},title:{color:M.text,fontSize:20,fontWeight:"700",letterSpacing:2.1,textAlign:"center",marginTop:8},subtitle:{color:M.muted,fontSize:11.5,lineHeight:17,textAlign:"center",marginTop:8,marginBottom:22,paddingHorizontal:18},card:{borderRadius:17,borderWidth:1,borderColor:"rgba(214,189,122,.13)",backgroundColor:"rgba(11,11,10,.90)",overflow:"hidden",...cardShadow},row:{minHeight:82,paddingHorizontal:16,paddingVertical:15,flexDirection:"row",alignItems:"center"},rowDivider:{borderBottomWidth:1,borderBottomColor:"rgba(255,255,255,.052)"},rowTitle:{color:M.text,fontSize:13.5,fontWeight:"700"},rowSub:{color:M.muted,fontSize:9.5,lineHeight:14,marginTop:4},toggle:{width:48,height:28,borderRadius:14,borderWidth:1,borderColor:"rgba(214,189,122,.12)",backgroundColor:"#24221E",padding:3,justifyContent:"center"},toggleOn:{backgroundColor:M.gold,borderColor:"rgba(241,221,162,.60)"},knob:{width:20,height:20,borderRadius:10,backgroundColor:"#8C8981"},knobOn:{alignSelf:"flex-end",backgroundColor:"#F7F5EF"}
});
