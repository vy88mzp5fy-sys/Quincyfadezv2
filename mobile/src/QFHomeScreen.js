import React,{useEffect,useMemo,useState} from "react";
import {Linking,Pressable,SafeAreaView,ScrollView,StatusBar,StyleSheet,Text,View} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {BrandLogo,M,Marble,PrimaryButton,StatusDot,Surface,cardShadow} from "./QFTheme";
import QFIcon from "./QFIcons";
import {readCachedAvailability,fetchAvailability,primeAvailability} from "./QFAvailabilityCache";

const API=(process.env.EXPO_PUBLIC_API_URL||"").replace(/\/$/,"");
const PROFILE="quincyfadez.bookingProfile",KEY="quincyfadez.paymentClientKey",PREFS="quincyfadez.preferences";
const SERVICES=[
  {name:"Haircut",price:20,duration:"45 min",icon:"scissors"},
  {name:"Haircut & Beard",price:25,duration:"60 min",icon:"profile"},
  {name:"Shape Up",price:10,duration:"15 min",icon:"star"},
  {name:"Beard Trim",price:10,duration:"15 min",icon:"user"},
];
const links={whatsapp:"https://wa.me/447490194682",directions:"https://www.google.com/maps/dir/?api=1&destination=51.7402247,-1.2202434"};
const read=r=>r.json().catch(()=>({}));
const open=u=>Linking.openURL(u).catch(()=>{});
const greet=()=>{const h=new Date().getHours();return h<12?"Good morning":h<18?"Good afternoon":"Good evening"};
const fmtDate=v=>v?new Date(v).toLocaleDateString("en-GB",{weekday:"short",day:"numeric",month:"short",timeZone:"Europe/London"}):"—";
const fmtLongDate=v=>v?new Date(v).toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long",timeZone:"Europe/London"}):"—";
const fmtTime=v=>v?new Date(v).toLocaleTimeString("en-GB",{hour:"numeric",minute:"2-digit",hour12:true,timeZone:"Europe/London"}).replace(":00",""):"—";
function availabilityLabel(v){if(!v)return"View live times";const d=new Date(v),today=new Date(),tomorrow=new Date();tomorrow.setDate(today.getDate()+1);const key=x=>x.toLocaleDateString("en-CA",{timeZone:"Europe/London"});const day=key(d)===key(today)?"Today":key(d)===key(tomorrow)?"Tomorrow":fmtDate(v);return`${day} · ${fmtTime(v)}`}
const firstSlot=d=>(d?.days||[]).flatMap(x=>x.slots||[])[0]||"";

function QuickAction({icon,title,sub,onPress}){
  return <Pressable onPress={onPress} style={({pressed})=>[s.quick,pressed&&s.pressed]}><View style={s.quickTop}><View style={s.quickIcon}><QFIcon name={icon} size={27}/></View><Text style={s.quickArrow}>›</Text></View><Text style={s.quickTitle}>{title}</Text><Text numberOfLines={2} style={s.quickSub}>{sub}</Text></Pressable>;
}
function ServiceRow({item,onPress,favourite}){
  return <Pressable onPress={onPress} style={({pressed})=>[s.serviceRow,pressed&&s.pressed]}><View style={s.serviceMark}><QFIcon name={item.icon} size={27}/></View><View style={{flex:1}}><View style={s.serviceTitleRow}><Text style={s.serviceName}>{item.name}</Text>{favourite?<Text style={s.favourite}>YOUR USUAL</Text>:null}</View><Text style={s.serviceMeta}>{item.duration}</Text></View><Text style={s.servicePrice}>£{item.price}</Text><Text style={s.chev}>›</Text></Pressable>;
}
function InfoCard({label,value,note,icon,onPress}){
  return <Pressable onPress={onPress} style={({pressed})=>[s.infoCard,pressed&&onPress&&s.pressed]}><View style={s.infoHead}><Text style={s.infoLabel}>{label}</Text><QFIcon name={icon} size={27}/></View><Text numberOfLines={2} adjustsFontSizeToFit style={s.infoValue}>{value}</Text><Text numberOfLines={2} style={s.infoNote}>{note}</Text></Pressable>;
}

