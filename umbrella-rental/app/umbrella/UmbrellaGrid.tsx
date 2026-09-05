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
  const [pin, setPin] = useState(""); // 추가: 대여 시 입력하는 PIN
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  function resetForm() {
    setSelectedId(null);
    setStudentId("");
    setName("");
    setPhone("");
    setPin(""); // 추가
  }

  async function handleRent(id: number) {
    setLoading(true);
    const result = await rentUmbrella(id, studentId, name, phone, pin); // 추가: pin 전달
    setMessage(result.message);
    setLoading(false);
    if (result.success) {
      resetForm();
    }
  }

  async function handleReturn(id: number) {
    // 추가: 반납(취소) 전에 PIN을 팝업창으로 물어봄
    const inputPin = window.prompt("대여할 때 설정한 4자리 비밀번호를 입력해주세요.");
    if (inputPin === null) {
      // 사용자가 취소 버튼을 누른 경우 아무 것도 하지 않음
      return;
    }

    setLoading(true);
    const result = await returnUmbrella(id, inputPin); // 추가: pin 전달
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
                  {/* 추가: 반납할 때 쓸 4자리 비밀번호 입력칸 */}
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={4}
                    placeholder="반납용 비밀번호 4자리"
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, ""))}
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
