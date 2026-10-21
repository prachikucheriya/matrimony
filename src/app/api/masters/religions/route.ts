import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const religions = await prisma.religion.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
  return NextResponse.json({ religions });
}