export default function QFHomeScreen({go}){
  const[profile,setProfile]=useState({}),[next,setNext]=useState(null),[last,setLast]=useState(null),[loading,setLoading]=useState(true),[nextSlot,setNextSlot]=useState(""),[favourite,setFavourite]=useState("Haircut"),[upcomingCount,setUpcomingCount]=useState(0);
  useEffect(()=>{Promise.all([AsyncStorage.getItem(PROFILE),AsyncStorage.getItem(PREFS)]).then(async([p,pr])=>{let fav="Haircut";if(p)try{setProfile(JSON.parse(p))}catch(_){}if(pr)try{const v=JSON.parse(pr);if(v.favoriteService){fav=v.favoriteService;setFavourite(v.favoriteService)}}catch(_){}const cached=await readCachedAvailability(fav);if(cached)setNextSlot(firstSlot(cached));primeAvailability(21).catch(()=>{})})},[]);
  useEffect(()=>{let alive=true;(async()=>{try{const key=await AsyncStorage.getItem(KEY);const jobs=[];if(API&&key)jobs.push(fetch(`${API}/api/booking/appointments/${encodeURIComponent(key)}`).then(async r=>{const d=await read(r);if(!r.ok)return;const rows=d.bookings||[],now=Date.now();const future=rows.filter(x=>["pending","confirmed"].includes(x.status)&&new Date(x.start_at).getTime()>=now).sort((a,b)=>String(a.start_at).localeCompare(String(b.start_at)));const prev=rows.filter(x=>["completed","no_show","cancelled"].includes(x.status)||new Date(x.start_at).getTime()<now).sort((a,b)=>String(b.start_at).localeCompare(String(a.start_at)))[0]||null;if(alive){setNext(future[0]||null);setUpcomingCount(future.length);setLast(prev)}}));jobs.push((async()=>{const cached=await readCachedAvailability(favourite||"Haircut");if(alive&&cached)setNextSlot(firstSlot(cached));try{const fresh=await fetchAvailability(favourite||"Haircut",21);if(alive)setNextSlot(firstSlot(fresh))}catch(_){}})());await Promise.allSettled(jobs)}finally{if(alive)setLoading(false)}})();return()=>{alive=false}},[favourite]);
  const first=useMemo(()=>String(profile.name||"there").trim().split(/\s+/)[0]||"there",[profile]);
  const repeatService=last?.service||favourite||"Haircut";
  return <Marble><SafeAreaView style={s.safe}><StatusBar barStyle="light-content"/><ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
    <View style={s.top}><View style={s.brandRow}><BrandLogo size={49}/><View><Text style={s.brand}>QUINCYFADEZ</Text><Text style={s.brandSub}>OXFORD · PRIVATE BARBERING</Text></View></View><Pressable onPress={()=>go("profile")} style={s.profileButton}><QFIcon name="profile" size={28} color={M.text2}/></Pressable></View>

    <View style={s.welcome}><Text style={s.greeting}>{greet()}, {first}</Text><Text style={s.welcomeCopy}>Book, manage and rebook your appointments in seconds.</Text></View>

    <Surface style={s.hero}>
      <View style={s.heroTop}><View style={s.livePill}><StatusDot tone={nextSlot?"good":"accent"}/><Text style={s.liveText}>{nextSlot?`NEXT OPENING · ${availabilityLabel(nextSlot)}`:"LIVE AVAILABILITY"}</Text></View><QFIcon name="scissors" size={38}/></View>
      <Text style={s.heroTitle}>Book your next cut.</Text>
      <Text style={s.heroCopy}>Choose a service, pick a live time and confirm your appointment without any back-and-forth.</Text>
      <PrimaryButton title="BOOK APPOINTMENT" subtitle={nextSlot?`Next opening ${availabilityLabel(nextSlot)}`:"View live availability"} onPress={()=>go("book",favourite)} style={s.heroButton} right={<QFIcon name="calendar" size={22} color="#090704"/>}/>
    </Surface>

    <View style={s.infoGrid}>
      <InfoCard label="NEXT OPENING" value={nextSlot?availabilityLabel(nextSlot):loading?"Checking…":"View times"} note={favourite} icon="clock" onPress={()=>go("book",favourite)}/>
      <InfoCard label="UPCOMING" value={String(upcomingCount)} note={upcomingCount===1?"appointment":"appointments"} icon="calendar" onPress={()=>go("bookings")}/>
    </View>

    {next?<><View style={s.sectionHead}><Text style={s.sectionTitle}>NEXT APPOINTMENT</Text><Pressable onPress={()=>go("bookings")}><Text style={s.sectionLink}>Manage</Text></Pressable></View><Surface style={s.nextCard}><View style={s.nextMain}><View style={s.dateBlock}><Text style={s.dateBig}>{new Date(next.start_at).toLocaleDateString("en-GB",{day:"2-digit",timeZone:"Europe/London"})}</Text><Text style={s.dateMonth}>{new Date(next.start_at).toLocaleDateString("en-GB",{month:"short",timeZone:"Europe/London"}).toUpperCase()}</Text></View><View style={{flex:1}}><View style={s.nextTitleRow}><Text style={s.nextService}>{next.service}</Text><View style={[s.status,next.status==="pending"&&s.statusPending]}><StatusDot tone={next.status==="pending"?"warn":"good"}/><Text style={[s.statusText,next.status==="pending"&&{color:M.amber}]}>{String(next.status||"confirmed").toUpperCase()}</Text></View></View><Text style={s.dateTitle}>{fmtLongDate(next.start_at)}</Text><Text style={s.dateTime}>{fmtTime(next.start_at)} · QuincyFadez</Text></View></View><View style={s.actionRow}><Pressable onPress={()=>go("bookings")} style={s.secondaryAction}><QFIcon name="calendar" size={18}/><Text style={s.secondaryText}>Manage booking</Text></Pressable><Pressable onPress={()=>open(links.directions)} style={s.secondaryAction}><QFIcon name="location" size={18}/><Text style={s.secondaryText}>Directions</Text></Pressable></View></Surface></>:null}

    <View style={s.sectionHead}><Text style={s.sectionTitle}>QUICK ACTIONS</Text></View>
    <View style={s.quickGrid}><QuickAction icon="repeat" title="Book again" sub={repeatService} onPress={()=>go("book",repeatService)}/><QuickAction icon="hourglass" title="Waitlist" sub="Catch a cancelled slot" onPress={()=>go("waiting")}/><QuickAction icon="star" title="Reviews" sub="See client feedback" onPress={()=>go("reviews")}/></View>

    <View style={s.sectionHead}><Text style={s.sectionTitle}>SERVICES</Text><Pressable onPress={()=>go("book")}><Text style={s.sectionLink}>View all</Text></Pressable></View>
    <Surface style={s.services}>{SERVICES.map((x,i)=><View key={x.name}>{i?<View style={s.line}/>:null}<ServiceRow item={x} favourite={x.name===favourite} onPress={()=>go("book",x.name)}/></View>)}</Surface>

    <View style={s.sectionHead}><Text style={s.sectionTitle}>VISIT & CONTACT</Text></View>
    <Surface style={s.visit}><View style={s.visitTop}><View style={s.locationIcon}><QFIcon name="location" size={27}/></View><View style={{flex:1}}><Text style={s.visitTitle}>QuincyFadez · Oxford</Text><Text style={s.visitCopy}>Get directions or message Quincy directly about your booking.</Text></View></View><View style={s.actionRow}><Pressable onPress={()=>open(links.whatsapp)} style={s.secondaryAction}><QFIcon name="message" size={18}/><Text style={s.secondaryText}>WhatsApp</Text></Pressable><Pressable onPress={()=>open(links.directions)} style={s.secondaryAction}><QFIcon name="location" size={18}/><Text style={s.secondaryText}>Get directions</Text></Pressable></View></Surface>
    <Text style={s.footer}>PRECISION BOOKING · PREMIUM SERVICE</Text>
  </ScrollView></SafeAreaView></Marble>;
}

