import React,{useEffect,useState} from "react";
import {ActivityIndicator,KeyboardAvoidingView,Platform,Pressable,SafeAreaView,ScrollView,StatusBar,StyleSheet,Text,TextInput,View} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {BrandLogo,M,Marble,PrimaryButton,Surface} from "./QFTheme";

const API=(process.env.EXPO_PUBLIC_API_URL||"").replace(/\/$/,"");
const SESSION="quincyfadez.clientSession",KEY="quincyfadez.paymentClientKey",PROFILE="quincyfadez.bookingProfile",ADMIN="quincyfadez.adminToken",REMEMBERED="quincyfadez.rememberedEmail";
const read=r=>r.json().catch(()=>({}));

async function saveClient(d){
  const p=d?.profile||{},k=d?.client_key||p?.client_key||"";
  const rows=[[SESSION,JSON.stringify(d)],[PROFILE,JSON.stringify({name:p.name||"",phone:p.phone||"",email:p.email||""})]];
  if(k)rows.push([KEY,k]);
  await AsyncStorage.multiSet(rows);
}

function Field({label,secure=false,right,value,onChangeText,...props}){
  return <View style={s.field}><View style={s.fieldTop}><Text style={s.label}>{label}</Text>{right}</View><TextInput value={value} onChangeText={onChangeText} secureTextEntry={secure} placeholderTextColor={M.muted2} autoCorrect={false} style={s.input}{...props}/></View>;
}
function Toggle({value,onPress,label}){return <Pressable onPress={onPress} style={s.toggleRow}><View style={[s.checkBox,value&&s.checkBoxOn]}>{value?<Text style={s.check}>✓</Text>:null}</View><Text style={s.toggleLabel}>{label}</Text></Pressable>}

