import { PrismaClient } from "@prisma/client";



const prisma = new PrismaClient();



type CasteSeed = { name: string; subCastes: string[] };



const masterData: { name: string; castes: CasteSeed[] }[] = [
  {
    name: "Jain",
    castes: [
      { name: "Digambar", subCastes: [] },
      { name: "Shwetambar", subCastes: ["General", "Murtipujak", "Sthanakvasi"] },
      { name: "Jain", subCastes: ["General"] },
    ],
  },
];

async function upsertCaste(

  religionId: string,

  caste: CasteSeed,

) {

  const row = await prisma.caste.upsert({

    where: {

      religionId_name: { religionId, name: caste.name },

    },

    create: {

      religionId,

      name: caste.name,

    },

    update: {},

  });



  for (const subName of caste.subCastes) {

    await prisma.subCaste.upsert({

      where: {

        casteId_name: { casteId: row.id, name: subName },

      },

      create: { casteId: row.id, name: subName },

      update: {},

    });

  }

}



async function main() {

  for (const religion of masterData) {

    const religionRow = await prisma.religion.upsert({

      where: { name: religion.name },

      create: { name: religion.name },

      update: {},

    });



    for (const caste of religion.castes) {

      await upsertCaste(religionRow.id, caste);

    }

  }



  console.log("Seeded religions, castes, and sub-castes.");

}



main()

  .catch((error) => {

    console.error(error);

    process.exit(1);

  })

  .finally(async () => {

    await prisma.$disconnect();

  });


