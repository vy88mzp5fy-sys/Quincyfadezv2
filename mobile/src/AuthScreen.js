import React, { useState } from "react";
import { ActivityIndicator, Image, Pressable, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { QF, qfCardShadow, qfShadow } from "./QuincyTheme";

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

function BrandMark(){
  return <View style={s.brandMark}><Image source={require("../assets/icon.png")} style={s.brandImage}/></View>;
}

function Field({label,value,onChangeText,placeholder,keyboardType,secureTextEntry,autoCapitalize="none",onSubmitEditing}){
  return <View style={s.field}>
    <Text style={s.label}>{label}</Text>
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={QF.muted2}
      keyboardType={keyboardType}
      secureTextEntry={secureTextEntry}
      autoCapitalize={autoCapitalize}
      autoCorrect={false}
      onSubmitEditing={onSubmitEditing}
      style={s.input}
    />
  </View>;
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

  const signupMode=mode==="signup";
  return <SafeAreaView style={s.safe}>
    <StatusBar barStyle="light-content" backgroundColor={QF.bg}/>
    <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <View style={s.topLine}/>
      <View style={s.brandRow}>
        <BrandMark/>
        <View style={s.brandCopy}>
          <Text style={s.brand}>QUINCYFADEZ</Text>
          <Text style={s.brandSub}>PREMIUM BARBER · OXFORD</Text>
        </View>
      </View>

      <View style={s.heroCopy}>
        <Text style={s.kicker}>{signupMode?"NEW CLIENT":"WELCOME BACK"}</Text>
        <Text style={s.title}>{signupMode?"Your QuincyFadez Account Starts Here.":"Good To See You Again."}</Text>
        <Text style={s.copy}>{signupMode?"Create your account once, then book and manage every appointment from one clean place.":"Log in and we’ll automatically open the right QuincyFadez experience for your account."}</Text>
      </View>

      <View style={s.tabs}>
        <Pressable onPress={()=>switchMode("login")} style={[s.tab,mode==="login"&&s.tabActive]}><Text style={[s.tabText,mode==="login"&&s.tabTextActive]}>LOG IN</Text></Pressable>
        <Pressable onPress={()=>switchMode("signup")} style={[s.tab,mode==="signup"&&s.tabActive]}><Text style={[s.tabText,mode==="signup"&&s.tabTextActive]}>SIGN UP</Text></Pressable>
      </View>

      <View style={s.formCard}>
        <View style={s.formHead}><Text style={s.formKicker}>{signupMode?"CREATE ACCOUNT":"SECURE SIGN IN"}</Text><View style={s.securePill}><View style={s.secureDot}/><Text style={s.secureText}>SECURE</Text></View></View>
        {signupMode?<>
          <Field label="FULL NAME" value={name} onChangeText={setName} placeholder="Your name" autoCapitalize="words"/>
          <Field label="MOBILE NUMBER" value={phone} onChangeText={setPhone} placeholder="07..." keyboardType="phone-pad"/>
        </>:null}
        <Field label="EMAIL ADDRESS" value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address"/>
        <Field label="PASSWORD" value={password} onChangeText={setPassword} placeholder={signupMode?"At least 8 characters":"Your password"} secureTextEntry onSubmitEditing={submit}/>

        {error?<View style={s.errorBox}><Text style={s.errorTitle}>CHECK YOUR DETAILS</Text><Text style={s.error}>{error}</Text></View>:null}

        <Pressable disabled={busy} onPress={submit} style={({pressed})=>[s.primary,busy&&s.disabled,pressed&&!busy&&s.pressed]}>
          {busy?<ActivityIndicator color="#090806"/>:<><View><Text style={s.primaryText}>{signupMode?"CREATE MY ACCOUNT":"CONTINUE"}</Text><Text style={s.primarySub}>{signupMode?"Set Up QuincyFadez Access":"Open My QuincyFadez"}</Text></View><View style={s.arrowCircle}><Text style={s.arrow}>›</Text></View></>}
        </Pressable>
      </View>

      <View style={s.promiseCard}>
        <View style={s.promiseLine}/>
        <Text style={s.promiseTitle}>ONE APP. ONE LOGIN.</Text>
        <Text style={s.promiseCopy}>Clients never need to choose between different app areas. Your verified credentials decide what opens after sign-in.</Text>
      </View>
      <Text style={s.footer}>QUINCYFADEZ · PRIVATE CLIENT ACCESS</Text>
    </ScrollView>
  </SafeAreaView>;
}

const s=StyleSheet.create({
  safe:{flex:1,backgroundColor:QF.bg},content:{flexGrow:1,paddingHorizontal:20,paddingTop:12,paddingBottom:34},pressed:{opacity:.84},disabled:{opacity:.55},
  topLine:{height:2,width:64,borderRadius:2,backgroundColor:QF.gold,marginBottom:22},brandRow:{flexDirection:"row",alignItems:"center",gap:13},brandMark:{width:62,height:62,borderRadius:31,borderWidth:1.5,borderColor:QF.goldDark,backgroundColor:QF.panel2,overflow:"hidden",alignItems:"center",justifyContent:"center",...qfShadow},brandImage:{width:58,height:58,borderRadius:29,resizeMode:"cover"},brandCopy:{flex:1},brand:{color:QF.text,fontSize:20,fontWeight:"900",letterSpacing:3.1},brandSub:{color:QF.gold,fontSize:8.5,fontWeight:"850",letterSpacing:1.35,marginTop:6},
  heroCopy:{paddingTop:32,paddingBottom:22},kicker:{color:QF.gold,fontSize:9.5,fontWeight:"900",letterSpacing:1.7},title:{color:QF.text,fontSize:33,lineHeight:37,fontWeight:"900",marginTop:8,maxWidth:350},copy:{color:QF.muted,fontSize:13.5,lineHeight:20,marginTop:11,maxWidth:350},
  tabs:{height:58,flexDirection:"row",backgroundColor:QF.panel,borderWidth:1,borderColor:QF.border,borderRadius:18,padding:5,...qfCardShadow},tab:{flex:1,borderRadius:13,alignItems:"center",justifyContent:"center"},tabActive:{backgroundColor:QF.panel3,borderWidth:1,borderColor:QF.goldDark},tabText:{color:QF.muted2,fontSize:10,fontWeight:"900",letterSpacing:1.1},tabTextActive:{color:QF.goldSoft},
  formCard:{marginTop:13,borderRadius:24,borderWidth:1,borderColor:QF.border,backgroundColor:QF.panel,padding:17,...qfCardShadow},formHead:{flexDirection:"row",alignItems:"center",justifyContent:"space-between",marginBottom:4},formKicker:{color:QF.text2,fontSize:10,fontWeight:"900",letterSpacing:1.2},securePill:{flexDirection:"row",alignItems:"center",gap:6,borderRadius:12,borderWidth:1,borderColor:"#26422E",backgroundColor:QF.greenBg,paddingHorizontal:9,paddingVertical:6},secureDot:{width:6,height:6,borderRadius:3,backgroundColor:QF.green},secureText:{color:QF.green,fontSize:7.5,fontWeight:"900",letterSpacing:.8},
  field:{marginTop:15},label:{color:QF.gold,fontSize:9,fontWeight:"900",letterSpacing:1.15,marginBottom:7},input:{minHeight:58,borderRadius:16,borderWidth:1,borderColor:QF.borderSoft,backgroundColor:QF.bg2,color:QF.text,paddingHorizontal:15,fontSize:15,fontWeight:"600"},
  errorBox:{marginTop:14,borderRadius:14,borderWidth:1,borderColor:"#5F312B",backgroundColor:QF.redBg,padding:12},errorTitle:{color:QF.red,fontSize:8,fontWeight:"900",letterSpacing:1.1},error:{color:"#E9B1A9",fontSize:11.5,lineHeight:17,marginTop:5},
  primary:{minHeight:70,borderRadius:18,backgroundColor:QF.gold,marginTop:18,paddingHorizontal:17,paddingVertical:11,flexDirection:"row",alignItems:"center",justifyContent:"space-between",...qfShadow},primaryText:{color:"#090806",fontSize:11.5,fontWeight:"950",letterSpacing:.9},primarySub:{color:"#4E3B18",fontSize:9.5,fontWeight:"800",marginTop:4},arrowCircle:{width:39,height:39,borderRadius:20,backgroundColor:"rgba(5,5,5,.11)",alignItems:"center",justifyContent:"center"},arrow:{color:"#090806",fontSize:30,lineHeight:32},
  promiseCard:{marginTop:17,borderRadius:20,borderWidth:1,borderColor:QF.borderSoft,backgroundColor:QF.bg2,padding:16},promiseLine:{width:38,height:2,borderRadius:1,backgroundColor:QF.gold,marginBottom:11},promiseTitle:{color:QF.text2,fontSize:9.5,fontWeight:"900",letterSpacing:1.15},promiseCopy:{color:QF.muted,fontSize:11.5,lineHeight:17,marginTop:7},footer:{color:QF.muted2,fontSize:8.5,fontWeight:"800",letterSpacing:1.3,textAlign:"center",marginTop:18}
});
