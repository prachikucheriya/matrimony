import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const casteId = searchParams.get("casteId");
  if (!casteId) {
    return NextResponse.json({ error: "casteId is required" }, { status: 400 });
  }

  const subCastes = await prisma.subCaste.findMany({
    where: { casteId },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return NextResponse.json({ subCastes });
}
