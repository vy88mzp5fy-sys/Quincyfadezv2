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
    <PrimaryButton title="UPDATE PASSWORD" subtitle="Secure your QuincyFadez account" onPress={update} disabled={!current||!next||!confirm} style={s.primary}/>
  </ScrollView></SafeAreaView></Marble>;
}

const s=StyleSheet.create({safe:{flex:1},content:{paddingHorizontal:18,paddingTop:4,paddingBottom:84},card:{padding:17,marginTop:9,backgroundColor:M.panel2},field:{marginBottom:17},fieldHead:{flexDirection:"row",alignItems:"center",justifyContent:"space-between",marginBottom:8},label:{color:M.text2,fontSize:12,fontWeight:"700"},show:{color:M.accentBright,fontSize:11,fontWeight:"800"},input:{height:58,borderRadius:16,borderWidth:1,borderColor:"rgba(255,255,255,.11)",backgroundColor:M.bg2,paddingHorizontal:15,color:M.text,fontSize:15},rule:{flexDirection:"row",alignItems:"center",gap:8,marginTop:-2},ruleDot:{width:8,height:8,borderRadius:4,backgroundColor:M.muted2},ruleDotOn:{backgroundColor:M.green},ruleText:{color:M.muted,fontSize:10.5},message:{borderRadius:14,borderWidth:1,borderColor:"rgba(255,142,150,.20)",backgroundColor:M.redBg,padding:13,marginTop:13},messageInfo:{borderColor:"rgba(255,255,255,.11)",backgroundColor:M.panel2},messageText:{color:M.text2,fontSize:11,lineHeight:16},primary:{marginTop:17}});
