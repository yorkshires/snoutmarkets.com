// prisma/migrate_to_english.ts
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const map: Record<string, { slug: string; name: string }> = {
    "hvalpe": { slug: "puppies", name: "Puppies" },
    "voksne-hunde": { slug: "adult-dogs", name: "Adult dogs" },
    "udstyr": { slug: "gear", name: "Gear" },
    "foder": { slug: "food", name: "Food" },
    "legetoj": { slug: "toys", name: "Toys" },
  };

  for (const [oldSlug, next] of Object.entries(map)) {
    const res = await prisma.category.updateMany({
      where: { slug: oldSlug },
      data: { slug: next.slug, name: next.name },
    });
    if (res.count > 0) {
      console.log(`Updated ${oldSlug} -> ${next.slug}`);
    }
  }

  console.log("✅ Category slugs/names migrated to English.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
