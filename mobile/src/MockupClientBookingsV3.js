import React,{useEffect,useMemo,useState}from"react";
import{ActivityIndicator,Alert,Pressable,SafeAreaView,ScrollView,StatusBar,StyleSheet,Text,View}from"react-native";
import AsyncStorage from"@react-native-async-storage/async-storage";
import{BrandLogo,M,Marble,cardShadow,shadow}from"./MockupTheme";
import{ClientHeader,ClientSection}from"./ClientLuxuryUI";

const API=(process.env.EXPO_PUBLIC_API_URL||"").replace(/\/$/,""),KEY="quincyfadez.paymentClientKey";
const read=r=>r.json().catch(()=>({}));
const parts=v=>{const d=new Date(v);return{date:d.toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"short",timeZone:"Europe/London"}),time:d.toLocaleTimeString("en-GB",{hour:"numeric",minute:"2-digit",hour12:true,timeZone:"Europe/London"}).replace(":00","")}};
const state=v=>String(v||"confirmed").replaceAll("_"," ").toUpperCase();

function Status({value}){
 const pending=value==="pending",bad=["cancelled","expired","no_show"].includes(value),done=value==="completed";
 return <View style={[s.status,pending&&s.statusPending,bad&&s.statusBad,done&&s.statusDone]}><Text style={[s.statusText,pending&&{color:M.amber},bad&&{color:M.red},done&&{color:M.muted}]}>{state(value)}</Text></View>;
}
function Booking({x,onCancel,onRebook,busy,past}){
 const p=parts(x.start_at);
 return <View style={s.booking}>
   <View style={s.bookingTop}>
    <BrandLogo size={48} compact/>
    <View style={{flex:1}}><Text style={s.service}>{x.service}</Text><Text style={s.price}>£{Number(x.price||0).toFixed(Number(x.price||0)%1?2:0)}</Text></View>
    <Status value={x.status}/>
   </View>
   <View style={s.detailRow}><View style={s.detail}><Text style={s.detailLabel}>DATE</Text><Text style={s.detailValue}>{p.date}</Text></View><View style={s.detailDivider}/><View style={s.detail}><Text style={s.detailLabel}>TIME</Text><Text style={s.detailValue}>{p.time}</Text></View></View>
   {["pending","confirmed"].includes(x.status)?<Pressable disabled={busy} onPress={()=>onCancel(x.id)} style={s.outlineButton}><Text style={s.outlineText}>{busy?"CANCELLING…":"CANCEL BOOKING"}</Text></Pressable>:past&&x.service?<Pressable onPress={()=>onRebook(x.service)} style={s.rebook}><Text style={s.rebookText}>REBOOK THIS SERVICE</Text><Text style={s.rebookArrow}>›</Text></Pressable>:null}
  </View>;
}

export default function MockupClientBookingsV3({onBack,onBook}){
 const[bookings,setBookings]=useState([]),[key,setKey]=useState(""),[loading,setLoading]=useState(true),[error,setError]=useState(""),[busy,setBusy]=useState("");
 const request=async(path,opt={})=>{const r=await fetch(`${API}${path}`,{...opt,headers:{"Content-Type":"application/json",...(opt.headers||{})}}),d=await read(r);if(!r.ok)throw new Error(typeof d.detail==="string"?d.detail:"Bookings could not be loaded.");return d};
 const refresh=async k=>{if(!k){setLoading(false);return}setLoading(true);setError("");try{setBookings((await request(`/api/booking/appointments/${encodeURIComponent(k)}`)).bookings||[])}catch(e){setError(e.message)}finally{setLoading(false)}};
 useEffect(()=>{AsyncStorage.getItem(KEY).then(k=>{setKey(k||"");return refresh(k||"")}).catch(()=>{setError("Your booking account could not be opened.");setLoading(false)})},[]);
 const cancel=async id=>{if(!key||busy)return;Alert.alert("Cancel booking?","This will release your appointment slot.",[{text:"Keep",style:"cancel"},{text:"Cancel Booking",style:"destructive",onPress:async()=>{setBusy(id);try{await request(`/api/booking/appointments/${id}/cancel`,{method:"POST",body:JSON.stringify({client_key:key})});await refresh(key)}catch(e){setError(e.message)}finally{setBusy("")}}}])};
 const now=Date.now();
 const up=useMemo(()=>bookings.filter(x=>["pending","confirmed"].includes(x.status)&&new Date(x.start_at).getTime()>=now).sort((a,b)=>String(a.start_at).localeCompare(String(b.start_at))),[bookings]);
 const past=useMemo(()=>bookings.filter(x=>!["pending","confirmed"].includes(x.status)||new Date(x.start_at).getTime()<now).sort((a,b)=>String(b.start_at).localeCompare(String(a.start_at))),[bookings]);
 return <Marble><SafeAreaView style={s.safe}><StatusBar barStyle="light-content"/><ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
   <ClientHeader title="My Bookings" subtitle="Upcoming visits first, with your most recent appointments just below." onBack={onBack}/>
   {loading?<View style={s.state}><ActivityIndicator color={M.gold}/><Text style={s.stateText}>Loading your appointments…</Text></View>:<>
    <ClientSection title="UPCOMING BOOKINGS"/>
    {up.length?up.map(x=><Booking key={x.id} x={x} onCancel={cancel} onRebook={service=>onBook(service)} busy={busy===x.id}/>):<View style={s.state}><Text style={s.emptyIcon}>▦</Text><Text style={s.emptyTitle}>No Upcoming Appointments</Text><Text style={s.stateText}>Book your next cut and it will appear here.</Text></View>}
    <ClientSection title="RECENT BOOKINGS"/>
    {past.length?past.map(x=><Booking key={x.id} x={x} onCancel={cancel} onRebook={service=>onBook(service)} busy={busy===x.id} past/>):<View style={s.state}><Text style={s.emptyIcon}>◷</Text><Text style={s.emptyTitle}>No Previous Appointments</Text><Text style={s.stateText}>Your most recent visits will appear here, newest first.</Text></View>}
   </>}
   {error?<View style={s.error}><Text style={s.errorText}>{error}</Text></View>:null}
   <Pressable onPress={()=>onBook()} style={s.book}><Text style={s.bookText}>BOOK ANOTHER APPOINTMENT</Text><Text style={s.bookArrow}>›</Text></Pressable>
  </ScrollView></SafeAreaView></Marble>;
}

