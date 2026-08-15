import React,{useEffect,useState}from"react";
import{ActivityIndicator,Pressable,SafeAreaView,ScrollView,StatusBar,StyleSheet,Text,TextInput,View}from"react-native";
import AsyncStorage from"@react-native-async-storage/async-storage";
import{BrandLogo,LuxuryBackButton,M,Marble,cardShadow,shadow}from"./MockupTheme";

const API=(process.env.EXPO_PUBLIC_API_URL||"").replace(/\/$/,"");
const SESSION="quincyfadez.clientSession",KEY="quincyfadez.paymentClientKey",PROFILE="quincyfadez.bookingProfile",ADMIN="quincyfadez.adminToken",REMEMBERED="quincyfadez.rememberedEmail";
const read=r=>r.json().catch(()=>({}));
async function saveClient(d){
 const k=d?.client_key||d?.profile?.client_key||"",p=d?.profile||{};
 const rows=[[SESSION,JSON.stringify(d)],[PROFILE,JSON.stringify({name:p.name||"",phone:p.phone||"",email:p.email||""})]];
 if(k)rows.push([KEY,k]);
 await AsyncStorage.multiSet(rows);
}

function Input({icon,right,...props}){
 return <View style={s.inputWrap}><Text style={s.inputIcon}>{icon}</Text><TextInput placeholderTextColor="#77736C" autoCorrect={false} style={s.input}{...props}/>{right}</View>;
}
function Divider(){return <View style={s.orRow}><View style={s.orLine}/><Text style={s.or}>OR</Text><View style={s.orLine}/></View>}

