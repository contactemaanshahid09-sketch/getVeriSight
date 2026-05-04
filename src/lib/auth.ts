import { cookies } from "next/headers";
import { verifyAuthToken } from "@/lib/jwt";
import { AUTH_COOKIE_NAME } from "@/lib/constants/auth";
import { connectToDatabase } from "@/lib/db";
import { UserModel } from "@/models/User";

export async function getAuthUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  try {
    const payload = await verifyAuthToken(token);

    await connectToDatabase();

    const user = await UserModel.findById(payload.userId).select("-passwordHash");

    if (!user) {
      return null;
    }

    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
    };
  } catch {
    return null;
  }
}
