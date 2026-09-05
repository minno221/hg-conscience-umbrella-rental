// app/umbrella/actions.ts
"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

// 우산 대여하기
export async function rentUmbrella(
  umbrellaId: number,
  studentId: string,
  name: string,
  phone: string,
  pin: string // 추가: 취소(반납)용 비밀번호
) {
  const trimmedStudentId = studentId?.trim() ?? "";
  const trimmedName = name?.trim() ?? "";
  const trimmedPhone = phone?.trim() ?? "";
  const trimmedPin = pin?.trim() ?? "";

  if (!trimmedStudentId) {
    return { success: false, message: "학번을 입력해주세요." };
  }
  if (!trimmedName) {
    return { success: false, message: "이름을 입력해주세요." };
  }
  if (!trimmedPhone) {
    return { success: false, message: "전화번호를 입력해주세요." };
  }

  // 추가: PIN 형식 확인 (숫자 4자리)
  if (!/^\d{4}$/.test(trimmedPin)) {
    return { success: false, message: "취소용 비밀번호는 숫자 4자리로 입력해주세요." };
  }

  // 간단한 전화번호 형식 확인 (숫자만 9~11자리인지)
  const digitsOnly = trimmedPhone.replace(/[^0-9]/g, "");
  if (digitsOnly.length < 9 || digitsOnly.length > 11) {
    return { success: false, message: "올바른 전화번호 형식이 아닙니다. (예: 010-1234-5678)" };
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

  // 추가: PIN을 평문이 아니라 해시로 저장 (DB가 유출돼도 원본 PIN을 알 수 없게)
  const pinHash = await bcrypt.hash(trimmedPin, 10);

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
      pinHash, // 추가
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

// 우산 반납하기
export async function returnUmbrella(umbrellaId: number, pin: string) {
  // 추가: pin 파라미터
  const umbrella = await prisma.umbrella.findUnique({
    where: { id: umbrellaId },
  });

  if (!umbrella) {
    return { success: false, message: "존재하지 않는 우산입니다." };
  }
  if (umbrella.status === "available") {
    return { success: false, message: "이미 반납된 우산입니다." };
  }

  // 추가: 핵심 보안 로직 — 이 우산을 대여할 때 저장된 PIN과 일치하는지 확인
  // 여기가 없으면 우산 번호만 알아도 아무나 반납(취소)할 수 있게 됨
  const trimmedPin = pin?.trim() ?? "";
  if (!umbrella.pinHash || !(await bcrypt.compare(trimmedPin, umbrella.pinHash))) {
    return { success: false, message: "비밀번호가 일치하지 않습니다." };
  }

  await prisma.umbrella.update({
    where: { id: umbrellaId },
    data: {
      status: "available",
      studentId: null,
      renterName: null,
      phone: null,
      pinHash: null, // 추가: 반납 시 초기화
      rentedAt: null,
      updatedBy: "student",
    },
  });
  revalidatePath("/umbrella");
  return { success: true, message: `${umbrella.number}번 우산을 반납했습니다.` };
}
