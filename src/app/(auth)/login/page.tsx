import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <main className="container auth-wrap">
      <section className="card auth-card">
        <div className="auth-card-head">
          <h4>Log In</h4>
        </div>
        <div className="auth-card-body">
          <LoginForm />
          <p className="auth-footnote">
            Don't have an account? <Link href="/signup">Create one</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
