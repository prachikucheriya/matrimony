import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";



export async function GET(request: Request) {

  const { searchParams } = new URL(request.url);

  const religionId = searchParams.get("religionId");



  const castes = await prisma.caste.findMany({

    where: { religion: { name: "Jain" }, name: { in: ["Jain Shwetambar Sthanakvasi", "Jain Shwetambar Murtipujak", "Terapanthi", "Digambar"] }, ...(religionId ? { religionId } : {}) },

    orderBy: { name: "asc" },

    select: {

      id: true,

      name: true,

      religion: { select: { name: true } },

    },

  });



  // Dedupe by name for partner preference (same caste name across religions).

  if (!religionId) {

    const seen = new Set<string>();

    const unique = [];

    for (const caste of castes) {

      const key = caste.name.toLowerCase();

      if (seen.has(key)) continue;

      seen.add(key);

      unique.push({ id: caste.id, name: caste.name });

    }

    return NextResponse.json({ castes: unique });

  }



  return NextResponse.json({

    castes: castes.map((c) => ({ id: c.id, name: c.name })),

  });

}


