import React from "react";
import {Image,Pressable,StyleSheet,Text,View} from "react-native";

const QF_LOGO=require("../assets/icon.png");

// QuincyFadez modern luxury product system.
// Flat black background, graphite surfaces, warm white typography and a vivid gold accent.
export const M={
  bg:"#070707",
  bg2:"#0C0D0F",
  panel:"#181A1E",
  panel2:"#202329",
  panel3:"#292D34",
  accent:"#F4C542",
  accentSoft:"#FFD866",
  accentBright:"#FFE99B",
  accentDeep:"#D7A91E",
  accentDark:"#7D6111",
  gold:"#F4C542",
  goldSoft:"#FFD866",
  goldBright:"#FFE99B",
  goldDeep:"#D7A91E",
  goldDark:"#7D6111",
  text:"#FFFDF7",
  text2:"#E9E5DB",
  muted:"#B8B3A8",
  muted2:"#7F7B73",
  border:"#373A40",
  borderSoft:"#292C31",
  green:"#78D6A4",
  greenBg:"#10231A",
  amber:"#F4C542",
  amberBg:"#30270F",
  red:"#F08E86",
  redBg:"#2D1515",
  black:"#070707",
  white:"#FFFDF7"
};

export const shadow={
  shadowColor:M.accent,
  shadowOpacity:.24,
  shadowRadius:14,
  shadowOffset:{width:0,height:7},
  elevation:5
};
export const cardShadow={
  shadowColor:"#000",
  shadowOpacity:.28,
  shadowRadius:13,
  shadowOffset:{width:0,height:7},
  elevation:4
};

export function Marble({children,style}){
  return <View style={[s.stage,style]}>{children}</View>;
}

export function BrandLogo({size=72}){
  return <View style={[s.logo,{width:size,height:size,borderRadius:size/2}]}>
    <Image source={QF_LOGO} resizeMode="cover" style={{width:size-4,height:size-4,borderRadius:(size-4)/2}}/>
  </View>;
}

export function GoldButton({title,subtitle,onPress,disabled=false,style,right="›"}){
  return <Pressable disabled={disabled} onPress={onPress} style={({pressed})=>[s.primary,style,disabled&&s.disabled,pressed&&!disabled&&s.pressed]}>
    <View style={{flex:1}}><Text style={s.primaryText}>{title}</Text>{subtitle?<Text style={s.primarySub}>{subtitle}</Text>:null}</View>
    {right?<View style={s.primaryIcon}><Text style={s.primaryArrow}>{right}</Text></View>:null}
  </Pressable>;
}

export function PrimaryButton(props){return <GoldButton {...props}/>}
export function LuxuryCard({children,style}){return <View style={[s.card,style]}>{children}</View>}
export function Surface({children,style}){return <View style={[s.card,style]}>{children}</View>}

export function LuxuryBackButton({onPress,style}){
  return <Pressable onPress={onPress} style={({pressed})=>[s.back,style,pressed&&{opacity:.65}]}>
    <Text style={s.backText}>‹</Text>
  </Pressable>;
}

export function Pill({children,active=false,style}){
  return <View style={[s.pill,active&&s.pillOn,style]}><Text style={[s.pillText,active&&s.pillTextOn]}>{children}</Text></View>;
}
export function Eyebrow({children,style}){return <Text style={[s.eyebrow,style]}>{children}</Text>}
export function StatusDot({tone="accent"}){const c=tone==="good"?M.green:tone==="warn"?M.amber:tone==="bad"?M.red:M.accent;return <View style={[s.statusDot,{backgroundColor:c}]}/>}

const s=StyleSheet.create({
  stage:{flex:1,backgroundColor:M.bg,overflow:"hidden"},
  logo:{borderWidth:1,borderColor:"rgba(244,197,66,.62)",backgroundColor:"#0B0B0B",alignItems:"center",justifyContent:"center",overflow:"hidden",...cardShadow},
  primary:{minHeight:60,borderRadius:17,borderWidth:1,borderColor:"rgba(255,233,155,.78)",backgroundColor:M.accent,paddingHorizontal:18,paddingVertical:12,flexDirection:"row",alignItems:"center",justifyContent:"space-between",...shadow},
  pressed:{transform:[{scale:.992}],opacity:.95},
  primaryText:{color:"#0B0A06",fontSize:13.5,fontWeight:"900",letterSpacing:.15},
  primarySub:{color:"rgba(11,10,6,.68)",fontSize:9.7,fontWeight:"800",marginTop:3},
  primaryIcon:{width:36,height:36,borderRadius:18,backgroundColor:"rgba(11,10,6,.12)",alignItems:"center",justifyContent:"center"},
  primaryArrow:{color:"#0B0A06",fontSize:23,lineHeight:24,fontWeight:"700"},
  disabled:{opacity:.38},
  card:{borderRadius:19,borderWidth:1,borderColor:"rgba(255,255,255,.10)",backgroundColor:M.panel,...cardShadow},
  back:{width:44,height:44,borderRadius:14,borderWidth:1,borderColor:"rgba(244,197,66,.22)",backgroundColor:M.panel2,alignItems:"center",justifyContent:"center"},
  backText:{color:M.text2,fontSize:31,fontWeight:"300",lineHeight:31,marginTop:-2},
  pill:{borderRadius:999,borderWidth:1,borderColor:"rgba(255,255,255,.10)",backgroundColor:M.panel2,paddingHorizontal:11,paddingVertical:6,alignSelf:"flex-start"},
  pillOn:{borderColor:"rgba(244,197,66,.60)",backgroundColor:"rgba(244,197,66,.14)"},
  pillText:{color:M.muted,fontSize:9,fontWeight:"700",letterSpacing:.35},
  pillTextOn:{color:M.accentSoft},
  eyebrow:{color:M.accentSoft,fontSize:9,fontWeight:"800",letterSpacing:1.35},
  statusDot:{width:7,height:7,borderRadius:4}
});
