import React from "react";
import {Image,ImageBackground,Pressable,StyleSheet,Text,View} from "react-native";

// QuincyFadez master visual system.
// The approved Personal Information screen is the reference for every client/admin surface.
// Its actual black-and-gold marble treatment is now used as the global app background.
const MASTER_MARBLE=require("../assets/qf-marble-master.jpg");

export const M={
  bg:"#050505",
  bg2:"#090909",
  panel:"#0D0D0C",
  panel2:"#121210",
  panel3:"#17140F",
  gold:"#D6BD7A",
  goldSoft:"#E4CF95",
  goldBright:"#F1DDA2",
  goldDeep:"#9C8652",
  goldDark:"#574A2D",
  text:"#F7F5EF",
  text2:"#D8D5CE",
  muted:"#9A968E",
  muted2:"#666159",
  border:"#302A20",
  borderSoft:"#1D1A16",
  green:"#68C987",
  greenBg:"#0B2014",
  amber:"#D5B56D",
  amberBg:"#241D0E",
  red:"#D98B82",
  redBg:"#25110F"
};

export const shadow={
  shadowColor:M.gold,
  shadowOpacity:.09,
  shadowRadius:12,
  shadowOffset:{width:0,height:5},
  elevation:3
};
export const cardShadow={
  shadowColor:"#000",
  shadowOpacity:.42,
  shadowRadius:15,
  shadowOffset:{width:0,height:8},
  elevation:3
};

export function Marble({children,style}){
  return <ImageBackground
    source={MASTER_MARBLE}
    resizeMode="cover"
    style={[s.marble,style]}
    imageStyle={s.marbleImage}
  >
    <View pointerEvents="none" style={s.marbleShade}/>
    {children}
  </ImageBackground>;
}

export function BrandLogo({size=94,compact=false}){
  const inner=size-8;
  return <View style={[s.logo,{width:size,height:size,borderRadius:size/2}]}>
    <View style={[s.logoRing,{width:inner,height:inner,borderRadius:inner/2}]}>
      <Image source={require("../assets/icon.png")} style={{width:inner-4,height:inner-4,borderRadius:(inner-4)/2,resizeMode:"cover"}}/>
    </View>
    {!compact?<View style={s.crown}><Text style={s.crownText}>♛</Text></View>:null}
  </View>;
}

export function GoldButton({title,subtitle,onPress,disabled=false,style,right="›"}){
  return <Pressable disabled={disabled} onPress={onPress} style={({pressed})=>[s.goldButton,style,disabled&&s.disabled,pressed&&!disabled&&{opacity:.9}]}>
    <View><Text style={s.goldButtonText}>{title}</Text>{subtitle?<Text style={s.goldButtonSub}>{subtitle}</Text>:null}</View>
    {right?<View style={s.arrow}><Text style={s.arrowText}>{right}</Text></View>:null}
  </Pressable>;
}

export function LuxuryCard({children,style}){
  return <View style={[s.luxuryCard,style]}>{children}</View>;
}

export function LuxuryBackButton({onPress,style}){
  return <Pressable onPress={onPress} style={({pressed})=>[s.backButton,style,pressed&&{opacity:.72}]}>
    <Text style={s.backGlyph}>‹</Text>
  </Pressable>;
}

export function Pill({children,active=false,style}){
  return <View style={[s.pill,active&&s.pillActive,style]}><Text style={[s.pillText,active&&s.pillTextActive]}>{children}</Text></View>;
}
export function Eyebrow({children,style}){return <Text style={[s.eyebrow,style]}>{children}</Text>}

const s=StyleSheet.create({
  marble:{flex:1,backgroundColor:M.bg,overflow:"hidden"},
  marbleImage:{opacity:.94},
  marbleShade:{...StyleSheet.absoluteFillObject,backgroundColor:"rgba(0,0,0,.075)"},
  logo:{borderWidth:1,borderColor:"rgba(214,189,122,.82)",backgroundColor:"#070707",alignItems:"center",justifyContent:"center",...shadow},
  logoRing:{borderWidth:1,borderColor:"rgba(228,207,149,.38)",overflow:"hidden",alignItems:"center",justifyContent:"center"},
  crown:{position:"absolute",top:-14,alignSelf:"center"},
  crownText:{color:M.goldBright,fontSize:18,textShadowColor:"rgba(214,189,122,.18)",textShadowRadius:5},
  goldButton:{minHeight:56,borderRadius:12,backgroundColor:M.gold,paddingHorizontal:17,paddingVertical:10,flexDirection:"row",alignItems:"center",justifyContent:"space-between",borderWidth:1,borderColor:"rgba(241,221,162,.68)",...shadow},
  goldButtonText:{color:"#090806",fontSize:12,fontWeight:"800",letterSpacing:.9},
  goldButtonSub:{color:"#4A3F26",fontSize:8.5,fontWeight:"700",marginTop:3},
  arrow:{width:29,height:29,borderRadius:14.5,backgroundColor:"rgba(5,4,3,.09)",alignItems:"center",justifyContent:"center"},
  arrowText:{color:"#090806",fontSize:22,lineHeight:24},
  disabled:{opacity:.4},
  luxuryCard:{borderRadius:16,borderWidth:1,borderColor:"rgba(214,189,122,.14)",backgroundColor:"rgba(12,12,11,.90)",...cardShadow},
  backButton:{width:42,height:42,borderRadius:13,borderWidth:1,borderColor:"rgba(214,189,122,.24)",backgroundColor:"rgba(11,11,10,.76)",alignItems:"center",justifyContent:"center",...cardShadow},
  backGlyph:{color:M.goldSoft,fontSize:30,fontWeight:"300",lineHeight:31,marginTop:-2},
  pill:{borderRadius:999,borderWidth:1,borderColor:"rgba(214,189,122,.16)",backgroundColor:"rgba(13,13,12,.88)",paddingHorizontal:10,paddingVertical:5,alignSelf:"flex-start"},
  pillActive:{borderColor:"rgba(241,221,162,.62)",backgroundColor:M.gold},
  pillText:{color:M.muted,fontSize:8,fontWeight:"800",letterSpacing:.7},
  pillTextActive:{color:"#090806"},
  eyebrow:{color:M.gold,fontSize:9,fontWeight:"800",letterSpacing:1.7}
});
