// app/umbrella/admin/LoginForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginAdmin } from "./actions";

export default function LoginForm() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await loginAdmin(password);

    if (result.success) {
      router.refresh(); // 쿠키 반영해서 페이지 다시 렌더
    } else {
      setError(result.message);
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="password"
        placeholder="관리자 비밀번호"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{
          width: "100%",
          padding: "10px",
          borderRadius: "8px",
          border: "1px solid #ccc",
          marginBottom: "8px",
        }}
      />
      {error && (
        <p style={{ color: "#dc2626", fontSize: "13px", marginBottom: "8px" }}>
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={loading}
        style={{
          width: "100%",
          padding: "10px",
          borderRadius: "8px",
          border: "none",
          background: "#2563eb",
          color: "white",
          fontWeight: "bold",
          cursor: "pointer",
        }}
      >
        {loading ? "확인 중..." : "로그인"}
      </button>
    </form>
  );
}
