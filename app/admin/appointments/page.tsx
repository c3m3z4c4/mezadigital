"use client";

import { useEffect, useState } from "react";
import { useCrmStore } from "@/stores/crmStore";
import { useAuthStore } from "@/stores/authStore";
import { type Appointment } from "@/lib/api/crm";
import { Plus, Trash2, Pencil, X, Mail } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  pendiente:   "#f59e0b",
  confirmada:  "#10b981",
  cancelada:   "#ef4444",
};
const STATUS_LABELS: Record<string, string> = {
  pendiente:  "Pendiente",
  confirmada: "Confirmada",
  cancelada:  "Cancelada",
};

const TOPICS = [
  "Consulta general", "Propuesta de proyecto", "Soporte técnico",
  "Seguimiento de proyecto", "Demo / presentación", "Otro",
];

export default function AppointmentsPage() {
  const token = useAuthStore(s => s.token)!;
  const { appointments, loading, saving, fetchAll, saveAppointment, deleteAppointment, setAppointmentStatus } = useCrmStore();
  const [editing, setEditing]   = useState<Appointment | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter]     = useState("all");

  useEffect(() => { fetchAll(token); }, []);

  const today = new Date().toISOString().slice(0, 10);
  const filtered = filter === "all"
    ? appointments
    : filter === "proximas"
      ? appointments.filter(a => a.date >= today && a.status !== "cancelada")
      : appointments.filter(a => a.status === filter);

  async function handleSave(data: Partial<Appointment>) {
    try { await saveAppointment(data, editing?.id, token); setShowForm(false); setEditing(null); }
    catch { /* toast en store */ }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 900 }}>
      {/* Toolbar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 6 }}>
          {["all", "proximas", "pendiente", "confirmada", "cancelada"].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: "5px 12px", fontSize: 10, letterSpacing: "0.1em", cursor: "pointer",
              background: filter === f ? "rgba(51,133,255,0.15)" : "none",
              border: `1px solid ${filter === f ? "rgba(51,133,255,0.4)" : "rgba(51,133,255,0.14)"}`,
              color: filter === f ? "#e2eaf5" : "#8899aa", textTransform: "uppercase",
            }}>
              {f === "all" ? "Todas" : f === "proximas" ? "Próximas" : STATUS_LABELS[f]}
            </button>
          ))}
        </div>
        <button onClick={() => { setEditing(null); setShowForm(true); }} style={addBtn}>
          <Plus size={13} /> Nueva reunión
        </button>
      </div>

      {loading && <p style={{ color: "#8899aa", fontSize: 13 }}>Cargando…</p>}
      {!loading && filtered.length === 0 && <p style={{ color: "#4a5568", fontSize: 13 }}>Sin reuniones.</p>}

      {/* List */}
      <div style={{ background: "#0d1421", border: "1px solid rgba(51,133,255,0.14)" }}>
        {filtered.map((a, i) => {
          const isPast = a.date < today;
          return (
            <div key={a.id} style={{
              display: "grid", gridTemplateColumns: "100px 1fr 1fr 120px auto",
              alignItems: "center", gap: 14, padding: "14px 20px",
              borderBottom: i < filtered.length - 1 ? "1px solid rgba(51,133,255,0.08)" : "none",
              opacity: isPast && a.status !== "cancelada" ? 0.7 : 1,
            }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: isPast ? "#8899aa" : "#e2eaf5" }}>
                  {new Date(a.date + "T12:00:00").toLocaleDateString("es-MX", { day: "numeric", month: "short" })}
                </div>
                {a.time && <div style={{ fontSize: 10, color: "#4a5568" }}>{a.time}</div>}
              </div>
              <div>
                <div style={{ fontSize: 13, color: "#e2eaf5", fontWeight: 500 }}>{a.name}</div>
                <div style={{ fontSize: 11, color: "#4a5568" }}>{a.email}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: "#8899aa" }}>{a.topic}</div>
                {a.notes && <div style={{ fontSize: 10, color: "#4a5568", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.notes}</div>}
              </div>
              <select
                value={a.status}
                onChange={e => setAppointmentStatus(a.id, e.target.value, token)}
                style={{
                  background: "rgba(51,133,255,0.08)", border: `1px solid ${STATUS_COLORS[a.status] || "#8899aa"}40`,
                  color: STATUS_COLORS[a.status] || "#8899aa", fontSize: 10, padding: "4px 8px", cursor: "pointer",
                }}
              >
                {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
              <div style={{ display: "flex", gap: 4 }}>
                <a href={`mailto:${a.email}?subject=Reunión: ${a.topic}`} style={{ ...iconBtn, textDecoration: "none" }}><Mail size={13} /></a>
                <button onClick={() => { setEditing(a); setShowForm(true); }} style={iconBtn}><Pencil size={13} /></button>
                <button onClick={async () => { if (!confirm("¿Eliminar?")) return; await deleteAppointment(a.id, token); }} style={{ ...iconBtn, color: "#ef4444" }}><Trash2 size={13} /></button>
              </div>
            </div>
          );
        })}
      </div>

      {showForm && (
        <Modal title={editing ? "Editar reunión" : "Nueva reunión"} onClose={() => { setShowForm(false); setEditing(null); }}>
          <AppointmentForm initial={editing} saving={saving} onSave={handleSave} onCancel={() => { setShowForm(false); setEditing(null); }} />
        </Modal>
      )}
    </div>
  );
}

