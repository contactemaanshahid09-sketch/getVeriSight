import { NextResponse } from "next/server";
import { loginSchema } from "@/lib/validators/auth";
import { connectToDatabase } from "@/lib/db";
import { UserModel } from "@/models/User";
import { verifyPassword } from "@/lib/password";
import { createAuthToken, setAuthCookie } from "@/lib/jwt";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0]?.message ?? "Invalid login data." },
        { status: 400 },
      );
    }

    await connectToDatabase();

    const user = await UserModel.findOne({ email: parsed.data.email });

    if (!user) {
      return NextResponse.json(
        { message: "Invalid email or password." },
        { status: 401 },
      );
    }

    if (!user.passwordHash) {
      return NextResponse.json(
        {
          message:
            "This account uses Google sign-in. Please continue with Google.",
        },
        { status: 400 },
      );
    }

    const isValidPassword = await verifyPassword(
      parsed.data.password,
      user.passwordHash,
    );

    if (!isValidPassword) {
      return NextResponse.json(
        { message: "Invalid email or password." },
        { status: 401 },
      );
    }

    const token = await createAuthToken({
      userId: user._id.toString(),
      email: user.email,
    });

    const response = NextResponse.json({
      message: "Login successful.",
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
      },
    });

    setAuthCookie(response, token);

    return response;
  } catch {
    return NextResponse.json(
      { message: "Something went wrong during login." },
      { status: 500 },
    );
  }
}
