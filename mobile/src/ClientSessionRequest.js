import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = (process.env.EXPO_PUBLIC_API_URL || "").replace(/\/$/, "");
const SESSION_STORAGE = "quincyfadez.clientSession";

export async function readClientSession() {
  const saved = await AsyncStorage.getItem(SESSION_STORAGE);
  if (!saved) return null;
  try {
    const session = JSON.parse(saved);
    return session?.token ? session : null;
  } catch (_) {
    return null;
  }
}

export async function clientSessionRequest(path, options = {}) {
  if (!API_URL) throw new Error("The QuincyFadez account server is not connected in this build.");
  const session = await readClientSession();
  if (!session?.token) throw new Error("Client authentication required.");
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.token}`,
      ...(options.headers || {}),
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(typeof data.detail === "string" ? data.detail : "Client request failed.");
  return data;
}
