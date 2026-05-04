import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { UserModel } from "@/models/User";
import { createPasswordResetToken } from "@/lib/reset-password";
import { forgotPasswordSchema } from "@/lib/validators/auth";
import { env } from "@/lib/env";
import { isEmailConfigured, sendPasswordResetEmail } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = forgotPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0]?.message ?? "Invalid email." },
        { status: 400 },
      );
    }

    await connectToDatabase();

    const user = await UserModel.findOne({ email: parsed.data.email });

    const emailConfigured = isEmailConfigured();

    if (!emailConfigured) {
      return NextResponse.json(
        {
          message:
            "SMTP email is not fully configured. Add SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM, and NEXT_PUBLIC_APP_URL in .env.local.",
        },
        { status: 500 },
      );
    }

    if (!user) {
      return NextResponse.json({
        message:
          "If an account with that email exists, a password reset link is ready.",
      });
    }

    if (!user.passwordHash) {
      return NextResponse.json(
        {
          message:
            "This account uses Google sign-in, so there is no password to reset. Please continue with Google.",
        },
        { status: 400 },
      );
    }

    const resetToken = createPasswordResetToken();

    user.resetPasswordTokenHash = resetToken.tokenHash;
    user.resetPasswordExpiresAt = resetToken.expiresAt;
    await user.save();

    const baseUrl = env.NEXT_PUBLIC_APP_URL;
    const resetUrl = `${baseUrl}/reset-password?token=${resetToken.rawToken}`;
    await sendPasswordResetEmail({
      to: user.email,
      name: user.name ?? "there",
      resetUrl,
    });

    return NextResponse.json({
      message: "If an account with that email exists, a password reset email has been sent.",
    });
  } catch {
    return NextResponse.json(
      { message: "Unable to process forgot password request." },
      { status: 500 },
    );
  }
}
