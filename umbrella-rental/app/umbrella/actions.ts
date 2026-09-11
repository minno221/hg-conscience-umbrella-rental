// app/umbrella/actions.ts
"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// 우산 대여하기
export async function rentUmbrella(
  umbrellaId: number,
  studentId: string,
  name: string,
  phone: string
) {
  const trimmedStudentId = studentId?.trim() ?? "";
  const trimmedName = name?.trim() ?? "";
  const trimmedPhone = phone?.trim() ?? "";

  if (!trimmedStudentId) {
    return { success: false, message: "학번을 입력해주세요." };
  }
  if (!trimmedName) {
    return { success: false, message: "이름을 입력해주세요." };
  }
  if (!trimmedPhone) {
    return { success: false, message: "전화번호를 입력해주세요." };
  }

  // 간단한 전화번호 형식 확인 (숫자만 9~11자리인지)
  const digitsOnly = trimmedPhone.replace(/[^0-9]/g, "");
  if (digitsOnly.length < 9 || digitsOnly.length > 11) {
    return { success: false, message: "올바른 전화번호 형식이 아닙니다. (예: 010-1234-5678)" };
  }

  // 학번+이름이 실제 학생 명단과 일치하는지 확인
  const student = await prisma.student.findUnique({
    where: { studentId: trimmedStudentId },
  });
  if (!student) {
    return { success: false, message: "학번을 다시 확인해주세요. 명단에 없는 학번입니다." };
  }
  if (student.name !== trimmedName) {
    return { success: false, message: "학번과 이름이 일치하지 않습니다. 다시 확인해주세요." };
  }

  // 이 학번으로 이미 대여 중인 우산이 있는지 확인 (한 사람당 하나만 대여 가능)
  const existingRental = await prisma.umbrella.findFirst({
    where: {
      studentId: trimmedStudentId,
      status: "rented",
    },
  });
  if (existingRental) {
    return {
      success: false,
      message: `이미 ${existingRental.number}번 우산을 대여 중이에요. 한 사람당 하나의 우산만 대여할 수 있습니다.`,
    };
  }

  // 여러 명이 동시에 같은 우산을 누르는 경우를 막기 위해
  // "현재 available 상태일 때만" 조건부로 업데이트 (원자적 처리)
  const result = await prisma.umbrella.updateMany({
    where: {
      id: umbrellaId,
      status: "available",
    },
    data: {
      status: "rented",
      studentId: trimmedStudentId,
      renterName: trimmedName,
      phone: trimmedPhone,
      rentedAt: new Date(),
      updatedBy: "student",
    },
  });

  if (result.count === 0) {
    return {
      success: false,
      message: "방금 다른 사람이 먼저 대여했어요. 목록을 새로고침 해주세요.",
    };
  }

  const umbrella = await prisma.umbrella.findUnique({ where: { id: umbrellaId } });
  revalidatePath("/umbrella");
  return { success: true, message: `${umbrella?.number}번 우산을 대여했습니다.` };
}
