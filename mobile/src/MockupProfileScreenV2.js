import React from"react";
import{Linking,Pressable,SafeAreaView,ScrollView,StatusBar,StyleSheet,Text,View}from"react-native";
import AsyncStorage from"@react-native-async-storage/async-storage";
import{BrandLogo,LuxuryBackButton,M,Marble,cardShadow,shadow}from"./MockupTheme";
import{ClientSection}from"./ClientLuxuryUI";

const links={whatsapp:"https://wa.me/447490194682",website:"https://quincyfadez.com"};
function Row({icon,title,sub,onPress,last}){const body=<View style={[s.row,!last&&s.line]}><View style={s.rowIcon}><Text style={s.rowIconText}>{icon}</Text></View><View style={{flex:1}}><Text style={s.rowTitle}>{title}</Text>{sub?<Text style={s.rowSub}>{sub}</Text>:null}</View><Text style={s.chev}>›</Text></View>;return onPress?<Pressable onPress={onPress}>{body}</Pressable>:body}

export default function MockupProfileScreenV2({onBack,go,onLogout}){
 const logout=async()=>{await AsyncStorage.multiRemove(["quincyfadez.clientSession","quincyfadez.paymentClientKey","quincyfadez.adminToken"]);onLogout?.()};
 return <Marble><SafeAreaView style={s.safe}><StatusBar barStyle="light-content"/><ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
   <View style={s.header}><LuxuryBackButton onPress={onBack}/><View style={s.headerLogo}><BrandLogo size={68} compact/></View><View style={s.headerSpacer}/></View>
   <Text style={s.title}>MY PROFILE</Text><Text style={s.subtitle}>Your QuincyFadez account, preferences and support.</Text>
   <ClientSection title="ACCOUNT"/>
   <View style={s.card}><Row icon="◎" title="Personal Information" sub="Name, email address and phone number" onPress={()=>go("personal")}/><Row icon="◇" title="Change Password" sub="Update your account password" onPress={()=>go("changePassword")} last/></View>
   <ClientSection title="PREFERENCES"/>
   <View style={s.card}><Row icon="◉" title="Notifications" sub="Booking, reminder and waiting-list alerts" onPress={()=>go("notifications")}/><Row icon="▦" title="Booking Preferences" sub="Booking and payment settings" onPress={()=>go("account")}/><Row icon="✂" title="Favourite Services" sub="View QuincyFadez services and pricing" onPress={()=>go("services")} last/></View>
   <ClientSection title="SUPPORT"/>
   <View style={s.card}><Row icon="?" title="Help & FAQs" sub="Get help with your account or booking" onPress={()=>Linking.openURL(links.whatsapp).catch(()=>{})}/><Row icon="§" title="Terms & Privacy" sub="QuincyFadez terms and privacy information" onPress={()=>Linking.openURL(links.website).catch(()=>{})} last/></View>
   <Pressable onPress={logout} style={s.logout}><Text style={s.logoutText}>LOG OUT</Text></Pressable>
  </ScrollView></SafeAreaView></Marble>;
}

const s=StyleSheet.create({
 safe:{flex:1},content:{paddingHorizontal:20,paddingTop:10,paddingBottom:112},header:{height:76,flexDirection:"row",alignItems:"center",justifyContent:"space-between"},headerLogo:{flex:1,alignItems:"center"},headerSpacer:{width:42},title:{color:M.text,fontSize:20,fontWeight:"700",letterSpacing:2.1,textAlign:"center",marginTop:8},subtitle:{color:M.muted,fontSize:11.5,lineHeight:17,textAlign:"center",marginTop:8,marginBottom:4},card:{borderRadius:17,borderWidth:1,borderColor:"rgba(214,189,122,.13)",backgroundColor:"rgba(11,11,10,.90)",overflow:"hidden",...cardShadow},row:{minHeight:76,paddingHorizontal:15,flexDirection:"row",alignItems:"center",gap:12},rowIcon:{width:40,height:40,borderRadius:12,borderWidth:1,borderColor:"rgba(214,189,122,.16)",backgroundColor:"rgba(18,16,12,.62)",alignItems:"center",justifyContent:"center"},rowIconText:{color:M.goldSoft,fontSize:16,fontWeight:"700"},line:{borderBottomWidth:1,borderBottomColor:"rgba(255,255,255,.052)"},rowTitle:{color:M.text,fontSize:13.5,fontWeight:"700"},rowSub:{color:M.muted,fontSize:9.5,lineHeight:14,marginTop:4},chev:{color:M.goldSoft,fontSize:22},logout:{height:56,borderRadius:12,backgroundColor:M.gold,borderWidth:1,borderColor:"rgba(241,221,162,.66)",alignItems:"center",justifyContent:"center",marginTop:28,...shadow},logoutText:{color:"#090704",fontSize:10.5,fontWeight:"900",letterSpacing:1.2}
});
