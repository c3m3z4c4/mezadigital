"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "sonner";

export default function AdminLoginPage() {
  const router = useRouter();
  const login  = useAuthStore((s) => s.login);

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      router.push("/admin/portfolio");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "#060a12", padding: "24px",
    }}>
      <div style={{ width: "100%", maxWidth: 380 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <span style={{
            fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 900,
            color: "#e2eaf5", letterSpacing: "-0.01em",
          }}>
            meza<span style={{ color: "#3385ff" }}>digital</span>
          </span>
          <p style={{ fontSize: 11, letterSpacing: "0.2em", color: "#8899aa", textTransform: "uppercase", marginTop: 8 }}>
            Panel de administración
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{
          background: "#0d1421", border: "1px solid rgba(51,133,255,0.14)",
          padding: "32px",
        }}>
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Correo electrónico</label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              required autoFocus style={inputStyle}
              placeholder="admin@mezadigital.com"
            />
          </div>
          <div style={{ marginBottom: 28 }}>
            <label style={labelStyle}>Contraseña</label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)}
              required style={inputStyle}
              placeholder="••••••••"
            />
          </div>
          <button type="submit" disabled={loading} style={{
            width: "100%", padding: "12px", background: "#3385ff",
            border: "none", color: "#fff", fontSize: 13, fontWeight: 600,
            letterSpacing: "0.08em", cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1, transition: "opacity 0.2s",
          }}>
            {loading ? "Iniciando sesión…" : "Iniciar sesión"}
          </button>
        </form>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block", fontSize: "9.5px", letterSpacing: "0.22em",
  color: "#8899aa", textTransform: "uppercase", marginBottom: 6,
};

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "10px 12px",
  background: "#111827", border: "1px solid rgba(51,133,255,0.2)",
  color: "#e2eaf5", fontSize: 13, outline: "none", boxSizing: "border-box",
};
