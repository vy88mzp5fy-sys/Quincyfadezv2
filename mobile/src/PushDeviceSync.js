import { useEffect, useRef } from "react";

import { clientSessionRequest } from "./ClientSessionRequest";
import { getPushRegistrationPayload } from "./PushRegistration";

export default function PushDeviceSync() {
  const registeredClient = useRef("");

  useEffect(() => {
    let active = true;
    let running = false;

    const sync = async () => {
      if (!active || running) return;
      running = true;
      try {
        const me = await clientSessionRequest("/api/client/me");
        const clientKey = me?.client_key || "";
        if (!clientKey || registeredClient.current === clientKey) return;

        const payload = await getPushRegistrationPayload();
        if (!payload || !active) return;
        await clientSessionRequest("/api/notifications/devices", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        registeredClient.current = clientKey;
      } catch (_) {
        // No signed-in session, no API connection, or notifications unavailable.
        // None of these should block the customer app.
      } finally {
        running = false;
      }
    };

    sync();
    const timer = setInterval(sync, 1500);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);

  return null;
}
