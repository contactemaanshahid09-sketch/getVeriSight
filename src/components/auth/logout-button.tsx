"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { showAlert } from "@/lib/alerts";
import { notifyAuthStateChanged } from "@/lib/auth-client";

export function LogoutButton() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    setIsLoggingOut(true);

    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });

      notifyAuthStateChanged(false);
      router.replace("/");
      router.refresh();

      await showAlert(
        "success",
        "Logged out",
        "You have been logged out successfully from GetVeriSight.",
      );
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <button
      type="button"
      className="nav-button nav-logout"
      onClick={handleLogout}
      disabled={isLoggingOut}
    >
      {isLoggingOut ? "Logging out..." : "Logout"}
    </button>
  );
}
