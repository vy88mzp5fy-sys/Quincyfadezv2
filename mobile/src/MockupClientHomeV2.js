import React,{useEffect,useMemo,useState}from"react";
import{ImageBackground,Linking,Pressable,SafeAreaView,ScrollView,StatusBar,StyleSheet,Text,View}from"react-native";
import AsyncStorage from"@react-native-async-storage/async-storage";
import{BrandLogo,M,Marble,cardShadow,shadow}from"./MockupTheme";
import{ClientCard,ClientSection,MiniIcon}from"./ClientLuxuryUI";

const PROFILE="quincyfadez.bookingProfile";
const links={whatsapp:"https://wa.me/447490194682",directions:"https://www.google.com/maps/dir/?api=1&destination=51.7402247,-1.2202434"};
const open=u=>Linking.openURL(u).catch(()=>{});
const greet=()=>{const h=new Date().getHours();return h<12?"Good morning":h<18?"Good afternoon":"Good evening"};

function Quick({icon,label,sub,onPress}){return <Pressable onPress={onPress} style={s.quick}><MiniIcon>{icon}</MiniIcon><View style={{flex:1}}><Text style={s.quickTitle}>{label}</Text><Text style={s.quickSub}>{sub}</Text></View><Text style={s.chev}>›</Text></Pressable>}

export default function MockupClientHomeV2({go}){
 const[profile,setProfile]=useState({});
 useEffect(()=>{AsyncStorage.getItem(PROFILE).then(v=>{if(v)try{setProfile(JSON.parse(v))}catch(_){}})},[]);
 const first=useMemo(()=>String(profile.name||"there").trim().split(/\s+/)[0]||"there",[profile]);
 return <Marble><SafeAreaView style={s.safe}><StatusBar barStyle="light-content"/><ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
   <View style={s.top}><Pressable onPress={()=>go("more")} style={s.topSide}><Text style={s.topIcon}>☰</Text></Pressable><BrandLogo size={72} compact/><Pressable onPress={()=>go("bookings")} style={s.topSide}><Text style={s.topIcon}>▦</Text></Pressable></View>
   <Text style={s.greeting}>{greet()}, {first} 👋</Text><Text style={s.greetingSub}>Ready for your next QuincyFadez appointment?</Text>
   <ImageBackground source={{uri:"https://quincyfadez.com/media/gallery-replacement-01.jpg"}} imageStyle={{borderRadius:18}} style={s.hero}>
    <View style={s.heroShade}/><View style={s.heroCopy}><Text style={s.heroKicker}>QUINCYFADEZ · OXFORD</Text><Text style={s.heroTitle}>Fresh Cut. Sharp Finish.</Text><Text style={s.heroText}>Book your next appointment in a few taps.</Text><Pressable onPress={()=>go("booking")} style={s.bookButton}><Text style={s.bookText}>BOOK NOW</Text><Text style={s.bookArrow}>›</Text></Pressable></View>
   </ImageBackground>
   <ClientSection title="QUICK ACCESS"/>
   <ClientCard><Quick icon="✂" label="Book Appointment" sub="Choose a service, date and time" onPress={()=>go("booking")}/><View style={s.divider}/><Quick icon="▦" label="My Bookings" sub="View upcoming and past visits" onPress={()=>go("bookings")}/><View style={s.divider}/><Quick icon="▧" label="Gallery" sub="Browse recent QuincyFadez work" onPress={()=>go("gallery")}/><View style={s.divider}/><Quick icon="★" label="Reviews" sub="See live Google feedback" onPress={()=>go("reviews")}/></ClientCard>
   <ClientSection title="POPULAR SERVICES" action="View all" onAction={()=>go("services")}/>
   <View style={s.serviceGrid}><Pressable onPress={()=>go("booking","Haircut")} style={s.serviceCard}><Text style={s.serviceIcon}>✂</Text><Text style={s.serviceName}>Haircut</Text><Text style={s.serviceMeta}>45 min</Text><Text style={s.servicePrice}>£20</Text></Pressable><Pressable onPress={()=>go("booking","Haircut & Beard")} style={s.serviceCard}><Text style={s.serviceIcon}>♚</Text><Text style={s.serviceName}>Haircut & Beard</Text><Text style={s.serviceMeta}>60 min</Text><Text style={s.servicePrice}>£25</Text></Pressable></View>
   <ClientSection title="NEED SOMETHING?"/>
   <View style={s.contactRow}><Pressable onPress={()=>open(links.whatsapp)} style={s.contact}><Text style={s.contactIcon}>◉</Text><Text style={s.contactText}>WhatsApp</Text></Pressable><Pressable onPress={()=>open(links.directions)} style={s.contact}><Text style={s.contactIcon}>⌖</Text><Text style={s.contactText}>Directions</Text></Pressable></View>
 </ScrollView></SafeAreaView></Marble>
}

