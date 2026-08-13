import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Modal, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NotificationAutomationSettings from "./NotificationAutomationSettings";

const API_URL = (process.env.EXPO_PUBLIC_API_URL || "").replace(/\/$/, "");
const TOKEN_KEY = "quincyfadez.adminToken";
const GOLD = "#D6BD7A";
const GOLD_LIGHT = "#F1DDA2";
const BG = "#050505";

function MasterToggle({ value, disabled, onChange }) {
  return <Pressable disabled={disabled} onPress={() => onChange(!value)} style={[styles.toggle, value && styles.toggleOn, disabled && styles.disabled]}><View style={[styles.knob, value && styles.knobOn]} /></Pressable>;
}

export default function AdminNotificationAutomationOverlay() {
  const [token, setToken] = useState("");
  const [visible, setVisible] = useState(false);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let active = true;
    const sync = async () => {
      const next = await AsyncStorage.getItem(TOKEN_KEY).catch(() => "");
      if (active) setToken(next || "");
    };
    sync();
    const timer = setInterval(sync, 3000);
    return () => { active = false; clearInterval(timer); };
  }, []);

  const request = useCallback(async (path, options = {}) => {
    if (!API_URL || !token) throw new Error("Admin session is not available.");
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...(options.headers || {}) },
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.detail || "Notification settings could not be updated.");
    return data;
  }, [token]);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true); setError("");
    try {
      const data = await request("/api/admin/settings");
      setSettings(data.settings || null);
    } catch (err) {
      setError(err.message || "Notification settings could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, [request, token]);

  const open = async () => {
    setVisible(true);
    await load();
  };

  const savePatch = async (patch) => {
    if (saving) return;
    const optimistic = { ...(settings || {}), ...patch };
    if (patch.automations) optimistic.automations = { ...(settings?.automations || {}), ...patch.automations };
    setSettings(optimistic);
    setSaving(true); setError(""); setSaved(false);
    try {
      const data = await request("/api/admin/settings", { method: "PUT", body: JSON.stringify(patch) });
      setSettings(data.settings || optimistic);
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    } catch (err) {
      setError(err.message || "Notification settings could not be saved.");
      await load();
    } finally {
      setSaving(false);
    }
  };

  const updateAutomation = (key, patch) => savePatch({ automations: { [key]: { ...(settings?.automations?.[key] || {}), ...patch } } });

  if (!token) return null;

  return <>
    <Pressable accessibilityRole="button" accessibilityLabel="Open Notifications And Automations" onPress={open} style={({ pressed }) => [styles.launcher, pressed && styles.pressed]}>
      <Text style={styles.launcherIcon}>◌</Text>
    </Pressable>
    <Modal visible={visible} animationType="slide" onRequestClose={() => !saving && setVisible(false)}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <View><Text style={styles.eyebrow}>BUSINESS SETTINGS</Text><Text style={styles.title}>Notifications.</Text></View>
          <Pressable disabled={saving} onPress={() => setVisible(false)} style={[styles.close, saving && styles.disabled]}><Text style={styles.closeText}>×</Text></Pressable>
        </View>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.masterCard}>
            <View style={styles.masterCopy}><Text style={styles.masterTitle}>Client Notifications</Text><Text style={styles.masterMeta}>Master control for automated client messages. Turning this off pauses every notification automation.</Text></View>
            <MasterToggle value={Boolean(settings?.notifications_enabled)} disabled={saving || loading} onChange={(value) => savePatch({ notifications_enabled: value })} />
          </View>
          {loading ? <View style={styles.loading}><ActivityIndicator color={GOLD_LIGHT} /><Text style={styles.loadingText}>LOADING SETTINGS…</Text></View> : null}
          {error ? <View style={styles.errorCard}><Text style={styles.errorText}>{error}</Text></View> : null}
          {saved ? <Text style={styles.saved}>✓ SAVED</Text> : null}
          {!loading && settings ? <NotificationAutomationSettings automation={settings.automations || {}} saving={saving || !settings.notifications_enabled} waitingListEnabled={Boolean(settings.waiting_list_enabled)} onUpdate={updateAutomation} /> : null}
          {!loading && settings && !settings.notifications_enabled ? <Text style={styles.paused}>Automations are paused while Client Notifications is switched off.</Text> : null}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  </>;
}

const styles = StyleSheet.create({
  launcher:{position:"absolute",top:14,right:36,width:40,height:40,borderRadius:20,borderWidth:1,borderColor:"#343434",backgroundColor:"#0A0A0A",alignItems:"center",justifyContent:"center",zIndex:20},launcherIcon:{color:GOLD_LIGHT,fontSize:22,fontWeight:"700"},pressed:{opacity:.72,transform:[{scale:.97}]},disabled:{opacity:.45},
  safe:{flex:1,backgroundColor:BG},header:{minHeight:78,paddingHorizontal:18,borderBottomWidth:1,borderBottomColor:"#191919",flexDirection:"row",alignItems:"center",justifyContent:"space-between"},eyebrow:{color:GOLD,fontSize:7,letterSpacing:1.6,fontWeight:"900"},title:{color:"#F4F4F4",fontSize:22,fontWeight:"750",marginTop:4},close:{width:40,height:40,borderRadius:20,borderWidth:1,borderColor:"#242424",backgroundColor:"#0D0D0D",alignItems:"center",justifyContent:"center"},closeText:{color:GOLD_LIGHT,fontSize:24},content:{paddingHorizontal:18,paddingBottom:44},masterCard:{marginTop:18,minHeight:92,borderRadius:18,borderWidth:1,borderColor:"#3A3020",backgroundColor:"#0B0906",padding:15,flexDirection:"row",alignItems:"center",gap:14},masterCopy:{flex:1},masterTitle:{color:"#F1EEE8",fontSize:13,fontWeight:"750"},masterMeta:{color:"#8F887D",fontSize:8.5,lineHeight:14,marginTop:5},toggle:{width:42,height:24,borderRadius:12,backgroundColor:"#272727",padding:3,justifyContent:"center"},toggleOn:{backgroundColor:GOLD},knob:{width:18,height:18,borderRadius:9,backgroundColor:"#777"},knobOn:{backgroundColor:"#090909",alignSelf:"flex-end"},loading:{marginTop:14,minHeight:58,borderRadius:14,borderWidth:1,borderColor:"#242424",backgroundColor:"#0D0D0D",flexDirection:"row",alignItems:"center",justifyContent:"center",gap:8},loadingText:{color:"#8D7751",fontSize:7,letterSpacing:1,fontWeight:"900"},errorCard:{marginTop:12,borderRadius:12,borderWidth:1,borderColor:"#552E28",backgroundColor:"#120A09",padding:11},errorText:{color:"#D89489",fontSize:8.5,lineHeight:13},saved:{color:GOLD_LIGHT,fontSize:7,letterSpacing:1.1,fontWeight:"900",marginTop:12,textAlign:"right"},paused:{color:"#8B7650",fontSize:8.5,lineHeight:14,textAlign:"center",marginTop:13}
});
