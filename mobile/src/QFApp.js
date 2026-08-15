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
import QFIcon from "./QFIcons";
import {primeAvailability} from "./QFAvailabilityCache";

const SESSION="quincyfadez.clientSession",ADMIN="quincyfadez.adminToken";
const NAV=[
  ["home","Home","home"],
  ["bookings","Bookings","calendar"],
  ["book","Book","scissors"],
  ["reviews","Reviews","star"],
  ["profile","Profile","profile"],
];

function BottomNav({screen,onChange}){
  return <SafeAreaView pointerEvents="box-none" style={s.navSafe}><View style={s.nav}>{NAV.map(([key,label,icon])=>{const active=screen===key;return <Pressable key={key} onPress={()=>onChange(key)} style={s.navItem}><View style={s.navIconWrap}><QFIcon name={icon} size={25} color={active?M.accent:M.muted}/></View><Text style={[s.navLabel,active&&s.navLabelOn]}>{label}</Text></Pressable>})}</View></SafeAreaView>;
}

function Boot(){return <Marble><View style={s.boot}><BrandLogo size={82}/><Text style={s.bootBrand}>QUINCYFADEZ</Text><ActivityIndicator color={M.accent} style={{marginTop:24}}/></View></Marble>}

export default function QFApp(){
  const[screen,setScreen]=useState("boot"),[service,setService]=useState("Haircut");
  useEffect(()=>{primeAvailability(21).catch(()=>{});AsyncStorage.multiGet([SESSION,ADMIN]).then(rows=>{const client=rows[0]?.[1],admin=rows[1]?.[1];if(client){try{const parsed=JSON.parse(client);if(parsed?.token)return setScreen("home")}catch(_){}}if(admin)return setScreen("admin");setScreen("auth")}).catch(()=>setScreen("auth"))},[]);
  const go=(next,selected)=>{if(selected)setService(selected);if(next==="book")primeAvailability(21).catch(()=>{});setScreen(next)};
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
  shell:{flex:1,backgroundColor:M.bg},body:{flex:1},boot:{flex:1,alignItems:"center",justifyContent:"center"},bootBrand:{color:M.text,fontSize:17,fontWeight:"800",letterSpacing:3.4,marginTop:16},
  navSafe:{position:"absolute",left:0,right:0,bottom:0,backgroundColor:"rgba(5,5,5,.985)",borderTopWidth:1,borderTopColor:"rgba(255,255,255,.10)"},
  nav:{height:82,flexDirection:"row",alignItems:"center",paddingHorizontal:9},
  navItem:{flex:1,height:72,alignItems:"center",justifyContent:"center"},
  navIconWrap:{width:38,height:32,alignItems:"center",justifyContent:"center"},
  navLabel:{color:M.muted,fontSize:11.5,fontWeight:"600",marginTop:5},
  navLabelOn:{color:M.accent,fontWeight:"700"}
});
