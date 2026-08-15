import React from"react";
import{Pressable,SafeAreaView,ScrollView,StatusBar,StyleSheet,Text,View}from"react-native";
import{BrandLogo,M,Marble,cardShadow,shadow}from"./MockupTheme";
import{ClientHeader,ClientSection}from"./ClientLuxuryUI";

const services=[
 {name:"Haircut",price:"£20",duration:"45 min",copy:"Precision fades, tapers, scissor work and a clean detailed finish."},
 {name:"Haircut & Beard",price:"£25",duration:"60 min",copy:"Full haircut with the beard shaped, lined and finished to match."},
 {name:"Shape Up",price:"£10",duration:"15 min",copy:"A quick refresh for crisp edges between full appointments."},
 {name:"Beard Trim",price:"£10",duration:"15 min",copy:"Beard groomed, shaped and lined for a clean result."},
];

export default function MockupServicesScreenV2({onBack,onBook}){return <Marble><SafeAreaView style={s.safe}><StatusBar barStyle="light-content"/><ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
 <ClientHeader title="Services" subtitle="Choose your service, see the price and book straight away." onBack={onBack}/>
 <ClientSection title="QUINCYFADEZ SERVICES"/>
 {services.map(x=><View key={x.name} style={s.card}><View style={s.top}><BrandLogo size={50} compact/><View style={{flex:1}}><Text style={s.name}>{x.name}</Text><Text style={s.duration}>{x.duration}</Text></View><Text style={s.price}>{x.price}</Text></View><Text style={s.copy}>{x.copy}</Text><Pressable onPress={()=>onBook(x.name)} style={s.button}><Text style={s.buttonText}>BOOK THIS SERVICE</Text><Text style={s.buttonArrow}>›</Text></Pressable></View>)}
 <View style={s.note}><Text style={s.noteTitle}>ALL FADEZ. ONE EXPERIENCE.</Text><Text style={s.noteText}>Every appointment is focused on clean detail, consistency and a finish tailored to you.</Text></View>
 </ScrollView></SafeAreaView></Marble>}

const s=StyleSheet.create({
 safe:{flex:1},content:{paddingHorizontal:20,paddingTop:7,paddingBottom:112},card:{borderRadius:17,borderWidth:1,borderColor:"rgba(214,189,122,.13)",backgroundColor:"rgba(11,11,10,.90)",padding:15,marginBottom:10,...cardShadow},top:{flexDirection:"row",alignItems:"center",gap:12},name:{color:M.text,fontSize:15,fontWeight:"700"},duration:{color:M.muted,fontSize:10,marginTop:4},price:{color:M.goldSoft,fontSize:21,fontWeight:"700"},copy:{color:M.text2,fontSize:11,lineHeight:16,marginTop:13},button:{height:54,borderRadius:12,backgroundColor:M.gold,borderWidth:1,borderColor:"rgba(241,221,162,.68)",marginTop:14,paddingHorizontal:15,flexDirection:"row",alignItems:"center",justifyContent:"space-between",...shadow},buttonText:{color:"#090704",fontSize:9.5,fontWeight:"900",letterSpacing:.9},buttonArrow:{color:"#090704",fontSize:22},note:{borderRadius:16,borderWidth:1,borderColor:"rgba(214,189,122,.11)",backgroundColor:"rgba(11,11,10,.84)",padding:15,marginTop:9},noteTitle:{color:M.goldSoft,fontSize:8.5,fontWeight:"900",letterSpacing:1.4},noteText:{color:M.muted,fontSize:10.5,lineHeight:16,marginTop:7}
});
