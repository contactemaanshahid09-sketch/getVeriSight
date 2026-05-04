"use client";

import { showAlert } from "@/lib/alerts";

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
