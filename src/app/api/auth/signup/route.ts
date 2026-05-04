import { NextResponse } from "next/server";
import { signupSchema } from "@/lib/validators/auth";
import { connectToDatabase } from "@/lib/db";
import { UserModel } from "@/models/User";
import { hashPassword } from "@/lib/password";
import { createAuthToken, setAuthCookie } from "@/lib/jwt";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = signupSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0]?.message ?? "Invalid signup data." },
        { status: 400 },
      );
    }

    await connectToDatabase();

    const existingUser = await UserModel.findOne({ email: parsed.data.email });

    if (existingUser) {
      return NextResponse.json(
        {
          message:
            existingUser.authProvider === "google"
              ? "This email is already registered with Google. Please continue with Google."
              : "An account with this email already exists.",
        },
        { status: 409 },
      );
    }

    const passwordHash = await hashPassword(parsed.data.password);

    const user = await UserModel.create({
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash,
      authProvider: "credentials",
      emailVerified: false,
    });

    const token = await createAuthToken({
      userId: user._id.toString(),
      email: user.email,
    });

    const response = NextResponse.json(
      {
        message: "Signup successful.",
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
        },
      },
      { status: 201 },
    );

    setAuthCookie(response, token);

    return response;
  } catch {
    return NextResponse.json(
      { message: "Something went wrong during signup." },
      { status: 500 },
    );
  }
}
