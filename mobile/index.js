import React, { useEffect, useState } from "react";
import { registerRootComponent } from "expo";
import { StripeProvider } from "@stripe/stripe-react-native";
import App from "./App";
import ClientIdentitySync from "./src/ClientIdentitySync";

const API_URL = (process.env.EXPO_PUBLIC_API_URL || "").replace(/\/$/, "");

function QuincyFadezRoot() {
  const [publishableKey, setPublishableKey] = useState(
    process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""
  );

  useEffect(() => {
    if (publishableKey || !API_URL) return;

    let active = true;
    fetch(`${API_URL}/api/payments/config`)
      .then((response) => {
        if (!response.ok) throw new Error("Stripe config unavailable");
        return response.json();
      })
      .then((data) => {
        if (active && data.publishable_key) setPublishableKey(data.publishable_key);
      })
      .catch(() => {
        // Booking screen will show a clear setup message until Stripe is configured.
      });

    return () => {
      active = false;
    };
  }, [publishableKey]);

  return (
    <StripeProvider
      publishableKey={publishableKey}
      urlScheme="quincyfadez"
    >
      <ClientIdentitySync />
      <App />
    </StripeProvider>
  );
}

registerRootComponent(QuincyFadezRoot);