const s=StyleSheet.create({
 safe:{flex:1},content:{paddingHorizontal:18,paddingTop:7,paddingBottom:112},
 booking:{borderRadius:16,borderWidth:1,borderColor:"rgba(214,189,122,.14)",backgroundColor:"rgba(12,12,11,.90)",padding:14,marginBottom:10,...cardShadow},bookingTop:{flexDirection:"row",alignItems:"center",gap:12},service:{color:M.text,fontSize:15,fontWeight:"700"},price:{color:M.goldSoft,fontSize:13,fontWeight:"700",marginTop:4},
 detailRow:{flexDirection:"row",alignItems:"stretch",borderTopWidth:1,borderTopColor:"rgba(255,255,255,.055)",marginTop:13,paddingTop:12},detail:{flex:1},detailDivider:{width:1,backgroundColor:"rgba(255,255,255,.055)",marginHorizontal:12},detailLabel:{color:M.muted2,fontSize:7.5,fontWeight:"800",letterSpacing:1},detailValue:{color:M.text2,fontSize:10.5,fontWeight:"600",marginTop:5},
 status:{borderRadius:8,borderWidth:1,borderColor:"#265438",backgroundColor:M.greenBg,paddingHorizontal:8,paddingVertical:6,alignSelf:"flex-start"},statusText:{color:M.green,fontSize:7,fontWeight:"900",letterSpacing:.45},statusPending:{borderColor:"#6C5728",backgroundColor:M.amberBg},statusBad:{borderColor:"#62352F",backgroundColor:M.redBg},statusDone:{borderColor:M.border,backgroundColor:M.panel2},
 outlineButton:{height:42,borderRadius:10,borderWidth:1,borderColor:"rgba(214,189,122,.20)",backgroundColor:"rgba(10,10,9,.32)",alignItems:"center",justifyContent:"center",marginTop:12},outlineText:{color:M.goldSoft,fontSize:8.5,fontWeight:"800",letterSpacing:.8},rebook:{height:44,borderRadius:10,backgroundColor:M.gold,marginTop:12,paddingHorizontal:13,flexDirection:"row",alignItems:"center",justifyContent:"space-between",...shadow},rebookText:{color:"#090704",fontSize:8.5,fontWeight:"900",letterSpacing:.8},rebookArrow:{color:"#090704",fontSize:21},
 state:{borderRadius:16,borderWidth:1,borderColor:"rgba(214,189,122,.12)",backgroundColor:"rgba(12,12,11,.88)",padding:22,alignItems:"center",...cardShadow},emptyIcon:{color:M.goldSoft,fontSize:31},emptyTitle:{color:M.text,fontSize:16,fontWeight:"700",marginTop:10},stateText:{color:M.muted,fontSize:10.5,lineHeight:16,textAlign:"center",marginTop:7},
 book:{height:56,borderRadius:12,backgroundColor:M.gold,borderWidth:1,borderColor:"rgba(241,221,162,.66)",marginTop:24,paddingHorizontal:16,flexDirection:"row",alignItems:"center",justifyContent:"space-between",...shadow},bookText:{color:"#090704",fontSize:9.5,fontWeight:"900",letterSpacing:.9},bookArrow:{color:"#090704",fontSize:23},error:{borderRadius:10,borderWidth:1,borderColor:"rgba(217,139,130,.28)",backgroundColor:M.redBg,padding:10,marginTop:11},errorText:{color:M.red,fontSize:10.5}
});
