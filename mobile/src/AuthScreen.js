import React, { useState } from "react";
import { ActivityIndicator, Pressable, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BG="#050505",GOLD="#D6BD7A",GOLD_LIGHT="#F1DDA2",BORDER="#3A3121",MUTED="#AAA49A",TEXT="#FBFAF6";
const API_URL=(process.env.EXPO_PUBLIC_API_URL||"").replace(/\/$/,"");
const SESSION_STORAGE="quincyfadez.clientSession";
const CLIENT_KEY_STORAGE="quincyfadez.paymentClientKey";
const PROFILE_STORAGE="quincyfadez.bookingProfile";
const ADMIN_TOKEN_STORAGE="quincyfadez.adminToken";

async function readJson(response){return response.json().catch(()=>({}));}
async function persistClientSession(session){
  const clientKey=session?.client_key||session?.profile?.client_key||"";
  const profile=session?.profile||{};
  const writes=[[SESSION_STORAGE,JSON.stringify(session)]];
  if(clientKey)writes.push([CLIENT_KEY_STORAGE,clientKey]);
  writes.push([PROFILE_STORAGE,JSON.stringify({name:profile.name||"",phone:profile.phone||"",email:profile.email||""})]);
  await AsyncStorage.multiSet(writes);
}

export default function AuthScreen({onClient,onAdmin}){
  const [mode,setMode]=useState("login"),[name,setName]=useState(""),[email,setEmail]=useState(""),[phone,setPhone]=useState(""),[password,setPassword]=useState(""),[error,setError]=useState(""),[busy,setBusy]=useState(false);
  const switchMode=next=>{setMode(next);setError("");setPassword("")};

  const clientLogin=async(cleanEmail)=>{
    const response=await fetch(`${API_URL}/api/client/login`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:cleanEmail,password})});
    const data=await readJson(response);
    if(!response.ok)return{ok:false,status:response.status,data};
    if(!data.token)throw new Error("The account server did not return a secure session.");
    const session={token:data.token,client_key:data.client_key||data.profile?.client_key||"",profile:data.profile||{name:data.name,email:data.email,phone:data.phone}};
    await AsyncStorage.removeItem(ADMIN_TOKEN_STORAGE).catch(()=>{});
    await persistClientSession(session);
    onClient(session);
    return{ok:true};
  };

  const ownerLogin=async()=>{
    const response=await fetch(`${API_URL}/api/admin/login`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({pin:password})});
    const data=await readJson(response);
    if(!response.ok)return false;
    if(!data.token)throw new Error("The secure owner session could not be created.");
    await AsyncStorage.multiRemove([SESSION_STORAGE,CLIENT_KEY_STORAGE,PROFILE_STORAGE]).catch(()=>{});
    await AsyncStorage.setItem(ADMIN_TOKEN_STORAGE,data.token);
    onAdmin({token:data.token});
    return true;
  };

  const signup=async(cleanEmail)=>{
    const response=await fetch(`${API_URL}/api/client/signup`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:name.trim(),phone:phone.trim(),email:cleanEmail,password})});
    const data=await readJson(response);
    if(!response.ok)throw new Error(typeof data.detail==="string"?data.detail:"Your account could not be created.");
    if(!data.token)throw new Error("The account server did not return a secure session.");
    const session={token:data.token,client_key:data.client_key||data.profile?.client_key||"",profile:data.profile||{name:name.trim(),phone:phone.trim(),email:cleanEmail}};
    await AsyncStorage.removeItem(ADMIN_TOKEN_STORAGE).catch(()=>{});
    await persistClientSession(session);
    onClient(session);
  };

  const submit=async()=>{
    if(busy)return;
    setError("");
    const cleanEmail=email.trim().toLowerCase();
    if(!API_URL){setError("The QuincyFadez account server is unavailable in this build.");return;}
    if(!cleanEmail.includes("@")){setError("Enter a valid email address.");return;}
    if(mode==="signup"){
      if(password.length<8){setError("Create a password with at least 8 characters.");return;}
      if(name.trim().length<2||phone.trim().length<7){setError("Add your name and mobile number to create your account.");return;}
    }else if(password.length<4){setError("Enter your password.");return;}
    setBusy(true);
    try{
      if(mode==="signup"){await signup(cleanEmail);return;}
      const client=await clientLogin(cleanEmail);
      if(client.ok)return;
      const owner=await ownerLogin();
      if(owner)return;
      const detail=client.data?.detail;
      throw new Error(typeof detail==="string"?detail:"Email or password is incorrect.");
    }catch(err){setError(err.message||"Your account could not be opened.")}
    finally{setBusy(false)}
  };

  return <SafeAreaView style={s.safe}><StatusBar barStyle="light-content" backgroundColor={BG}/><ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
    <View style={s.logo}><Text style={s.logoText}>QF</Text></View>
    <Text style={s.eyebrow}>QUINCYFADEZ</Text>
    <Text style={s.title}>{mode==="login"?"Welcome Back.":"Create Your Account."}</Text>
    <Text style={s.copy}>{mode==="login"?"Log in to continue to QuincyFadez.":"Create your client account to book and manage appointments."}</Text>
    <View style={s.tabs}><Pressable onPress={()=>switchMode("login")} style={[s.tab,mode==="login"&&s.tabActive]}><Text style={[s.tabText,mode==="login"&&s.tabTextActive]}>LOG IN</Text></Pressable><Pressable onPress={()=>switchMode("signup")} style={[s.tab,mode==="signup"&&s.tabActive]}><Text style={[s.tabText,mode==="signup"&&s.tabTextActive]}>SIGN UP</Text></Pressable></View>
    <View style={s.card}>
      {mode==="signup"?<><Text style={s.label}>NAME</Text><TextInput value={name} onChangeText={setName} placeholder="Your name" placeholderTextColor="#625E57" autoCapitalize="words" style={s.input}/><Text style={s.label}>MOBILE NUMBER</Text><TextInput value={phone} onChangeText={setPhone} placeholder="07..." placeholderTextColor="#625E57" keyboardType="phone-pad" style={s.input}/></>:null}
      <Text style={s.label}>EMAIL</Text><TextInput value={email} onChangeText={setEmail} placeholder="you@example.com" placeholderTextColor="#625E57" keyboardType="email-address" autoCapitalize="none" autoCorrect={false} style={s.input}/>
      <Text style={s.label}>PASSWORD</Text><TextInput value={password} onChangeText={setPassword} placeholder={mode==="signup"?"At least 8 characters":"Your password"} placeholderTextColor="#625E57" secureTextEntry autoCapitalize="none" style={s.input} onSubmitEditing={submit}/>
      {error?<View style={s.errorBox}><Text style={s.error}>{error}</Text></View>:null}
      <Pressable disabled={busy} onPress={submit} style={[s.primary,busy&&s.disabled]}>{busy?<ActivityIndicator color="#090909"/>:<><Text style={s.primaryText}>{mode==="signup"?"CREATE ACCOUNT":"CONTINUE"}</Text><Text style={s.arrow}>›</Text></>}</Pressable>
    </View>
    <Text style={s.security}>Secure sign-in. The app automatically opens the correct QuincyFadez experience after your credentials are verified.</Text>
  </ScrollView></SafeAreaView>;
}

