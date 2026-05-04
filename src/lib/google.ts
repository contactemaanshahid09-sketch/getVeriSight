import { OAuth2Client } from "google-auth-library";
import { env } from "@/lib/env";

let googleClient: OAuth2Client | null = null;

function getGoogleClient() {
  if (!env.GOOGLE_CLIENT_ID) {
    throw new Error("Google sign-in is not configured.");
  }

  if (!googleClient) {
    googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID);
  }

  return googleClient;
}

export type VerifiedGoogleUser = {
  googleId: string;
  email: string;
  name: string;
  picture?: string;
  emailVerified: boolean;
};

export async function verifyGoogleCredential(
  credential: string,
): Promise<VerifiedGoogleUser> {
  const client = getGoogleClient();
  const ticket = await client.verifyIdToken({
    idToken: credential,
    audience: env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();

  if (!payload?.sub || !payload.email) {
    throw new Error("Invalid Google account payload.");
  }

  return {
    googleId: payload.sub,
    email: payload.email.toLowerCase(),
    name: payload.name ?? payload.email.split("@")[0] ?? "Google User",
    picture: payload.picture,
    emailVerified: Boolean(payload.email_verified),
  };
}
