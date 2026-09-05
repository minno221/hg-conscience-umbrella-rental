// app/umbrella/admin/page.tsx
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import LoginForm from "./LoginForm";
import AdminGrid from "./AdminGrid";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get("admin_auth")?.value === "true";

  if (!isAdmin) {
    return (
      <main style={{ padding: "24px", maxWidth: "400px", margin: "80px auto" }}>
        <h1 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "16px" }}>
          관리자 로그인
        </h1>
        <LoginForm />
      </main>
    );
  }

  const umbrellas = await prisma.umbrella.findMany({
    orderBy: { number: "asc" },
  });

  return (
    <main style={{ padding: "24px", maxWidth: "900px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "8px" }}>
        우산 관리자 페이지
      </h1>
      <p style={{ marginBottom: "24px", color: "#555" }}>
        버튼을 누르면 학생 동의 없이 바로 상태가 변경됩니다.
      </p>
      <AdminGrid umbrellas={umbrellas} />
    </main>
  );
}
