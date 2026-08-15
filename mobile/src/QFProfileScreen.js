import React,{useEffect,useMemo,useState} from "react";
import {Linking,Pressable,SafeAreaView,ScrollView,StatusBar,StyleSheet,Text,View} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {M,Marble,Surface} from "./QFTheme";
import {ClientHeader} from "./ClientLuxuryUI";

const PROFILE="quincyfadez.bookingProfile",SESSION="quincyfadez.clientSession",KEY="quincyfadez.paymentClientKey",ADMIN="quincyfadez.adminToken";
const WHATSAPP="https://wa.me/447490194682",SITE="https://quincyfadez.com";
const open=u=>Linking.openURL(u).catch(()=>{});

function Row({icon,title,sub,onPress,tone="normal",last=false}){return <Pressable onPress={onPress} style={({pressed})=>[s.row,!last&&s.rowLine,pressed&&{opacity:.68}]}><View style={[s.rowIcon,tone==="danger"&&s.rowIconDanger]}><Text style={s.rowGlyph}>{icon}</Text></View><View style={{flex:1}}><Text style={[s.rowTitle,tone==="danger"&&{color:M.red}]}>{title}</Text>{sub?<Text style={s.rowSub}>{sub}</Text>:null}</View><Text style={s.chev}>›</Text></Pressable>}
function Section({title,children}){return <><Text style={s.section}>{title}</Text><Surface style={s.group}>{children}</Surface></>}

export default function QFProfileScreen({onBack,go,onLogout}){
  const[profile,setProfile]=useState({});
  useEffect(()=>{AsyncStorage.getItem(PROFILE).then(v=>{if(v)try{setProfile(JSON.parse(v))}catch(_){}})},[]);
  const initials=useMemo(()=>String(profile.name||"QF").trim().split(/\s+/).map(x=>x[0]).join("").slice(0,2).toUpperCase()||"QF",[profile]);
  const logout=async()=>{await AsyncStorage.multiRemove([PROFILE,SESSION,KEY,ADMIN]);onLogout?.()};
  return <Marble><SafeAreaView style={s.safe}><StatusBar barStyle="light-content"/><ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
    <ClientHeader title="Profile" subtitle="Your details, booking preferences and account controls." onBack={onBack}/>
    <Surface style={s.identity}><View style={s.avatar}><Text style={s.avatarText}>{initials}</Text></View><View style={{flex:1}}><Text style={s.name}>{profile.name||"Your QuincyFadez account"}</Text><Text style={s.email}>{profile.email||"Client profile"}</Text>{profile.phone?<Text style={s.phone}>{profile.phone}</Text>:null}</View><Pressable onPress={()=>go?.("personal")} style={s.edit}><Text style={s.editText}>Edit</Text></Pressable></Surface>
    <Section title="ACCOUNT"><Row icon="👤" title="Personal information" sub="Name, email and mobile number" onPress={()=>go?.("personal")}/><Row icon="🔔" title="Notifications" sub="Booking updates and reminders" onPress={()=>go?.("notifications")}/><Row icon="⚙️" title="Booking preferences" sub="Your usual service and preferred time" onPress={()=>go?.("preferences")} last/></Section>
    <Section title="SECURITY"><Row icon="🔐" title="Change password" sub="Update your account password" onPress={()=>go?.("security")} last/></Section>
    <Section title="SUPPORT"><Row icon="💬" title="WhatsApp QuincyFadez" sub="Get help with a booking" onPress={()=>open(WHATSAPP)}/><Row icon="⭐" title="Google reviews" sub="See live client feedback" onPress={()=>go?.("reviews")}/><Row icon="🛡️" title="Terms & privacy" sub="View QuincyFadez online" onPress={()=>open(SITE)} last/></Section>
    <Section title="SESSION"><Row icon="🚪" title="Log out" sub="Sign out of this device" onPress={logout} tone="danger" last/></Section>
    <View style={s.footer}><View style={s.brandDot}/><Text style={s.footerBrand}>QUINCYFADEZ</Text><Text style={s.footerVersion}>Mobile · v0.3.0</Text></View>
  </ScrollView></SafeAreaView></Marble>;
}

const s=StyleSheet.create({
  safe:{flex:1},content:{paddingHorizontal:18,paddingTop:4,paddingBottom:120},identity:{padding:15,flexDirection:"row",alignItems:"center",gap:12,marginTop:7,backgroundColor:M.panel2,borderColor:"rgba(244,197,66,.18)"},avatar:{width:54,height:54,borderRadius:18,backgroundColor:M.panel3,borderWidth:1,borderColor:"rgba(244,197,66,.30)",alignItems:"center",justifyContent:"center"},avatarText:{color:M.accentSoft,fontSize:15,fontWeight:"900",letterSpacing:.5},name:{color:M.text,fontSize:14.5,fontWeight:"800"},email:{color:M.muted,fontSize:9.5,marginTop:4},phone:{color:M.muted2,fontSize:8.5,marginTop:3},edit:{height:38,borderRadius:12,borderWidth:1,borderColor:"rgba(244,197,66,.28)",backgroundColor:"rgba(244,197,66,.12)",paddingHorizontal:12,alignItems:"center",justifyContent:"center"},editText:{color:M.accentSoft,fontSize:9,fontWeight:"900"},section:{color:M.text2,fontSize:8.6,fontWeight:"900",letterSpacing:1.2,marginTop:23,marginBottom:9},group:{overflow:"hidden",backgroundColor:M.panel},row:{minHeight:74,paddingHorizontal:13,flexDirection:"row",alignItems:"center",gap:12},rowLine:{borderBottomWidth:1,borderBottomColor:"rgba(255,255,255,.07)"},rowIcon:{width:42,height:42,borderRadius:13,backgroundColor:M.panel3,borderWidth:1,borderColor:"rgba(244,197,66,.18)",alignItems:"center",justifyContent:"center"},rowIconDanger:{backgroundColor:"rgba(240,142,134,.07)",borderColor:"rgba(240,142,134,.16)"},rowGlyph:{fontSize:18},rowTitle:{color:M.text,fontSize:12.7,fontWeight:"800"},rowSub:{color:M.muted,fontSize:9,lineHeight:13.5,marginTop:4},chev:{color:M.accentSoft,fontSize:22},footer:{alignItems:"center",marginTop:28},brandDot:{width:7,height:7,borderRadius:4,backgroundColor:M.accent},footerBrand:{color:M.text2,fontSize:8,fontWeight:"900",letterSpacing:1.8,marginTop:8},footerVersion:{color:M.muted2,fontSize:7.5,marginTop:4}
});
