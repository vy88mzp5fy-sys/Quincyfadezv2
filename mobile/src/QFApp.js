import React,{useEffect,useState} from "react";
import {ActivityIndicator,Pressable,SafeAreaView,StyleSheet,Text,View} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import QFAuthScreen from "./QFAuthScreen";
import QFHomeScreen from "./QFHomeScreen";
import QFBookingScreen from "./QFBookingScreen";
import QFBookingsScreen from "./QFBookingsScreen";
import QFWaitingScreen from "./QFWaitingScreen";
import QFReviewsScreen from "./QFReviewsScreen";
import QFProfileScreen from "./QFProfileScreen";
import QFPreferencesScreen from "./QFPreferencesScreen";
import PersonalInformationScreen from "./PersonalInformationScreen";
import ChangePasswordScreen from "./ChangePasswordScreen";
import ClientNotificationsScreen from "./ClientNotificationsScreen";
import AdminPremiumShell from "./AdminPremiumShell";
import {BrandLogo,M,Marble} from "./QFTheme";

const SESSION="quincyfadez.clientSession",ADMIN="quincyfadez.adminToken";
const NAV=[["home","Home","⌂"],["bookings","Bookings","▦"],["book","Book","＋"],["reviews","Reviews","☆"],["profile","Profile","○"]];

function BottomNav({screen,onChange}){
  return <SafeAreaView pointerEvents="box-none" style={s.navSafe}><View style={s.nav}>{NAV.map(([key,label,icon])=>{const active=screen===key,book=key==="book";return <Pressable key={key} onPress={()=>onChange(key)} style={s.navItem}><View style={[s.navIconWrap,book&&s.bookWrap,active&&s.navIconOn,book&&active&&s.bookWrapOn]}><Text style={[s.navIcon,active&&s.navIconActive,book&&s.bookIcon]}>{icon}</Text></View><Text style={[s.navLabel,active&&s.navLabelOn]}>{label}</Text></Pressable>})}</View></SafeAreaView>;
}

function Boot(){return <Marble><View style={s.boot}><BrandLogo size={76}/><Text style={s.bootBrand}>QUINCYFADEZ</Text><ActivityIndicator color={M.accent} style={{marginTop:22}}/></View></Marble>}

export default function QFApp(){
  const[screen,setScreen]=useState("boot"),[service,setService]=useState("Haircut");
  useEffect(()=>{AsyncStorage.multiGet([SESSION,ADMIN]).then(rows=>{const client=rows[0]?.[1],admin=rows[1]?.[1];if(client){try{const parsed=JSON.parse(client);if(parsed?.token)return setScreen("home")}catch(_){}}if(admin)return setScreen("admin");setScreen("auth")}).catch(()=>setScreen("auth"))},[]);
  const go=(next,selected)=>{if(selected)setService(selected);setScreen(next)};
  const logout=()=>setScreen("auth");
  if(screen==="boot")return <Boot/>;
  let body=null;
  if(screen==="auth")body=<QFAuthScreen onClient={()=>setScreen("home")} onAdmin={()=>setScreen("admin")}/>;
  else if(screen==="home")body=<QFHomeScreen go={go}/>;
  else if(screen==="book")body=<QFBookingScreen initialService={service} onBack={()=>setScreen("home")} onDone={()=>setScreen("bookings")} onWait={()=>setScreen("waiting")}/>;
  else if(screen==="bookings")body=<QFBookingsScreen onBack={()=>setScreen("home")} onBook={selected=>go("book",selected)}/>;
  else if(screen==="waiting")body=<QFWaitingScreen onBack={()=>setScreen("home")}/>;
  else if(screen==="reviews")body=<QFReviewsScreen onBack={()=>setScreen("home")}/>;
  else if(screen==="profile")body=<QFProfileScreen onBack={()=>setScreen("home")} go={go} onLogout={logout}/>;
  else if(screen==="preferences")body=<QFPreferencesScreen onBack={()=>setScreen("profile")}/>;
  else if(screen==="personal")body=<PersonalInformationScreen onBack={()=>setScreen("profile")}/>;
  else if(screen==="security")body=<ChangePasswordScreen onBack={()=>setScreen("profile")}/>;
  else if(screen==="notifications")body=<ClientNotificationsScreen onBack={()=>setScreen("profile")}/>;
  else if(screen==="admin")body=<AdminPremiumShell onExit={()=>setScreen("auth")}/>;
  else body=<QFHomeScreen go={go}/>;
  const showNav=["home","bookings","book","reviews","profile"].includes(screen);
  return <View style={s.shell}><View style={s.body}>{body}</View>{showNav?<BottomNav screen={screen} onChange={key=>go(key)}/>:null}</View>;
}

const s=StyleSheet.create({
  shell:{flex:1,backgroundColor:M.bg},body:{flex:1},boot:{flex:1,alignItems:"center",justifyContent:"center"},bootBrand:{color:M.text,fontSize:13,fontWeight:"900",letterSpacing:3.2,marginTop:14},navSafe:{position:"absolute",left:12,right:12,bottom:8},nav:{height:76,borderRadius:24,borderWidth:1,borderColor:"rgba(255,255,255,.085)",backgroundColor:"rgba(13,18,27,.97)",flexDirection:"row",alignItems:"center",paddingHorizontal:6,shadowColor:"#000",shadowOpacity:.44,shadowRadius:22,shadowOffset:{width:0,height:12},elevation:9},navItem:{flex:1,height:66,alignItems:"center",justifyContent:"center"},navIconWrap:{width:36,height:32,borderRadius:12,alignItems:"center",justifyContent:"center"},navIconOn:{backgroundColor:"rgba(169,184,255,.11)"},bookWrap:{width:46,height:46,borderRadius:16,backgroundColor:M.accent,marginTop:-16,shadowColor:"#000",shadowOpacity:.32,shadowRadius:14,shadowOffset:{width:0,height:8},elevation:6},bookWrapOn:{backgroundColor:M.accentSoft},navIcon:{color:M.muted,fontSize:17,fontWeight:"700"},navIconActive:{color:M.accentSoft},bookIcon:{color:M.bg,fontSize:22,fontWeight:"700"},navLabel:{color:M.muted2,fontSize:7.5,fontWeight:"700",marginTop:4},navLabelOn:{color:M.text2}
});
