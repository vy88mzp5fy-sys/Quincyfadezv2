import React from "react";
import {Pressable,StyleSheet,Text,View} from "react-native";
import {M,cardShadow,LuxuryBackButton} from "./MockupTheme";

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
  header:{minHeight:84,flexDirection:"row",alignItems:"center",gap:12,paddingTop:5},
  placeholder:{width:44,height:44},
  headText:{flex:1},
  title:{color:M.text,fontSize:25,fontWeight:"700",letterSpacing:-.5},
  subtitle:{color:M.muted,fontSize:11.5,lineHeight:16,marginTop:4},
  rightButton:{width:44,height:44,borderRadius:14,borderWidth:1,borderColor:"rgba(255,255,255,.08)",backgroundColor:M.panel,alignItems:"center",justifyContent:"center"},
  right:{color:M.text2,fontSize:16,fontWeight:"700"},
  section:{flexDirection:"row",alignItems:"center",justifyContent:"space-between",marginTop:26,marginBottom:10},
  sectionTitle:{color:M.muted,fontSize:9,fontWeight:"800",letterSpacing:1.25},
  sectionAction:{color:M.accentSoft,fontSize:10.5,fontWeight:"700"},
  card:{borderRadius:18,borderWidth:1,borderColor:"rgba(255,255,255,.075)",backgroundColor:M.panel,...cardShadow},
  icon:{width:43,height:43,borderRadius:14,borderWidth:1,borderColor:"rgba(214,183,92,.18)",backgroundColor:M.panel2,alignItems:"center",justifyContent:"center"},
  iconText:{color:M.accentSoft,fontSize:16,fontWeight:"800"}
});
