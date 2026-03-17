import { jobs } from "./Job_Apps.js";
import { prisma } from "./utils/db.js";

async function main() {
  const result = await prisma.job_Apps.createMany({
    data: jobs,
    // skipDuplicates: true, // skip if id already exists
  });

  console.log(`✅ Seeded ${result.count} jobs`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
