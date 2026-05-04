import Link from "next/link";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <main className="container auth-wrap">
      <section className="card auth-card">
        <div className="auth-card-head">
          <h4>Forgot Password</h4>
        </div>
        <div className="auth-card-body">
          <ForgotPasswordForm />
          <p className="auth-footnote">
            Remembered your password? <Link href="/login">Login</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
