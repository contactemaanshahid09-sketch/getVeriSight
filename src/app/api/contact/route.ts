import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { contactSchema } from "@/lib/validators/contact";
import { ContactInquiryModel } from "@/models/ContactInquiry";
import { isEmailConfigured, sendContactEmail } from "@/lib/email";
import { env } from "@/lib/env";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = contactSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0]?.message ?? "Invalid contact form data." },
        { status: 400 },
      );
    }

    await connectToDatabase();

    const inquiry = await ContactInquiryModel.create({
      name: parsed.data.name,
      email: parsed.data.email,
      service: parsed.data.service,
      message: parsed.data.message,
      status: "new",
    });

    if (!isEmailConfigured()) {
      return NextResponse.json(
        {
          message:
            "Your message was saved, but email notifications are not configured yet. Add SMTP settings to enable delivery.",
          saved: true,
          id: inquiry._id.toString(),
        },
        { status: 201 },
      );
    }

    const to = env.CONTACT_RECEIVER_EMAIL ?? env.SMTP_USER;

    if (!to) {
      return NextResponse.json(
        {
          message:
            "Your message was saved, but no contact recipient email is configured. Add CONTACT_RECEIVER_EMAIL or SMTP_USER in .env.local.",
          saved: true,
          id: inquiry._id.toString(),
        },
        { status: 201 },
      );
    }

    await sendContactEmail({
      to,
      name: parsed.data.name,
      email: parsed.data.email,
      service: parsed.data.service,
      message: parsed.data.message,
      inquiryId: inquiry._id.toString(),
    });

    return NextResponse.json(
      {
        message: "Your message has been sent successfully.",
        saved: true,
        id: inquiry._id.toString(),
      },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      { message: "Unable to send your message right now." },
      { status: 500 },
    );
  }
}
