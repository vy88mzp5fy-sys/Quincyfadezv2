import React, { useState } from "react";
import { Image, Linking, Pressable, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, View } from "react-native";
import AuthScreen from "./AuthScreen";
import BookingScreen from "./BookingScreen";
import GalleryScreen from "./GalleryScreen";
import ReviewsScreen from "./ReviewsScreen";
import AccountScreen from "./AccountScreen";
import AdminNotificationsShell from "./AdminNotificationsShell";

const C={bg:"#050505",surface:"#0E0C08",surface2:"#171107",gold:"#D6BD7A",goldSoft:"#F1DDA2",text:"#FBFAF6",text2:"#E8E2D8",muted:"#AAA49A",border:"#352D20",borderSoft:"#25221C"};
const links={whatsapp:"https://wa.me/447490194682",directions:"https://www.google.com/maps/dir/?api=1&destination=51.7402247,-1.2202434",website:"https://quincyfadez.com"};
const services=[
  {name:"Haircut",price:"£20",duration:"45 Minutes",description:"Skin fades, tapers, scissor work and clean finishes — built around the cut you want."},
  {name:"Haircut & Beard",price:"£25",duration:"60 Minutes",description:"A full haircut with a sharp, shaped and lined beard finish."},
  {name:"Shape Up",price:"£10",duration:"15 Minutes",description:"A quick refresh for crisp edges and a cleaner finish between full cuts."},
  {name:"Beard Trim",price:"£10",duration:"15 Minutes",description:"Beard groomed, shaped and lined for a clean, balanced result."},
];
const open=url=>Linking.openURL(url).catch(()=>{});

function NavIcon({type,active}){
  const tone=active?C.goldSoft:"#77736C";
  if(type==="home")return <View style={[s.homeGlyph,{borderColor:tone}]}><View style={[s.homeGlyphDot,{backgroundColor:tone}]}/></View>;
  if(type==="gallery")return <View style={[s.galleryGlyph,{borderColor:tone}]}><View style={[s.galleryDot,{backgroundColor:tone}]}/><View style={[s.galleryLine,{backgroundColor:tone}]}/></View>;
  if(type==="reviews")return <Text style={[s.starGlyph,{color:tone}]}>★</Text>;
  if(type==="account")return <View style={s.personGlyph}><View style={[s.personHead,{borderColor:tone}]}/><View style={[s.personBody,{borderColor:tone}]}/></View>;
  return <Text style={s.bookGlyph}>＋</Text>;
}

function BottomNav({screen,onHome,onBook,onGallery,onReviews,onAccount}){
  const items=[
    {key:"home",label:"Home",action:onHome},
    {key:"gallery",label:"Gallery",action:onGallery},
    {key:"booking",label:"Book",action:onBook,primary:true},
    {key:"reviews",label:"Reviews",action:onReviews},
    {key:"account",label:"Account",action:onAccount},
  ];
  return <SafeAreaView style={s.navSafe}><View style={s.navShell}>{items.map(item=>{const active=screen===item.key;return <Pressable key={item.key} onPress={item.action} style={({pressed})=>[s.navItem,item.primary&&s.navItemBook,active&&!item.primary&&s.navItemActive,pressed&&s.pressed]}><View style={[s.navIconArea,item.primary&&s.navBookCircle]}><NavIcon type={item.key} active={active||item.primary}/></View><Text style={[s.navLabel,item.primary&&s.navBookLabel,active&&!item.primary&&s.navLabelActive]}>{item.label}</Text></Pressable>})}</View></SafeAreaView>;
}

function PageHeader({title,onBack}){return <View style={s.pageHeader}><Pressable onPress={onBack} hitSlop={12} style={s.backButton}><Text style={s.backIcon}>‹</Text></Pressable><Text style={s.pageHeaderTitle}>{title}</Text><View style={s.headerSpace}/></View>}

