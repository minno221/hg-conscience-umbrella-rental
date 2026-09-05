// app/umbrella/UmbrellaGrid.tsx
"use client";

import { useState } from "react";
import { rentUmbrella, returnUmbrella } from "./actions";

type Umbrella = {
  id: number;
  number: number;
  status: string;
  studentId: string | null;
  renterName: string | null;
  phone: string | null;
};

export default function UmbrellaGrid({ umbrellas }: { umbrellas: Umbrella[] }) {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [studentId, setStudentId] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  function resetForm() {
    setSelectedId(null);
    setStudentId("");
    setName("");
    setPhone("");
  }

  async function handleRent(id: number) {
    setLoading(true);
    const result = await rentUmbrella(id, studentId, name, phone);
    setMessage(result.message);
    setLoading(false);
    if (result.success) {
      resetForm();
    }
  }

  async function handleReturn(id: number) {
    setLoading(true);
    const result = await returnUmbrella(id);
    setMessage(result.message);
    setLoading(false);
  }

  const inputStyle = {
    width: "100%",
    padding: "6px",
    fontSize: "12px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    marginBottom: "4px",
    boxSizing: "border-box" as const,
  };

  return (
    <div>
      {message && (
        <div
          style={{
            padding: "10px 14px",
            marginBottom: "16px",
            borderRadius: "8px",
            background: "#eff6ff",
            color: "#1e40af",
            fontSize: "14px",
          }}
        >
          {message}
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))",
          gap: "10px",
        }}
      >
        {umbrellas.map((u) => {
          const isAvailable = u.status === "available";
          const isSelected = selectedId === u.id;

          return (
            <div key={u.id}>
              <button
                onClick={() =>
                  isAvailable
                    ? (isSelected ? resetForm() : setSelectedId(u.id))
                    : handleReturn(u.id)
                }
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "12px 0",
                  borderRadius: "10px",
                  border: "none",
                  fontWeight: "bold",
                  cursor: "pointer",
                  background: isAvailable ? "#dbeafe" : "#fee2e2",
                  color: isAvailable ? "#1e40af" : "#b91c1c",
                }}
              >
                {u.number}번
                <div style={{ fontSize: "11px", fontWeight: "normal" }}>
                  {isAvailable ? "대여가능" : "반납하기"}
                </div>
              </button>

              {isSelected && (
                <div style={{ marginTop: "6px" }}>
                  <input
                    type="text"
                    placeholder="학번"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    style={inputStyle}
                  />
                  <input
                    type="text"
                    placeholder="이름"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={inputStyle}
                  />
                  <input
                    type="tel"
                    placeholder="전화번호 (010-1234-5678)"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    style={inputStyle}
                  />
                  <button
                    onClick={() => handleRent(u.id)}
                    disabled={loading}
                    style={{
                      width: "100%",
                      padding: "6px",
                      fontSize: "12px",
                      borderRadius: "6px",
                      border: "none",
                      background: "#2563eb",
                      color: "white",
                      cursor: "pointer",
                    }}
                  >
                    대여 확정
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
