"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { showAlert } from "@/lib/alerts";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (options: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              theme?: "outline" | "filled_blue" | "filled_black";
              size?: "large" | "medium" | "small";
              text?:
                | "signin_with"
                | "signup_with"
                | "continue_with"
                | "signin";
              shape?: "pill" | "rectangular" | "circle" | "square";
              width?: number;
              logo_alignment?: "left" | "center";
            },
          ) => void;
        };
      };
    };
  }
}

type GoogleSigninButtonProps = {
  text?: "signin_with" | "signup_with" | "continue_with";
};

export function GoogleSigninButton({
  text = "continue_with",
}: GoogleSigninButtonProps) {
  const router = useRouter();
  const buttonRef = useRef<HTMLDivElement | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  async function handleCredentialResponse(response: { credential: string }) {
    try {
      setBusy(true);
      setError("");

      const apiResponse = await fetch("/api/auth/google", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          credential: response.credential,
        }),
      });

      const data = (await apiResponse.json()) as { message?: string };

      if (!apiResponse.ok) {
        throw new Error(data.message ?? "Google sign-in failed.");
      }

      await showAlert(
        "success",
        "Welcome to GetVeriSight",
        "You have successfully signed in with Google.",
      );

      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google sign-in failed.");
      setBusy(false);
    }
  }

  function renderGoogleButton() {
    if (!clientId || !window.google?.accounts.id || !buttonRef.current) {
      return;
    }

    const width = Math.min(buttonRef.current.clientWidth || 360, 360);
    buttonRef.current.innerHTML = "";

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: handleCredentialResponse,
    });

    window.google.accounts.id.renderButton(buttonRef.current, {
      theme: "outline",
      size: "large",
      text,
      shape: "pill",
      width,
      logo_alignment: "left",
    });
  }

  useEffect(() => {
    renderGoogleButton();
  }, [clientId, text]);

  if (!clientId) {
    return null;
  }

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={renderGoogleButton}
      />
      <div className="google-auth-block">
        <div className="oauth-divider">
          <span>or</span>
        </div>
        <div className="google-button-wrap">
          <div ref={buttonRef} className="google-button-slot" />
        </div>
        {busy ? <div className="helper-row">Signing in with Google, then redirecting...</div> : null}
        {error ? <div className="message error">{error}</div> : null}
      </div>
    </>
  );
}
