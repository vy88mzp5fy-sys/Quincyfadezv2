import React,{useState} from "react";
import {Pressable,SafeAreaView,ScrollView,StatusBar,StyleSheet,Text,TextInput,View} from "react-native";
import {M,Marble,PrimaryButton,Surface} from "./QFTheme";
import {ClientHeader} from "./ClientLuxuryUI";

function Field({label,value,onChangeText,show,setShow}){return <View style={s.field}><View style={s.fieldHead}><Text style={s.label}>{label}</Text><Pressable onPress={()=>setShow(v=>!v)}><Text style={s.show}>{show?"Hide":"Show"}</Text></Pressable></View><TextInput value={value} onChangeText={onChangeText} secureTextEntry={!show} placeholder="••••••••" placeholderTextColor={M.muted2} style={s.input} autoCapitalize="none"/></View>}

export default function ChangePasswordScreen({onBack}){
  const[current,setCurrent]=useState(""),[next,setNext]=useState(""),[confirm,setConfirm]=useState(""),[showCurrent,setShowCurrent]=useState(false),[showNext,setShowNext]=useState(false),[showConfirm,setShowConfirm]=useState(false),[message,setMessage]=useState("");
  const valid=current.length>0&&next.length>=8&&next===confirm;
  const update=()=>{if(!valid){setMessage(next!==confirm?"The new passwords don’t match.":"Enter your current password and use at least 8 characters for the new one.");return}setMessage("Password changes are not connected to the live account service yet.")};
  return <Marble><SafeAreaView style={s.safe}><StatusBar barStyle="light-content"/><ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
    <ClientHeader title="Change password" subtitle="Use a strong password you don’t reuse elsewhere." onBack={onBack}/>
    <Surface style={s.card}><Field label="Current password" value={current} onChangeText={setCurrent} show={showCurrent} setShow={setShowCurrent}/><Field label="New password" value={next} onChangeText={setNext} show={showNext} setShow={setShowNext}/><Field label="Confirm new password" value={confirm} onChangeText={setConfirm} show={showConfirm} setShow={setShowConfirm}/><View style={s.rule}><View style={[s.ruleDot,next.length>=8&&s.ruleDotOn]}/><Text style={s.ruleText}>At least 8 characters</Text></View></Surface>
    {message?<View style={[s.message,valid&&s.messageInfo]}><Text style={s.messageText}>{message}</Text></View>:null}
    <PrimaryButton title="Update password" subtitle="Secure your QuincyFadez account" onPress={update} disabled={!current||!next||!confirm} style={s.primary}/>
  </ScrollView></SafeAreaView></Marble>;
}

const s=StyleSheet.create({safe:{flex:1},content:{paddingHorizontal:18,paddingTop:4,paddingBottom:80},card:{padding:15,marginTop:8},field:{marginBottom:15},fieldHead:{flexDirection:"row",alignItems:"center",justifyContent:"space-between",marginBottom:7},label:{color:M.text2,fontSize:10,fontWeight:"700"},show:{color:M.accentSoft,fontSize:9.5,fontWeight:"700"},input:{height:54,borderRadius:15,borderWidth:1,borderColor:"rgba(255,255,255,.075)",backgroundColor:"rgba(8,11,16,.62)",paddingHorizontal:13,color:M.text,fontSize:13.5},rule:{flexDirection:"row",alignItems:"center",gap:7,marginTop:-2},ruleDot:{width:7,height:7,borderRadius:4,backgroundColor:M.muted2},ruleDotOn:{backgroundColor:M.green},ruleText:{color:M.muted,fontSize:8.8},message:{borderRadius:13,borderWidth:1,borderColor:"rgba(255,142,150,.20)",backgroundColor:M.redBg,padding:11,marginTop:12},messageInfo:{borderColor:"rgba(169,184,255,.18)",backgroundColor:"rgba(169,184,255,.06)"},messageText:{color:M.text2,fontSize:9.5,lineHeight:14},primary:{marginTop:15}});
