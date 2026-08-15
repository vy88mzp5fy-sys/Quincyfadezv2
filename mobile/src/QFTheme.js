import React from "react";
import {Pressable,StyleSheet,Text,View} from "react-native";

// QuincyFadez clean luxury product system.
// Simple black/charcoal surfaces with warm neutral text and restrained gold accents.
export const M={
  bg:"#090909",
  bg2:"#0D0D0D",
  panel:"#141414",
  panel2:"#1A1A1A",
  panel3:"#202020",
  accent:"#D6B75C",
  accentSoft:"#E4CC83",
  accentBright:"#F2E3AF",
  accentDeep:"#B89843",
  accentDark:"#6B5728",
  gold:"#D6B75C",
  goldSoft:"#E4CC83",
  goldBright:"#F2E3AF",
  goldDeep:"#B89843",
  goldDark:"#6B5728",
  text:"#F4F1EA",
  text2:"#D9D5CC",
  muted:"#AAA59B",
  muted2:"#77736C",
  border:"#303030",
  borderSoft:"#242424",
  green:"#8FC6A6",
  greenBg:"#15221A",
  amber:"#D6B75C",
  amberBg:"#2A2415",
  red:"#D98D86",
  redBg:"#2A1716",
  black:"#090909",
  white:"#F4F1EA"
};

export const shadow={
  shadowColor:"#000",
  shadowOpacity:.22,
  shadowRadius:14,
  shadowOffset:{width:0,height:6},
  elevation:3
};
export const cardShadow={
  shadowColor:"#000",
  shadowOpacity:.16,
  shadowRadius:10,
  shadowOffset:{width:0,height:4},
  elevation:2
};

export function Marble({children,style}){
  return <View style={[s.stage,style]}>{children}</View>;
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
  logo:{borderWidth:1,borderColor:"rgba(214,183,92,.34)",backgroundColor:M.panel,alignItems:"center",justifyContent:"center",...cardShadow},
  logoInner:{borderWidth:1,borderColor:"rgba(255,255,255,.06)",backgroundColor:"#101010",alignItems:"center",justifyContent:"center"},
  logoText:{color:M.text,fontWeight:"800",letterSpacing:1},
  logoDot:{position:"absolute",right:4,bottom:7,width:8,height:8,borderRadius:4,backgroundColor:M.accent,borderWidth:2,borderColor:M.bg},
  primary:{minHeight:58,borderRadius:16,backgroundColor:M.accent,paddingHorizontal:17,paddingVertical:11,flexDirection:"row",alignItems:"center",justifyContent:"space-between",...shadow},
  pressed:{transform:[{scale:.994}],opacity:.94},
  primaryText:{color:"#11100D",fontSize:13,fontWeight:"800",letterSpacing:.2},
  primarySub:{color:"rgba(17,16,13,.66)",fontSize:9.5,fontWeight:"700",marginTop:3},
  primaryIcon:{width:34,height:34,borderRadius:17,backgroundColor:"rgba(17,16,13,.09)",alignItems:"center",justifyContent:"center"},
  primaryArrow:{color:"#11100D",fontSize:22,lineHeight:23},
  disabled:{opacity:.36},
  card:{borderRadius:18,borderWidth:1,borderColor:"rgba(255,255,255,.075)",backgroundColor:M.panel,...cardShadow},
  back:{width:44,height:44,borderRadius:14,borderWidth:1,borderColor:"rgba(255,255,255,.08)",backgroundColor:M.panel,alignItems:"center",justifyContent:"center"},
  backText:{color:M.text2,fontSize:31,fontWeight:"300",lineHeight:31,marginTop:-2},
  pill:{borderRadius:999,borderWidth:1,borderColor:"rgba(255,255,255,.08)",backgroundColor:M.panel2,paddingHorizontal:11,paddingVertical:6,alignSelf:"flex-start"},
  pillOn:{borderColor:"rgba(214,183,92,.46)",backgroundColor:"rgba(214,183,92,.10)"},
  pillText:{color:M.muted,fontSize:9,fontWeight:"700",letterSpacing:.35},
  pillTextOn:{color:M.accentSoft},
  eyebrow:{color:M.accentSoft,fontSize:9,fontWeight:"800",letterSpacing:1.35},
  statusDot:{width:7,height:7,borderRadius:4}
});
