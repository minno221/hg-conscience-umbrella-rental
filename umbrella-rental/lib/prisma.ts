// lib/prisma.ts
// Next.js 개발 환경에서 핫리로드할 때마다 PrismaClient가 여러 개 생성되는 걸 막기 위한 싱글톤 패턴

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
