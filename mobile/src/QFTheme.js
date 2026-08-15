import React from "react";
import {Pressable,StyleSheet,Text,View} from "react-native";

// QuincyFadez 2026 product system.
// Compatibility aliases keep the existing app engine working while the visual language moves away from marble/gold.
export const M={
  bg:"#080B10",
  bg2:"#0B1017",
  panel:"#111722",
  panel2:"#151C28",
  panel3:"#1A2230",
  accent:"#A9B8FF",
  accentSoft:"#CBD2FF",
  accentBright:"#EEF0FF",
  accentDeep:"#7E91DA",
  accentDark:"#39466F",
  gold:"#A9B8FF",
  goldSoft:"#CBD2FF",
  goldBright:"#EEF0FF",
  goldDeep:"#7E91DA",
  goldDark:"#39466F",
  text:"#F8F9FB",
  text2:"#D8DEE8",
  muted:"#8C98A8",
  muted2:"#5D6877",
  border:"#273142",
  borderSoft:"#1C2431",
  green:"#6EE7BE",
  greenBg:"#0D241D",
  amber:"#F1C77A",
  amberBg:"#2A2112",
  red:"#FF8E96",
  redBg:"#2A1317",
  black:"#080B10",
  white:"#F8F9FB"
};

export const shadow={
  shadowColor:"#000",
  shadowOpacity:.30,
  shadowRadius:18,
  shadowOffset:{width:0,height:8},
  elevation:5
};
export const cardShadow={
  shadowColor:"#000",
  shadowOpacity:.24,
  shadowRadius:16,
  shadowOffset:{width:0,height:7},
  elevation:3
};

export function Marble({children,style}){
  return <View style={[s.stage,style]}>
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View style={[s.aura,s.auraTop]}/>
      <View style={[s.aura,s.auraSide]}/>
      <View style={[s.aura,s.auraBottom]}/>
      <View style={s.hairline}/>
    </View>
    {children}
  </View>;
}

export function BrandLogo({size=72,compact=false}){
  const font=Math.max(14,Math.round(size*.27));
  return <View style={[s.logo,{width:size,height:size,borderRadius:size/2}]}>
    <View style={[s.logoInner,{width:size-8,height:size-8,borderRadius:(size-8)/2}]}>
      <Text style={[s.logoText,{fontSize:font}]}>QF</Text>
    </View>
    {!compact?<View style={s.logoDot}/>:null}
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
  aura:{position:"absolute",borderRadius:999},
  auraTop:{width:440,height:440,top:-300,right:-220,backgroundColor:"rgba(128,149,255,.09)"},
  auraSide:{width:360,height:360,top:300,left:-300,backgroundColor:"rgba(110,231,190,.035)"},
  auraBottom:{width:520,height:520,bottom:-410,right:-180,backgroundColor:"rgba(203,210,255,.045)"},
  hairline:{position:"absolute",left:24,right:24,top:112,height:1,backgroundColor:"rgba(255,255,255,.025)"},
  logo:{borderWidth:1,borderColor:"rgba(203,210,255,.38)",backgroundColor:"rgba(16,22,32,.95)",alignItems:"center",justifyContent:"center",...cardShadow},
  logoInner:{borderWidth:1,borderColor:"rgba(255,255,255,.075)",backgroundColor:"#0C1119",alignItems:"center",justifyContent:"center"},
  logoText:{color:M.text,fontWeight:"800",letterSpacing:1},
  logoDot:{position:"absolute",right:4,bottom:7,width:8,height:8,borderRadius:4,backgroundColor:M.accent,borderWidth:2,borderColor:M.bg},
  primary:{minHeight:58,borderRadius:17,backgroundColor:M.accent,paddingHorizontal:17,paddingVertical:11,flexDirection:"row",alignItems:"center",justifyContent:"space-between",...shadow},
  pressed:{transform:[{scale:.992}],opacity:.94},
  primaryText:{color:"#0B0F16",fontSize:13,fontWeight:"800",letterSpacing:.2},
  primarySub:{color:"rgba(11,15,22,.68)",fontSize:9.5,fontWeight:"700",marginTop:3},
  primaryIcon:{width:34,height:34,borderRadius:17,backgroundColor:"rgba(11,15,22,.10)",alignItems:"center",justifyContent:"center"},
  primaryArrow:{color:"#0B0F16",fontSize:22,lineHeight:23},
  disabled:{opacity:.36},
  card:{borderRadius:20,borderWidth:1,borderColor:"rgba(255,255,255,.075)",backgroundColor:"rgba(17,23,34,.94)",...cardShadow},
  back:{width:44,height:44,borderRadius:14,borderWidth:1,borderColor:"rgba(255,255,255,.08)",backgroundColor:"rgba(17,23,34,.86)",alignItems:"center",justifyContent:"center"},
  backText:{color:M.text2,fontSize:31,fontWeight:"300",lineHeight:31,marginTop:-2},
  pill:{borderRadius:999,borderWidth:1,borderColor:"rgba(255,255,255,.08)",backgroundColor:"rgba(21,28,40,.90)",paddingHorizontal:11,paddingVertical:6,alignSelf:"flex-start"},
  pillOn:{borderColor:"rgba(169,184,255,.55)",backgroundColor:"rgba(169,184,255,.14)"},
  pillText:{color:M.muted,fontSize:9,fontWeight:"700",letterSpacing:.35},
  pillTextOn:{color:M.accentSoft},
  eyebrow:{color:M.accentSoft,fontSize:9,fontWeight:"800",letterSpacing:1.35},
  statusDot:{width:7,height:7,borderRadius:4}
});
