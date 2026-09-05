// app/umbrella/page.tsx
import { prisma } from "@/lib/prisma";
import UmbrellaGrid from "./UmbrellaGrid";

export default async function UmbrellaPage() {
  const umbrellas = await prisma.umbrella.findMany({
    orderBy: { number: "asc" },
  });

  const availableCount = umbrellas.filter((u) => u.status === "available").length;

  return (
    <main style={{ padding: "24px", maxWidth: "900px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "8px" }}>
        양심우산 대여
      </h1>
      <p style={{ marginBottom: "24px", color: "#555" }}>
        전체 {umbrellas.length}개 중{" "}
        <strong style={{ color: "#2563eb" }}>{availableCount}개</strong> 대여
        가능
      </p>

      <UmbrellaGrid umbrellas={umbrellas} />
    </main>
  );
}
