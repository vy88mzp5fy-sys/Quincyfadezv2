import React from"react";
import{Pressable,SafeAreaView,ScrollView,StatusBar,StyleSheet,Text,View}from"react-native";
import{M,Marble,cardShadow,shadow}from"./MockupTheme";
import{ClientHeader,ClientSection}from"./ClientLuxuryUI";

const services=[
 {icon:"✂",name:"Haircut",price:"£20",duration:"45 min",copy:"Precision fades, tapers, scissor work and a clean detailed finish."},
 {icon:"♚",name:"Haircut & Beard",price:"£25",duration:"60 min",copy:"Full haircut with the beard shaped, lined and finished to match."},
 {icon:"⌁",name:"Shape Up",price:"£10",duration:"15 min",copy:"A quick refresh for crisp edges between full appointments."},
 {icon:"◔",name:"Beard Trim",price:"£10",duration:"15 min",copy:"Beard groomed, shaped and lined for a clean result."},
];

export default function MockupServicesScreenV2({onBack,onBook}){return <Marble><SafeAreaView style={s.safe}><StatusBar barStyle="light-content"/><ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
 <ClientHeader title="Services" subtitle="Choose your service, see the price and book straight away." onBack={onBack}/>
 <ClientSection title="QUINCYFADEZ SERVICES"/>
 {services.map(x=><View key={x.name} style={s.card}><View style={s.top}><View style={s.iconCircle}><Text style={s.icon}>{x.icon}</Text></View><View style={{flex:1}}><Text style={s.name}>{x.name}</Text><Text style={s.duration}>{x.duration}</Text></View><Text style={s.price}>{x.price}</Text></View><Text style={s.copy}>{x.copy}</Text><Pressable onPress={()=>onBook(x.name)} style={s.button}><Text style={s.buttonText}>BOOK THIS SERVICE</Text><Text style={s.buttonArrow}>›</Text></Pressable></View>)}
 <View style={s.note}><Text style={s.noteTitle}>PREMIUM ONE-TO-ONE EXPERIENCE</Text><Text style={s.noteText}>Every appointment is focused on clean detail, consistency and a finish tailored to you.</Text></View>
 </ScrollView></SafeAreaView></Marble>}

const s=StyleSheet.create({safe:{flex:1},content:{paddingHorizontal:18,paddingTop:7,paddingBottom:112},card:{borderRadius:15,borderWidth:1,borderColor:"rgba(214,189,122,.24)",backgroundColor:"rgba(16,16,15,.93)",padding:15,marginBottom:10,...cardShadow},top:{flexDirection:"row",alignItems:"center",gap:12},iconCircle:{width:48,height:48,borderRadius:24,borderWidth:1,borderColor:M.goldDark,backgroundColor:M.panel3,alignItems:"center",justifyContent:"center"},icon:{color:M.goldSoft,fontSize:21},name:{color:M.text,fontSize:16,fontWeight:"700"},duration:{color:M.muted,fontSize:10.5,marginTop:4},price:{color:M.goldSoft,fontSize:24,fontWeight:"700"},copy:{color:M.text2,fontSize:11.5,lineHeight:17,marginTop:13},button:{height:52,borderRadius:10,backgroundColor:M.gold,borderWidth:1,borderColor:M.goldSoft,marginTop:14,paddingHorizontal:15,flexDirection:"row",alignItems:"center",justifyContent:"space-between",...shadow},buttonText:{color:"#090704",fontSize:10.5,fontWeight:"900",letterSpacing:.7},buttonArrow:{color:"#090704",fontSize:23},note:{borderRadius:14,borderWidth:1,borderColor:M.border,backgroundColor:M.panel,padding:15,marginTop:9},noteTitle:{color:M.gold,fontSize:9,fontWeight:"900",letterSpacing:1},noteText:{color:M.muted,fontSize:11,lineHeight:17,marginTop:7}});