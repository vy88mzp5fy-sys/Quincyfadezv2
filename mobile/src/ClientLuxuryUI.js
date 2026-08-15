import React from"react";
import{Pressable,StyleSheet,Text,View}from"react-native";
import{M,cardShadow,LuxuryBackButton}from"./MockupTheme";

export function ClientHeader({title,onBack,rightIcon="",onRight,subtitle}){
  return <>
    <View style={s.header}>
      <View style={s.side}><LuxuryBackButton onPress={onBack}/></View>
      <Text style={s.title}>{String(title||"").toUpperCase()}</Text>
      <View style={s.side}>{onRight?<Pressable onPress={onRight} style={s.rightButton}><Text style={s.right}>{rightIcon}</Text></Pressable>:null}</View>
    </View>
    {subtitle?<Text style={s.subtitle}>{subtitle}</Text>:null}
  </>;
}

export function ClientSection({title,action,onAction}){
  return <View style={s.section}><Text style={s.sectionTitle}>{title}</Text>{action?<Pressable onPress={onAction}><Text style={s.sectionAction}>{action}</Text></Pressable>:null}</View>;
}

export function ClientCard({children,style}){return <View style={[s.card,style]}>{children}</View>}

export function MiniIcon({children}){
  return <View style={s.icon}><Text style={s.iconText}>{children}</Text></View>;
}

const s=StyleSheet.create({
  header:{height:70,flexDirection:"row",alignItems:"center",justifyContent:"space-between",marginTop:2},
  side:{width:50,height:50,alignItems:"center",justifyContent:"center"},
  title:{flex:1,color:M.text,fontSize:20,fontWeight:"700",letterSpacing:2.05,textAlign:"center"},
  rightButton:{width:42,height:42,borderRadius:13,borderWidth:1,borderColor:"rgba(214,189,122,.18)",backgroundColor:"rgba(11,11,10,.72)",alignItems:"center",justifyContent:"center"},
  right:{color:M.goldSoft,fontSize:20},
  subtitle:{color:M.muted,textAlign:"center",fontSize:12.5,lineHeight:18,marginTop:-2,marginBottom:18,paddingHorizontal:28},
  section:{flexDirection:"row",alignItems:"center",justifyContent:"space-between",marginTop:27,marginBottom:10},
  sectionTitle:{color:M.text2,fontSize:12,fontWeight:"800",letterSpacing:1.2},
  sectionAction:{color:M.gold,fontSize:11.5,fontWeight:"700"},
  card:{borderRadius:16,borderWidth:1,borderColor:"rgba(214,189,122,.14)",backgroundColor:"rgba(12,12,11,.90)",...cardShadow},
  icon:{width:42,height:42,borderRadius:13,borderWidth:1,borderColor:"rgba(214,189,122,.18)",backgroundColor:"rgba(18,16,12,.78)",alignItems:"center",justifyContent:"center"},
  iconText:{color:M.goldSoft,fontSize:17,fontWeight:"700"}
});
