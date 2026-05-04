import Link from "next/link";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

type ResetPasswordPageProps = {
  searchParams: Promise<{
    token?: string;
  }>;
};

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const params = await searchParams;
  const token = params.token ?? "";

  return (
    <main className="container auth-wrap">
      <section className="card auth-card">
        <div className="auth-card-head">
          <h1>Reset Password</h1>
        </div>
        <div className="auth-card-body">
          {token ? (
            <ResetPasswordForm token={token} />
          ) : (
            <div className="message error">Reset token is missing or invalid.</div>
          )}
          <p className="auth-footnote">
            Back to <Link href="/login">Login</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
