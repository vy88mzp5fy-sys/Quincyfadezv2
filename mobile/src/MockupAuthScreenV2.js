import React, { useState } from "react";
import { ActivityIndicator, Pressable, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BrandLogo, M, Marble, cardShadow, shadow } from "./MockupTheme";

const API = (process.env.EXPO_PUBLIC_API_URL || "").replace(/\/$/, "");
const SESSION = "quincyfadez.clientSession", KEY = "quincyfadez.paymentClientKey", PROFILE = "quincyfadez.bookingProfile", ADMIN = "quincyfadez.adminToken";
const read = (r) => r.json().catch(() => ({}));
async function saveClient(d) {
  const k = d?.client_key || d?.profile?.client_key || "", p = d?.profile || {};
  const rows = [[SESSION, JSON.stringify(d)], [PROFILE, JSON.stringify({ name: p.name || "", phone: p.phone || "", email: p.email || "" })]];
  if (k) rows.push([KEY, k]);
  await AsyncStorage.multiSet(rows);
}

function Input({ icon, ...props }) {
  return <View style={s.inputWrap}><Text style={s.inputIcon}>{icon}</Text><TextInput placeholderTextColor="#8B857C" autoCorrect={false} style={s.input} {...props} /></View>;
}

export default function MockupAuthScreenV2({ onClient, onAdmin }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const signup = mode === "signup";

  const submit = async () => {
    if (busy) return;
    setError("");
    const e = email.trim().toLowerCase();
    if (!API) return setError("The QuincyFadez account service is unavailable in this build.");
    if (!e.includes("@")) return setError("Enter a valid email address.");
    if (signup && (name.trim().length < 2 || phone.trim().length < 7 || password.length < 8)) return setError("Add your name, mobile number and a password of at least 8 characters.");
    if (!signup && password.length < 4) return setError("Enter your password.");
    setBusy(true);
    try {
      if (signup) {
        const r = await fetch(`${API}/api/client/signup`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: name.trim(), phone: phone.trim(), email: e, password }) });
        const d = await read(r);
        if (!r.ok) throw new Error(typeof d.detail === "string" ? d.detail : "Your account could not be created.");
        await AsyncStorage.removeItem(ADMIN);
        await saveClient({ token: d.token, client_key: d.client_key || d.profile?.client_key || "", profile: d.profile || { name: name.trim(), phone: phone.trim(), email: e } });
        onClient?.(); return;
      }
      const cr = await fetch(`${API}/api/client/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: e, password }) });
      const cd = await read(cr);
      if (cr.ok && cd.token) {
        await AsyncStorage.removeItem(ADMIN);
        await saveClient({ token: cd.token, client_key: cd.client_key || cd.profile?.client_key || "", profile: cd.profile || { name: cd.name, email: cd.email, phone: cd.phone } });
        onClient?.(); return;
      }
      const ar = await fetch(`${API}/api/admin/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ pin: password }) });
      const ad = await read(ar);
      if (ar.ok && ad.token) {
        await AsyncStorage.multiRemove([SESSION, KEY, PROFILE]);
        await AsyncStorage.setItem(ADMIN, ad.token);
        onAdmin?.(); return;
      }
      throw new Error(typeof cd.detail === "string" ? cd.detail : "Email or password is incorrect.");
    } catch (e2) { setError(e2.message || "Your account could not be opened."); }
    finally { setBusy(false); }
  };

  return <Marble><SafeAreaView style={s.safe}><StatusBar barStyle="light-content" /><ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
    <View style={s.logoWrap}><BrandLogo size={112} /><Text style={s.brand}>QuincyFadez</Text><Text style={s.tag}>Precision. Style. Confidence.</Text></View>
    <View style={s.card}>
      <Text style={s.welcome}>{signup ? "Create your account" : "Welcome back"}</Text>
      <Text style={s.copy}>{signup ? "Create your QuincyFadez account to book and manage your cuts." : "Log in to continue your experience."}</Text>
      {signup ? <><Input icon="♙" value={name} onChangeText={setName} placeholder="Full name" autoCapitalize="words" /><Input icon="☎" value={phone} onChangeText={setPhone} placeholder="Mobile number" keyboardType="phone-pad" /></> : null}
      <Input icon="✉" value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" />
      <Input icon="▣" value={password} onChangeText={setPassword} placeholder="••••••••" secureTextEntry autoCapitalize="none" onSubmitEditing={submit} />
      {!signup ? <View style={s.helperRow}><Pressable onPress={() => setRemember((v) => !v)} style={s.remember}><View style={[s.checkbox, remember && s.checkboxOn]}>{remember ? <Text style={s.check}>✓</Text> : null}</View><Text style={s.helperText}>Remember me</Text></Pressable><Pressable><Text style={s.forgot}>Forgot password?</Text></Pressable></View> : null}
      {error ? <View style={s.error}><Text style={s.errorText}>{error}</Text></View> : null}
      <Pressable disabled={busy} onPress={submit} style={s.primary}>{busy ? <ActivityIndicator color="#080705" /> : <Text style={s.primaryText}>{signup ? "Create Account" : "Log In"}</Text>}</Pressable>
      <Pressable onPress={() => { setMode(signup ? "login" : "signup"); setError(""); }} style={s.secondary}><Text style={s.secondaryText}>{signup ? "Log In" : "Create Account"}</Text></Pressable>
      <Text style={s.bottomCopy}>{signup ? "Already a client? Log in to continue." : "New client? Create an account\nto book your next cut."}</Text>
    </View>
    <Text style={s.footer}>Q U I N C Y F A D E Z</Text>
  </ScrollView></SafeAreaView></Marble>;
}

