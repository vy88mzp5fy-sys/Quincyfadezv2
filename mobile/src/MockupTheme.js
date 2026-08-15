import React from "react";
import {Image,Pressable,StyleSheet,Text,View} from "react-native";

export const M={
  bg:"#050403",bg2:"#090805",panel:"#0E0B07",panel2:"#151007",panel3:"#1D160A",
  gold:"#D6BD7A",goldSoft:"#F4D993",goldBright:"#FFE6A5",goldDeep:"#A97D2F",goldDark:"#5E431B",
  text:"#FFFDF7",text2:"#EDE7DB",muted:"#9E968A",muted2:"#655F56",border:"#3A2C17",borderSoft:"#221B11",
  green:"#65CC8A",greenBg:"#092015",amber:"#E9B851",amberBg:"#241806",red:"#E79C91",redBg:"#25100D"
};

export const shadow={shadowColor:"#D6BD7A",shadowOpacity:.16,shadowRadius:16,shadowOffset:{width:0,height:7},elevation:4};
export const cardShadow={shadowColor:"#000",shadowOpacity:.42,shadowRadius:15,shadowOffset:{width:0,height:9},elevation:3};

export function Marble({children,style}){
  return <View style={[s.marble,style]}>
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View style={[s.glow,s.glow1]}/><View style={[s.glow,s.glow2]}/>
      <View style={[s.vein,s.vein1]}/><View style={[s.vein,s.vein2]}/><View style={[s.vein,s.vein3]}/><View style={[s.vein,s.vein4]}/>
      <View style={[s.hairline,s.hairline1]}/><View style={[s.hairline,s.hairline2]}/><View style={[s.hairline,s.hairline3]}/>
    </View>
    {children}
  </View>;
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
  return <Pressable disabled={disabled} onPress={onPress} style={({pressed})=>[s.goldButton,style,disabled&&s.disabled,pressed&&!disabled&&{opacity:.88}]}>
    <View><Text style={s.goldButtonText}>{title}</Text>{subtitle?<Text style={s.goldButtonSub}>{subtitle}</Text>:null}</View>
    {right?<View style={s.arrow}><Text style={s.arrowText}>{right}</Text></View>:null}
  </Pressable>;
}

export function Pill({children,active=false,style}){return <View style={[s.pill,active&&s.pillActive,style]}><Text style={[s.pillText,active&&s.pillTextActive]}>{children}</Text></View>}
export function Eyebrow({children,style}){return <Text style={[s.eyebrow,style]}>{children}</Text>}

const s=StyleSheet.create({
 marble:{flex:1,backgroundColor:M.bg,overflow:"hidden"},
 glow:{position:"absolute",width:260,height:260,borderRadius:130,backgroundColor:"rgba(214,189,122,.035)"},glow1:{top:-70,right:-90},glow2:{bottom:80,left:-140},
 vein:{position:"absolute",height:1,backgroundColor:"rgba(214,189,122,.20)",borderRadius:2,shadowColor:M.gold,shadowOpacity:.16,shadowRadius:5},
 vein1:{width:370,top:170,left:-120,transform:[{rotate:"-32deg"}]},vein2:{width:310,top:440,right:-115,transform:[{rotate:"28deg"}]},vein3:{width:420,bottom:190,left:-180,transform:[{rotate:"-18deg"}]},vein4:{width:220,bottom:65,right:-60,transform:[{rotate:"42deg"}]},
 hairline:{position:"absolute",height:.6,backgroundColor:"rgba(255,255,255,.055)"},hairline1:{width:280,top:260,right:-80,transform:[{rotate:"-15deg"}]},hairline2:{width:240,bottom:330,left:-70,transform:[{rotate:"35deg"}]},hairline3:{width:210,bottom:105,right:20,transform:[{rotate:"-40deg"}]},
 logo:{borderWidth:1,borderColor:M.gold,backgroundColor:"#090704",alignItems:"center",justifyContent:"center",...shadow},logoRing:{borderWidth:1,borderColor:"rgba(244,217,147,.46)",overflow:"hidden",alignItems:"center",justifyContent:"center"},crown:{position:"absolute",top:-14,alignSelf:"center"},crownText:{color:M.goldBright,fontSize:19,textShadowColor:"rgba(214,189,122,.4)",textShadowRadius:8},
 goldButton:{minHeight:58,borderRadius:10,backgroundColor:M.gold,paddingHorizontal:17,paddingVertical:10,flexDirection:"row",alignItems:"center",justifyContent:"space-between",borderWidth:1,borderColor:M.goldSoft,...shadow},goldButtonText:{color:"#0A0805",fontSize:12,fontWeight:"900",letterSpacing:.7},goldButtonSub:{color:"#523D16",fontSize:8.5,fontWeight:"800",marginTop:3},arrow:{width:30,height:30,borderRadius:15,backgroundColor:"rgba(5,4,3,.12)",alignItems:"center",justifyContent:"center"},arrowText:{color:"#090704",fontSize:23,lineHeight:25},disabled:{opacity:.42},
 pill:{borderRadius:999,borderWidth:1,borderColor:M.border,backgroundColor:M.panel,paddingHorizontal:10,paddingVertical:5,alignSelf:"flex-start"},pillActive:{borderColor:M.goldDeep,backgroundColor:M.gold},pillText:{color:M.muted,fontSize:8,fontWeight:"900",letterSpacing:.6},pillTextActive:{color:"#090704"},
 eyebrow:{color:M.gold,fontSize:9,fontWeight:"900",letterSpacing:1.55}
});