import nodemailer from "nodemailer";
import { env } from "@/lib/env";

function getSmtpConfig() {
  if (
    !env.SMTP_HOST ||
    !env.SMTP_PORT ||
    !env.SMTP_USER ||
    !env.SMTP_PASS ||
    !env.SMTP_FROM
  ) {
    return null;
  }

  const port = Number(env.SMTP_PORT);

  return {
    host: env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
    from: env.SMTP_FROM,
  };
}

export function isEmailConfigured() {
  return Boolean(getSmtpConfig());
}

export async function sendPasswordResetEmail(input: {
  to: string;
  name: string;
  resetUrl: string;
}) {
  const config = getSmtpConfig();

  if (!config) {
    throw new Error("SMTP email is not configured.");
  }

  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: config.auth,
  });

  await transporter.sendMail({
    from: config.from,
    to: input.to,
    subject: "Reset your GetVeriSight password",
    text: `Hello ${input.name},\n\nUse this link to reset your password:\n${input.resetUrl}\n\nThis link expires in 30 minutes.\n`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.6;">
        <h2 style="margin-bottom: 12px;">Reset your password</h2>
        <p>Hello ${input.name},</p>
        <p>Click the button below to reset your GetVeriSight password. This link expires in 30 minutes.</p>
        <p style="margin: 24px 0;">
          <a
            href="${input.resetUrl}"
            style="background: #f97316; color: #ffffff; text-decoration: none; padding: 12px 18px; border-radius: 8px; display: inline-block; font-weight: 700;"
          >
            Reset password
          </a>
        </p>
        <p>If the button does not work, use this link:</p>
        <p><a href="${input.resetUrl}">${input.resetUrl}</a></p>
      </div>
    `,
  });
}

export async function sendContactEmail(input: {
  to: string;
  name: string;
  email: string;
  service: string;
  message: string;
  inquiryId: string;
}) {
  const config = getSmtpConfig();

  if (!config) {
    throw new Error("SMTP email is not configured.");
  }

  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: config.auth,
  });

  const escapedMessage = input.message
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br />");

  await transporter.sendMail({
    from: config.from,
    to: input.to,
    replyTo: input.email,
    subject: `New GetVeriSight contact inquiry: ${input.service}`,
    text: `New contact inquiry received.\n\nInquiry ID: ${input.inquiryId}\nName: ${input.name}\nEmail: ${input.email}\nService: ${input.service}\n\nMessage:\n${input.message}\n`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.6;">
        <h2 style="margin-bottom: 12px;">New contact inquiry</h2>
        <p><strong>Inquiry ID:</strong> ${input.inquiryId}</p>
        <p><strong>Name:</strong> ${input.name}</p>
        <p><strong>Email:</strong> ${input.email}</p>
        <p><strong>Service:</strong> ${input.service}</p>
        <p><strong>Message:</strong></p>
        <div style="padding: 12px 14px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
          ${escapedMessage}
        </div>
      </div>
    `,
  });
}