const s = StyleSheet.create({
  safe: { flex: 1 }, content: { flexGrow: 1, paddingHorizontal: 28, paddingTop: 26, paddingBottom: 28, justifyContent: "center" }, logoWrap: { alignItems: "center", marginBottom: 28 },
  brand: { color: M.goldSoft, fontSize: 36, fontWeight: "700", marginTop: 15 }, tag: { color: M.text2, fontSize: 13, marginTop: 5 },
  card: { borderRadius: 20, borderWidth: 1, borderColor: "rgba(214,189,122,.32)", backgroundColor: "rgba(13,13,12,.93)", padding: 20, ...cardShadow },
  welcome: { color: M.text, fontSize: 24, fontWeight: "600", textAlign: "center" }, copy: { color: M.muted, fontSize: 12.5, textAlign: "center", marginTop: 6, marginBottom: 14 },
  inputWrap: { height: 58, borderRadius: 12, borderWidth: 1, borderColor: "rgba(255,255,255,.14)", backgroundColor: "rgba(5,5,5,.78)", flexDirection: "row", alignItems: "center", paddingHorizontal: 15, marginTop: 12 }, inputIcon: { color: M.muted, fontSize: 20, width: 33 }, input: { flex: 1, color: M.text, fontSize: 14 },
  helperRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 13 }, remember: { flexDirection: "row", alignItems: "center", gap: 8 }, checkbox: { width: 23, height: 23, borderRadius: 5, borderWidth: 1.5, borderColor: M.muted2, alignItems: "center", justifyContent: "center" }, checkboxOn: { borderColor: M.gold, backgroundColor: M.panel3 }, check: { color: M.goldSoft, fontSize: 14, fontWeight: "900" }, helperText: { color: M.text2, fontSize: 11.5 }, forgot: { color: M.gold, fontSize: 11.5 },
  error: { borderRadius: 9, borderWidth: 1, borderColor: "#63372E", backgroundColor: M.redBg, padding: 10, marginTop: 12 }, errorText: { color: M.red, fontSize: 10.5 },
  primary: { height: 58, borderRadius: 11, backgroundColor: M.gold, borderWidth: 1, borderColor: M.goldSoft, alignItems: "center", justifyContent: "center", marginTop: 18, ...shadow }, primaryText: { color: "#080705", fontSize: 17, fontWeight: "700" },
  secondary: { height: 56, borderRadius: 11, borderWidth: 1, borderColor: M.goldDeep, alignItems: "center", justifyContent: "center", marginTop: 11 }, secondaryText: { color: M.goldSoft, fontSize: 15, fontWeight: "600" },
  bottomCopy: { color: M.muted, fontSize: 11.5, lineHeight: 17, textAlign: "center", marginTop: 18 }, footer: { color: M.gold, fontSize: 11, fontWeight: "800", letterSpacing: 3.7, textAlign: "center", marginTop: 42 },
});