export default function QFAuthScreen({onClient,onAdmin}){
  const[mode,setMode]=useState("login"),[name,setName]=useState(""),[phone,setPhone]=useState(""),[email,setEmail]=useState(""),[password,setPassword]=useState(""),[confirm,setConfirm]=useState(""),[pin,setPin]=useState(""),[remember,setRemember]=useState(true),[accepted,setAccepted]=useState(true),[show,setShow]=useState(false),[error,setError]=useState(""),[busy,setBusy]=useState(false);
  const signup=mode==="signup",forgot=mode==="forgot",owner=mode==="owner";
  useEffect(()=>{AsyncStorage.getItem(REMEMBERED).then(v=>{if(v)setEmail(v)}).catch(()=>{})},[]);
  const switchMode=m=>{setMode(m);setError("");setPassword("");setConfirm("");setPin("")};
  const rememberEmail=async e=>{if(remember)await AsyncStorage.setItem(REMEMBERED,e);else await AsyncStorage.removeItem(REMEMBERED)};
  const submit=async()=>{
    if(busy)return;setError("");
    if(!API)return setError("The QuincyFadez account service is unavailable in this build.");
    setBusy(true);
    try{
      if(owner){
        if(pin.trim().length<4)throw new Error("Enter your owner PIN.");
        const r=await fetch(`${API}/api/admin/login`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({pin:pin.trim()})}),d=await read(r);
        if(!r.ok||!d.token)throw new Error(typeof d.detail==="string"?d.detail:"Owner access could not be opened.");
        await AsyncStorage.multiRemove([SESSION,KEY,PROFILE]);await AsyncStorage.setItem(ADMIN,d.token);onAdmin?.();return;
      }
      if(forgot){setError("Password reset is not live yet. Contact QuincyFadez if you need help accessing your account.");return}
      const e=email.trim().toLowerCase();
      if(!e.includes("@"))throw new Error("Enter a valid email address.");
      if(signup){
        if(name.trim().length<2||phone.trim().length<7)throw new Error("Add your name and mobile number.");
        if(password.length<8)throw new Error("Use a password of at least 8 characters.");
        if(password!==confirm)throw new Error("Your passwords do not match.");
        if(!accepted)throw new Error("Please accept the Terms of Service and Privacy Policy.");
        const r=await fetch(`${API}/api/client/signup`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:name.trim(),phone:phone.trim(),email:e,password})}),d=await read(r);
        if(!r.ok)throw new Error(typeof d.detail==="string"?d.detail:"Your account could not be created.");
        await AsyncStorage.removeItem(ADMIN);await saveClient({token:d.token,client_key:d.client_key||d.profile?.client_key||"",profile:d.profile||{name:name.trim(),phone:phone.trim(),email:e}});await rememberEmail(e);onClient?.();return;
      }
      if(password.length<4)throw new Error("Enter your password.");
      const r=await fetch(`${API}/api/client/login`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:e,password})}),d=await read(r);
      if(!r.ok||!d.token)throw new Error(typeof d.detail==="string"?d.detail:"Email or password is incorrect.");
      await AsyncStorage.removeItem(ADMIN);await saveClient({token:d.token,client_key:d.client_key||d.profile?.client_key||"",profile:d.profile||{name:d.name||"",phone:d.phone||"",email:d.email||e}});await rememberEmail(e);onClient?.();
    }catch(e2){setError(e2.message||"That action could not be completed.")}finally{setBusy(false)}
  };
  const title=owner?"Owner access":forgot?"Reset your password":signup?"Create your account":"Welcome back";
  const copy=owner?"Private access to your QuincyFadez command centre.":forgot?"Enter your email and we’ll help you regain access.":signup?"Book faster, manage appointments and get slot alerts in one place.":"Your appointments, preferences and next cut — ready when you are.";
  return <Marble><SafeAreaView style={s.safe}><StatusBar barStyle="light-content"/><KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS==="ios"?"padding":undefined}><ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
    <View style={s.brand}><BrandLogo size={76}/><Text style={s.wordmark}>QUINCYFADEZ</Text><Text style={s.tag}>PRECISION BOOKING · PREMIUM SERVICE</Text></View>
    <Surface style={s.card}>
      <View style={s.cardHead}><Text style={s.title}>{title}</Text><Text style={s.copy}>{copy}</Text></View>
      {signup?<Field label="Full name" value={name} onChangeText={setName} placeholder="Your name" autoCapitalize="words"/>:null}
      {!owner?<Field label="Email address" value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none"/>:null}
      {signup?<Field label="Mobile number" value={phone} onChangeText={setPhone} placeholder="07..." keyboardType="phone-pad"/>:null}
      {!forgot&&!owner?<Field label="Password" value={password} onChangeText={setPassword} placeholder="••••••••" secure={!show} autoCapitalize="none" right={<Pressable onPress={()=>setShow(v=>!v)}><Text style={s.fieldAction}>{show?"Hide":"Show"}</Text></Pressable>}/>:null}
      {signup?<Field label="Confirm password" value={confirm} onChangeText={setConfirm} placeholder="••••••••" secure={!show} autoCapitalize="none"/>:null}
      {owner?<Field label="Owner PIN" value={pin} onChangeText={setPin} placeholder="Enter PIN" secure={!show} keyboardType="number-pad" right={<Pressable onPress={()=>setShow(v=>!v)}><Text style={s.fieldAction}>{show?"Hide":"Show"}</Text></Pressable>}/>:null}
      {!signup&&!forgot&&!owner?<View style={s.helper}><Toggle value={remember} onPress={()=>setRemember(v=>!v)} label="Remember me"/><Pressable onPress={()=>switchMode("forgot")}><Text style={s.link}>Forgot password?</Text></Pressable></View>:null}
      {signup?<View style={s.terms}><Toggle value={accepted} onPress={()=>setAccepted(v=>!v)} label="I agree to the Terms of Service and Privacy Policy"/></View>:null}
      {error?<View style={s.error}><Text style={s.errorText}>{error}</Text></View>:null}
      <PrimaryButton title={busy?"Please wait…":owner?"Open command centre":forgot?"Send reset link":signup?"Create account":"Log in"} onPress={submit} disabled={busy} style={s.submit} right={busy?"":"›"}/>
      {!owner&&!forgot?<View style={s.divider}><View style={s.line}/><Text style={s.or}>OR</Text><View style={s.line}/></View>:null}
      {!owner&&!forgot?<Pressable onPress={()=>switchMode(signup?"login":"signup")} style={({pressed})=>[s.secondary,pressed&&{opacity:.7}]}><Text style={s.secondaryText}>{signup?"Already have an account? Log in":"New to QuincyFadez? Create account"}</Text></Pressable>:null}
      {(owner||forgot)?<Pressable onPress={()=>switchMode("login")} style={s.backLink}><Text style={s.link}>Back to client login</Text></Pressable>:null}
    </Surface>
    {!owner&&!forgot?<Pressable onPress={()=>switchMode("owner")} style={s.ownerLink}><View style={s.ownerDot}/><Text style={s.ownerText}>Owner access</Text></Pressable>:null}
  </ScrollView></KeyboardAvoidingView></SafeAreaView></Marble>;
}

