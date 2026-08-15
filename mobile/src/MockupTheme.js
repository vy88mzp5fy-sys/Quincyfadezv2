import React from "react";
import {Image,Pressable,StyleSheet,Text,View} from "react-native";

export const M={
  bg:"#040404",bg2:"#080808",panel:"#111110",panel2:"#171715",panel3:"#1B1710",
  gold:"#D6A443",goldSoft:"#E6BA63",goldBright:"#F3D482",goldDeep:"#A97624",goldDark:"#614516",
  text:"#F7F7F4",text2:"#DDDAD4",muted:"#9A9790",muted2:"#66625B",border:"#47371E",borderSoft:"#242019",
  green:"#57C97A",greenBg:"#0A2114",amber:"#DCAA3F",amberBg:"#241806",red:"#E18D82",redBg:"#25100D"
};

export const shadow={shadowColor:"#D6A443",shadowOpacity:.18,shadowRadius:17,shadowOffset:{width:0,height:7},elevation:5};
export const cardShadow={shadowColor:"#000",shadowOpacity:.5,shadowRadius:17,shadowOffset:{width:0,height:9},elevation:4};

export function Marble({children,style}){
  return <View style={[s.marble,style]}>
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View style={[s.glow,s.glow1]}/><View style={[s.glow,s.glow2]}/><View style={[s.glow,s.glow3]}/>
      <View style={[s.vein,s.vein1]}/><View style={[s.vein,s.vein2]}/><View style={[s.vein,s.vein3]}/><View style={[s.vein,s.vein4]}/><View style={[s.vein,s.vein5]}/>
      <View style={[s.hairline,s.hairline1]}/><View style={[s.hairline,s.hairline2]}/><View style={[s.hairline,s.hairline3]}/><View style={[s.hairline,s.hairline4]}/>
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
 glow:{position:"absolute",borderRadius:999,backgroundColor:"rgba(214,164,67,.026)"},glow1:{width:330,height:330,top:-120,right:-120},glow2:{width:290,height:290,bottom:80,left:-160},glow3:{width:230,height:230,top:330,left:70,backgroundColor:"rgba(255,255,255,.012)"},
 vein:{position:"absolute",height:1,backgroundColor:"rgba(214,164,67,.15)",borderRadius:2,shadowColor:M.gold,shadowOpacity:.12,shadowRadius:5},
 vein1:{width:390,top:160,left:-125,transform:[{rotate:"-31deg"}]},vein2:{width:340,top:425,right:-130,transform:[{rotate:"27deg"}]},vein3:{width:450,bottom:205,left:-195,transform:[{rotate:"-17deg"}]},vein4:{width:245,bottom:75,right:-70,transform:[{rotate:"42deg"}]},vein5:{width:210,top:610,left:-45,transform:[{rotate:"19deg"}]},
 hairline:{position:"absolute",height:.55,backgroundColor:"rgba(255,255,255,.045)"},hairline1:{width:300,top:255,right:-85,transform:[{rotate:"-14deg"}]},hairline2:{width:255,bottom:335,left:-75,transform:[{rotate:"34deg"}]},hairline3:{width:225,bottom:115,right:15,transform:[{rotate:"-39deg"}]},hairline4:{width:190,top:515,right:-55,transform:[{rotate:"12deg"}]},
 logo:{borderWidth:1,borderColor:M.gold,backgroundColor:"#070707",alignItems:"center",justifyContent:"center",...shadow},logoRing:{borderWidth:1,borderColor:"rgba(230,186,99,.48)",overflow:"hidden",alignItems:"center",justifyContent:"center"},crown:{position:"absolute",top:-14,alignSelf:"center"},crownText:{color:M.goldBright,fontSize:19,textShadowColor:"rgba(214,164,67,.42)",textShadowRadius:8},
 goldButton:{minHeight:58,borderRadius:11,backgroundColor:M.gold,paddingHorizontal:17,paddingVertical:10,flexDirection:"row",alignItems:"center",justifyContent:"space-between",borderWidth:1,borderColor:M.goldSoft,...shadow},goldButtonText:{color:"#090806",fontSize:12,fontWeight:"900",letterSpacing:.55},goldButtonSub:{color:"#4E3710",fontSize:8.5,fontWeight:"800",marginTop:3},arrow:{width:30,height:30,borderRadius:15,backgroundColor:"rgba(5,4,3,.12)",alignItems:"center",justifyContent:"center"},arrowText:{color:"#090806",fontSize:23,lineHeight:25},disabled:{opacity:.42},
 pill:{borderRadius:999,borderWidth:1,borderColor:M.border,backgroundColor:M.panel,paddingHorizontal:10,paddingVertical:5,alignSelf:"flex-start"},pillActive:{borderColor:M.goldDeep,backgroundColor:M.gold},pillText:{color:M.muted,fontSize:8,fontWeight:"900",letterSpacing:.55},pillTextActive:{color:"#090806"},
 eyebrow:{color:M.gold,fontSize:9,fontWeight:"900",letterSpacing:1.55}
});
