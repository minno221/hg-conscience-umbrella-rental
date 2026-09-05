// prisma/seed.ts
// 우산 1번~100번을 처음 한 번 DB에 만들어주는 스크립트
// 실행 방법: npx tsx prisma/seed.ts

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const existingCount = await prisma.umbrella.count();
  if (existingCount > 0) {
    console.log(`이미 우산이 ${existingCount}개 등록되어 있어서 시딩을 건너뜁니다.`);
    return;
  }

  const umbrellas = Array.from({ length: 100 }, (_, i) => ({
    number: i + 1,
    status: "available",
  }));

  await prisma.umbrella.createMany({ data: umbrellas });
  console.log("우산 100개 생성 완료!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
