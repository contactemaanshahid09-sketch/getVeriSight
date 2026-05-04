import { NextResponse } from "next/server";
import { moderateText } from "@/lib/moderation/text/service";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      text?: string;
    };

    const text = body.text?.trim() ?? "";

    if (!text) {
      return NextResponse.json({ message: "Please enter text to analyze." }, { status: 400 });
    }

    const result = await moderateText({ text, language: "en" });

    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Text moderation failed unexpectedly.";

    return NextResponse.json({ message }, { status: 500 });
  }
}
