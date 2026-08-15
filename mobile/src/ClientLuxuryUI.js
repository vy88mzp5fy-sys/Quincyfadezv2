import React from "react";
import {Pressable,StyleSheet,Text,View} from "react-native";
import {M,cardShadow,LuxuryBackButton} from "./QFTheme";
import QFIcon from "./QFIcons";

export function ClientHeader({title,onBack,rightIcon="menu",onRight,subtitle}){
  return <View style={s.header}>
    <View style={s.side}>{onBack?<LuxuryBackButton onPress={onBack}/>:null}</View>
    <View style={s.headText}><Text numberOfLines={1} style={s.title}>{title}</Text>{subtitle?<Text numberOfLines={2} style={s.subtitle}>{subtitle}</Text>:null}</View>
    <View style={[s.side,{alignItems:"flex-end"}]}>{onRight?<Pressable onPress={onRight} style={({pressed})=>[s.rightButton,pressed&&{opacity:.6}]}>{typeof rightIcon==="string"?<QFIcon name={rightIcon} size={25}/>:rightIcon}</Pressable>:null}</View>
  </View>;
}

export function ClientSection({title,action,onAction}){
  return <View style={s.section}><Text style={s.sectionTitle}>{String(title||"").toUpperCase()}</Text>{action?<Pressable onPress={onAction}><Text style={s.sectionAction}>{action}</Text></Pressable>:null}</View>;
}

export function ClientCard({children,style}){return <View style={[s.card,style]}>{children}</View>}
export function MiniIcon({children,name}){return <View style={s.icon}>{name?<QFIcon name={name} size={24}/>:<Text style={s.iconText}>{children}</Text>}</View>}

const s=StyleSheet.create({
  header:{minHeight:112,flexDirection:"row",alignItems:"flex-start",paddingTop:13,paddingBottom:16},
  side:{width:54,minHeight:48,justifyContent:"flex-start"},
  headText:{flex:1,alignItems:"center",paddingTop:5},
  title:{color:M.text,fontSize:31,fontWeight:"700",letterSpacing:-.5,textAlign:"center"},
  subtitle:{color:M.muted,fontSize:14.5,lineHeight:20,marginTop:7,textAlign:"center",maxWidth:290},
  rightButton:{width:46,height:46,alignItems:"center",justifyContent:"center"},
  section:{flexDirection:"row",alignItems:"center",justifyContent:"space-between",marginTop:30,marginBottom:12},
  sectionTitle:{color:M.text,fontSize:16,fontWeight:"800",letterSpacing:.2},
  sectionAction:{color:M.accent,fontSize:14,fontWeight:"700"},
  card:{borderRadius:18,borderWidth:1,borderColor:M.warmBorderSoft,backgroundColor:M.panel2,...cardShadow},
  icon:{width:48,height:48,borderRadius:15,borderWidth:1,borderColor:M.border,backgroundColor:M.panel3,alignItems:"center",justifyContent:"center"},
  iconText:{color:M.accent,fontSize:20,fontWeight:"700"}
});
