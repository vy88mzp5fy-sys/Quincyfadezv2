import React,{useEffect,useState}from"react";
import{ActivityIndicator,Pressable,SafeAreaView,ScrollView,StatusBar,StyleSheet,Text,TextInput,View}from"react-native";
import AsyncStorage from"@react-native-async-storage/async-storage";
import{BrandLogo,LuxuryBackButton,M,Marble,cardShadow,shadow}from"./MockupTheme";

const PROFILE="quincyfadez.bookingProfile";

function Field({label,placeholder,...props}){
 return <View style={s.field}><Text style={s.label}>{label}</Text><TextInput style={s.input} placeholder={placeholder} placeholderTextColor={M.muted2}{...props}/></View>;
}

export default function PersonalInformationScreen({onBack}){
 const[name,setName]=useState(""),[email,setEmail]=useState(""),[phone,setPhone]=useState(""),[saving,setSaving]=useState(false),[saved,setSaved]=useState(false);
 useEffect(()=>{AsyncStorage.getItem(PROFILE).then(v=>{if(!v)return;try{const p=JSON.parse(v);setName(p.name||"");setEmail(p.email||"");setPhone(p.phone||"")}catch(_){}})},[]);
 const save=async()=>{if(saving)return;setSaving(true);setSaved(false);try{await AsyncStorage.setItem(PROFILE,JSON.stringify({name:name.trim(),email:email.trim(),phone:phone.trim()}));setSaved(true)}finally{setSaving(false)}};
 return <Marble><SafeAreaView style={s.safe}><StatusBar barStyle="light-content"/><ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
   <View style={s.header}><LuxuryBackButton onPress={onBack}/><View style={s.headerLogo}><BrandLogo size={66} compact/></View><View style={s.headerSpacer}/></View>
   <Text style={s.title}>PERSONAL INFORMATION</Text><Text style={s.subtitle}>Keep your QuincyFadez account details up to date.</Text>
   <View style={s.card}><Field label="FULL NAME" value={name} onChangeText={setName} placeholder="Enter your full name" autoCapitalize="words"/><Field label="EMAIL ADDRESS" value={email} onChangeText={setEmail} placeholder="Enter your email address" keyboardType="email-address" autoCapitalize="none"/><Field label="PHONE NUMBER" value={phone} onChangeText={setPhone} placeholder="Enter your phone number" keyboardType="phone-pad"/></View>
   {saved?<Text style={s.saved}>CHANGES SAVED</Text>:null}
   <Pressable onPress={save} disabled={saving} style={s.primary}>{saving?<ActivityIndicator color="#090704"/>:<Text style={s.primaryText}>SAVE CHANGES</Text>}</Pressable>
  </ScrollView></SafeAreaView></Marble>;
}

const s=StyleSheet.create({
 safe:{flex:1},content:{paddingHorizontal:22,paddingTop:12,paddingBottom:110},header:{height:76,flexDirection:"row",alignItems:"center",justifyContent:"space-between"},headerLogo:{flex:1,alignItems:"center"},headerSpacer:{width:42},title:{color:M.text,fontSize:20,fontWeight:"700",letterSpacing:2.1,textAlign:"center",marginTop:8},subtitle:{color:M.muted,fontSize:11.5,lineHeight:17,textAlign:"center",marginTop:8,marginBottom:22,paddingHorizontal:20},card:{borderRadius:17,borderWidth:1,borderColor:"rgba(214,189,122,.13)",backgroundColor:"rgba(11,11,10,.90)",padding:16,...cardShadow},field:{marginBottom:15},label:{color:M.goldSoft,fontSize:8.5,fontWeight:"800",letterSpacing:1.2,marginBottom:8},input:{height:56,borderRadius:12,borderWidth:1,borderColor:"rgba(214,189,122,.14)",backgroundColor:"rgba(5,5,5,.72)",paddingHorizontal:14,color:M.text,fontSize:13.5,fontWeight:"500"},saved:{color:M.green,fontSize:8.5,fontWeight:"800",letterSpacing:1.2,textAlign:"center",marginTop:13},primary:{height:56,borderRadius:12,backgroundColor:M.gold,borderWidth:1,borderColor:"rgba(241,221,162,.68)",alignItems:"center",justifyContent:"center",marginTop:18,...shadow},primaryText:{color:"#090704",fontSize:10.5,fontWeight:"900",letterSpacing:1.2}
});
