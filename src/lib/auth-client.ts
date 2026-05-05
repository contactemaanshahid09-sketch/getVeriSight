"use client";

import { showAlert } from "@/lib/alerts";

const AUTH_STATE_CHANGED_EVENT = "getverisight-auth-state-changed";

type AuthStateChangedDetail = {
  isAuthenticated: boolean;
};

export function notifyAuthStateChanged(isAuthenticated: boolean) {
  window.dispatchEvent(
    new CustomEvent<AuthStateChangedDetail>(AUTH_STATE_CHANGED_EVENT, {
      detail: { isAuthenticated },
    }),
  );
}

export function subscribeAuthStateChanged(
  listener: (isAuthenticated: boolean) => void,
) {
  function handleAuthStateChanged(event: Event) {
    const customEvent = event as CustomEvent<AuthStateChangedDetail>;
    listener(Boolean(customEvent.detail?.isAuthenticated));
  }

  window.addEventListener(AUTH_STATE_CHANGED_EVENT, handleAuthStateChanged);

  return () => {
    window.removeEventListener(AUTH_STATE_CHANGED_EVENT, handleAuthStateChanged);
  };
}

export async function requireAuthForModeration() {
  const response = await fetch("/api/auth/me", {
    method: "GET",
    cache: "no-store",
  });

  if (response.ok) {
    return true;
  }

  await showAlert(
    "warning",
    "Login required",
    "Please log in or sign up before testing GetVeriSight moderation models.",
  );

  return false;
}
