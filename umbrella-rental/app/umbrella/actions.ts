// app/umbrella/actions.ts
"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// 우산 대여하기
export async function rentUmbrella(umbrellaId: number, borrowerName: string) {
  if (!borrowerName || borrowerName.trim().length === 0) {
    return { success: false, message: "이름(또는 학번)을 입력해주세요." };
  }

  const umbrella = await prisma.umbrella.findUnique({
    where: { id: umbrellaId },
  });

  if (!umbrella) {
    return { success: false, message: "존재하지 않는 우산입니다." };
  }

  if (umbrella.status === "rented") {
    return { success: false, message: "이미 대여 중인 우산입니다." };
  }

  await prisma.umbrella.update({
    where: { id: umbrellaId },
    data: {
      status: "rented",
      borrower: borrowerName.trim(),
      rentedAt: new Date(),
      updatedBy: "student",
    },
  });

  revalidatePath("/umbrella");
  return { success: true, message: `${umbrella.number}번 우산을 대여했습니다.` };
}

// 우산 반납하기
export async function returnUmbrella(umbrellaId: number) {
  const umbrella = await prisma.umbrella.findUnique({
    where: { id: umbrellaId },
  });

  if (!umbrella) {
    return { success: false, message: "존재하지 않는 우산입니다." };
  }

  if (umbrella.status === "available") {
    return { success: false, message: "이미 반납된 우산입니다." };
  }

  await prisma.umbrella.update({
    where: { id: umbrellaId },
    data: {
      status: "available",
      borrower: null,
      rentedAt: null,
      updatedBy: "student",
    },
  });

  revalidatePath("/umbrella");
  return { success: true, message: `${umbrella.number}번 우산을 반납했습니다.` };
}