const s=StyleSheet.create({
  safe:{flex:1},content:{flexGrow:1,paddingHorizontal:22,paddingTop:34,paddingBottom:34,justifyContent:"center"},brand:{alignItems:"center",marginBottom:24},wordmark:{color:M.text,fontSize:15,fontWeight:"800",letterSpacing:3.6,marginTop:14},tag:{color:M.muted,fontSize:8,fontWeight:"700",letterSpacing:1.6,marginTop:7},card:{padding:19},cardHead:{marginBottom:5},title:{color:M.text,fontSize:28,fontWeight:"700",letterSpacing:-.7},copy:{color:M.muted,fontSize:11.5,lineHeight:17,marginTop:7,maxWidth:330},field:{marginTop:15},fieldTop:{height:20,flexDirection:"row",alignItems:"center",justifyContent:"space-between"},label:{color:M.text2,fontSize:10.5,fontWeight:"700"},fieldAction:{color:M.accentSoft,fontSize:10,fontWeight:"700"},input:{height:55,borderRadius:15,borderWidth:1,borderColor:"rgba(255,255,255,.10)",backgroundColor:"#0D0D0D",color:M.text,fontSize:14,paddingHorizontal:14,marginTop:5},helper:{flexDirection:"row",alignItems:"center",justifyContent:"space-between",marginTop:15},toggleRow:{flexDirection:"row",alignItems:"center",gap:8,flexShrink:1},checkBox:{width:20,height:20,borderRadius:7,borderWidth:1,borderColor:"rgba(255,255,255,.14)",backgroundColor:"#0D0D0D",alignItems:"center",justifyContent:"center"},checkBoxOn:{borderColor:"rgba(214,183,92,.55)",backgroundColor:"rgba(214,183,92,.12)"},check:{color:M.accentSoft,fontSize:11,fontWeight:"900"},toggleLabel:{color:M.muted,fontSize:9.8,flexShrink:1},link:{color:M.accentSoft,fontSize:10.5,fontWeight:"700"},terms:{marginTop:15},error:{borderRadius:13,borderWidth:1,borderColor:"rgba(217,141,134,.24)",backgroundColor:M.redBg,padding:11,marginTop:14},errorText:{color:M.red,fontSize:10.5,lineHeight:15},submit:{marginTop:17},divider:{flexDirection:"row",alignItems:"center",gap:10,marginVertical:15},line:{height:1,flex:1,backgroundColor:"rgba(255,255,255,.06)"},or:{color:M.muted2,fontSize:8,fontWeight:"800",letterSpacing:1},secondary:{height:50,borderRadius:15,borderWidth:1,borderColor:"rgba(255,255,255,.09)",backgroundColor:M.panel2,alignItems:"center",justifyContent:"center"},secondaryText:{color:M.text2,fontSize:11,fontWeight:"700"},backLink:{alignItems:"center",marginTop:17},ownerLink:{alignSelf:"center",flexDirection:"row",alignItems:"center",gap:7,marginTop:18,padding:8},ownerDot:{width:6,height:6,borderRadius:3,backgroundColor:M.accentDark},ownerText:{color:M.muted,fontSize:9.5,fontWeight:"700"}
});