const s=StyleSheet.create({safe:{flex:1},content:{paddingHorizontal:18,paddingTop:7,paddingBottom:112},top:{height:84,flexDirection:"row",alignItems:"center",justifyContent:"space-between"},topSide:{width:48,height:48,alignItems:"center",justifyContent:"center"},topIcon:{color:M.text2,fontSize:24},greeting:{color:M.text,fontSize:29,fontWeight:"700",marginTop:8},greetingSub:{color:M.muted,fontSize:14,marginTop:5},hero:{height:290,borderRadius:18,overflow:"hidden",borderWidth:1,borderColor:"rgba(214,189,122,.30)",marginTop:20,justifyContent:"flex-end",...cardShadow},heroShade:{...StyleSheet.absoluteFillObject,backgroundColor:"rgba(0,0,0,.42)"},heroCopy:{padding:18,backgroundColor:"rgba(5,4,3,.70)"},heroKicker:{color:M.gold,fontSize:9,fontWeight:"900",letterSpacing:1.3},heroTitle:{color:M.text,fontSize:28,lineHeight:31,fontWeight:"800",marginTop:6},heroText:{color:M.text2,fontSize:12.5,marginTop:6},bookButton:{height:52,borderRadius:11,backgroundColor:M.gold,borderWidth:1,borderColor:M.goldSoft,marginTop:14,paddingHorizontal:16,flexDirection:"row",alignItems:"center",justifyContent:"space-between",...shadow},bookText:{color:"#090704",fontSize:13,fontWeight:"900",letterSpacing:.7},bookArrow:{color:"#090704",fontSize:25},quick:{minHeight:78,paddingHorizontal:14,flexDirection:"row",alignItems:"center",gap:12},quickTitle:{color:M.text,fontSize:14,fontWeight:"700"},quickSub:{color:M.muted,fontSize:10.5,marginTop:4},chev:{color:M.gold,fontSize:25},divider:{height:1,backgroundColor:"rgba(255,255,255,.07)",marginLeft:68},serviceGrid:{flexDirection:"row",gap:10},serviceCard:{flex:1,minHeight:155,borderRadius:15,borderWidth:1,borderColor:"rgba(214,189,122,.25)",backgroundColor:"rgba(16,16,15,.93)",padding:15,...cardShadow},serviceIcon:{color:M.gold,fontSize:29},serviceName:{color:M.text,fontSize:15,fontWeight:"700",marginTop:12},serviceMeta:{color:M.muted,fontSize:10,marginTop:4},servicePrice:{color:M.goldSoft,fontSize:24,fontWeight:"700",marginTop:12},contactRow:{flexDirection:"row",gap:10},contact:{flex:1,height:64,borderRadius:13,borderWidth:1,borderColor:M.border,backgroundColor:"rgba(16,16,15,.92)",flexDirection:"row",alignItems:"center",justifyContent:"center",gap:9},contactIcon:{color:M.gold,fontSize:20},contactText:{color:M.text2,fontSize:12.5,fontWeight:"700"}});