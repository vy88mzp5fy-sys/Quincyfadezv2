import React,{useEffect,useMemo,useState} from "react";
import {Linking,Pressable,SafeAreaView,ScrollView,StatusBar,StyleSheet,Text,View} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {M,Marble,Surface} from "./QFTheme";
import {ClientHeader} from "./ClientLuxuryUI";
import QFIcon from "./QFIcons";

const PROFILE="quincyfadez.bookingProfile",SESSION="quincyfadez.clientSession",KEY="quincyfadez.paymentClientKey",ADMIN="quincyfadez.adminToken";
const WHATSAPP="https://wa.me/447490194682",SITE="https://quincyfadez.com";
const open=u=>Linking.openURL(u).catch(()=>{});

function Row({icon,title,sub,onPress,tone="normal",last=false}){const danger=tone==="danger";return <Pressable onPress={onPress} style={({pressed})=>[s.row,!last&&s.rowLine,pressed&&{opacity:.64}]}><View style={[s.rowIcon,danger&&s.rowIconDanger]}><QFIcon name={icon} size={24} color={danger?M.red:M.accent}/></View><View style={{flex:1}}><Text style={[s.rowTitle,danger&&{color:M.red}]}>{title}</Text>{sub?<Text style={s.rowSub}>{sub}</Text>:null}</View><Text style={[s.chev,danger&&{color:M.red}]}>›</Text></Pressable>}
function Section({title,children}){return <><Text style={s.section}>{title}</Text><Surface style={s.group}>{children}</Surface></>}

export default function QFProfileScreen({onBack,go,onLogout}){
  const[profile,setProfile]=useState({});
  useEffect(()=>{AsyncStorage.getItem(PROFILE).then(v=>{if(v)try{setProfile(JSON.parse(v))}catch(_){}})},[]);
  const initials=useMemo(()=>String(profile.name||"QF").trim().split(/\s+/).map(x=>x[0]).join("").slice(0,2).toUpperCase()||"QF",[profile]);
  const logout=async()=>{await AsyncStorage.multiRemove([PROFILE,SESSION,KEY,ADMIN]);onLogout?.()};
  return <Marble><SafeAreaView style={s.safe}><StatusBar barStyle="light-content"/><ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
    <ClientHeader title="Profile" subtitle="Your account, preferences and booking controls." onBack={onBack}/>
    <Surface style={s.identity}><View style={s.avatar}><Text style={s.avatarText}>{initials}</Text></View><View style={{flex:1}}><Text style={s.name}>{profile.name||"Your QuincyFadez account"}</Text><Text style={s.email}>{profile.email||"Client profile"}</Text>{profile.phone?<Text style={s.phone}>{profile.phone}</Text>:null}</View><Pressable onPress={()=>go?.("personal")} style={s.edit}><Text style={s.editText}>Edit</Text></Pressable></Surface>
    <Section title="ACCOUNT"><Row icon="profile" title="Personal information" sub="Name, email and mobile number" onPress={()=>go?.("personal")}/><Row icon="bell" title="Notifications" sub="Booking updates and reminders" onPress={()=>go?.("notifications")}/><Row icon="settings" title="Booking preferences" sub="Your usual service and preferred time" onPress={()=>go?.("preferences")} last/></Section>
    <Section title="SECURITY"><Row icon="lock" title="Change password" sub="Update your account password" onPress={()=>go?.("security")} last/></Section>
    <Section title="SUPPORT"><Row icon="message" title="WhatsApp QuincyFadez" sub="Get help with a booking" onPress={()=>open(WHATSAPP)}/><Row icon="star" title="Google reviews" sub="See live client feedback" onPress={()=>go?.("reviews")}/><Row icon="shield" title="Terms & privacy" sub="View QuincyFadez online" onPress={()=>open(SITE)} last/></Section>
    <Section title="SESSION"><Row icon="logout" title="Log out" sub="Sign out of this device" onPress={logout} tone="danger" last/></Section>
    <View style={s.footer}><View style={s.brandDot}/><Text style={s.footerBrand}>QUINCYFADEZ</Text><Text style={s.footerVersion}>Mobile · v0.3.0</Text></View>
  </ScrollView></SafeAreaView></Marble>;
}

const s=StyleSheet.create({
  safe:{flex:1},content:{paddingHorizontal:18,paddingTop:4,paddingBottom:118},identity:{padding:18,flexDirection:"row",alignItems:"center",gap:14,marginTop:8,backgroundColor:M.panel2,borderColor:M.warmBorderSoft},avatar:{width:62,height:62,borderRadius:18,backgroundColor:M.panel3,borderWidth:1,borderColor:M.border,alignItems:"center",justifyContent:"center"},avatarText:{color:M.accent,fontSize:18,fontWeight:"800",letterSpacing:.5},name:{color:M.text,fontSize:18,fontWeight:"700"},email:{color:M.muted,fontSize:13,marginTop:5},phone:{color:M.muted2,fontSize:12,marginTop:4},edit:{height:43,borderRadius:13,borderWidth:1,borderColor:M.warmBorderSoft,backgroundColor:M.panel3,paddingHorizontal:15,alignItems:"center",justifyContent:"center"},editText:{color:M.accent,fontSize:12,fontWeight:"800"},section:{color:M.text,fontSize:16,fontWeight:"800",letterSpacing:.1,marginTop:28,marginBottom:11},group:{overflow:"hidden",backgroundColor:M.panel2},row:{minHeight:86,paddingHorizontal:15,flexDirection:"row",alignItems:"center",gap:14},rowLine:{borderBottomWidth:1,borderBottomColor:"rgba(255,255,255,.08)"},rowIcon:{width:48,height:48,borderRadius:15,backgroundColor:M.panel3,borderWidth:1,borderColor:M.border,alignItems:"center",justifyContent:"center"},rowIconDanger:{backgroundColor:M.redBg,borderColor:"rgba(240,125,115,.18)"},rowTitle:{color:M.text,fontSize:15.5,fontWeight:"700"},rowSub:{color:M.muted,fontSize:12.5,lineHeight:17,marginTop:5},chev:{color:M.accent,fontSize:25,fontWeight:"300"},footer:{alignItems:"center",marginTop:31},brandDot:{width:7,height:7,borderRadius:4,backgroundColor:M.accent},footerBrand:{color:M.text2,fontSize:10,fontWeight:"800",letterSpacing:1.8,marginTop:9},footerVersion:{color:M.muted2,fontSize:9.5,marginTop:5}
});
