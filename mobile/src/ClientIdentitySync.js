import { useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SESSION_STORAGE = "quincyfadez.clientSession";
const CLIENT_KEY_STORAGE = "quincyfadez.paymentClientKey";
const PROFILE_STORAGE = "quincyfadez.bookingProfile";

async function syncIdentity() {
  const saved = await AsyncStorage.getItem(SESSION_STORAGE);
  if (!saved) return;

  let session;
  try {
    session = JSON.parse(saved);
  } catch (_) {
    return;
  }

  const clientKey = session?.client_key || session?.profile?.client_key || "";
  if (!clientKey) return;

  const profile = session?.profile || {};
  const bookingProfile = {
    name: profile.name || "",
    phone: profile.phone || "",
    email: profile.email || "",
  };

  const currentKey = await AsyncStorage.getItem(CLIENT_KEY_STORAGE);
  if (currentKey === clientKey) return;

  await AsyncStorage.multiSet([
    [CLIENT_KEY_STORAGE, clientKey],
    [PROFILE_STORAGE, JSON.stringify(bookingProfile)],
  ]);
}

export default function ClientIdentitySync() {
  useEffect(() => {
    let active = true;

    const run = () => {
      if (!active) return;
      syncIdentity().catch(() => {});
    };

    run();
    const timer = setInterval(run, 750);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);

  return null;
}
