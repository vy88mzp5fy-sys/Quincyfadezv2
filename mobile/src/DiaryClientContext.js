import React, { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const GOLD_LIGHT = "#E7C77A";
const TOKEN_KEY = "quincyfadez.adminToken";
const API_URL = (process.env.EXPO_PUBLIC_API_URL || "").replace(/\/$/, "");
const CACHE_TTL_MS = 5 * 60 * 1000;
const clientCache = new Map();
const pendingLoads = new Map();

async function fetchClientContext(clientKey) {
  const cached = clientCache.get(clientKey);
  if (cached && Date.now() - cached.loadedAt < CACHE_TTL_MS) return cached.client;
  if (pendingLoads.has(clientKey)) return pendingLoads.get(clientKey);

  const task = (async () => {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    if (!token) return null;
    const response = await fetch(`${API_URL}/api/admin/clients/${encodeURIComponent(clientKey)}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error("Client context unavailable");
    const client = data.client || null;
    if (client) clientCache.set(clientKey, { client, loadedAt: Date.now() });
    return client;
  })();

  pendingLoads.set(clientKey, task);
  try {
    return await task;
  } finally {
    pendingLoads.delete(clientKey);
  }
}

function ContextPill({ label, tone = "neutral" }) {
  return <View style={[styles.pill, tone === "positive" && styles.pillPositive, tone === "warning" && styles.pillWarning, tone === "danger" && styles.pillDanger]}>
    <Text style={[styles.pillText, tone === "positive" && styles.pillTextPositive, tone === "warning" && styles.pillTextWarning, tone === "danger" && styles.pillTextDanger]}>{label}</Text>
  </View>;
}

export default function DiaryClientContext({ clientKey }) {
  const [client, setClient] = useState(() => clientCache.get(clientKey)?.client || null);
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    let active = true;
    setUnavailable(false);
    if (!clientKey || !API_URL) return () => { active = false; };

    const cached = clientCache.get(clientKey);
    if (cached && Date.now() - cached.loadedAt < CACHE_TTL_MS) {
      setClient(cached.client);
      return () => { active = false; };
    }

    fetchClientContext(clientKey)
      .then((nextClient) => { if (active) setClient(nextClient); })
      .catch(() => { if (active) setUnavailable(true); });

    return () => { active = false; };
  }, [clientKey]);

  const context = useMemo(() => {
    if (!client) return [];
    const items = [];
    const tags = Array.isArray(client.tags) ? client.tags : [];
    const lowerTags = tags.map((tag) => String(tag).toLowerCase());
    const completed = Number(client.completed_count || 0);
    const noShows = Number(client.no_show_count || 0);
    const cancelled = Number(client.cancelled_count || 0);

    if (client.blocked) items.push({ label: "BOOKING BLOCKED", tone: "danger" });
    if (lowerTags.includes("vip")) items.push({ label: "VIP", tone: "positive" });
    else if (client.regular) items.push({ label: "REGULAR", tone: "positive" });
    else if (completed === 0) items.push({ label: "FIRST VISIT", tone: "positive" });

    if (noShows >= 2 || lowerTags.some((tag) => tag.includes("no-show risk"))) items.push({ label: `${Math.max(noShows, 2)} NO-SHOWS · RISK`, tone: "danger" });
    else if (noShows === 1) items.push({ label: "1 NO-SHOW", tone: "warning" });
    else if (cancelled >= 3 || lowerTags.some((tag) => tag.includes("late risk"))) items.push({ label: "WATCH RELIABILITY", tone: "warning" });

    tags
      .filter((tag) => !["vip", "regular", "no-show risk", "late risk"].includes(String(tag).toLowerCase()))
      .slice(0, 2)
      .forEach((tag) => items.push({ label: String(tag).toUpperCase(), tone: "neutral" }));

    return items.slice(0, 4);
  }, [client]);

  if (!clientKey || unavailable || !context.length) return null;
  return <View style={styles.wrap}>{context.map((item, index) => <ContextPill key={`${item.label}-${index}`} label={item.label} tone={item.tone} />)}</View>;
}

const styles = StyleSheet.create({
  wrap:{flexDirection:"row",flexWrap:"wrap",gap:5,marginTop:7},
  pill:{borderRadius:8,borderWidth:1,borderColor:"#343434",backgroundColor:"#101010",paddingHorizontal:6,paddingVertical:4},
  pillPositive:{borderColor:"#315342",backgroundColor:"#09110D"},
  pillWarning:{borderColor:"#5A4523",backgroundColor:"#171107"},
  pillDanger:{borderColor:"#5A302B",backgroundColor:"#160B09"},
  pillText:{color:"#888",fontSize:5.2,letterSpacing:.45,fontWeight:"900"},
  pillTextPositive:{color:"#91D1AD"},
  pillTextWarning:{color:GOLD_LIGHT},
  pillTextDanger:{color:"#D98778"},
});