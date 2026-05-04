import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { UserModel } from "@/models/User";
import { createAuthToken, setAuthCookie } from "@/lib/jwt";
import { verifyGoogleCredential } from "@/lib/google";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { credential?: string };
    const credential = body.credential?.trim();

    if (!credential) {
      return NextResponse.json(
        { message: "Google credential is required." },
        { status: 400 },
      );
    }

    const googleUser = await verifyGoogleCredential(credential);

    if (!googleUser.emailVerified) {
      return NextResponse.json(
        { message: "Google email is not verified." },
        { status: 403 },
      );
    }

    await connectToDatabase();

    let user = await UserModel.findOne({
      $or: [{ email: googleUser.email }, { googleId: googleUser.googleId }],
    });

    if (!user) {
      user = await UserModel.create({
        name: googleUser.name,
        email: googleUser.email,
        passwordHash: null,
        authProvider: "google",
        googleId: googleUser.googleId,
        avatarUrl: googleUser.picture ?? null,
        emailVerified: true,
      });
    } else {
      user.name = user.name || googleUser.name;
      user.googleId = user.googleId ?? googleUser.googleId;
      user.avatarUrl = googleUser.picture ?? user.avatarUrl;
      user.emailVerified = true;

      if (user.authProvider !== "credentials") {
        user.authProvider = "google";
      }

      await user.save();
    }

    const token = await createAuthToken({
      userId: user._id.toString(),
      email: user.email,
    });

    const response = NextResponse.json({
      message: "Google login successful.",
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        authProvider: user.authProvider,
      },
    });

    setAuthCookie(response, token);

    return response;
  } catch {
    return NextResponse.json(
      { message: "Google sign-in failed." },
      { status: 500 },
    );
  }
}