export default function MockupAuthScreenV2({onClient,onAdmin}){
 const[mode,setMode]=useState("login"),[name,setName]=useState(""),[phone,setPhone]=useState(""),[email,setEmail]=useState(""),[password,setPassword]=useState(""),[confirm,setConfirm]=useState(""),[remember,setRemember]=useState(true),[accepted,setAccepted]=useState(true),[showPassword,setShowPassword]=useState(false),[showConfirm,setShowConfirm]=useState(false),[error,setError]=useState(""),[busy,setBusy]=useState(false);
 const signup=mode==="signup",forgotMode=mode==="forgot";
 useEffect(()=>{AsyncStorage.getItem(REMEMBERED).then(saved=>{if(saved)setEmail(saved)}).catch(()=>{})},[]);
 const rememberEmail=async value=>{if(remember)await AsyncStorage.setItem(REMEMBERED,value);else await AsyncStorage.removeItem(REMEMBERED)};
 const submit=async()=>{
  if(busy)return;setError("");const e=email.trim().toLowerCase();
  if(!API)return setError("The QuincyFadez account service is unavailable in this build.");
  if(!e.includes("@"))return setError("Enter a valid email address.");
  if(signup&&(name.trim().length<2||phone.trim().length<7||password.length<8))return setError("Add your name, mobile number and a password of at least 8 characters.");
  if(signup&&password!==confirm)return setError("Your passwords do not match.");
  if(signup&&!accepted)return setError("Please accept the Terms of Service and Privacy Policy to continue.");
  if(!signup&&password.length<4)return setError("Enter your password.");
  setBusy(true);
  try{
   if(signup){
    const r=await fetch(`${API}/api/client/signup`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:name.trim(),phone:phone.trim(),email:e,password})}),d=await read(r);
    if(!r.ok)throw new Error(typeof d.detail==="string"?d.detail:"Your account could not be created.");
    await AsyncStorage.removeItem(ADMIN);await saveClient({token:d.token,client_key:d.client_key||d.profile?.client_key||"",profile:d.profile||{name:name.trim(),phone:phone.trim(),email:e}});await rememberEmail(e);onClient?.();return;
   }
   const cr=await fetch(`${API}/api/client/login`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:e,password})}),cd=await read(cr);
   if(cr.ok&&cd.token){await AsyncStorage.removeItem(ADMIN);await saveClient({token:cd.token,client_key:cd.client_key||cd.profile?.client_key||"",profile:cd.profile||{name:cd.name,email:cd.email,phone:cd.phone}});await rememberEmail(e);onClient?.();return}
   const ar=await fetch(`${API}/api/admin/login`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({pin:password})}),ad=await read(ar);
   if(ar.ok&&ad.token){await AsyncStorage.multiRemove([SESSION,KEY,PROFILE]);await AsyncStorage.setItem(ADMIN,ad.token);await rememberEmail(e);onAdmin?.();return}
   throw new Error(typeof cd.detail==="string"?cd.detail:"Email or password is incorrect.");
  }catch(e2){setError(e2.message||"Your account could not be opened.")}finally{setBusy(false)}
 };
 const forgot=()=>setError("Password reset is not live yet. Please contact QuincyFadez if you need help accessing your account.");
 const switchMode=next=>{setMode(next);setError("");setPassword("");setConfirm("")};
 return <Marble><SafeAreaView style={s.safe}><StatusBar barStyle="light-content"/><ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
   {forgotMode?<View style={s.backWrap}><LuxuryBackButton onPress={()=>switchMode("login")}/></View>:null}
   <View style={s.logoWrap}><BrandLogo size={88} compact/><Text style={s.brand}>QUINCYFADEZ</Text><Text style={s.tag}>ALL FADEZ. ONE EXPERIENCE.</Text></View>
   <View style={s.card}>
    <Text style={s.welcome}>{forgotMode?"Forgot Password?":signup?"Create Account":"Welcome Back"}</Text>
    <Text style={s.copy}>{forgotMode?"Enter your email and we’ll help you get back into your account.":signup?"Create your account to book and manage your QuincyFadez appointments.":"Log in to continue"}</Text>
    {signup?<Input icon="♙" value={name} onChangeText={setName} placeholder="Full Name" autoCapitalize="words"/>:null}
    <Input icon="✉" value={email} onChangeText={setEmail} placeholder="Email Address" keyboardType="email-address" autoCapitalize="none"/>
    {signup?<Input icon="☎" value={phone} onChangeText={setPhone} placeholder="Phone Number" keyboardType="phone-pad"/>:null}
    {!forgotMode?<Input icon="◇" value={password} onChangeText={setPassword} placeholder="Password" secureTextEntry={!showPassword} autoCapitalize="none" onSubmitEditing={signup?undefined:submit} right={<Pressable onPress={()=>setShowPassword(v=>!v)} style={s.eyeButton}><Text style={s.eye}>{showPassword?"◉":"◎"}</Text></Pressable>}/>:null}
    {signup?<Input icon="◇" value={confirm} onChangeText={setConfirm} placeholder="Confirm Password" secureTextEntry={!showConfirm} autoCapitalize="none" onSubmitEditing={submit} right={<Pressable onPress={()=>setShowConfirm(v=>!v)} style={s.eyeButton}><Text style={s.eye}>{showConfirm?"◉":"◎"}</Text></Pressable>}/>:null}
    {!signup&&!forgotMode?<View style={s.helperRow}><Pressable onPress={()=>setRemember(v=>!v)} style={s.remember}><View style={[s.checkbox,remember&&s.checkboxOn]}>{remember?<Text style={s.check}>✓</Text>:null}</View><Text style={s.helperText}>Remember Me</Text></Pressable><Pressable onPress={()=>switchMode("forgot")}><Text style={s.forgot}>Forgot Password?</Text></Pressable></View>:null}
    {signup?<Pressable onPress={()=>setAccepted(v=>!v)} style={s.termsRow}><View style={[s.checkbox,accepted&&s.checkboxOn]}>{accepted?<Text style={s.check}>✓</Text>:null}</View><Text style={s.termsText}>I agree to the <Text style={s.termsGold}>Terms of Service</Text> and <Text style={s.termsGold}>Privacy Policy</Text>.</Text></Pressable>:null}
    {error?<View style={s.error}><Text style={s.errorText}>{error}</Text></View>:null}
    <Pressable disabled={busy} onPress={forgotMode?forgot:submit} style={s.primary}>{busy?<ActivityIndicator color="#080705"/>:<Text style={s.primaryText}>{forgotMode?"SEND RESET LINK":signup?"CREATE ACCOUNT":"LOG IN"}</Text>}</Pressable>
    {forgotMode?<Pressable onPress={()=>switchMode("login")} style={s.inlineLink}><Text style={s.inlineMuted}>Remember your password? </Text><Text style={s.inlineGold}>Log In</Text></Pressable>:<><Divider/><Pressable onPress={()=>switchMode(signup?"login":"signup")} style={s.secondary}><Text style={s.secondaryText}>{signup?"LOG IN":"CREATE ACCOUNT"}</Text></Pressable></>}
   </View>
   {!forgotMode?<Text style={s.legal}>By continuing, you agree to our <Text style={s.legalGold}>Terms of Service</Text>{"\n"}and <Text style={s.legalGold}>Privacy Policy</Text>.</Text>:null}
  </ScrollView></SafeAreaView></Marble>;
}

