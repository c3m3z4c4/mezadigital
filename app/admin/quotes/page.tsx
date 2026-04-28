"use client";

import { useEffect, useState } from "react";
import { useCrmStore } from "@/stores/crmStore";
import { useAuthStore } from "@/stores/authStore";
import { type Quote } from "@/lib/api/crm";
import { Plus, Trash2, Pencil, X, Mail, FileText, MessageCircle, Send } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  pendiente: "#f59e0b",
  revision:  "#3385ff",
  aprobada:  "#10b981",
  rechazada: "#ef4444",
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

function buildEmailBody(q: Quote) {
  return `Estimado/a ${q.name},

Gracias por contactarnos. A continuación encontrará la cotización para su proyecto.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
COTIZACIÓN — MEZA DIGITAL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Cliente: ${q.name}${q.company ? ` · ${q.company}` : ""}
Tipo de proyecto: ${q.projectType || "Web"}
${q.budget ? `Presupuesto estimado: ${q.budget}` : ""}
${q.timeline ? `Tiempo estimado: ${q.timeline}` : ""}
${q.techStack ? `Tecnologías: ${q.techStack}` : ""}

Descripción:
${q.description}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Para proceder o resolver dudas, responda este correo o contáctenos.

Equipo Meza Digital
contacto@mezadigital.com
https://mezadigital.com`;
}