function Services({onBack,onBook}){return <SafeAreaView style={s.safe}><StatusBar barStyle="light-content" backgroundColor={C.bg}/><ScrollView contentContainerStyle={s.pageContent} showsVerticalScrollIndicator={false}><PageHeader title="SERVICES" onBack={onBack}/><Text style={s.eyebrow}>CHOOSE YOUR SERVICE</Text><Text style={s.pageTitle}>Premium Cuts. Clear Pricing.</Text><Text style={s.pageCopy}>Everything is simple to compare, easy to read and one tap away from booking.</Text>{services.map(x=><View key={x.name} style={s.serviceCard}><View style={s.serviceTop}><View style={{flex:1}}><Text style={s.serviceName}>{x.name}</Text><Text style={s.serviceDuration}>{x.duration}</Text></View><Text style={s.servicePrice}>{x.price}</Text></View><Text style={s.serviceDescription}>{x.description}</Text><Pressable onPress={()=>onBook(x.name)} style={s.serviceButton}><Text style={s.serviceButtonText}>BOOK THIS SERVICE</Text><Text style={s.buttonArrow}>›</Text></Pressable></View>)}</ScrollView></SafeAreaView>}

function QuickIcon({item}){return <View style={s.quickIcon}>{item.image?<Image source={{uri:item.image}} style={s.whatsappIcon}/>:<Text style={s.quickEmoji}>{item.icon}</Text>}</View>}

function Home({onServices,onBooking,onGallery,onReviews,onAccount}){
  const actions=[
    {icon:"✂️",label:"Services",action:onServices},
    {icon:"🖼️",label:"Gallery",action:onGallery},
    {icon:"⭐️",label:"Reviews",action:onReviews},
    {icon:"👨🏽‍💼",label:"Account",action:onAccount},
    {image:"https://cdn.simpleicons.org/whatsapp/25D366",label:"WhatsApp",action:()=>open(links.whatsapp)},
    {icon:"🗺️",label:"Directions",action:()=>open(links.directions)},
  ];
  return <SafeAreaView style={s.safe}><StatusBar barStyle="light-content" backgroundColor={C.bg}/><ScrollView contentContainerStyle={s.homeContent} showsVerticalScrollIndicator={false}>
    <View style={s.topBar}><View><Text style={s.brand}>QUINCYFADEZ</Text><Text style={s.subBrand}>PREMIUM BARBER · OXFORD</Text></View><Pressable onPress={onAccount} style={s.logoButton}><Image source={require("../assets/icon.png")} style={s.logoImage}/></Pressable></View>
    <View style={s.hero}><Image source={{uri:"https://quincyfadez.com/media/gallery-replacement-01.jpg"}} style={s.heroImage}/><View style={s.heroShade}/><View style={s.heroBadge}><Text style={s.heroBadgeText}>APPOINTMENT ONLY · OXFORD</Text></View><View style={s.heroPanel}><Text style={s.heroTitle}>CLEAN CUTS.{"\n"}SHARP STYLES.</Text><Text style={s.heroGold}>PREMIUM EXPERIENCE.</Text><Text style={s.heroCopy}>Precision barbering, clean detail and a relaxed one-to-one appointment from start to finish.</Text></View></View>
    <Pressable onPress={()=>onBooking("Haircut")} style={s.primaryBook}><View><Text style={s.primaryBookText}>BOOK APPOINTMENT</Text><Text style={s.primaryBookSub}>Choose Service · Date · Time</Text></View><Text style={s.primaryBookArrow}>›</Text></Pressable>
    <View style={s.infoRow}><View style={s.infoPill}><Text style={s.infoLabel}>BOOKING</Text><Text style={s.infoValue}>Appointment Only</Text></View><View style={s.infoPill}><Text style={s.infoLabel}>FROM</Text><Text style={s.infoValue}>£10</Text></View><View style={s.infoPill}><Text style={s.infoLabel}>LOCATION</Text><Text style={s.infoValue}>Oxford</Text></View></View>
    <View style={s.sectionHead}><Text style={s.eyebrow}>QUICK ACCESS</Text><Text style={s.sectionTitle}>Everything You Need.</Text></View>
    <View style={s.quickGrid}>{actions.map(item=><Pressable key={item.label} onPress={item.action} style={({pressed})=>[s.quickCard,pressed&&s.pressed]}><QuickIcon item={item}/><Text style={s.quickLabel}>{item.label}</Text></Pressable>)}</View>
    <View style={s.previewCard}><View style={s.previewHead}><View><Text style={s.eyebrow}>POPULAR SERVICES</Text><Text style={s.previewTitle}>Ready When You Are.</Text></View><Pressable onPress={onServices}><Text style={s.viewAll}>VIEW ALL</Text></Pressable></View>{services.slice(0,2).map((x,i)=><View key={x.name}>{i?<View style={s.divider}/>:null}<Pressable onPress={()=>onBooking(x.name)} style={s.previewRow}><View><Text style={s.previewName}>{x.name}</Text><Text style={s.previewMeta}>{x.duration}</Text></View><View style={s.previewRight}><Text style={s.previewPrice}>{x.price}</Text><Text style={s.previewArrow}>›</Text></View></Pressable></View>)}</View>
    <Pressable onPress={onReviews} style={s.reviewCard}><View><Text style={s.reviewLabel}>GOOGLE REVIEWS</Text><Text style={s.reviewStars}>★★★★★</Text><Text style={s.reviewCopy}>See genuine client feedback.</Text></View><View style={s.reviewOpen}><Text style={s.reviewOpenText}>OPEN</Text></View></Pressable>
    <Pressable onPress={()=>open(links.website)} style={s.websiteButton}><Text style={s.websiteText}>VISIT QUINCYFADEZ.COM</Text><Text style={s.websiteArrow}>↗</Text></Pressable>
  </ScrollView></SafeAreaView>;
}

