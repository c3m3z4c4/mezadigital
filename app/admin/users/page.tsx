"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "sonner";
import { UserPlus, KeyRound, Trash2, Shield, UserCheck, UserX } from "lucide-react";

interface User {
  id: string;
  email: string;
  role: string;
  active: boolean;
  createdAt: string;
}

const API = "/api/users";

export default function UsersPage() {
  const { token } = useAuthStore();
  const [users, setUsers]           = useState<User[]>([]);
  const [loading, setLoading]       = useState(true);
  const [showAdd, setShowAdd]       = useState(false);
  const [resetId, setResetId]       = useState<string | null>(null);

  const [newEmail, setNewEmail]     = useState("");
  const [newPass, setNewPass]       = useState("");
  const [newRole, setNewRole]       = useState("editor");
  const [newPass2, setNewPass2]     = useState("");
  const [resetPass, setResetPass]   = useState("");
  const [resetPass2, setResetPass2] = useState("");
  const [saving, setSaving]         = useState(false);

  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  async function fetchUsers() {
    setLoading(true);
    const res = await fetch(API, { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) setUsers(await res.json());
    setLoading(false);
  }

  useEffect(() => { if (token) fetchUsers(); }, [token]);

  async function addUser(e: React.FormEvent) {
    e.preventDefault();
    if (newPass !== newPass2) { toast.error("Las contraseñas no coinciden"); return; }
    if (newPass.length < 8) { toast.error("La contraseña debe tener al menos 8 caracteres"); return; }
    setSaving(true);
    const res = await fetch(API, {
      method: "POST",
      headers,
      body: JSON.stringify({ email: newEmail, password: newPass, role: newRole }),
    });
    setSaving(false);
    if (res.ok) {
      toast.success("Usuario creado");
      setShowAdd(false);
      setNewEmail(""); setNewPass(""); setNewPass2(""); setNewRole("editor");
      fetchUsers();
    } else {
      const { error } = await res.json();
      toast.error(error || "Error al crear usuario");
    }
  }

  async function resetPassword(e: React.FormEvent) {
    e.preventDefault();
    if (resetPass !== resetPass2) { toast.error("Las contraseñas no coinciden"); return; }
    if (resetPass.length < 8) { toast.error("La contraseña debe tener al menos 8 caracteres"); return; }
    setSaving(true);
    const res = await fetch(`${API}/${resetId}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ password: resetPass }),
    });
    setSaving(false);
    if (res.ok) {
      toast.success("Contraseña actualizada");
      setResetId(null);
      setResetPass(""); setResetPass2("");
    } else {
      toast.error("Error al actualizar contraseña");
    }
  }

  async function toggleActive(user: User) {
    const res = await fetch(`${API}/${user.id}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ active: !user.active }),
    });
    if (res.ok) {
      toast.success(user.active ? "Usuario desactivado" : "Usuario activado");
      fetchUsers();
    }
  }

  async function deleteUser(user: User) {
    if (!confirm(`¿Eliminar a ${user.email}? Esta acción no se puede deshacer.`)) return;
    const res = await fetch(`${API}/${user.id}`, { method: "DELETE", headers });
    if (res.ok) { toast.success("Usuario eliminado"); fetchUsers(); }
    else toast.error("Error al eliminar usuario");
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "8px 12px", background: "#0d1421",
    border: "1px solid rgba(51,133,255,0.2)", color: "#e2eaf5",
    fontSize: 13, outline: "none", boxSizing: "border-box",
  };
  const labelStyle: React.CSSProperties = { fontSize: 11, color: "#8899aa", marginBottom: 4, display: "block", letterSpacing: "0.06em", textTransform: "uppercase" };
  const btnPrimary: React.CSSProperties = {
    padding: "8px 18px", background: "#3385ff", border: "none", color: "#fff",
    fontSize: 12, fontWeight: 600, cursor: "pointer", letterSpacing: "0.04em",
  };
  const btnSecondary: React.CSSProperties = {
    padding: "8px 18px", background: "rgba(51,133,255,0.1)",
    border: "1px solid rgba(51,133,255,0.2)", color: "#8899aa",
    fontSize: 12, fontWeight: 600, cursor: "pointer",
  };

  return (
    <div style={{ maxWidth: 780 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <p style={{ fontSize: 13, color: "#8899aa", margin: 0 }}>
          Gestiona los usuarios con acceso al panel de administración.
        </p>
        <button onClick={() => setShowAdd(true)} style={{ ...btnPrimary, display: "flex", alignItems: "center", gap: 6 }}>
          <UserPlus size={14} /> Nuevo usuario
        </button>
      </div>

      {/* Add user form */}
      {showAdd && (
        <div style={{ background: "#0d1421", border: "1px solid rgba(51,133,255,0.2)", padding: 24, marginBottom: 24 }}>
          <h3 style={{ color: "#e2eaf5", fontSize: 14, fontWeight: 600, margin: "0 0 20px", letterSpacing: "0.04em" }}>Crear nuevo usuario</h3>
          <form onSubmit={addUser} style={{ display: "grid", gap: 14 }}>
            <div>
              <label style={labelStyle}>Email</label>
              <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} required style={inputStyle} placeholder="usuario@ejemplo.com" />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <label style={labelStyle}>Contraseña</label>
                <input type="password" value={newPass} onChange={e => setNewPass(e.target.value)} required style={inputStyle} placeholder="Mín. 8 caracteres" />
              </div>
              <div>
                <label style={labelStyle}>Confirmar contraseña</label>
                <input type="password" value={newPass2} onChange={e => setNewPass2(e.target.value)} required style={inputStyle} placeholder="Repetir contraseña" />
              </div>
            </div>
            <div>
              <label style={labelStyle}>Rol</label>
              <select value={newRole} onChange={e => setNewRole(e.target.value)} style={{ ...inputStyle, appearance: "none" }}>
                <option value="editor">Editor</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
              <button type="submit" disabled={saving} style={btnPrimary}>{saving ? "Guardando..." : "Crear usuario"}</button>
              <button type="button" onClick={() => setShowAdd(false)} style={btnSecondary}>Cancelar</button>
            </div>
          </form>
        </div>
      )}

      {/* Reset password modal */}
      {resetId && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(6,10,18,0.85)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50,
        }}>
          <div style={{ background: "#0d1421", border: "1px solid rgba(51,133,255,0.2)", padding: 28, width: 380 }}>
            <h3 style={{ color: "#e2eaf5", fontSize: 14, fontWeight: 600, margin: "0 0 18px", letterSpacing: "0.04em", display: "flex", alignItems: "center", gap: 8 }}>
              <KeyRound size={15} color="#3385ff" /> Resetear contraseña
            </h3>
            <p style={{ fontSize: 12, color: "#8899aa", marginBottom: 18 }}>
              {users.find(u => u.id === resetId)?.email}
            </p>
            <form onSubmit={resetPassword} style={{ display: "grid", gap: 14 }}>
              <div>
                <label style={labelStyle}>Nueva contraseña</label>
                <input type="password" value={resetPass} onChange={e => setResetPass(e.target.value)} required style={inputStyle} placeholder="Mín. 8 caracteres" autoFocus />
              </div>
              <div>
                <label style={labelStyle}>Confirmar contraseña</label>
                <input type="password" value={resetPass2} onChange={e => setResetPass2(e.target.value)} required style={inputStyle} placeholder="Repetir contraseña" />
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                <button type="submit" disabled={saving} style={btnPrimary}>{saving ? "Guardando..." : "Actualizar"}</button>
                <button type="button" onClick={() => { setResetId(null); setResetPass(""); setResetPass2(""); }} style={btnSecondary}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Users table */}
      <div style={{ background: "#0d1421", border: "1px solid rgba(51,133,255,0.12)" }}>
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 90px 80px 120px",
          padding: "10px 16px", borderBottom: "1px solid rgba(51,133,255,0.1)",
          fontSize: 10, color: "#4a5568", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase",
        }}>
          <span>Email</span>
          <span>Rol</span>
          <span>Estado</span>
          <span style={{ textAlign: "right" }}>Acciones</span>
        </div>

        {loading ? (
          <p style={{ padding: 24, color: "#4a5568", fontSize: 13, textAlign: "center" }}>Cargando...</p>
        ) : users.length === 0 ? (
          <p style={{ padding: 24, color: "#4a5568", fontSize: 13, textAlign: "center" }}>No hay usuarios. Crea uno con el botón de arriba.</p>
        ) : (
          users.map(user => (
            <div key={user.id} style={{
              display: "grid", gridTemplateColumns: "1fr 90px 80px 120px",
              padding: "12px 16px", borderBottom: "1px solid rgba(51,133,255,0.06)",
              alignItems: "center",
            }}>
              <span style={{ fontSize: 13, color: "#e2eaf5" }}>{user.email}</span>
              <span style={{ fontSize: 11 }}>
                <span style={{
                  padding: "2px 8px",
                  background: user.role === "admin" ? "rgba(51,133,255,0.15)" : "rgba(100,100,120,0.2)",
                  color: user.role === "admin" ? "#3385ff" : "#8899aa",
                  fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase",
                }}>
                  {user.role === "admin" ? <><Shield size={9} style={{ display: "inline", marginRight: 4 }} />admin</> : "editor"}
                </span>
              </span>
              <span style={{ fontSize: 11 }}>
                <span style={{
                  padding: "2px 8px",
                  background: user.active ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)",
                  color: user.active ? "#4ade80" : "#f87171",
                  fontWeight: 600, letterSpacing: "0.06em",
                }}>
                  {user.active ? "activo" : "inactivo"}
                </span>
              </span>
              <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                <button
                  title="Resetear contraseña"
                  onClick={() => setResetId(user.id)}
                  style={{ background: "none", border: "1px solid rgba(51,133,255,0.2)", color: "#3385ff", padding: "4px 8px", cursor: "pointer" }}
                >
                  <KeyRound size={13} />
                </button>
                <button
                  title={user.active ? "Desactivar" : "Activar"}
                  onClick={() => toggleActive(user)}
                  style={{ background: "none", border: "1px solid rgba(100,120,100,0.2)", color: user.active ? "#4ade80" : "#f87171", padding: "4px 8px", cursor: "pointer" }}
                >
                  {user.active ? <UserX size={13} /> : <UserCheck size={13} />}
                </button>
                <button
                  title="Eliminar"
                  onClick={() => deleteUser(user)}
                  style={{ background: "none", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171", padding: "4px 8px", cursor: "pointer" }}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
