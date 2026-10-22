
import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function POST(request: Request) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("photo");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Photo file is required." },
        { status: 400 }
      );
    }

    if (!ALLOWED.has(file.type)) {
      return NextResponse.json(
        { error: "Only JPG, PNG, or WEBP images are allowed." },
        { status: 400 }
      );
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: "Photo must be under 5MB." },
        { status: 400 }
      );
    }

    const ext =
      file.type === "image/png"
        ? "png"
        : file.type === "image/webp"
        ? "webp"
        : "jpg";

    const fileName = `profiles/${session.userId}-${Date.now()}.${ext}`;

    const blob = await put(fileName, file, {
      access: "public",
      addRandomSuffix: true,
      contentType: file.type,
    });

    const photoUrl = blob.url;

    const profile = await prisma.profile.upsert({
      where: { userId: session.userId },
      create: {
        userId: session.userId,
        photoUrl,
      },
      update: {
        photoUrl,
      },
    });

    return NextResponse.json({
      ok: true,
      photoUrl: profile.photoUrl,
    });
  } catch (error) {
    console.error("photo upload error", error);

    return NextResponse.json(
      { error: "Unable to upload photo." },
      { status: 500 }
    );
  }
}
