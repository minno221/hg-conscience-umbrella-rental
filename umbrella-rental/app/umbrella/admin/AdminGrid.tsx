// app/umbrella/admin/AdminGrid.tsx
"use client";

import { useState } from "react";
import { forceUpdateStatus, logoutAdmin } from "./actions";
import { useRouter } from "next/navigation";

type Umbrella = {
  id: number;
  number: number;
  status: string;
  studentId: string | null;
  renterName: string | null;
  phone: string | null;
};

export default function AdminGrid({ umbrellas }: { umbrellas: Umbrella[] }) {
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const router = useRouter();

  async function handleToggle(u: Umbrella) {
    setLoadingId(u.id);
    const newStatus = u.status === "available" ? "rented" : "available";
    await forceUpdateStatus(u.id, newStatus);
    router.refresh();
    setLoadingId(null);
  }

  async function handleLogout() {
    await logoutAdmin();
    router.refresh();
  }

  return (
    <div>
      <button
        onClick={handleLogout}
        style={{
          marginBottom: "16px",
          padding: "6px 12px",
          fontSize: "13px",
          borderRadius: "6px",
          border: "1px solid #ccc",
          background: "white",
          cursor: "pointer",
        }}
      >
        로그아웃
      </button>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
          gap: "10px",
        }}
      >
        {umbrellas.map((u) => {
          const isAvailable = u.status === "available";
          return (
            <button
              key={u.id}
              onClick={() => handleToggle(u)}
              disabled={loadingId === u.id}
              style={{
                padding: "10px",
                borderRadius: "10px",
                border: "none",
                fontWeight: "bold",
                cursor: "pointer",
                background: isAvailable ? "#dbeafe" : "#fee2e2",
                color: isAvailable ? "#1e40af" : "#b91c1c",
                textAlign: "left",
              }}
            >
              {u.number}번
              <div style={{ fontSize: "11px", fontWeight: "normal" }}>
                {isAvailable ? (
                  "대여가능"
                ) : (
                  <>
                    대여중
                    <br />
                    학번: {u.studentId ?? "-"}
                    <br />
                    이름: {u.renterName ?? "-"}
                    <br />
                    전화: {u.phone ?? "-"}
                  </>
                )}
              </div>
              <div style={{ fontSize: "10px", opacity: 0.7, marginTop: "4px" }}>
                클릭 시 강제 전환
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