const s=StyleSheet.create({
  safe:{flex:1},content:{paddingHorizontal:18,paddingTop:10,paddingBottom:120},
  top:{height:64,flexDirection:"row",alignItems:"center",justifyContent:"space-between"},brandRow:{flexDirection:"row",alignItems:"center",gap:12},brand:{color:M.text,fontSize:14,fontWeight:"800",letterSpacing:1.7},brandSub:{color:M.muted,fontSize:9.5,fontWeight:"600",letterSpacing:.7,marginTop:4},profileButton:{width:48,height:48,alignItems:"center",justifyContent:"center"},
  welcome:{marginTop:26,marginBottom:20},greeting:{color:M.text,fontSize:32,fontWeight:"700",letterSpacing:-.7},welcomeCopy:{color:M.muted,fontSize:15,lineHeight:21,marginTop:7,maxWidth:360},
  hero:{padding:20,backgroundColor:"#111111",borderColor:M.warmBorder,overflow:"hidden"},heroTop:{flexDirection:"row",alignItems:"center",justifyContent:"space-between"},livePill:{minHeight:34,borderRadius:17,borderWidth:1,borderColor:M.border,backgroundColor:"#0A0A0A",paddingHorizontal:11,flexDirection:"row",alignItems:"center",gap:8},liveText:{color:M.text2,fontSize:10.5,fontWeight:"800",letterSpacing:.45},heroTitle:{color:M.text,fontSize:34,fontWeight:"700",letterSpacing:-.8,lineHeight:39,marginTop:22},heroCopy:{color:M.muted,fontSize:15,lineHeight:22,marginTop:10,maxWidth:335},heroButton:{marginTop:22},
  infoGrid:{flexDirection:"row",gap:12,marginTop:13},infoCard:{flex:1,minHeight:145,borderRadius:18,borderWidth:1,borderColor:M.warmBorderSoft,backgroundColor:M.panel2,padding:16,...cardShadow},infoHead:{flexDirection:"row",alignItems:"center",justifyContent:"space-between"},infoLabel:{color:M.text2,fontSize:11.5,fontWeight:"700",letterSpacing:.5},infoValue:{color:M.text,fontSize:25,fontWeight:"700",marginTop:22},infoNote:{color:M.muted,fontSize:12.5,lineHeight:17,marginTop:6},
  sectionHead:{flexDirection:"row",alignItems:"center",justifyContent:"space-between",marginTop:30,marginBottom:12},sectionTitle:{color:M.text,fontSize:16.5,fontWeight:"800",letterSpacing:.15},sectionLink:{color:M.accent,fontSize:14,fontWeight:"700"},
  nextCard:{padding:17,backgroundColor:M.panel2},nextMain:{flexDirection:"row",alignItems:"center",gap:14},dateBlock:{width:62,height:68,borderRadius:16,backgroundColor:M.panel3,borderWidth:1,borderColor:M.border,alignItems:"center",justifyContent:"center"},dateBig:{color:M.accent,fontSize:24,fontWeight:"800"},dateMonth:{color:M.text2,fontSize:9.5,fontWeight:"800",letterSpacing:.6,marginTop:2},nextTitleRow:{flexDirection:"row",alignItems:"center",justifyContent:"space-between",gap:8},nextService:{flex:1,color:M.text,fontSize:18,fontWeight:"700"},status:{borderRadius:12,borderWidth:1,borderColor:"rgba(85,216,117,.24)",backgroundColor:M.greenBg,paddingHorizontal:9,paddingVertical:6,flexDirection:"row",alignItems:"center",gap:6},statusPending:{borderColor:M.warmBorderSoft,backgroundColor:M.amberBg},statusText:{color:M.green,fontSize:8.5,fontWeight:"800",letterSpacing:.35},dateTitle:{color:M.text2,fontSize:13,fontWeight:"600",marginTop:8},dateTime:{color:M.muted,fontSize:12.5,marginTop:5},
  actionRow:{flexDirection:"row",gap:9,marginTop:15},secondaryAction:{flex:1,minHeight:49,borderRadius:14,borderWidth:1,borderColor:M.border,backgroundColor:M.panel3,flexDirection:"row",alignItems:"center",justifyContent:"center",gap:8,paddingHorizontal:8},secondaryText:{color:M.text2,fontSize:12.5,fontWeight:"700"},
  quickGrid:{flexDirection:"row",gap:10},quick:{flex:1,minHeight:145,borderRadius:18,borderWidth:1,borderColor:M.warmBorderSoft,backgroundColor:M.panel2,padding:14,...cardShadow},quickTop:{flexDirection:"row",alignItems:"center",justifyContent:"space-between"},quickIcon:{width:45,height:45,borderRadius:14,borderWidth:1,borderColor:M.border,backgroundColor:M.panel3,alignItems:"center",justifyContent:"center"},quickArrow:{color:M.accent,fontSize:24,fontWeight:"300"},quickTitle:{color:M.text,fontSize:14.5,fontWeight:"700",marginTop:15},quickSub:{color:M.muted,fontSize:11.5,lineHeight:16,marginTop:5},pressed:{opacity:.7,transform:[{scale:.99}]},
  services:{overflow:"hidden",backgroundColor:M.panel2},line:{height:1,backgroundColor:"rgba(255,255,255,.08)",marginLeft:76},serviceRow:{minHeight:82,paddingHorizontal:15,flexDirection:"row",alignItems:"center",gap:13},serviceMark:{width:48,height:48,borderRadius:15,backgroundColor:M.panel3,borderWidth:1,borderColor:M.border,alignItems:"center",justifyContent:"center"},serviceTitleRow:{flexDirection:"row",alignItems:"center",gap:8},serviceName:{color:M.text,fontSize:16,fontWeight:"700"},serviceMeta:{color:M.muted,fontSize:12.5,marginTop:5},servicePrice:{color:M.text,fontSize:15.5,fontWeight:"700",marginRight:5},favourite:{color:M.accent,fontSize:8.5,fontWeight:"800",letterSpacing:.4,borderWidth:1,borderColor:M.warmBorderSoft,borderRadius:9,paddingHorizontal:6,paddingVertical:3},chev:{color:M.accent,fontSize:25,fontWeight:"300"},
  visit:{padding:17,backgroundColor:M.panel2},visitTop:{flexDirection:"row",alignItems:"center",gap:13},locationIcon:{width:50,height:50,borderRadius:15,backgroundColor:M.panel3,borderWidth:1,borderColor:M.border,alignItems:"center",justifyContent:"center"},visitTitle:{color:M.text,fontSize:16.5,fontWeight:"700"},visitCopy:{color:M.muted,fontSize:12.5,lineHeight:18,marginTop:5},footer:{color:M.muted2,fontSize:9.5,fontWeight:"700",letterSpacing:1.5,textAlign:"center",marginTop:28,marginBottom:10}
});
