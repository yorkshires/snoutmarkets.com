// scripts/fix-user.ts
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/passwords";

async function main() {
  const email = "billing@yorkshires.eu";
  const passwordHash = await hashPassword("Demo12345!");
  await prisma.user.upsert({
    where: { email },
    update: { passwordHash },
    create: { email, passwordHash },
  });
  console.log("Updated", email);
}
main().catch((e) => { console.error(e); process.exit(1); });
