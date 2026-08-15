import React from "react";
import {Pressable,StyleSheet,Text,View} from "react-native";
import {M,cardShadow,LuxuryBackButton} from "./QFTheme";

export function ClientHeader({title,onBack,rightIcon="",onRight,subtitle}){
  return <View style={s.header}>
    {onBack?<LuxuryBackButton onPress={onBack}/>:<View style={s.placeholder}/>} 
    <View style={s.headText}><Text numberOfLines={1} style={s.title}>{title}</Text>{subtitle?<Text style={s.subtitle}>{subtitle}</Text>:null}</View>
    {onRight?<Pressable onPress={onRight} style={({pressed})=>[s.rightButton,pressed&&{opacity:.65}]}><Text style={s.right}>{rightIcon||"•••"}</Text></Pressable>:<View style={s.placeholder}/>} 
  </View>;
}

export function ClientSection({title,action,onAction}){
  return <View style={s.section}><Text style={s.sectionTitle}>{String(title||"").toUpperCase()}</Text>{action?<Pressable onPress={onAction}><Text style={s.sectionAction}>{action}</Text></Pressable>:null}</View>;
}

export function ClientCard({children,style}){return <View style={[s.card,style]}>{children}</View>}
export function MiniIcon({children}){return <View style={s.icon}><Text style={s.iconText}>{children}</Text></View>}

const s=StyleSheet.create({
  header:{minHeight:94,flexDirection:"row",alignItems:"center",gap:13,paddingTop:6},
  placeholder:{width:46,height:46},
  headText:{flex:1},
  title:{color:M.text,fontSize:28,fontWeight:"800",letterSpacing:-.55},
  subtitle:{color:M.muted,fontSize:13,lineHeight:18,marginTop:5},
  rightButton:{width:46,height:46,borderRadius:15,borderWidth:1,borderColor:"rgba(255,255,255,.11)",backgroundColor:M.panel2,alignItems:"center",justifyContent:"center"},
  right:{color:M.text2,fontSize:18,fontWeight:"700"},
  section:{flexDirection:"row",alignItems:"center",justifyContent:"space-between",marginTop:28,marginBottom:11},
  sectionTitle:{color:M.text2,fontSize:10.5,fontWeight:"900",letterSpacing:1.15},
  sectionAction:{color:M.accentBright,fontSize:11.5,fontWeight:"800"},
  card:{borderRadius:20,borderWidth:1,borderColor:"rgba(255,255,255,.105)",backgroundColor:M.panel2,...cardShadow},
  icon:{width:46,height:46,borderRadius:15,borderWidth:1,borderColor:"rgba(255,255,255,.11)",backgroundColor:M.panel3,alignItems:"center",justifyContent:"center"},
  iconText:{color:M.text2,fontSize:19,fontWeight:"800"}
});
