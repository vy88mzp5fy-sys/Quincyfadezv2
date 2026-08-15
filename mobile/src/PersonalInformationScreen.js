import React,{useEffect,useState} from "react";
import {SafeAreaView,ScrollView,StatusBar,StyleSheet,Text,TextInput,View} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {M,Marble,PrimaryButton,Surface} from "./QFTheme";
import {ClientHeader} from "./ClientLuxuryUI";
import QFIcon from "./QFIcons";

const PROFILE="quincyfadez.bookingProfile";
function Field({label,help,...props}){return <View style={s.field}><Text style={s.label}>{label}</Text><TextInput placeholderTextColor={M.muted2} style={s.input}{...props}/>{help?<Text style={s.help}>{help}</Text>:null}</View>}

export default function PersonalInformationScreen({onBack}){
  const[name,setName]=useState(""),[email,setEmail]=useState(""),[phone,setPhone]=useState(""),[saving,setSaving]=useState(false),[saved,setSaved]=useState(false);
  useEffect(()=>{AsyncStorage.getItem(PROFILE).then(v=>{if(v)try{const p=JSON.parse(v);setName(p.name||"");setEmail(p.email||"");setPhone(p.phone||"")}catch(_){}})},[]);
  const save=async()=>{if(saving)return;setSaving(true);setSaved(false);try{await AsyncStorage.setItem(PROFILE,JSON.stringify({name:name.trim(),email:email.trim(),phone:phone.trim()}));setSaved(true)}finally{setSaving(false)}};
  return <Marble><SafeAreaView style={s.safe}><StatusBar barStyle="light-content"/><ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
    <ClientHeader title="Personal information" subtitle="Keep the contact details attached to your bookings up to date." onBack={onBack}/>
    {saved?<View style={s.saved}><QFIcon name="check" size={18} color={M.green}/><Text style={s.savedText}>Details saved</Text></View>:null}
    <Surface style={s.card}><Field label="Full name" value={name} onChangeText={v=>{setSaved(false);setName(v)}} placeholder="Your full name" autoCapitalize="words"/><Field label="Email address" value={email} onChangeText={v=>{setSaved(false);setEmail(v)}} placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none"/><Field label="Mobile number" value={phone} onChangeText={v=>{setSaved(false);setPhone(v)}} placeholder="07..." keyboardType="phone-pad" help="Used for booking updates and appointment contact."/></Surface>
    <Surface style={s.note}><View style={s.noteIcon}><QFIcon name="profile" size={24}/></View><View style={{flex:1}}><Text style={s.noteTitle}>Keep this accurate</Text><Text style={s.noteText}>These details pre-fill new bookings and help QuincyFadez contact you about an appointment.</Text></View></Surface>
    <PrimaryButton title={saving?"Saving…":"SAVE CHANGES"} subtitle="Update your booking profile" onPress={save} disabled={saving||!name.trim()||!phone.trim()} style={s.primary} right={<QFIcon name="check" size={21} color="#090704"/>}/>
  </ScrollView></SafeAreaView></Marble>;
}

const s=StyleSheet.create({safe:{flex:1},content:{paddingHorizontal:18,paddingTop:4,paddingBottom:86},saved:{height:48,borderRadius:14,borderWidth:1,borderColor:"rgba(85,216,117,.22)",backgroundColor:M.greenBg,alignItems:"center",justifyContent:"center",marginTop:8,marginBottom:12,flexDirection:"row",gap:8},savedText:{color:M.green,fontSize:12.5,fontWeight:"700"},card:{padding:18,marginTop:9,backgroundColor:M.panel2,borderColor:M.warmBorderSoft},field:{marginBottom:18},label:{color:M.text2,fontSize:13,fontWeight:"700",marginBottom:8},input:{height:58,borderRadius:14,borderWidth:1,borderColor:M.border,backgroundColor:M.bg2,paddingHorizontal:15,color:M.text,fontSize:15.5},help:{color:M.muted2,fontSize:11.5,lineHeight:16,marginTop:7},note:{padding:18,marginTop:15,flexDirection:"row",gap:13,backgroundColor:M.panel2,borderColor:M.warmBorderSoft},noteIcon:{width:48,height:48,borderRadius:15,backgroundColor:M.panel3,borderWidth:1,borderColor:M.border,alignItems:"center",justifyContent:"center"},noteTitle:{color:M.text,fontSize:15.5,fontWeight:"700"},noteText:{color:M.muted,fontSize:12.5,lineHeight:18,marginTop:6},primary:{marginTop:18}});
