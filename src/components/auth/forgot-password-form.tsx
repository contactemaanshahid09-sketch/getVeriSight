"use client";

import { useState } from "react";
import type { FormEvent } from "react";

type ForgotState = {
  error: string;
  success: string;
  loading: boolean;
  resetUrl: string;
};

const initialState: ForgotState = {
  error: "",
  success: "",
  loading: false,
  resetUrl: "",
};

export function ForgotPasswordForm() {
  const [state, setState] = useState<ForgotState>(initialState);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState({ error: "", success: "", loading: true, resetUrl: "" });

    const formData = new FormData(event.currentTarget);
    const payload = {
      email: String(formData.get("email") ?? ""),
    };

    const response = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = (await response.json()) as {
      message?: string;
      resetUrl?: string;
    };

    if (!response.ok) {
      const message = data.message ?? "Unable to process your request.";

      if (message.includes("Google sign-in")) {
        setState({
          error:
            "This account uses Google sign-in, so there is no password to reset. Please continue with Google.",
          success: "",
          loading: false,
          resetUrl: "",
        });
        return;
      }

      setState({
        error: message,
        success: "",
        loading: false,
        resetUrl: "",
      });
      return;
    }

    setState({
      error: "",
      success: data.message ?? "Reset email request processed.",
      loading: false,
      resetUrl: data.resetUrl ?? "",
    });
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="forgot-email">Email</label>
        <input
          id="forgot-email"
          name="email"
          type="email"
          placeholder="Email Address"
          required
        />
      </div>

      {state.error ? <div className="message error">{state.error}</div> : null}
      {state.success ? <div className="message success">{state.success}</div> : null}

      <button className="button-primary auth-submit" type="submit" disabled={state.loading}>
        {state.loading ? "Sending..." : "Send reset link"}
      </button>

      {state.resetUrl ? (
        <div className="message success">
          Development reset link:
          <br />
          <a href={state.resetUrl}>{state.resetUrl}</a>
        </div>
      ) : null}
    </form>
  );
}
