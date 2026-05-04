import { NextResponse } from "next/server";
import { moderateImage } from "@/lib/moderation/image/service";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ message: "Please upload an image file." }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ message: "Only image uploads are supported." }, { status: 400 });
    }

    const result = await moderateImage({ file });

    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Image moderation failed unexpectedly.";

    return NextResponse.json({ message }, { status: 500 });
  }
}
