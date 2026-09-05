// app/umbrella/admin/actions.ts
"use server";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

const COOKIE_NAME = "admin_auth";

// 관리자 비밀번호 확인 후 쿠키 발급
export async function loginAdmin(password: string) {
  const correctPassword = process.env.ADMIN_PASSWORD;

  if (!correctPassword) {
    return { success: false, message: "서버에 관리자 비밀번호가 설정되어 있지 않습니다." };
  }

  if (password !== correctPassword) {
    return { success: false, message: "비밀번호가 틀렸습니다." };
  }

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, "true", {
    httpOnly: true, // 자바스크립트로 접근 불가 (보안)
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 4, // 4시간 유지
  });

  return { success: true, message: "로그인 성공" };
}

// 로그아웃
export async function logoutAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

// 학생 동의 없이 관리자가 강제로 대여상태 변경
export async function forceUpdateStatus(umbrellaId: number, newStatus: "available" | "rented") {
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get(COOKIE_NAME)?.value === "true";

  if (!isAdmin) {
    return { success: false, message: "관리자 인증이 필요합니다." };
  }

  await prisma.umbrella.update({
    where: { id: umbrellaId },
    data: {
      status: newStatus,
      studentId: newStatus === "available" ? null : null,
      renterName: newStatus === "available" ? null : "관리자 지정",
      phone: newStatus === "available" ? null : null,
      rentedAt: newStatus === "rented" ? new Date() : null,
      updatedBy: "admin",
    },
  });

  revalidatePath("/umbrella");
  revalidatePath("/umbrella/admin");
  return { success: true, message: "상태를 변경했습니다." };
}
