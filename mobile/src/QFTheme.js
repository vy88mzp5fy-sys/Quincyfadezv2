import React from "react";
import {Image,Pressable,StyleSheet,Text,View} from "react-native";

const QF_LOGO=require("../assets/icon.png");

export const M={
  bg:"#050505",
  bg2:"#090909",
  panel:"#101010",
  panel2:"#141414",
  panel3:"#1A1A1A",
  panel4:"#202020",
  accent:"#E0AE4F",
  accentSoft:"#EBC467",
  accentBright:"#F3D27D",
  accentDeep:"#B9822E",
  accentDark:"#6C4918",
  gold:"#E0AE4F",
  goldSoft:"#EBC467",
  goldBright:"#F3D27D",
  goldDeep:"#B9822E",
  goldDark:"#6C4918",
  text:"#F7F4EE",
  text2:"#E5E1DA",
  muted:"#AAA69F",
  muted2:"#76726C",
  border:"rgba(255,255,255,.13)",
  borderSoft:"rgba(255,255,255,.08)",
  warmBorder:"rgba(224,174,79,.24)",
  warmBorderSoft:"rgba(224,174,79,.14)",
  green:"#55D875",
  greenBg:"rgba(85,216,117,.08)",
  amber:"#E0AE4F",
  amberBg:"rgba(224,174,79,.09)",
  red:"#F07D73",
  redBg:"rgba(240,125,115,.08)",
  black:"#050505",
  white:"#F7F4EE"
};

export const shadow={
  shadowColor:"#000",
  shadowOpacity:.42,
  shadowRadius:18,
  shadowOffset:{width:0,height:10},
  elevation:7
};
export const cardShadow={
  shadowColor:"#000",
  shadowOpacity:.38,
  shadowRadius:15,
  shadowOffset:{width:0,height:8},
  elevation:5
};

export function Marble({children,style}){
  return <View style={[s.stage,style]}>{children}</View>;
}

export function BrandLogo({size=72}){
  return <View style={[s.logo,{width:size,height:size,borderRadius:size/2}]}>
    <Image source={QF_LOGO} resizeMode="cover" style={{width:size-3,height:size-3,borderRadius:(size-3)/2}}/>
  </View>;
}

export function GoldButton({title,subtitle,onPress,disabled=false,style,right="›"}){
  return <Pressable disabled={disabled} onPress={onPress} style={({pressed})=>[s.primary,style,disabled&&s.disabled,pressed&&!disabled&&s.pressed]}>
    <View pointerEvents="none" style={s.metalTop}/>
    <View pointerEvents="none" style={s.metalBottom}/>
    <View style={{flex:1,zIndex:1}}><Text style={s.primaryText}>{title}</Text>{subtitle?<Text numberOfLines={1} style={s.primarySub}>{subtitle}</Text>:null}</View>
    {right?<View style={s.primaryIcon}>{React.isValidElement(right)?right:<Text style={s.primaryArrow}>{right}</Text>}</View>:null}
  </Pressable>;
}

export function PrimaryButton(props){return <GoldButton {...props}/>}
export function LuxuryCard({children,style}){return <View style={[s.card,style]}>{children}</View>}
export function Surface({children,style}){return <View style={[s.card,style]}>{children}</View>}

export function LuxuryBackButton({onPress,style}){
  return <Pressable onPress={onPress} style={({pressed})=>[s.back,style,pressed&&{opacity:.62}]}>
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
  logo:{borderWidth:1,borderColor:"rgba(224,174,79,.30)",backgroundColor:"#090909",alignItems:"center",justifyContent:"center",overflow:"hidden",...cardShadow},
  primary:{minHeight:68,borderRadius:18,borderWidth:1,borderColor:"#F0CC77",backgroundColor:M.accent,paddingHorizontal:20,paddingVertical:14,flexDirection:"row",alignItems:"center",justifyContent:"space-between",overflow:"hidden",shadowColor:"#8C641F",shadowOpacity:.46,shadowRadius:16,shadowOffset:{width:0,height:8},elevation:8},
  metalTop:{position:"absolute",left:1,right:1,top:1,height:14,borderTopLeftRadius:17,borderTopRightRadius:17,backgroundColor:"rgba(255,255,255,.24)"},
  metalBottom:{position:"absolute",left:0,right:0,bottom:0,height:14,backgroundColor:"rgba(90,55,4,.11)"},
  pressed:{transform:[{scale:.992}],opacity:.96},
  primaryText:{color:"#090704",fontSize:16.5,fontWeight:"900",letterSpacing:.25},
  primarySub:{color:"rgba(9,7,4,.72)",fontSize:12.5,fontWeight:"700",marginTop:4},
  primaryIcon:{zIndex:1,width:40,height:40,borderRadius:20,backgroundColor:"rgba(9,7,4,.12)",borderWidth:1,borderColor:"rgba(255,255,255,.18)",alignItems:"center",justifyContent:"center"},
  primaryArrow:{color:"#090704",fontSize:24,lineHeight:25,fontWeight:"600"},
  disabled:{opacity:.34},
  card:{borderRadius:18,borderWidth:1,borderColor:M.warmBorderSoft,backgroundColor:M.panel2,...cardShadow},
  back:{width:46,height:46,alignItems:"center",justifyContent:"center"},
  backText:{color:M.text,fontSize:37,fontWeight:"200",lineHeight:38,marginTop:-3},
  pill:{borderRadius:999,borderWidth:1,borderColor:M.border,backgroundColor:M.panel3,paddingHorizontal:12,paddingVertical:7,alignSelf:"flex-start"},
  pillOn:{borderColor:M.warmBorder,backgroundColor:"rgba(224,174,79,.08)"},
  pillText:{color:M.muted,fontSize:11.5,fontWeight:"700",letterSpacing:.2},
  pillTextOn:{color:M.accentBright},
  eyebrow:{color:M.accentSoft,fontSize:11.5,fontWeight:"800",letterSpacing:1.15},
  statusDot:{width:8,height:8,borderRadius:4}
});