function AppointmentForm({ initial, saving, onSave, onCancel }: {
  initial: Appointment | null; saving: boolean;
  onSave: (d: Partial<Appointment>) => void; onCancel: () => void;
}) {
  const [form, setForm] = useState({
    name:   initial?.name   || "",
    email:  initial?.email  || "",
    date:   initial?.date   || "",
    time:   initial?.time   || "",
    topic:  initial?.topic  || TOPICS[0],
    notes:  initial?.notes  || "",
    status: initial?.status || "pendiente",
  });
  const f = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setForm(p => ({ ...p, [k]: e.target.value }));

  return (
    <form onSubmit={e => { e.preventDefault(); onSave(form); }} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <FField label="Nombre"><input value={form.name} onChange={f("name")} style={fieldStyle} required /></FField>
        <FField label="Email"><input value={form.email} onChange={f("email")} type="email" style={fieldStyle} required /></FField>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <FField label="Fecha"><input value={form.date} onChange={f("date")} type="date" style={fieldStyle} required /></FField>
        <FField label="Hora (opcional)"><input value={form.time} onChange={f("time")} type="time" style={fieldStyle} /></FField>
      </div>
      <FField label="Motivo">
        <select value={form.topic} onChange={f("topic")} style={fieldStyle}>
          {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </FField>
      <FField label="Notas"><textarea value={form.notes} onChange={f("notes")} style={{ ...fieldStyle, resize: "vertical" }} rows={3} /></FField>
      <FField label="Estado">
        <select value={form.status} onChange={f("status")} style={fieldStyle}>
          {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </FField>
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", paddingTop: 4 }}>
        <button type="button" onClick={onCancel} style={secBtn}>Cancelar</button>
        <button type="submit" disabled={saving} style={primaryBtn}>{saving ? "Guardando…" : "Guardar"}</button>
      </div>
    </form>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(6,10,18,0.8)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, overflowY: "auto" }}>
      <div style={{ background: "#0d1421", border: "1px solid rgba(51,133,255,0.2)", width: "100%", maxWidth: 520, maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "18px 24px", borderBottom: "1px solid rgba(51,133,255,0.14)", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
          <span style={{ fontSize: 11, letterSpacing: "0.18em", color: "#e2eaf5", textTransform: "uppercase" }}>{title}</span>
          <button onClick={onClose} style={iconBtn}><X size={15} /></button>
        </div>
        <div style={{ padding: 24, overflowY: "auto" }}>{children}</div>
      </div>
    </div>
  );
}

function FField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ fontSize: "9.5px", letterSpacing: "0.22em", color: "#8899aa", textTransform: "uppercase", display: "block", marginBottom: 4 }}>{label}</label>
      {children}
    </div>
  );
}

const addBtn: React.CSSProperties     = { display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", background: "rgba(51,133,255,0.1)", border: "1px solid rgba(51,133,255,0.3)", color: "#e2eaf5", fontSize: 11, letterSpacing: "0.1em", cursor: "pointer" };
const iconBtn: React.CSSProperties    = { background: "none", border: "none", color: "#8899aa", cursor: "pointer", padding: 4, display: "flex", alignItems: "center" };
const secBtn: React.CSSProperties     = { padding: "8px 16px", background: "none", border: "1px solid rgba(51,133,255,0.2)", color: "#8899aa", fontSize: 12, cursor: "pointer" };
const primaryBtn: React.CSSProperties = { padding: "8px 20px", background: "#3385ff", border: "none", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer" };
const fieldStyle: React.CSSProperties = { width: "100%", padding: "9px 11px", background: "#111827", border: "1px solid rgba(51,133,255,0.2)", color: "#e2eaf5", fontSize: 12, outline: "none", boxSizing: "border-box" };
