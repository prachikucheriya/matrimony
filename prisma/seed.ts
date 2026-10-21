import { PrismaClient } from "@prisma/client";



const prisma = new PrismaClient();



type CasteSeed = { name: string; subCastes: string[] };



const hinduCastes: CasteSeed[] = [

  { name: "Brahmin", subCastes: ["General", "Iyer", "Iyengar", "Saraswat", "Gaur"] },

  { name: "Rajput", subCastes: ["General", "Sisodia", "Chauhan", "Rathore"] },

  { name: "Maratha", subCastes: ["General", "96 Kuli", "Kunbi"] },

  { name: "Kunbi", subCastes: ["General"] },

  { name: "Koli", subCastes: ["General"] },

  { name: "Yadav", subCastes: ["General", "Ahir", "Gwala"] },

  { name: "Dhangar", subCastes: ["General"] },

  { name: "Teli", subCastes: ["General"] },

  { name: "Vanjari", subCastes: ["General"] },

  { name: "Koshti", subCastes: ["General"] },

  { name: "Nhavi", subCastes: ["General"] },

  { name: "Kumbhar", subCastes: ["General"] },

  { name: "Sutar", subCastes: ["General"] },

  { name: "Lohar", subCastes: ["General"] },

  { name: "Sonar", subCastes: ["General"] },

  { name: "Punjabi", subCastes: ["General"] },

  { name: "Tamil", subCastes: ["General"] },

  { name: "Jain", subCastes: ["General"] },

];



const masterData: { name: string; castes: CasteSeed[] }[] = [

  { name: "Hindu", castes: hinduCastes },

  {

    name: "Muslim",

    castes: [

      { name: "Sunni", subCastes: ["General", "Shaikh", "Pathan", "Syed"] },

      { name: "Shia", subCastes: ["General", "Ismaili", "Bohra"] },

    ],

  },

  {

    name: "Christian",

    castes: [

      {

        name: "Roman Catholic",

        subCastes: ["General", "Latin Catholic", "Syro-Malabar"],

      },

      { name: "Protestant", subCastes: ["General", "CSI", "Baptist"] },

    ],

  },

  {

    name: "Sikh",

    castes: [

      { name: "Jat", subCastes: ["General", "Sidhu", "Sandhu"] },

      { name: "Khatri", subCastes: ["General", "Arora", "Sood"] },

      { name: "Punjabi", subCastes: ["General"] },

    ],

  },

  {

    name: "Jain",

    castes: [

      { name: "Digambar", subCastes: ["General", "Bispanthi", "Terapanthi"] },

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


