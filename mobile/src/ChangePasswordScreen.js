import React,{useState}from"react";
import{Pressable,SafeAreaView,ScrollView,StatusBar,StyleSheet,Text,TextInput,View}from"react-native";
import{BrandLogo,LuxuryBackButton,M,Marble,cardShadow,shadow}from"./MockupTheme";

function PasswordField({label,value,onChangeText,show,setShow}){
 return <View style={s.field}><Text style={s.label}>{label}</Text><View style={s.inputWrap}><TextInput value={value} onChangeText={onChangeText} secureTextEntry={!show} placeholder="••••••••" placeholderTextColor={M.muted2} style={s.input} autoCapitalize="none"/><Pressable onPress={()=>setShow(v=>!v)} style={s.eyeButton}><Text style={s.eye}>{show?"◉":"◎"}</Text></Pressable></View></View>;
}

export default function ChangePasswordScreen({onBack}){
 const[current,setCurrent]=useState(""),[next,setNext]=useState(""),[confirm,setConfirm]=useState(""),[showCurrent,setShowCurrent]=useState(false),[showNext,setShowNext]=useState(false),[showConfirm,setShowConfirm]=useState(false),[message,setMessage]=useState("");
 const update=()=>{if(!current||next.length<8||next!==confirm){setMessage(next!==confirm?"New passwords must match.":"Enter your current password and a new password of at least 8 characters.");return}setMessage("Password update is ready to connect during the account-settings pass.")};
 return <Marble><SafeAreaView style={s.safe}><StatusBar barStyle="light-content"/><ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
   <View style={s.header}><LuxuryBackButton onPress={onBack}/><View style={s.headerLogo}><BrandLogo size={66} compact/></View><View style={s.headerSpacer}/></View>
   <Text style={s.title}>CHANGE PASSWORD</Text><Text style={s.subtitle}>Keep your QuincyFadez account secure with a strong password.</Text>
   <View style={s.card}><PasswordField label="CURRENT PASSWORD" value={current} onChangeText={setCurrent} show={showCurrent} setShow={setShowCurrent}/><PasswordField label="NEW PASSWORD" value={next} onChangeText={setNext} show={showNext} setShow={setShowNext}/><PasswordField label="CONFIRM NEW PASSWORD" value={confirm} onChangeText={setConfirm} show={showConfirm} setShow={setShowConfirm}/></View>
   {message?<Text style={s.message}>{message}</Text>:null}
   <Pressable onPress={update} style={s.primary}><Text style={s.primaryText}>UPDATE PASSWORD</Text></Pressable>
  </ScrollView></SafeAreaView></Marble>;
}

const s=StyleSheet.create({
 safe:{flex:1},content:{paddingHorizontal:22,paddingTop:12,paddingBottom:110},header:{height:76,flexDirection:"row",alignItems:"center",justifyContent:"space-between"},headerLogo:{flex:1,alignItems:"center"},headerSpacer:{width:42},title:{color:M.text,fontSize:20,fontWeight:"700",letterSpacing:2.1,textAlign:"center",marginTop:8},subtitle:{color:M.muted,fontSize:11.5,lineHeight:17,textAlign:"center",marginTop:8,marginBottom:22,paddingHorizontal:18},card:{borderRadius:17,borderWidth:1,borderColor:"rgba(214,189,122,.13)",backgroundColor:"rgba(11,11,10,.90)",padding:16,...cardShadow},field:{marginBottom:15},label:{color:M.goldSoft,fontSize:8.5,fontWeight:"800",letterSpacing:1.2,marginBottom:8},inputWrap:{height:56,borderRadius:12,borderWidth:1,borderColor:"rgba(214,189,122,.14)",backgroundColor:"rgba(5,5,5,.72)",paddingLeft:14,flexDirection:"row",alignItems:"center"},input:{flex:1,color:M.text,fontSize:13.5,fontWeight:"500"},eyeButton:{width:48,height:56,alignItems:"center",justifyContent:"center"},eye:{color:M.goldSoft,fontSize:17},message:{color:M.muted,fontSize:9.5,lineHeight:14,textAlign:"center",marginTop:13,paddingHorizontal:12},primary:{height:56,borderRadius:12,backgroundColor:M.gold,borderWidth:1,borderColor:"rgba(241,221,162,.68)",alignItems:"center",justifyContent:"center",marginTop:18,...shadow},primaryText:{color:"#090704",fontSize:10.5,fontWeight:"900",letterSpacing:1.2}
});
