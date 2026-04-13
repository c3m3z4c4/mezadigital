"use client";

import { useEffect, useState } from "react";
import { useCrmStore } from "@/stores/crmStore";
import { useAuthStore } from "@/stores/authStore";
import { type Message } from "@/lib/api/crm";
import { Trash2, Mail, MailOpen, X } from "lucide-react";

function timeStr(d: string) {
  return new Date(d).toLocaleString("es-MX", { dateStyle: "short", timeStyle: "short" });
}

export default function MessagesPage() {
  const token = useAuthStore(s => s.token)!;
  const { messages, loading, fetchAll, markRead, deleteMessage } = useCrmStore();
  const [selected, setSelected] = useState<Message | null>(null);

  useEffect(() => { fetchAll(token); }, []);

  function open(m: Message) {
    setSelected(m);
    if (!m.read) markRead(m.id, true, token);
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este mensaje?")) return;
    if (selected?.id === id) setSelected(null);
    await deleteMessage(id, token);
  }

  const unread = messages.filter(m => !m.read).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 860 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 11, letterSpacing: "0.2em", color: "#8899aa", textTransform: "uppercase" }}>
          {messages.length} mensajes · {unread} sin leer
        </span>
      </div>

      {loading && <p style={{ color: "#8899aa", fontSize: 13 }}>Cargando…</p>}
      {!loading && messages.length === 0 && (
        <p style={{ color: "#4a5568", fontSize: 13 }}>Sin mensajes todavía.</p>
      )}

      {/* List */}
      <div style={{ background: "#0d1421", border: "1px solid rgba(51,133,255,0.14)" }}>
        {messages.map((m, i) => (
          <div
            key={m.id}
            onClick={() => open(m)}
            style={{
              display: "flex", alignItems: "center", gap: 14, padding: "14px 20px",
              borderBottom: i < messages.length - 1 ? "1px solid rgba(51,133,255,0.08)" : "none",
              cursor: "pointer", transition: "background 0.15s",
              background: selected?.id === m.id ? "rgba(51,133,255,0.07)" : "transparent",
            }}
            onMouseEnter={e => { if (selected?.id !== m.id) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)"; }}
            onMouseLeave={e => { if (selected?.id !== m.id) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
          >
            <span style={{ color: m.read ? "#4a5568" : "#3385ff", flexShrink: 0 }}>
              {m.read ? <MailOpen size={15} /> : <Mail size={15} />}
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 13, color: m.read ? "#8899aa" : "#e2eaf5", fontWeight: m.read ? 400 : 600 }}>{m.name}</span>
                <span style={{ fontSize: 11, color: "#4a5568" }}>{m.email}</span>
                {m.phone && <span style={{ fontSize: 10, color: "#4a5568" }}>{m.phone}</span>}
              </div>
              <div style={{ fontSize: 12, color: "#4a5568", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 500 }}>
                {m.message}
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
              <span style={{ fontSize: 10, color: "#4a5568" }}>{timeStr(m.createdAt)}</span>
              <button onClick={e => { e.stopPropagation(); handleDelete(m.id); }} style={iconBtn}><Trash2 size={13} /></button>
            </div>
          </div>
        ))}
      </div>

      {/* Detail panel */}
      {selected && (
        <div style={{
          background: "#0d1421", border: "1px solid rgba(51,133,255,0.2)",
          padding: "28px 32px", position: "relative",
        }}>
          <button onClick={() => setSelected(null)} style={{ position: "absolute", top: 16, right: 16, ...iconBtn }}><X size={16} /></button>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 16, color: "#e2eaf5", fontWeight: 600, marginBottom: 4 }}>{selected.name}</div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <a href={`mailto:${selected.email}`} style={{ fontSize: 12, color: "#3385ff", textDecoration: "none" }}>{selected.email}</a>
              {selected.phone && <span style={{ fontSize: 12, color: "#8899aa" }}>{selected.phone}</span>}
              <span style={{ fontSize: 11, color: "#4a5568" }}>{timeStr(selected.createdAt)}</span>
            </div>
          </div>
          <div style={{ fontSize: 14, color: "#8899aa", lineHeight: 1.8, whiteSpace: "pre-wrap", borderTop: "1px solid rgba(51,133,255,0.1)", paddingTop: 20 }}>
            {selected.message}
          </div>
          <div style={{ marginTop: 20, display: "flex", gap: 8 }}>
            <a href={`mailto:${selected.email}?subject=Re: Tu mensaje en Meza Digital`} style={{
              padding: "8px 16px", background: "#3385ff", color: "#fff",
              fontSize: 12, fontWeight: 600, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6,
            }}>
              <Mail size={13} /> Responder
            </a>
            <button onClick={() => markRead(selected.id, !selected.read, token)} style={secBtn}>
              {selected.read ? "Marcar sin leer" : "Marcar leído"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const iconBtn: React.CSSProperties = { background: "none", border: "none", color: "#8899aa", cursor: "pointer", padding: 4, display: "flex", alignItems: "center" };
const secBtn: React.CSSProperties  = { padding: "8px 14px", background: "none", border: "1px solid rgba(51,133,255,0.2)", color: "#8899aa", fontSize: 12, cursor: "pointer" };
