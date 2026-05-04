import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { UserModel } from "@/models/User";
import { hashPassword } from "@/lib/password";
import { hashPasswordResetToken } from "@/lib/reset-password";
import { resetPasswordSchema } from "@/lib/validators/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = resetPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0]?.message ?? "Invalid reset request." },
        { status: 400 },
      );
    }

    await connectToDatabase();

    const tokenHash = hashPasswordResetToken(parsed.data.token);

    const user = await UserModel.findOne({
      resetPasswordTokenHash: tokenHash,
      resetPasswordExpiresAt: { $gt: new Date() },
    });

    if (!user) {
      return NextResponse.json(
        { message: "This reset link is invalid or has expired." },
        { status: 400 },
      );
    }

    user.passwordHash = await hashPassword(parsed.data.password);
    user.resetPasswordTokenHash = null;
    user.resetPasswordExpiresAt = null;
    user.authProvider = "credentials";
    await user.save();

    return NextResponse.json({
      message: "Password reset successful. You can now log in.",
    });
  } catch {
    return NextResponse.json(
      { message: "Unable to reset password." },
      { status: 500 },
    );
  }
}
