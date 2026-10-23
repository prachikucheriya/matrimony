import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
const fields = ["gender","displayName","dob","motherTongue","height","birthPlace","birthTime","complexion","religionId","casteId","subCasteId","education","occupation","incomeRange","city","state","address","fatherName","fatherOccupation","motherName","motherOccupation","brothersCount","brothersNames","sistersCount","sistersNames","maritalStatus","spouseName","spouseOccupation","isDifferentlyAbled"] as const;
async function currentUser() {
 const session = await getSession();
 if (!session || session.role !== "USER") return null;
 return prisma.user.findUnique({where:{id:session.userId},select:{id:true,profile:{select:{status:true}}}});
}
export async function GET() {
 const user=await currentUser();
 if (!user) return NextResponse.json({error:"Unauthorized"},{status:401});
 const draft=await prisma.onboardingDraft.findUnique({where:{userId:user.id}});
 return NextResponse.json({draft:draft?{step:draft.step,form:draft.data,updatedAt:draft.updatedAt}:null});
}
export async function PUT(request:Request) {
 const user=await currentUser();
 if (!user) return NextResponse.json({error:"Unauthorized"},{status:401});
 if (user.profile?.status!=="INCOMPLETE") return NextResponse.json({error:"Profile already submitted"},{status:409});
 const body=await request.json();
 if (!Number.isInteger(body.step)||body.step<0||body.step>5||!body.form||typeof body.form!=="object"||Array.isArray(body.form)) return NextResponse.json({error:"Invalid draft"},{status:400});
 const data:Record<string,string|boolean>={};
 for(const key of fields) {
  const value=body.form[key];
  if(typeof value!=="string" && typeof value!=="boolean") return NextResponse.json({error:"Invalid field: "+key},{status:400});
  if(typeof value==="string" && value.length>2000) return NextResponse.json({error:"Field too long"},{status:400});
  data[key]=value;
 }
 await prisma.onboardingDraft.upsert({where:{userId:user.id},create:{userId:user.id,step:body.step,data},update:{step:body.step,data}});
 return NextResponse.json({ok:true});
}
