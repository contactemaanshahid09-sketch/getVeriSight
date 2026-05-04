import Link from "next/link";
import { SignupForm } from "@/components/auth/signup-form";

export default function SignupPage() {
  return (
    <main className="container auth-wrap">
      <section className="card auth-card">
        <div className="auth-card-head">
          <h4>Sign Up</h4>
        </div>
        <div className="auth-card-body">
          <SignupForm />
          <p className="auth-footnote">
            Already have an account? <Link href="/login">Login</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