function buildWhatsAppText(q: Quote) {
  const lines = [
    `Hola ${q.name.split(" ")[0]}, soy del equipo *Meza Digital*. 👋`,
    ``,
    `Te comparto la cotización para tu proyecto *${q.projectType || "web"}*:`,
    ``,
    `📋 *Descripción:*`,
    q.description,
    ``,
    q.budget    ? `💰 *Presupuesto estimado:* ${q.budget}` : "",
    q.timeline  ? `⏱ *Tiempo estimado:* ${q.timeline}` : "",
    q.techStack ? `🛠 *Tecnologías:* ${q.techStack}` : "",
    ``,
    `Cualquier duda estamos a tus órdenes. 🙌`,
    ``,
    `*Meza Digital* — https://mezadigital.com`,
  ].filter(l => l !== null && l !== undefined && !(l === "" && false));
  return lines.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

export default function QuotesPage() {
  const token = useAuthStore(s => s.token)!;
  const { quotes, loading, saving, fetchAll, saveQuote, deleteQuote, setQuoteStatus } = useCrmStore();
  const [editing,  setEditing]  = useState<Quote | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [cotiz,    setCotiz]    = useState<Quote | null>(null);
  const [filter,   setFilter]   = useState<string>("all");

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
    <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 1100 }}>
      {/* Toolbar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
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
        {/* Header row */}
        <div style={{
          display: "grid", gridTemplateColumns: "220px 1fr 100px 130px auto",
          padding: "8px 20px", borderBottom: "1px solid rgba(51,133,255,0.14)",
        }}>
          {["Cliente", "Proyecto", "Fecha", "Estado", ""].map((h, i) => (
            <span key={i} style={{ fontSize: 9, letterSpacing: "0.18em", color: "#4a5568", textTransform: "uppercase" }}>{h}</span>
          ))}
        </div>

        {filtered.map((q, i) => (
          <div key={q.id} style={{
            display: "grid", gridTemplateColumns: "220px 1fr 100px 130px auto",
            alignItems: "start", gap: 16, padding: "14px 20px",
            borderBottom: i < filtered.length - 1 ? "1px solid rgba(51,133,255,0.08)" : "none",
          }}>
            {/* Cliente */}
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13, color: "#e2eaf5", fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{q.name}</div>
              <div style={{ fontSize: 11, color: "#4a5568", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{q.email}</div>
              {q.company && <div style={{ fontSize: 10, color: "#4a5568", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{q.company}</div>}
            </div>

            {/* Proyecto */}
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 12, color: "#8899aa", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", lineHeight: 1.5 }}>
                {q.description}
              </div>
              <div style={{ fontSize: 10, color: "#4a5568", marginTop: 4, display: "flex", gap: 6, flexWrap: "wrap" }}>
                {[q.projectType, q.budget, q.timeline].filter(Boolean).map((tag, idx) => (
                  <span key={idx} style={{ background: "rgba(51,133,255,0.08)", padding: "1px 6px", border: "1px solid rgba(51,133,255,0.12)" }}>{tag}</span>
                ))}
              </div>
            </div>

            {/* Fecha */}
            <span style={{ fontSize: 11, color: "#4a5568", paddingTop: 2 }}>{timeStr(q.createdAt)}</span>

            {/* Estado */}
            <select
              value={q.status}
              onChange={e => setQuoteStatus(q.id, e.target.value, token)}
              style={{
                background: "rgba(51,133,255,0.08)", border: `1px solid ${STATUS_COLORS[q.status] || "#8899aa"}40`,
                color: STATUS_COLORS[q.status] || "#8899aa", fontSize: 10, padding: "4px 8px", cursor: "pointer", width: "100%",
              }}
            >
              {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>

            {/* Acciones */}
            <div style={{ display: "flex", gap: 2, paddingTop: 1 }}>
              <button onClick={() => setCotiz(q)} style={{ ...iconBtn, color: "#10b981" }} title="Crear cotización"><FileText size={14} /></button>
              <button onClick={() => { setEditing(q); setShowForm(true); }} style={iconBtn} title="Editar"><Pencil size={13} /></button>
              <button onClick={() => handleDelete(q.id)} style={{ ...iconBtn, color: "#ef4444" }} title="Eliminar"><Trash2 size={13} /></button>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <Modal title={editing ? "Editar propuesta" : "Nueva propuesta"} onClose={() => { setShowForm(false); setEditing(null); }}>
          <QuoteForm initial={editing} saving={saving} onSave={handleSave} onCancel={() => { setShowForm(false); setEditing(null); }} />
        </Modal>
      )}

      {cotiz && (
        <CotizacionModal quote={cotiz} onClose={() => setCotiz(null)} />
      )}
    </div>
  );
}

/* ── Cotización Modal ───────────────────────────────────────── */
function CotizacionModal({ quote: q, onClose }: { quote: Quote; onClose: () => void }) {
  const emailSubject = encodeURIComponent(`Cotización — Proyecto ${q.projectType || "Web"} | Meza Digital`);
  const emailBody    = encodeURIComponent(buildEmailBody(q));
  const waText       = encodeURIComponent(buildWhatsAppText(q));

  const emailHref = `mailto:${q.email}?subject=${emailSubject}&body=${emailBody}`;
  const waHref    = `https://wa.me/?text=${waText}`;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(6,10,18,0.85)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, overflowY: "auto" }}>
      <div style={{ background: "#0d1421", border: "1px solid rgba(51,133,255,0.2)", width: "100%", maxWidth: 640, maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <div style={{ padding: "18px 24px", borderBottom: "1px solid rgba(51,133,255,0.14)", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
          <span style={{ fontSize: 11, letterSpacing: "0.18em", color: "#e2eaf5", textTransform: "uppercase" }}>Cotización</span>
          <button onClick={onClose} style={iconBtn}><X size={15} /></button>
        </div>

        {/* Body */}
        <div style={{ padding: 24, overflowY: "auto", display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Branding */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 900, color: "#e2eaf5", letterSpacing: "-0.02em" }}>meza<span style={{ color: "#3385ff" }}>digital</span></div>
              <div style={{ fontSize: 10, color: "#4a5568", letterSpacing: "0.12em", marginTop: 2 }}>COTIZACIÓN DE PROYECTO</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 10, color: "#4a5568" }}>Fecha</div>
              <div style={{ fontSize: 12, color: "#8899aa" }}>{new Date().toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" })}</div>
            </div>
          </div>

          <div style={{ height: 1, background: "rgba(51,133,255,0.14)" }} />

          {/* Cliente */}
          <div>
            <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "#4a5568", textTransform: "uppercase", marginBottom: 8 }}>Para</div>
            <div style={{ fontSize: 14, color: "#e2eaf5", fontWeight: 500 }}>{q.name}</div>
            {q.company && <div style={{ fontSize: 12, color: "#8899aa" }}>{q.company}</div>}
            <div style={{ fontSize: 12, color: "#3385ff" }}>{q.email}</div>
          </div>

          {/* Detalles */}
          <div style={{ background: "#111827", border: "1px solid rgba(51,133,255,0.12)", padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "#4a5568", textTransform: "uppercase", marginBottom: 4 }}>Detalles del proyecto</div>
            {[
              ["Tipo de proyecto", q.projectType],
              ["Presupuesto estimado", q.budget],
              ["Tiempo de entrega", q.timeline],
              ["Tecnologías", q.techStack],
            ].filter(([, v]) => v).map(([label, val]) => (
              <div key={label} style={{ display: "flex", gap: 12, alignItems: "baseline" }}>
                <span style={{ fontSize: 10, color: "#4a5568", minWidth: 140, flexShrink: 0 }}>{label}</span>
                <span style={{ fontSize: 12, color: "#e2eaf5" }}>{val}</span>
              </div>
            ))}
          </div>

          {/* Descripción */}
          <div>
            <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "#4a5568", textTransform: "uppercase", marginBottom: 8 }}>Alcance del proyecto</div>
            <p style={{ fontSize: 13, color: "#8899aa", lineHeight: 1.7, margin: 0 }}>{q.description}</p>
          </div>

          {q.notes && (
            <div style={{ background: "rgba(243,170,47,0.06)", border: "1px solid rgba(243,170,47,0.2)", padding: "10px 14px" }}>
              <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "#f59e0b", textTransform: "uppercase", marginBottom: 4 }}>Notas internas</div>
              <p style={{ fontSize: 12, color: "#8899aa", margin: 0 }}>{q.notes}</p>
            </div>
          )}

          <div style={{ height: 1, background: "rgba(51,133,255,0.14)" }} />

          {/* Acciones de envío */}
          <div>
            <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "#4a5568", textTransform: "uppercase", marginBottom: 12 }}>Enviar cotización</div>
            <div style={{ display: "flex", gap: 10 }}>
              <a
                href={emailHref}
                style={{
                  flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  padding: "10px 16px", background: "rgba(51,133,255,0.1)", border: "1px solid rgba(51,133,255,0.3)",
                  color: "#3385ff", fontSize: 12, fontWeight: 500, textDecoration: "none", cursor: "pointer",
                }}
              >
                <Mail size={14} /> Enviar por Email
              </a>
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  padding: "10px 16px", background: "rgba(37,211,102,0.1)", border: "1px solid rgba(37,211,102,0.3)",
                  color: "#25d366", fontSize: 12, fontWeight: 500, textDecoration: "none", cursor: "pointer",
                }}
              >
                <MessageCircle size={14} /> Enviar por WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Form ───────────────────────────────────────────────────── */
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
      <FField label="Tech stack deseado">
        <input value={form.techStack} onChange={f("techStack")} style={fieldStyle} placeholder="React, Node.js, PostgreSQL…" />
      </FField>
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
