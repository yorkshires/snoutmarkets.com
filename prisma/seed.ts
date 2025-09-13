// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // English base categories
  const categories = [
    { slug: "puppies", name: "Puppies" },
    { slug: "adult-dogs", name: "Adult dogs" },
    { slug: "gear", name: "Gear" },
    { slug: "food", name: "Food" },
    { slug: "toys", name: "Toys" },
  ];

  for (const c of categories) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name },
      create: { slug: c.slug, name: c.name },
    });
  }

  // Fetch for ids
  const cats = await prisma.category.findMany();
  const bySlug = (slug: string) => cats.find((c) => c.slug === slug);

  // Demo seller
  const user = await prisma.user.upsert({
    where: { email: "demo@snoutmarkets.com" },
    update: { name: "Demo Seller" },
    create: { email: "demo@snoutmarkets.com", name: "Demo Seller" },
  });

  await prisma.sellerProfile.upsert({
    where: { userId: user.id },
    update: {
      displayName: "Kennel Demo",
      phone: "+45 12 34 56 78",
      location: "Copenhagen",
      bio: "We love Labradors and good coffee.",
    },
    create: {
      userId: user.id,
      displayName: "Kennel Demo",
      phone: "+45 12 34 56 78",
      location: "Copenhagen",
      bio: "We love Labradors and good coffee.",
    },
  });

  // Remove previous demo listings (Danish/English titles)
  await prisma.listing.deleteMany({
    where: {
      userId: user.id,
      title: {
        in: [
          "Labrador hvalp, sort – klar til nye hjem",
          "Hundesele (M) – næsten som ny",
          "Labrador puppy, black — ready for new home",
          "Dog harness (M) — almost new",
        ],
      },
    },
  });

  // Create 2 English demo listings
  const toCreate = [
    {
      title: "Labrador puppy, black — ready for new home",
      description: "Sweet and social (demo). Used to kids. Ready to move within 2 weeks.",
      priceCents: 850000,
      currency: "DKK",
      location: "Copenhagen",
      imageUrl: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=1200",
      categoryId: bySlug("puppies")?.id ?? cats[0]!.id,
      userId: user.id,
    },
    {
      title: "Dog harness (M) — almost new",
      description: "Used a few times. Fits a medium-sized dog. (demo)",
      priceCents: 15000,
      currency: "DKK",
      location: "Aarhus",
      imageUrl: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=1200",
      categoryId: bySlug("gear")?.id ?? cats[0]!.id,
      userId: user.id,
    },
  ];

  await prisma.listing.createMany({ data: toCreate });

  console.log(`✅ Seed OK: English categories + ${toCreate.length} listings.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