export default function AppShellModern(){
  const[screen,setScreen]=useState("auth"),[bookingService,setBookingService]=useState("Haircut");
  const home=()=>setScreen("home");
  const book=(service="Haircut")=>{setBookingService(service);setScreen("booking")};
  let body;
  if(screen==="auth")body=<AuthScreen onClient={home} onAdmin={()=>setScreen("admin")}/>;
  else if(screen==="services")body=<Services onBack={home} onBook={book}/>;
  else if(screen==="booking")body=<BookingScreen initialService={bookingService} onBack={home}/>;
  else if(screen==="gallery")body=<GalleryScreen onBack={home} onBook={()=>book("Haircut")}/>;
  else if(screen==="reviews")body=<ReviewsScreen onBack={home}/>;
  else if(screen==="account")body=<AccountScreen onBack={home}/>;
  else if(screen==="admin")body=<AdminNotificationsShell onExit={()=>setScreen("auth")}/>;
  else body=<Home onServices={()=>setScreen("services")} onBooking={book} onGallery={()=>setScreen("gallery")} onReviews={()=>setScreen("reviews")} onAccount={()=>setScreen("account")}/>;
  const showNav=!["auth","services","admin"].includes(screen);
  return <View style={s.shell}><View style={s.stage}>{body}</View>{showNav?<BottomNav screen={screen} onHome={home} onBook={()=>book(bookingService)} onGallery={()=>setScreen("gallery")} onReviews={()=>setScreen("reviews")} onAccount={()=>setScreen("account")}/>:null}</View>;
}

