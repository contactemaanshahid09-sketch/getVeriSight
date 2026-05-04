"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { showAlert } from "@/lib/alerts";

type ResetPasswordFormProps = {
  token: string;
};

type ResetState = {
  error: string;
  success: string;
  loading: boolean;
};

const initialState: ResetState = {
  error: "",
  success: "",
  loading: false,
};

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const router = useRouter();
  const [state, setState] = useState<ResetState>(initialState);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState({ error: "", success: "", loading: true });

    const formData = new FormData(event.currentTarget);
    const password = String(formData.get("password") ?? "");
    const confirmPassword = String(formData.get("confirmPassword") ?? "");

    if (password !== confirmPassword) {
      setState({
        error: "Passwords do not match.",
        success: "",
        loading: false,
      });
      return;
    }

    const response = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token,
        password,
      }),
    });

    const data = (await response.json()) as { message?: string };

    if (!response.ok) {
      setState({
        error: data.message ?? "Unable to reset password.",
        success: "",
        loading: false,
      });
      return;
    }

    setState({
      error: "",
      success: data.message ?? "Password reset successful.",
      loading: false,
    });

    await showAlert(
      "success",
      "Password reset",
      "Your password has been reset successfully.",
    );

    router.push("/login");
    router.refresh();
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="reset-password">New password</label>
        <input
          id="reset-password"
          name="password"
          type="password"
          placeholder="New Password"
          required
        />
      </div>

      <div className="field">
        <label htmlFor="confirm-password">Confirm password</label>
        <input
          id="confirm-password"
          name="confirmPassword"
          type="password"
          placeholder="Confirm Password"
          required
        />
      </div>

      {state.error ? <div className="message error">{state.error}</div> : null}
      {state.success ? <div className="message success">{state.success}</div> : null}

      <button className="button-primary auth-submit" type="submit" disabled={state.loading}>
        {state.loading ? "Updating..." : "Reset password"}
      </button>
    </form>
  );
}
