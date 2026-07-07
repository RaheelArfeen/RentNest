import "dotenv/config";
import bcrypt from "bcryptjs";
import prisma from "../src/lib/prisma";

async function main() {
  const adminEmail = "admin@rentnest.com";
  const adminPassword = "admin123";

  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: "RentNest Admin",
      email: adminEmail,
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  console.log(`Admin user ready: ${admin.email}`);

  const categories = ["Apartment", "House", "Studio", "Duplex", "Villa"];

  for (const name of categories) {
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  console.log(`Seeded ${categories.length} property categories`);
}

main()
  .catch((err) => {
    console.error("Seeding failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