const s=StyleSheet.create({
  safe:{flex:1,backgroundColor:BG},content:{flexGrow:1,paddingHorizontal:22,paddingTop:46,paddingBottom:38},logo:{width:78,height:78,borderRadius:39,borderWidth:1.5,borderColor:"#7A6330",backgroundColor:"#171107",alignItems:"center",justifyContent:"center",shadowColor:GOLD,shadowOpacity:.18,shadowRadius:18,shadowOffset:{width:0,height:7}},logoText:{color:GOLD_LIGHT,fontSize:26,fontWeight:"900"},eyebrow:{color:GOLD,fontSize:10,letterSpacing:2.1,fontWeight:"900",marginTop:26},title:{color:TEXT,fontSize:34,lineHeight:39,fontWeight:"850",marginTop:8},copy:{color:MUTED,fontSize:14,lineHeight:21,marginTop:10,maxWidth:340},tabs:{flexDirection:"row",backgroundColor:"#0A0907",borderWidth:1,borderColor:BORDER,borderRadius:18,padding:5,marginTop:28},tab:{flex:1,minHeight:48,borderRadius:13,alignItems:"center",justifyContent:"center"},tabActive:{backgroundColor:"#1B150A",borderWidth:1,borderColor:"#655028"},tabText:{color:"#77736D",fontSize:10,fontWeight:"900",letterSpacing:1},tabTextActive:{color:GOLD_LIGHT},card:{marginTop:14,borderRadius:22,borderWidth:1,borderColor:BORDER,backgroundColor:"#0E0C08",padding:17},label:{color:GOLD,fontSize:9.5,letterSpacing:1.1,fontWeight:"900",marginTop:12,marginBottom:7},input:{minHeight:56,borderRadius:15,borderWidth:1,borderColor:"#2D2A24",backgroundColor:"#0A0A09",color:TEXT,paddingHorizontal:15,fontSize:14},errorBox:{marginTop:13,borderRadius:12,borderWidth:1,borderColor:"#5B312B",backgroundColor:"#170C0A",padding:11},error:{color:"#E4A097",fontSize:11.5,lineHeight:17},primary:{minHeight:62,borderRadius:16,backgroundColor:GOLD,marginTop:18,paddingHorizontal:18,flexDirection:"row",alignItems:"center",justifyContent:"space-between",shadowColor:GOLD,shadowOpacity:.24,shadowRadius:18,shadowOffset:{width:0,height:7},elevation:4},primaryText:{color:"#090909",fontSize:11,letterSpacing:.9,fontWeight:"900"},arrow:{color:"#090909",fontSize:30},disabled:{opacity:.55},security:{color:"#706B63",fontSize:10.5,lineHeight:16,textAlign:"center",marginTop:16,paddingHorizontal:8}
});
