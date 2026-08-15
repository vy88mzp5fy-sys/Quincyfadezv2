import React,{useState}from"react";
import{ActivityIndicator,Pressable,SafeAreaView,ScrollView,StatusBar,StyleSheet,Text,TextInput,View}from"react-native";
import AsyncStorage from"@react-native-async-storage/async-storage";
import{BrandLogo,GoldButton,M,Marble,cardShadow}from"./MockupTheme";

const API=(process.env.EXPO_PUBLIC_API_URL||"").replace(/\/$/,"");
const SESSION="quincyfadez.clientSession",KEY="quincyfadez.paymentClientKey",PROFILE="quincyfadez.bookingProfile",ADMIN="quincyfadez.adminToken";
const read=r=>r.json().catch(()=>({}));
async function saveClient(d){const k=d?.client_key||d?.profile?.client_key||"",p=d?.profile||{};const rows=[[SESSION,JSON.stringify(d)],[PROFILE,JSON.stringify({name:p.name||"",phone:p.phone||"",email:p.email||""})]];if(k)rows.push([KEY,k]);await AsyncStorage.multiSet(rows)}

function Input({label,...props}){return <View style={s.field}><Text style={s.label}>{label}</Text><TextInput placeholderTextColor="#6F675C" autoCorrect={false} style={s.input} {...props}/></View>}

export default function MockupAuthScreen({onClient,onAdmin}){
 const[mode,setMode]=useState("login"),[name,setName]=useState(""),[phone,setPhone]=useState(""),[email,setEmail]=useState(""),[password,setPassword]=useState(""),[error,setError]=useState(""),[busy,setBusy]=useState(false);
 const signup=mode==="signup";
 const submit=async()=>{
  if(busy)return;setError("");const e=email.trim().toLowerCase();
  if(!API)return setError("The QuincyFadez account service is unavailable in this build.");
  if(!e.includes("@"))return setError("Enter a valid email address.");
  if(signup&&(name.trim().length<2||phone.trim().length<7||password.length<8))return setError("Add your name, mobile number and a password of at least 8 characters.");
  if(!signup&&password.length<4)return setError("Enter your password.");
  setBusy(true);
  try{
   if(signup){const r=await fetch(`${API}/api/client/signup`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:name.trim(),phone:phone.trim(),email:e,password})}),d=await read(r);if(!r.ok)throw new Error(typeof d.detail==="string"?d.detail:"Your account could not be created.");await AsyncStorage.removeItem(ADMIN);await saveClient({token:d.token,client_key:d.client_key||d.profile?.client_key||"",profile:d.profile||{name:name.trim(),phone:phone.trim(),email:e}});onClient?.();return}
   const cr=await fetch(`${API}/api/client/login`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:e,password})}),cd=await read(cr);
   if(cr.ok&&cd.token){await AsyncStorage.removeItem(ADMIN);await saveClient({token:cd.token,client_key:cd.client_key||cd.profile?.client_key||"",profile:cd.profile||{name:cd.name,email:cd.email,phone:cd.phone}});onClient?.();return}
   const ar=await fetch(`${API}/api/admin/login`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({pin:password})}),ad=await read(ar);
   if(ar.ok&&ad.token){await AsyncStorage.multiRemove([SESSION,KEY,PROFILE]);await AsyncStorage.setItem(ADMIN,ad.token);onAdmin?.();return}
   throw new Error(typeof cd.detail==="string"?cd.detail:"Email or password is incorrect.");
  }catch(e2){setError(e2.message||"Your account could not be opened.")}finally{setBusy(false)}
 };
 return <Marble><SafeAreaView style={s.safe}><StatusBar barStyle="light-content" backgroundColor="transparent" translucent={false}/><ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
  <View style={s.logoWrap}><BrandLogo size={106}/><Text style={s.brand}>QuincyFadez</Text><Text style={s.tag}>PRECISION. STYLE. CONFIDENCE.</Text></View>
  <View style={s.card}>
   <Text style={s.welcome}>{signup?"Create your account":"Welcome back"}</Text>
   <Text style={s.copy}>{signup?"Join QuincyFadez and manage every appointment from one place.":"Log in to continue your QuincyFadez experience."}</Text>
   <View style={s.tabs}><Pressable onPress={()=>{setMode("login");setError("")}} style={[s.tab,!signup&&s.tabOn]}><Text style={[s.tabText,!signup&&s.tabTextOn]}>LOG IN</Text></Pressable><Pressable onPress={()=>{setMode("signup");setError("")}} style={[s.tab,signup&&s.tabOn]}><Text style={[s.tabText,signup&&s.tabTextOn]}>SIGN UP</Text></Pressable></View>
   {signup?<><Input label="FULL NAME" value={name} onChangeText={setName} placeholder="Your name" autoCapitalize="words"/><Input label="MOBILE NUMBER" value={phone} onChangeText={setPhone} placeholder="07..." keyboardType="phone-pad"/></>:null}
   <Input label="EMAIL" value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none"/>
   <Input label="PASSWORD" value={password} onChangeText={setPassword} placeholder={signup?"At least 8 characters":"Your password"} secureTextEntry autoCapitalize="none" onSubmitEditing={submit}/>
   {error?<View style={s.error}><Text style={s.errorText}>{error}</Text></View>:null}
   {busy?<View style={s.busy}><ActivityIndicator color="#0A0805"/></View>:<GoldButton title={signup?"CREATE ACCOUNT":"LOG IN"} subtitle={signup?"Create Your QuincyFadez Access":"Secure Client Access"} onPress={submit} style={s.primary}/>} 
   <Text style={s.small}>{signup?"Already have an account?":"New here?"}</Text>
   <Pressable onPress={()=>{setMode(signup?"login":"signup");setError("")}} style={s.secondary}><Text style={s.secondaryText}>{signup?"LOG IN":"CREATE ACCOUNT"}</Text></Pressable>
  </View>
  <Text style={s.footer}>PREMIUM BARBER EXPERIENCE · OXFORD</Text>
 </ScrollView></SafeAreaView></Marble>
}

