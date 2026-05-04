"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { GoogleSigninButton } from "@/components/auth/google-signin-button";
import { showAlert } from "@/lib/alerts";

type AuthState = {
  error: string;
  success: string;
  loading: boolean;
  redirecting: boolean;
};

const initialState: AuthState = {
  error: "",
  success: "",
  loading: false,
  redirecting: false,
};

export function SignupForm() {
  const router = useRouter();
  const [state, setState] = useState<AuthState>(initialState);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState({ error: "", success: "", loading: true, redirecting: false });

    const formData = new FormData(event.currentTarget);
    const payload = {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
    };

    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = (await response.json()) as { message?: string };

    if (!response.ok) {
      setState({
        error: data.message ?? "Unable to create account.",
        success: "",
        loading: false,
        redirecting: false,
      });
      return;
    }

    setState({
      error: "",
      success: data.message ?? "Signup successful.",
      loading: false,
      redirecting: true,
    });

    await showAlert(
      "success",
      "Account created",
      "You have successfully signed up to GetVeriSight.",
    );

    router.push("/");
    router.refresh();
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="name">Full name</label>
        <input id="name" name="name" type="text" placeholder="Full Name" required />
      </div>

      <div className="field">
        <label htmlFor="signup-email">Email</label>
        <input
          id="signup-email"
          name="email"
          type="email"
          placeholder="Email Address"
          required
        />
      </div>

      <div className="field">
        <label htmlFor="signup-password">Password</label>
        <input
          id="signup-password"
          name="password"
          type="password"
          placeholder="Password"
          required
        />
      </div>


      {state.error ? <div className="message error">{state.error}</div> : null}
      {state.success ? <div className="message success">{state.success}</div> : null}

      <button
        className="button-primary auth-submit"
        type="submit"
        disabled={state.loading || state.redirecting}
      >
        {state.loading ? "Creating..." : state.redirecting ? "Redirecting..." : "Create account"}
      </button>

      <GoogleSigninButton text="continue_with" />
    </form>
  );
}
