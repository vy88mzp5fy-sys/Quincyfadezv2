import React,{useState}from"react";
import{SafeAreaView,StyleSheet,Text,Pressable,View}from"react-native";
import MockupAuthScreenV2 from"./MockupAuthScreenV2";
import MockupClientHome from"./MockupClientHome";
import MockupBookingScreen from"./MockupBookingScreen";
import MockupClientBookings from"./MockupClientBookings";
import MockupGalleryScreen from"./MockupGalleryScreen";
import MockupReviewsScreen from"./MockupReviewsScreen";
import MockupServicesScreen from"./MockupServicesScreen";
import MockupProfileScreen from"./MockupProfileScreen";
import MockupAccountScreen from"./MockupAccountScreen";
import MockupAdminScreenV3 from"./MockupAdminScreenV3";
import{M}from"./MockupTheme";
function Icon({type,active}){const c=active?M.goldSoft:M.muted2,t=type==="home"?"⌂":type==="bookings"?"▦":type==="gallery"?"▧":type==="reviews"?"★":"≡";return <Text style={[s.icon,{color:c}]}>{t}</Text>}
function Nav({screen,setScreen}){const n=[["home","Home"],["bookings","Bookings"],["gallery","Gallery"],["reviews","Reviews"],["more","More"]];return <SafeAreaView style={s.navSafe}><View style={s.nav}>{n.map(([k,l])=>{const a=k===screen;return <Pressable key={k} onPress={()=>setScreen(k)} style={s.item}><Icon type={k} active={a}/><Text style={[s.label,a&&s.labelOn]}>{l}</Text></Pressable>})}</View></SafeAreaView>}
export default function MockupClientShellV3(){const[screen,setScreen]=useState("auth"),[service,setService]=useState("Haircut");const go=(x,sv)=>{if(sv)setService(sv);setScreen(x)};let body;if(screen==="auth")body=<MockupAuthScreenV2 onClient={()=>setScreen("home")} onAdmin={()=>setScreen("admin")}/>;else if(screen==="home")body=<MockupClientHome go={go}/>;else if(screen==="booking")body=<MockupBookingScreen initialService={service} onBack={()=>setScreen("home")} onDone={()=>setScreen("bookings")}/>;else if(screen==="bookings")body=<MockupClientBookings onBack={()=>setScreen("home")} onBook={()=>setScreen("booking")}/>;else if(screen==="gallery")body=<MockupGalleryScreen onBack={()=>setScreen("home")} onBook={()=>go("booking","Haircut")}/>;else if(screen==="reviews")body=<MockupReviewsScreen onBack={()=>setScreen("home")}/>;else if(screen==="services")body=<MockupServicesScreen onBack={()=>setScreen("home")} onBook={sv=>go("booking",sv)}/>;else if(screen==="more")body=<MockupProfileScreen onBack={()=>setScreen("home")} go={go}/>;else if(screen==="account")body=<MockupAccountScreen onBack={()=>setScreen("more")} onBookings={()=>setScreen("bookings")}/>;else if(screen==="admin")body=<MockupAdminScreenV3 onExit={()=>setScreen("auth")}/>;else body=<MockupClientHome go={go}/>;const show=["home","booking","bookings","gallery","reviews","services","more","account"].includes(screen),active=screen==="booking"||screen==="services"?"bookings":screen==="account"?"more":screen;return <View style={s.shell}><View style={{flex:1}}>{body}</View>{show?<Nav screen={active} setScreen={setScreen}/>:null}</View>}
const s=StyleSheet.create({shell:{flex:1,backgroundColor:M.bg},navSafe:{backgroundColor:"rgba(5,4,3,.99)",borderTopWidth:1,borderTopColor:"rgba(255,255,255,.07)"},nav:{minHeight:70,flexDirection:"row",alignItems:"center",paddingHorizontal:7,paddingTop:5},item:{flex:1,minHeight:54,alignItems:"center",justifyContent:"center"},icon:{fontSize:19},label:{color:M.muted2,fontSize:8.5,fontWeight:"700",marginTop:3},labelOn:{color:M.goldSoft}});
