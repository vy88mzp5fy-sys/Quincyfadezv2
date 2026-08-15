import React,{useEffect,useState} from "react";
import {ActivityIndicator,SafeAreaView,ScrollView,StatusBar,StyleSheet,Text,TextInput,View} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {M,Marble,PrimaryButton,Surface} from "./QFTheme";
import {ClientHeader} from "./ClientLuxuryUI";

const PROFILE="quincyfadez.bookingProfile";
function Field({label,help,...props}){return <View style={s.field}><Text style={s.label}>{label}</Text><TextInput placeholderTextColor={M.muted2} style={s.input}{...props}/>{help?<Text style={s.help}>{help}</Text>:null}</View>}

export default function PersonalInformationScreen({onBack}){
  const[name,setName]=useState(""),[email,setEmail]=useState(""),[phone,setPhone]=useState(""),[saving,setSaving]=useState(false),[saved,setSaved]=useState(false);
  useEffect(()=>{AsyncStorage.getItem(PROFILE).then(v=>{if(v)try{const p=JSON.parse(v);setName(p.name||"");setEmail(p.email||"");setPhone(p.phone||"")}catch(_){}})},[]);
  const save=async()=>{if(saving)return;setSaving(true);setSaved(false);try{await AsyncStorage.setItem(PROFILE,JSON.stringify({name:name.trim(),email:email.trim(),phone:phone.trim()}));setSaved(true)}finally{setSaving(false)}};
  return <Marble><SafeAreaView style={s.safe}><StatusBar barStyle="light-content"/><ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
    <ClientHeader title="Personal information" subtitle="Keep the contact details attached to your QuincyFadez bookings up to date." onBack={onBack}/>
    {saved?<View style={s.saved}><Text style={s.savedText}>✓ Details saved</Text></View>:null}
    <Surface style={s.card}><Field label="Full name" value={name} onChangeText={v=>{setSaved(false);setName(v)}} placeholder="Your full name" autoCapitalize="words"/><Field label="Email address" value={email} onChangeText={v=>{setSaved(false);setEmail(v)}} placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none"/><Field label="Mobile number" value={phone} onChangeText={v=>{setSaved(false);setPhone(v)}} placeholder="07..." keyboardType="phone-pad" help="Used for booking updates and appointment contact."/></Surface>
    <Surface style={s.note}><View style={s.noteIcon}><Text style={s.noteGlyph}>i</Text></View><View style={{flex:1}}><Text style={s.noteTitle}>Keep this accurate</Text><Text style={s.noteText}>These details are used to pre-fill bookings and help QuincyFadez contact you about an appointment.</Text></View></Surface>
    <PrimaryButton title={saving?"Saving…":"Save changes"} subtitle="Update your booking profile" onPress={save} disabled={saving||!name.trim()||!phone.trim()} style={s.primary}/>
  </ScrollView></SafeAreaView></Marble>;
}

const s=StyleSheet.create({safe:{flex:1},content:{paddingHorizontal:18,paddingTop:4,paddingBottom:80},saved:{height:42,borderRadius:13,borderWidth:1,borderColor:"rgba(110,231,190,.18)",backgroundColor:"rgba(110,231,190,.06)",alignItems:"center",justifyContent:"center",marginTop:6,marginBottom:10},savedText:{color:M.green,fontSize:9.5,fontWeight:"800"},card:{padding:15,marginTop:8},field:{marginBottom:15},label:{color:M.text2,fontSize:10,fontWeight:"700",marginBottom:7},input:{height:54,borderRadius:15,borderWidth:1,borderColor:"rgba(255,255,255,.075)",backgroundColor:"rgba(8,11,16,.62)",paddingHorizontal:13,color:M.text,fontSize:13.5},help:{color:M.muted2,fontSize:8.5,lineHeight:12.5,marginTop:6},note:{padding:15,marginTop:14,flexDirection:"row",gap:11},noteIcon:{width:38,height:38,borderRadius:13,backgroundColor:"rgba(169,184,255,.10)",borderWidth:1,borderColor:"rgba(169,184,255,.15)",alignItems:"center",justifyContent:"center"},noteGlyph:{color:M.accentSoft,fontSize:13,fontWeight:"900"},noteTitle:{color:M.text,fontSize:11.5,fontWeight:"700"},noteText:{color:M.muted,fontSize:9,lineHeight:13.5,marginTop:4},primary:{marginTop:15}});
