import { NextResponse } from "next/server";
import { moderateVideo } from "@/lib/moderation/video/service";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ message: "Please upload a video file." }, { status: 400 });
    }

    if (!file.type.startsWith("video/")) {
      return NextResponse.json({ message: "Only video uploads are supported." }, { status: 400 });
    }

    const result = await moderateVideo({ file });
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Video moderation failed unexpectedly.";

    return NextResponse.json({ message }, { status: 500 });
  }
}
