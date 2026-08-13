import React, { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BG="#050505",GOLD="#D6BD7A",GOLD_LIGHT="#F1DDA2",BORDER="#242424",MUTED="#929292";
const API_URL=(process.env.EXPO_PUBLIC_API_URL||"").replace(/\/$/,"");
const SESSION_STORAGE="quincyfadez.clientSession";
const CLIENT_KEY_STORAGE="quincyfadez.paymentClientKey";
const PROFILE_STORAGE="quincyfadez.bookingProfile";

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
  const [mode,setMode]=useState("login"),[name,setName]=useState(""),[email,setEmail]=useState(""),[phone,setPhone]=useState(""),[password,setPassword]=useState(""),[error,setError]=useState(""),[busy,setBusy]=useState(false),[restoring,setRestoring]=useState(true);

  useEffect(()=>{
    let active=true;
    (async()=>{
      try{
        const saved=await AsyncStorage.getItem(SESSION_STORAGE);
        if(!saved||!API_URL)return;
        const session=JSON.parse(saved);
        if(!session?.token)return;
        const response=await fetch(`${API_URL}/api/client/me`,{headers:{Authorization:`Bearer ${session.token}`}});
        const data=await readJson(response);
        if(response.ok&&active){
          const restored={...session,...data,client_key:data.client_key||session.client_key||data.profile?.client_key||"",profile:data.profile||session.profile||{}};
          await persistClientSession(restored);
          onClient(restored);
          return;
        }
        await AsyncStorage.removeItem(SESSION_STORAGE);
      }catch(_){
        await AsyncStorage.removeItem(SESSION_STORAGE).catch(()=>{});
      }finally{if(active)setRestoring(false)}
    })();
    if(!API_URL)setRestoring(false);
    return()=>{active=false};
  },[onClient]);

  const switchMode=next=>{setMode(next);setError("");setPassword("")};

  const submit=async()=>{
    if(busy)return;
    setError("");
    const cleanEmail=email.trim().toLowerCase();
    if(!API_URL){setError("The QuincyFadez account server is still being connected for this preview build.");return;}
    if(!cleanEmail.includes("@")||password.length<8){setError("Enter a valid email and a password with at least 8 characters.");return;}
    if(mode==="signup"&&(name.trim().length<2||phone.trim().length<7)){setError("Add your name and mobile number to create your client account.");return;}
    setBusy(true);
    try{
      const path=mode==="signup"?"/api/client/signup":"/api/client/login";
      const body=mode==="signup"?{name:name.trim(),phone:phone.trim(),email:cleanEmail,password}:{email:cleanEmail,password};
      const response=await fetch(`${API_URL}${path}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
      const data=await readJson(response);
      if(!response.ok)throw new Error(typeof data.detail==="string"?data.detail:"Your account could not be opened.");
      if(!data.token)throw new Error("The account server did not return a secure session.");
      const session={token:data.token,client_key:data.client_key||data.profile?.client_key||"",profile:data.profile||{name:data.name,email:data.email,phone:data.phone}};
      await persistClientSession(session);
      onClient(session);
    }catch(err){setError(err.message||"Your account could not be opened.")}
    finally{setBusy(false)}
  };

  if(restoring)return <SafeAreaView style={s.safe}><StatusBar barStyle="light-content" backgroundColor={BG}/><View style={s.restoring}><View style={s.logo}><Text style={s.logoText}>QF</Text></View><ActivityIndicator color={GOLD_LIGHT} style={{marginTop:22}}/><Text style={s.restoringText}>OPENING QUINCYFADEZ…</Text></View></SafeAreaView>;

  return <SafeAreaView style={s.safe}><StatusBar barStyle="light-content" backgroundColor={BG}/><ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled"><View style={s.logo}><Text style={s.logoText}>QF</Text></View><Text style={s.eyebrow}>QUINCYFADEZ</Text><Text style={s.title}>Your Cut. Your Account.</Text><Text style={s.copy}>Clients sign in here to book and manage appointments. Owner access opens a completely separate admin workspace.</Text><View style={s.tabs}><Pressable onPress={()=>switchMode("login")} style={[s.tab,mode==="login"&&s.tabActive]}><Text style={[s.tabText,mode==="login"&&s.tabTextActive]}>LOG IN</Text></Pressable><Pressable onPress={()=>switchMode("signup")} style={[s.tab,mode==="signup"&&s.tabActive]}><Text style={[s.tabText,mode==="signup"&&s.tabTextActive]}>SIGN UP</Text></Pressable></View><View style={s.card}>{mode==="signup"?<><Text style={s.label}>NAME</Text><TextInput value={name} onChangeText={setName} placeholder="Your name" placeholderTextColor="#555" autoCapitalize="words" style={s.input}/><Text style={s.label}>MOBILE</Text><TextInput value={phone} onChangeText={setPhone} placeholder="07..." placeholderTextColor="#555" keyboardType="phone-pad" style={s.input}/></>:null}<Text style={s.label}>EMAIL</Text><TextInput value={email} onChangeText={setEmail} placeholder="you@example.com" placeholderTextColor="#555" keyboardType="email-address" autoCapitalize="none" autoCorrect={false} style={s.input}/><Text style={s.label}>PASSWORD</Text><TextInput value={password} onChangeText={setPassword} placeholder="At least 8 characters" placeholderTextColor="#555" secureTextEntry autoCapitalize="none" style={s.input}/>{error?<Text style={s.error}>{error}</Text>:null}<Pressable disabled={busy} onPress={submit} style={[s.primary,busy&&s.disabled]}>{busy?<ActivityIndicator color="#090909"/>:<><Text style={s.primaryText}>{mode==="signup"?"CREATE CLIENT ACCOUNT":"OPEN CLIENT ACCOUNT"}</Text><Text style={s.arrow}>›</Text></>}</Pressable></View><Pressable disabled={busy} onPress={onAdmin} style={s.admin}><View><Text style={s.adminEyebrow}>OWNER ACCESS</Text><Text style={s.adminTitle}>QuincyFadez Admin</Text><Text style={s.adminText}>Insights · Bookings · Clients · Schedule · Settings</Text></View><Text style={s.adminArrow}>›</Text></Pressable><Text style={s.security}>Client passwords are verified by the QuincyFadez server. They are never stored as plain text inside the app.</Text></ScrollView></SafeAreaView>;
}
const s=StyleSheet.create({safe:{flex:1,backgroundColor:BG},content:{flexGrow:1,paddingHorizontal:22,paddingTop:52,paddingBottom:36},restoring:{flex:1,alignItems:"center",justifyContent:"center",padding:24},restoringText:{color:"#777",fontSize:7.5,letterSpacing:1.5,fontWeight:"800",marginTop:12},logo:{width:70,height:70,borderRadius:35,borderWidth:1,borderColor:"#6D5A2B",backgroundColor:"#120F08",alignItems:"center",justifyContent:"center"},logoText:{color:GOLD_LIGHT,fontSize:23,fontWeight:"900"},eyebrow:{color:GOLD,fontSize:8,letterSpacing:2.2,fontWeight:"900",marginTop:24},title:{color:"#F5F5F5",fontSize:31,lineHeight:36,fontWeight:"750",marginTop:8},copy:{color:MUTED,fontSize:12,lineHeight:19,marginTop:10},tabs:{flexDirection:"row",backgroundColor:"#090909",borderWidth:1,borderColor:BORDER,borderRadius:15,padding:4,marginTop:26},tab:{flex:1,minHeight:42,borderRadius:11,alignItems:"center",justifyContent:"center"},tabActive:{backgroundColor:"#181207",borderWidth:1,borderColor:"#5C4A25"},tabText:{color:"#666",fontSize:8,fontWeight:"900",letterSpacing:1.2},tabTextActive:{color:GOLD_LIGHT},card:{marginTop:12,borderRadius:20,borderWidth:1,borderColor:"#2F291D",backgroundColor:"#0A0907",padding:16},label:{color:GOLD,fontSize:7.5,letterSpacing:1.3,fontWeight:"900",marginTop:10,marginBottom:6},input:{minHeight:50,borderRadius:14,borderWidth:1,borderColor:"#292929",backgroundColor:"#0E0E0E",color:"#F3F3F3",paddingHorizontal:14,fontSize:12},error:{color:"#E4A29A",fontSize:9.5,lineHeight:15,marginTop:12},primary:{minHeight:58,borderRadius:15,backgroundColor:GOLD,marginTop:16,paddingHorizontal:17,flexDirection:"row",alignItems:"center",justifyContent:"space-between",shadowColor:GOLD,shadowOpacity:.2,shadowRadius:14,shadowOffset:{width:0,height:6},elevation:3},primaryText:{color:"#090909",fontSize:9.5,letterSpacing:1,fontWeight:"900"},arrow:{color:"#090909",fontSize:28},disabled:{opacity:.55},admin:{marginTop:14,minHeight:82,borderRadius:18,borderWidth:1,borderColor:"#242424",backgroundColor:"#0D0D0D",paddingHorizontal:16,flexDirection:"row",alignItems:"center",justifyContent:"space-between"},adminEyebrow:{color:"#777",fontSize:6.5,letterSpacing:1.2,fontWeight:"900"},adminTitle:{color:"#F1F1F1",fontSize:14,fontWeight:"750",marginTop:4},adminText:{color:"#777",fontSize:8.5,marginTop:4},adminArrow:{color:GOLD_LIGHT,fontSize:28},security:{color:"#5F5F5F",fontSize:7.5,lineHeight:12.5,textAlign:"center",marginTop:14,paddingHorizontal:8}});