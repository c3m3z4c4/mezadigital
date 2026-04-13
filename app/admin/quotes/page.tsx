"use client";

import { useEffect, useState } from "react";
import { useCrmStore } from "@/stores/crmStore";
import { useAuthStore } from "@/stores/authStore";
import { type Quote } from "@/lib/api/crm";
import { Plus, Trash2, Pencil, X, Mail } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  pendiente:  "#f59e0b",
  revision:   "#3385ff",
  aprobada:   "#10b981",
  rechazada:  "#ef4444",
};

const STATUS_LABELS: Record<string, string> = {
  pendiente: "Pendiente",
  revision:  "En revisión",
  aprobada:  "Aprobada",
  rechazada: "Rechazada",
};

const PROJECT_TYPES = ["web", "mobile", "api", "saas", "ecommerce", "desktop", "otro"];
const TIMELINES = ["1-2 semanas", "1 mes", "2-3 meses", "3-6 meses", "6+ meses", "Por definir"];
const BUDGETS   = ["< $5,000 MXN", "$5,000–$20,000", "$20,000–$50,000", "$50,000–$100,000", "$100,000+", "Por definir"];

function timeStr(d: string) { return new Date(d).toLocaleDateString("es-MX"); }

export default function QuotesPage() {
  const token = useAuthStore(s => s.token)!;
  const { quotes, loading, saving, fetchAll, saveQuote, deleteQuote, setQuoteStatus } = useCrmStore();
  const [editing, setEditing]   = useState<Quote | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter]     = useState<string>("all");

  useEffect(() => { fetchAll(token); }, []);

  const filtered = filter === "all" ? quotes : quotes.filter(q => q.status === filter);

  async function handleSave(data: Partial<Quote>) {
    try { await saveQuote(data, editing?.id, token); setShowForm(false); setEditing(null); }
    catch { /* toast en store */ }
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar esta propuesta?")) return;
    await deleteQuote(id, token);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 1000 }}>
      {/* Toolbar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 6 }}>
          {["all", "pendiente", "revision", "aprobada", "rechazada"].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: "5px 12px", fontSize: 10, letterSpacing: "0.1em", cursor: "pointer",
              background: filter === f ? "rgba(51,133,255,0.15)" : "none",
              border: `1px solid ${filter === f ? "rgba(51,133,255,0.4)" : "rgba(51,133,255,0.14)"}`,
              color: filter === f ? "#e2eaf5" : "#8899aa", textTransform: "uppercase",
            }}>
              {f === "all" ? "Todas" : STATUS_LABELS[f]}
            </button>
          ))}
        </div>
        <button onClick={() => { setEditing(null); setShowForm(true); }} style={addBtn}>
          <Plus size={13} /> Nueva propuesta
        </button>
      </div>

      {loading && <p style={{ color: "#8899aa", fontSize: 13 }}>Cargando…</p>}
      {!loading && filtered.length === 0 && <p style={{ color: "#4a5568", fontSize: 13 }}>Sin propuestas.</p>}

      {/* Table */}
      <div style={{ background: "#0d1421", border: "1px solid rgba(51,133,255,0.14)", overflow: "hidden" }}>
        {filtered.map((q, i) => (
          <div key={q.id} style={{
            display: "grid", gridTemplateColumns: "1fr 1fr 100px 120px auto",
            alignItems: "center", gap: 16, padding: "14px 20px",
            borderBottom: i < filtered.length - 1 ? "1px solid rgba(51,133,255,0.08)" : "none",
          }}>
            <div>
              <div style={{ fontSize: 13, color: "#e2eaf5", fontWeight: 500 }}>{q.name}</div>
              <div style={{ fontSize: 11, color: "#4a5568" }}>{q.email}</div>
              {q.company && <div style={{ fontSize: 10, color: "#4a5568" }}>{q.company}</div>}
            </div>
            <div>
              <div style={{ fontSize: 12, color: "#8899aa", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {q.description}
              </div>
              <div style={{ fontSize: 10, color: "#4a5568", marginTop: 2 }}>
                {[q.projectType, q.budget, q.timeline].filter(Boolean).join(" · ")}
              </div>
            </div>
            <span style={{ fontSize: 9, color: "#4a5568" }}>{timeStr(q.createdAt)}</span>
            <select
              value={q.status}
              onChange={e => setQuoteStatus(q.id, e.target.value, token)}
              style={{
                background: "rgba(51,133,255,0.08)", border: `1px solid ${STATUS_COLORS[q.status] || "#8899aa"}40`,
                color: STATUS_COLORS[q.status] || "#8899aa", fontSize: 10, padding: "4px 8px", cursor: "pointer",
              }}
            >
              {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
            <div style={{ display: "flex", gap: 4 }}>
              <a href={`mailto:${q.email}`} style={{ ...iconBtn, textDecoration: "none" }} title="Responder"><Mail size={13} /></a>
              <button onClick={() => { setEditing(q); setShowForm(true); }} style={iconBtn}><Pencil size={13} /></button>
              <button onClick={() => handleDelete(q.id)} style={{ ...iconBtn, color: "#ef4444" }}><Trash2 size={13} /></button>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <Modal title={editing ? "Editar propuesta" : "Nueva propuesta"} onClose={() => { setShowForm(false); setEditing(null); }}>
          <QuoteForm initial={editing} saving={saving} onSave={handleSave} onCancel={() => { setShowForm(false); setEditing(null); }} />
        </Modal>
      )}
    </div>
  );
}

function QuoteForm({ initial, saving, onSave, onCancel }: {
  initial: Quote | null; saving: boolean;
  onSave: (d: Partial<Quote>) => void; onCancel: () => void;
}) {
  const [form, setForm] = useState({
    name:        initial?.name        || "",
    email:       initial?.email       || "",
    company:     initial?.company     || "",
    projectType: initial?.projectType || "web",
    description: initial?.description || "",
    budget:      initial?.budget      || "",
    timeline:    initial?.timeline    || "",
    techStack:   initial?.techStack   || "",
    status:      initial?.status      || "pendiente",
    notes:       initial?.notes       || "",
  });
  const f = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setForm(p => ({ ...p, [k]: e.target.value }));

  return (
    <form onSubmit={e => { e.preventDefault(); onSave(form); }} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <FField label="Nombre"><input value={form.name}    onChange={f("name")}    style={fieldStyle} required /></FField>
        <FField label="Email"><input  value={form.email}   onChange={f("email")}   style={fieldStyle} required type="email" /></FField>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <FField label="Empresa (opcional)"><input value={form.company} onChange={f("company")} style={fieldStyle} /></FField>
        <FField label="Tipo de proyecto">
          <select value={form.projectType} onChange={f("projectType")} style={fieldStyle}>
            {PROJECT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </FField>
      </div>
      <FField label="Descripción del proyecto">
        <textarea value={form.description} onChange={f("description")} style={{ ...fieldStyle, resize: "vertical" }} rows={3} required />
      </FField>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <FField label="Presupuesto estimado">
          <select value={form.budget} onChange={f("budget")} style={fieldStyle}>
            <option value="">—</option>
            {BUDGETS.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </FField>
        <FField label="Tiempo estimado">
          <select value={form.timeline} onChange={f("timeline")} style={fieldStyle}>
            <option value="">—</option>
            {TIMELINES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </FField>
      </div>
      <FField label="Tech stack deseado"><input value={form.techStack} onChange={f("techStack")} style={fieldStyle} placeholder="React, Node.js, PostgreSQL…" /></FField>
      <FField label="Estado">
        <select value={form.status} onChange={f("status")} style={fieldStyle}>
          {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </FField>
      <FField label="Notas internas">
        <textarea value={form.notes} onChange={f("notes")} style={{ ...fieldStyle, resize: "vertical" }} rows={2} />
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
      <div style={{ background: "#0d1421", border: "1px solid rgba(51,133,255,0.2)", width: "100%", maxWidth: 580, maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
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