const s=StyleSheet.create({
  shell:{flex:1,backgroundColor:C.bg},stage:{flex:1},safe:{flex:1,backgroundColor:C.bg},pressed:{opacity:.72},homeContent:{paddingHorizontal:18,paddingTop:10,paddingBottom:28},pageContent:{paddingHorizontal:18,paddingTop:8,paddingBottom:42},
  topBar:{flexDirection:"row",alignItems:"center",justifyContent:"space-between",marginBottom:16},brand:{color:C.text,fontSize:20,letterSpacing:3.4,fontWeight:"900"},subBrand:{color:C.gold,fontSize:9,letterSpacing:1.4,fontWeight:"800",marginTop:5},logoButton:{width:52,height:52,borderRadius:26,borderWidth:1.5,borderColor:"#6A5429",backgroundColor:C.surface2,overflow:"hidden",alignItems:"center",justifyContent:"center"},logoImage:{width:48,height:48,borderRadius:24,resizeMode:"cover"},
  hero:{height:350,borderRadius:25,overflow:"hidden",borderWidth:1,borderColor:"rgba(214,189,122,.28)",backgroundColor:C.surface},heroImage:{...StyleSheet.absoluteFillObject,width:"100%",height:"100%"},heroShade:{...StyleSheet.absoluteFillObject,backgroundColor:"rgba(0,0,0,.24)"},heroBadge:{position:"absolute",top:15,left:15,borderRadius:14,borderWidth:1,borderColor:"rgba(241,221,162,.38)",backgroundColor:"rgba(5,5,5,.82)",paddingHorizontal:11,paddingVertical:8},heroBadgeText:{color:C.goldSoft,fontSize:8.5,letterSpacing:.9,fontWeight:"900"},heroPanel:{position:"absolute",left:13,right:13,bottom:13,borderRadius:20,borderWidth:1,borderColor:"rgba(214,189,122,.28)",backgroundColor:"rgba(6,6,6,.91)",padding:17},heroTitle:{color:"#FFFFFF",fontSize:28,lineHeight:30,fontWeight:"900"},heroGold:{color:C.goldSoft,fontSize:17,fontWeight:"850",marginTop:6},heroCopy:{color:"#E2DED7",fontSize:12.5,lineHeight:18,marginTop:9},
  primaryBook:{minHeight:68,borderRadius:18,backgroundColor:C.gold,marginTop:14,paddingHorizontal:19,paddingVertical:13,flexDirection:"row",alignItems:"center",justifyContent:"space-between",shadowColor:C.gold,shadowOpacity:.25,shadowRadius:16,shadowOffset:{width:0,height:7},elevation:4},primaryBookText:{color:"#090909",fontSize:13,fontWeight:"900",letterSpacing:.8},primaryBookSub:{color:"#453417",fontSize:10,marginTop:5,fontWeight:"700"},primaryBookArrow:{color:"#090909",fontSize:32},infoRow:{flexDirection:"row",gap:8,marginTop:10},infoPill:{flex:1,minHeight:62,borderRadius:15,borderWidth:1,borderColor:C.borderSoft,backgroundColor:C.surface,paddingHorizontal:10,paddingVertical:11,justifyContent:"center"},infoLabel:{color:C.gold,fontSize:7.5,fontWeight:"900",letterSpacing:.7},infoValue:{color:C.text2,fontSize:10.5,fontWeight:"800",marginTop:5},
  eyebrow:{color:C.gold,fontSize:9.5,letterSpacing:1.5,fontWeight:"900"},sectionHead:{marginTop:28,marginBottom:13},sectionTitle:{color:C.text,fontSize:24,fontWeight:"850",marginTop:6},quickGrid:{flexDirection:"row",flexWrap:"wrap",gap:9},quickCard:{width:"31.5%",minHeight:112,borderRadius:19,borderWidth:1,borderColor:C.border,backgroundColor:C.surface,alignItems:"center",justifyContent:"center",paddingHorizontal:7},quickIcon:{width:48,height:48,borderRadius:24,borderWidth:1,borderColor:"#564522",backgroundColor:C.surface2,alignItems:"center",justifyContent:"center",marginBottom:9},quickEmoji:{fontSize:21},whatsappIcon:{width:24,height:24,resizeMode:"contain"},quickLabel:{color:C.text2,fontSize:9.5,fontWeight:"850",textAlign:"center"},
  previewCard:{marginTop:21,borderRadius:20,borderWidth:1,borderColor:C.border,backgroundColor:C.surface,padding:17},previewHead:{flexDirection:"row",alignItems:"flex-start",justifyContent:"space-between"},previewTitle:{color:C.text,fontSize:18,fontWeight:"850",marginTop:5},viewAll:{color:C.goldSoft,fontSize:9,fontWeight:"900",letterSpacing:.8,paddingTop:3},previewRow:{minHeight:72,flexDirection:"row",alignItems:"center",justifyContent:"space-between",paddingTop:13},previewName:{color:C.text,fontSize:16,fontWeight:"800"},previewMeta:{color:C.muted,fontSize:10.5,marginTop:4},previewRight:{flexDirection:"row",alignItems:"center",gap:10},previewPrice:{color:C.goldSoft,fontSize:18,fontWeight:"900"},previewArrow:{color:C.gold,fontSize:24},divider:{height:1,backgroundColor:C.borderSoft,marginTop:12},
  reviewCard:{marginTop:18,borderRadius:20,borderWidth:1,borderColor:"#50421F",backgroundColor:C.surface2,padding:17,flexDirection:"row",alignItems:"center",justifyContent:"space-between"},reviewLabel:{color:C.gold,fontSize:9,fontWeight:"900",letterSpacing:1},reviewStars:{color:C.goldSoft,fontSize:15,letterSpacing:1.5,marginTop:6},reviewCopy:{color:C.muted,fontSize:11,marginTop:6},reviewOpen:{minWidth:58,height:38,borderRadius:19,borderWidth:1,borderColor:"#6A5429",alignItems:"center",justifyContent:"center"},reviewOpenText:{color:C.goldSoft,fontSize:9,fontWeight:"900"},websiteButton:{minHeight:58,borderRadius:17,borderWidth:1,borderColor:C.border,backgroundColor:C.surface,marginTop:16,paddingHorizontal:16,flexDirection:"row",alignItems:"center",justifyContent:"space-between"},websiteText:{color:C.goldSoft,fontSize:10,fontWeight:"900",letterSpacing:.8},websiteArrow:{color:C.goldSoft,fontSize:20},
  pageHeader:{minHeight:58,flexDirection:"row",alignItems:"center",justifyContent:"space-between",borderBottomWidth:1,borderBottomColor:C.borderSoft},backButton:{width:46,height:46,justifyContent:"center"},backIcon:{color:C.text,fontSize:36},pageHeaderTitle:{color:C.text,fontSize:14,letterSpacing:1.5,fontWeight:"900"},headerSpace:{width:46},pageTitle:{color:C.text,fontSize:29,lineHeight:34,fontWeight:"850",marginTop:8},pageCopy:{color:C.muted,fontSize:13,lineHeight:20,marginTop:9,marginBottom:16},serviceCard:{marginTop:10,borderRadius:21,borderWidth:1,borderColor:C.border,backgroundColor:C.surface,padding:17},serviceTop:{flexDirection:"row",alignItems:"flex-start",gap:12},serviceName:{color:C.text,fontSize:19,fontWeight:"850"},serviceDuration:{color:C.muted,fontSize:11,marginTop:5},servicePrice:{color:C.goldSoft,fontSize:20,fontWeight:"900"},serviceDescription:{color:C.text2,fontSize:12.5,lineHeight:19,marginTop:13},serviceButton:{minHeight:54,borderRadius:14,backgroundColor:C.gold,marginTop:15,paddingHorizontal:15,flexDirection:"row",alignItems:"center",justifyContent:"space-between"},serviceButtonText:{color:"#090909",fontSize:10,fontWeight:"900",letterSpacing:.7},buttonArrow:{color:"#090909",fontSize:26},
  navSafe:{backgroundColor:C.bg},navShell:{minHeight:74,marginHorizontal:10,marginTop:5,marginBottom:7,borderRadius:25,borderWidth:1,borderColor:C.border,backgroundColor:"#0A0907",flexDirection:"row",padding:5,alignItems:"center",shadowColor:"#000",shadowOpacity:.3,shadowRadius:16,shadowOffset:{width:0,height:-5}},navItem:{flex:1,minHeight:60,borderRadius:18,alignItems:"center",justifyContent:"center",gap:5},navItemActive:{backgroundColor:C.surface2,borderWidth:1,borderColor:"#544422"},navItemBook:{marginTop:-16},navIconArea:{height:25,alignItems:"center",justifyContent:"center"},navBookCircle:{width:52,height:52,borderRadius:26,backgroundColor:C.gold,shadowColor:C.gold,shadowOpacity:.28,shadowRadius:12,shadowOffset:{width:0,height:5},elevation:5},navLabel:{color:"#817D76",fontSize:9.5,fontWeight:"700"},navLabelActive:{color:C.goldSoft,fontWeight:"900"},navBookLabel:{color:C.goldSoft,fontWeight:"900",marginTop:1},bookGlyph:{color:"#090909",fontSize:29,lineHeight:30,fontWeight:"500"},homeGlyph:{width:21,height:19,borderRadius:5,borderWidth:1.8,alignItems:"center",justifyContent:"center"},homeGlyphDot:{width:5,height:5,borderRadius:3},galleryGlyph:{width:22,height:19,borderRadius:4,borderWidth:1.7,position:"relative"},galleryDot:{position:"absolute",top:4,right:4,width:4,height:4,borderRadius:2},galleryLine:{position:"absolute",left:3,right:3,bottom:4,height:2,borderRadius:1,transform:[{rotate:"-18deg"}]},starGlyph:{fontSize:21,lineHeight:23},personGlyph:{width:23,height:21,alignItems:"center"},personHead:{width:9,height:9,borderRadius:5,borderWidth:1.8},personBody:{width:20,height:10,borderTopLeftRadius:9,borderTopRightRadius:9,borderWidth:1.8,borderBottomWidth:0,marginTop:2}
});
