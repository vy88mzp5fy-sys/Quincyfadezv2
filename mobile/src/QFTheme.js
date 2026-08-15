import React from "react";
import {Image,Pressable,StyleSheet,Text,View} from "react-native";

const QF_LOGO=require("../assets/icon.png");

// QuincyFadez modern luxury product system.
// Flat black background, layered graphite surfaces, warm white typography and metallic gold actions.
export const M={
  bg:"#070707",
  bg2:"#0D0E10",
  panel:"#191B1F",
  panel2:"#22252A",
  panel3:"#2B2F35",
  accent:"#D9B451",
  accentSoft:"#E7CA78",
  accentBright:"#F4DF9C",
  accentDeep:"#B88F2E",
  accentDark:"#6F5518",
  gold:"#D9B451",
  goldSoft:"#E7CA78",
  goldBright:"#F4DF9C",
  goldDeep:"#B88F2E",
  goldDark:"#6F5518",
  text:"#FFFDF8",
  text2:"#ECE8DF",
  muted:"#BDB8AE",
  muted2:"#88837B",
  border:"#3A3D43",
  borderSoft:"#2B2E33",
  green:"#7BD6A6",
  greenBg:"#10231A",
  amber:"#D9B451",
  amberBg:"#30270F",
  red:"#F08E86",
  redBg:"#2D1515",
  black:"#070707",
  white:"#FFFDF8"
};

export const shadow={
  shadowColor:"#8E6E25",
  shadowOpacity:.28,
  shadowRadius:15,
  shadowOffset:{width:0,height:8},
  elevation:6
};
export const cardShadow={
  shadowColor:"#000",
  shadowOpacity:.32,
  shadowRadius:14,
  shadowOffset:{width:0,height:8},
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
    <View pointerEvents="none" style={s.metalHighlight}/>
    <View style={{flex:1,zIndex:1}}><Text style={s.primaryText}>{title}</Text>{subtitle?<Text style={s.primarySub}>{subtitle}</Text>:null}</View>
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
  logo:{borderWidth:1,borderColor:"rgba(255,255,255,.13)",backgroundColor:"#0B0B0B",alignItems:"center",justifyContent:"center",overflow:"hidden",...cardShadow},
  primary:{minHeight:64,borderRadius:18,borderWidth:1,borderColor:"#F1D98D",backgroundColor:M.accent,paddingHorizontal:19,paddingVertical:13,flexDirection:"row",alignItems:"center",justifyContent:"space-between",overflow:"hidden",...shadow},
  metalHighlight:{position:"absolute",left:1,right:1,top:1,height:12,borderTopLeftRadius:17,borderTopRightRadius:17,backgroundColor:"rgba(255,255,255,.20)"},
  pressed:{transform:[{scale:.992}],opacity:.95},
  primaryText:{color:"#0B0A06",fontSize:15,fontWeight:"900",letterSpacing:.1},
  primarySub:{color:"rgba(11,10,6,.72)",fontSize:11,fontWeight:"800",marginTop:4},
  primaryIcon:{zIndex:1,width:38,height:38,borderRadius:19,backgroundColor:"rgba(11,10,6,.13)",borderWidth:1,borderColor:"rgba(255,255,255,.16)",alignItems:"center",justifyContent:"center"},
  primaryArrow:{color:"#0B0A06",fontSize:23,lineHeight:24,fontWeight:"700"},
  disabled:{opacity:.38},
  card:{borderRadius:20,borderWidth:1,borderColor:"rgba(255,255,255,.105)",backgroundColor:M.panel,...cardShadow},
  back:{width:46,height:46,borderRadius:15,borderWidth:1,borderColor:"rgba(255,255,255,.11)",backgroundColor:M.panel2,alignItems:"center",justifyContent:"center"},
  backText:{color:M.text2,fontSize:32,fontWeight:"300",lineHeight:32,marginTop:-2},
  pill:{borderRadius:999,borderWidth:1,borderColor:"rgba(255,255,255,.11)",backgroundColor:M.panel2,paddingHorizontal:12,paddingVertical:7,alignSelf:"flex-start"},
  pillOn:{borderColor:"rgba(255,255,255,.15)",backgroundColor:"#303239"},
  pillText:{color:M.muted,fontSize:10.5,fontWeight:"700",letterSpacing:.3},
  pillTextOn:{color:M.accentBright},
  eyebrow:{color:M.accentSoft,fontSize:10.5,fontWeight:"800",letterSpacing:1.25},
  statusDot:{width:8,height:8,borderRadius:4}
});