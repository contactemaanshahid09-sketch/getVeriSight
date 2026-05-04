function getEnv(key: string) {
  const value = process.env[key];

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
}

function getOptionalEnv(key: string) {
  return process.env[key];
}

export const env = {
  MONGODB_URI: getEnv("MONGODB_URI"),
  JWT_SECRET: getEnv("JWT_SECRET"),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ?? "7d",
  GOOGLE_CLIENT_ID:
    getOptionalEnv("GOOGLE_CLIENT_ID") ??
    getOptionalEnv("NEXT_PUBLIC_GOOGLE_CLIENT_ID"),
  NEXT_PUBLIC_GOOGLE_CLIENT_ID: getOptionalEnv("NEXT_PUBLIC_GOOGLE_CLIENT_ID"),
  NEXT_PUBLIC_APP_URL:
    getOptionalEnv("NEXT_PUBLIC_APP_URL") ?? "http://localhost:3000",
  SMTP_HOST: getOptionalEnv("SMTP_HOST"),
  SMTP_PORT: getOptionalEnv("SMTP_PORT"),
  SMTP_USER: getOptionalEnv("SMTP_USER"),
  SMTP_PASS: getOptionalEnv("SMTP_PASS"),
  SMTP_FROM: getOptionalEnv("SMTP_FROM"),
  CONTACT_RECEIVER_EMAIL: getOptionalEnv("CONTACT_RECEIVER_EMAIL"),
  GETVERISIGHT_API_USER:
    getOptionalEnv("GETVERISIGHT_API_USER") ?? getOptionalEnv("SIGHTENGINE_API_USER"),
  GETVERISIGHT_API_SECRET:
    getOptionalEnv("GETVERISIGHT_API_SECRET") ??
    getOptionalEnv("GETVERISIGHT_API_KEY") ??
    getOptionalEnv("SIGHTENGINE_API_SECRET") ??
    getOptionalEnv("SIGHTENGINE_API_KEY"),
};
