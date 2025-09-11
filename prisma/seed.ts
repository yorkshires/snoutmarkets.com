import { PrismaClient } from "@prisma/client"; const prisma = new PrismaClient();
async function main(){
  const cats=[{slug:"hvalpe",name:"Hvalpe"},{slug:"voksne-hunde",name:"Voksne hunde"},{slug:"legetoej",name:"Legetøj"},{slug:"udstyr",name:"Udstyr"},{slug:"foder",name:"Foder"}];
  for(const c of cats){ await prisma.category.upsert({ where:{slug:c.slug}, update:{}, create:c }); }
  const u=await prisma.user.upsert({ where:{email:"seller@snoutmarkets.test"}, update:{}, create:{email:"seller@snoutmarkets.test", name:"Kennel Demo"} });
  await prisma.sellerProfile.upsert({ where:{userId:u.id}, update:{}, create:{ userId:u.id, displayName:"Kennel Demo", phone:"+45 12 34 56 78", location:"København" } });
  const pup=await prisma.category.findFirst({ where:{slug:"hvalpe"} }); const toy=await prisma.category.findFirst({ where:{slug:"legetoej"} });
  await prisma.listing.create({ data:{ title:"Labrador hvalp – han, 10 uger", description:"Sød og social labrador, vaccineret og chippet.", priceCents:950000, location:"Aarhus", imageUrl:"https://images.unsplash.com/photo-1543466835-00a7907e9de1", userId:u.id, categoryId:pup?.id || null, isAnimal:true, breed:"Labrador Retriever", ageMonths:2, sex:"MALE", vaccinated:true, microchipped:true, pedigree:true, color:"Gul", size:"Stor" } });
  await prisma.listing.create({ data:{ title:"Interaktiv gummibold", description:"Holdbar bold til aktivering. Str. M.", priceCents:12900, location:"København", imageUrl:"https://images.unsplash.com/photo-1548199973-03cce0bbc87b", userId:u.id, categoryId:toy?.id || null, isAnimal:false } });
  console.log("Seed done");
}
main().finally(async()=>{await prisma.$disconnect();});