const s=StyleSheet.create({safe:{flex:1},content:{flexGrow:1,paddingHorizontal:24,paddingTop:34,paddingBottom:34,justifyContent:"center"},logoWrap:{alignItems:"center",marginBottom:24},brand:{color:M.goldSoft,fontSize:31,fontWeight:"800",letterSpacing:.7,marginTop:13},tag:{color:M.gold,fontSize:8.5,fontWeight:"900",letterSpacing:2.15,marginTop:7},card:{borderRadius:18,borderWidth:1,borderColor:M.border,backgroundColor:"rgba(8,6,4,.92)",padding:19,...cardShadow},welcome:{color:M.text,fontSize:23,fontWeight:"800"},copy:{color:M.muted,fontSize:12.5,lineHeight:18,marginTop:5},tabs:{flexDirection:"row",backgroundColor:"#080603",borderWidth:1,borderColor:M.borderSoft,borderRadius:12,padding:4,marginTop:17},tab:{flex:1,minHeight:40,borderRadius:8,alignItems:"center",justifyContent:"center"},tabOn:{backgroundColor:M.panel3,borderWidth:1,borderColor:M.goldDark},tabText:{color:M.muted2,fontSize:8.5,fontWeight:"900",letterSpacing:1},tabTextOn:{color:M.goldSoft},field:{marginTop:14},label:{color:M.gold,fontSize:8.5,fontWeight:"900",letterSpacing:1.15,marginBottom:6},input:{height:54,borderRadius:10,borderWidth:1,borderColor:"#342819",backgroundColor:"#090704",color:M.text,fontSize:14,paddingHorizontal:14},error:{borderRadius:9,borderWidth:1,borderColor:"#63372E",backgroundColor:M.redBg,padding:10,marginTop:12},errorText:{color:M.red,fontSize:10.5,lineHeight:15},primary:{marginTop:16,borderRadius:10},busy:{minHeight:58,borderRadius:10,backgroundColor:M.gold,alignItems:"center",justifyContent:"center",marginTop:16},small:{color:M.muted,fontSize:9.5,textAlign:"center",marginTop:14},secondary:{height:47,borderRadius:10,borderWidth:1,borderColor:M.goldDeep,alignItems:"center",justifyContent:"center",marginTop:8},secondaryText:{color:M.goldSoft,fontSize:9.5,fontWeight:"900",letterSpacing:1.15},footer:{color:M.muted2,fontSize:8,fontWeight:"800",letterSpacing:1.2,textAlign:"center",marginTop:18}});