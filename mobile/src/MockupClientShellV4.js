import React,{useState}from"react";
import{SafeAreaView,StyleSheet,Text,Pressable,View}from"react-native";
import MockupAuthScreenV2 from"./MockupAuthScreenV2";
import MockupClientHomeV3 from"./MockupClientHomeV3";
import MockupBookingScreenV2 from"./MockupBookingScreenV2";
import MockupClientBookingsV3 from"./MockupClientBookingsV3";
import MockupReviewsScreenV2 from"./MockupReviewsScreenV2";
import MockupServicesScreenV2 from"./MockupServicesScreenV2";
import MockupProfileScreenV2 from"./MockupProfileScreenV2";
import MockupAccountScreenV2 from"./MockupAccountScreenV2";
import WaitingListScreen from"./WaitingListScreen";
import AdminPremiumShell from"./AdminPremiumShell";
import{M}from"./MockupTheme";

function Icon({type,active}){
 const c=active?M.goldSoft:M.muted;
 const t=type==="home"?"⌂":type==="booking"?"＋":type==="bookings"?"▦":type==="reviews"?"★":"◎";
 return <Text style={[s.icon,{color:c}]}>{t}</Text>;
}
function Nav({screen,setScreen}){
 const n=[["home","Home"],["booking","Book"],["bookings","My Bookings"],["reviews","Reviews"],["more","Profile"]];
 return <SafeAreaView style={s.navSafe}><View style={s.nav}>{n.map(([k,l])=>{const a=k===screen;return <Pressable key={k} onPress={()=>setScreen(k)} style={s.item}><View style={[s.iconWrap,a&&s.iconWrapOn]}><Icon type={k} active={a}/></View><Text numberOfLines={1} style={[s.label,a&&s.labelOn]}>{l}</Text></Pressable>})}</View></SafeAreaView>;
}

export default function MockupClientShellV4(){
 const[screen,setScreen]=useState("auth"),[service,setService]=useState("Haircut");
 const go=(x,sv)=>{if(sv)setService(sv);setScreen(x)};
 let body;
 if(screen==="auth")body=<MockupAuthScreenV2 onClient={()=>setScreen("home")} onAdmin={()=>setScreen("admin")}/>;
 else if(screen==="home")body=<MockupClientHomeV3 go={go}/>;
 else if(screen==="booking")body=<MockupBookingScreenV2 initialService={service} onBack={()=>setScreen("home")} onDone={()=>setScreen("bookings")}/>;
 else if(screen==="bookings")body=<MockupClientBookingsV3 onBack={()=>setScreen("home")} onBook={sv=>go("booking",sv)}/>;
 else if(screen==="waiting")body=<WaitingListScreen onBack={()=>setScreen("home")}/>;
 else if(screen==="reviews")body=<MockupReviewsScreenV2 onBack={()=>setScreen("home")}/>;
 else if(screen==="services")body=<MockupServicesScreenV2 onBack={()=>setScreen("home")} onBook={sv=>go("booking",sv)}/>;
 else if(screen==="more")body=<MockupProfileScreenV2 onBack={()=>setScreen("home")} go={go}/>;
 else if(screen==="account")body=<MockupAccountScreenV2 onBack={()=>setScreen("more")} onBookings={()=>setScreen("bookings")}/>;
 else if(screen==="admin")body=<AdminPremiumShell onExit={()=>setScreen("auth")}/>;
 else body=<MockupClientHomeV3 go={go}/>;
 const show=["home","booking","bookings","waiting","reviews","services","more","account"].includes(screen);
 const active=screen==="services"||screen==="waiting"?"booking":screen==="account"?"more":screen;
 return <View style={s.shell}><View style={{flex:1}}>{body}</View>{show?<Nav screen={active} setScreen={setScreen}/>:null}</View>;
}

const s=StyleSheet.create({
 shell:{flex:1,backgroundColor:M.bg},
 navSafe:{backgroundColor:"rgba(5,5,5,.985)",borderTopWidth:1,borderTopColor:"rgba(214,189,122,.10)"},
 nav:{minHeight:74,flexDirection:"row",alignItems:"center",paddingHorizontal:8,paddingTop:5},
 item:{flex:1,minHeight:58,alignItems:"center",justifyContent:"center"},
 iconWrap:{width:36,height:28,borderRadius:10,alignItems:"center",justifyContent:"center"},
 iconWrapOn:{backgroundColor:"rgba(214,189,122,.075)",borderWidth:1,borderColor:"rgba(214,189,122,.12)"},
 icon:{fontSize:18},
 label:{color:M.muted,fontSize:8.5,fontWeight:"600",marginTop:4,letterSpacing:.1},
 labelOn:{color:M.goldSoft,fontWeight:"700"}
});
