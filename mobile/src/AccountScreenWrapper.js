import React, { useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import AccountScreenCore from "./AccountScreenCore";
import WaitingListScreen from "./WaitingListScreen";

export default function AccountScreenWrapper(props) {
  const [waitingListVisible, setWaitingListVisible] = useState(false);

  return <View style={{ flex: 1 }}>
    <AccountScreenCore {...props} />
    <Pressable accessibilityRole="button" accessibilityLabel="Open Waiting List" onPress={() => setWaitingListVisible(true)} style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
      <Text style={styles.label}>WAITING LIST</Text><Text style={styles.arrow}>›</Text>
    </Pressable>
    <Modal visible={waitingListVisible} animationType="slide" onRequestClose={() => setWaitingListVisible(false)}>
      <WaitingListScreen onBack={() => setWaitingListVisible(false)} />
    </Modal>
  </View>;
}

const styles = StyleSheet.create({
  button:{position:"absolute",top:12,right:18,minHeight:38,borderRadius:19,borderWidth:1,borderColor:"#4A3B20",backgroundColor:"#120F08",paddingLeft:12,paddingRight:9,flexDirection:"row",alignItems:"center",gap:6,zIndex:20},
  label:{color:"#D6BD7A",fontSize:6.5,letterSpacing:.8,fontWeight:"900"},arrow:{color:"#F1DDA2",fontSize:17,fontWeight:"900"},pressed:{opacity:.72}
});