const s=StyleSheet.create({
 safe:{flex:1},content:{flexGrow:1,paddingHorizontal:26,paddingTop:22,paddingBottom:28,justifyContent:"center"},backWrap:{position:"absolute",left:24,top:28,zIndex:5},logoWrap:{alignItems:"center",marginBottom:25},brand:{color:M.goldSoft,fontSize:17,fontWeight:"700",letterSpacing:4.1,marginTop:15},tag:{color:M.muted,fontSize:8.5,fontWeight:"600",letterSpacing:2.15,marginTop:7},
 card:{borderRadius:20,borderWidth:1,borderColor:"rgba(214,189,122,.14)",backgroundColor:"rgba(11,11,10,.92)",padding:20,...cardShadow},welcome:{color:M.text,fontSize:24,fontWeight:"700",textAlign:"center",letterSpacing:.1},copy:{color:M.muted,fontSize:11.5,lineHeight:17,textAlign:"center",marginTop:7,marginBottom:9,paddingHorizontal:10},
 inputWrap:{height:56,borderRadius:12,borderWidth:1,borderColor:"rgba(214,189,122,.14)",backgroundColor:"rgba(5,5,5,.76)",flexDirection:"row",alignItems:"center",paddingHorizontal:14,marginTop:11},inputIcon:{color:M.goldSoft,fontSize:16,width:31,textAlign:"center"},input:{flex:1,color:M.text,fontSize:13.5,fontWeight:"500"},eyeButton:{width:34,height:40,alignItems:"center",justifyContent:"center"},eye:{color:M.goldSoft,fontSize:17},
 helperRow:{flexDirection:"row",alignItems:"center",justifyContent:"space-between",marginTop:13},remember:{flexDirection:"row",alignItems:"center",gap:8},checkbox:{width:21,height:21,borderRadius:5,borderWidth:1,borderColor:"rgba(214,189,122,.30)",backgroundColor:"rgba(12,12,11,.72)",alignItems:"center",justifyContent:"center"},checkboxOn:{borderColor:M.goldDeep,backgroundColor:"rgba(214,189,122,.12)"},check:{color:M.goldSoft,fontSize:12,fontWeight:"900"},helperText:{color:M.text2,fontSize:10.5},forgot:{color:M.goldSoft,fontSize:10.5,fontWeight:"600"},termsRow:{flexDirection:"row",alignItems:"flex-start",gap:9,marginTop:13},termsText:{flex:1,color:M.muted,fontSize:9.5,lineHeight:14},termsGold:{color:M.goldSoft},
 error:{borderRadius:10,borderWidth:1,borderColor:"rgba(217,139,130,.30)",backgroundColor:M.redBg,padding:10,marginTop:12},errorText:{color:M.red,fontSize:10,lineHeight:14},primary:{height:56,borderRadius:12,backgroundColor:M.gold,borderWidth:1,borderColor:"rgba(241,221,162,.72)",alignItems:"center",justifyContent:"center",marginTop:17,...shadow},primaryText:{color:"#080705",fontSize:12,fontWeight:"900",letterSpacing:1.35},
 orRow:{flexDirection:"row",alignItems:"center",gap:11,marginVertical:15},orLine:{height:1,flex:1,backgroundColor:"rgba(255,255,255,.075)"},or:{color:M.muted2,fontSize:8,fontWeight:"800",letterSpacing:1.2},secondary:{height:54,borderRadius:12,borderWidth:1,borderColor:"rgba(214,189,122,.42)",backgroundColor:"rgba(10,10,9,.36)",alignItems:"center",justifyContent:"center"},secondaryText:{color:M.goldSoft,fontSize:11,fontWeight:"800",letterSpacing:1.15},inlineLink:{flexDirection:"row",justifyContent:"center",marginTop:18},inlineMuted:{color:M.muted,fontSize:10.5},inlineGold:{color:M.goldSoft,fontSize:10.5,fontWeight:"700"},legal:{color:M.muted2,fontSize:9,lineHeight:14,textAlign:"center",marginTop:18},legalGold:{color:M.goldSoft}
});
