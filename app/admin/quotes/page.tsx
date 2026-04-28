"use client";

import { useEffect, useState } from "react";
import { useCrmStore } from "@/stores/crmStore";
import { useAuthStore } from "@/stores/authStore";
import { type Quote, type QuoteItem } from "@/lib/api/crm";
import { Plus, Trash2, Pencil, X, Mail, FileText, MessageCircle, Download } from "lucide-react";

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

async function downloadPDF(quoteId: string, token: string, filename: string) {
  const res = await fetch(`/api/quotes/${quoteId}/pdf`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    return alert("Error al generar el PDF: " + (body.error || res.status));
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}
const BUDGETS   = ["< $5,000 MXN", "$5,000–$20,000", "$20,000–$50,000", "$50,000–$100,000", "$100,000+", "Por definir"];

const IVA = 0.16;

function timeStr(d: string) { return new Date(d).toLocaleDateString("es-MX"); }
function fmt(n: number) { return "$" + n.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

function buildEmailBody(q: Quote) {
  const items: QuoteItem[] = Array.isArray(q.items) ? q.items : [];
  const subtotal = items.reduce((s, it) => s + it.qty * it.unitPrice, 0);
  const total    = subtotal * (1 + IVA);
  const priceBlock = items.length > 0
    ? `\nDESGLOSE DE COSTOS:\n${items.map(it => `  • ${it.description}: ${fmt(it.qty * it.unitPrice)}`).join("\n")}\n\nSubtotal: ${fmt(subtotal)}\nIVA (16%): ${fmt(subtotal * IVA)}\nTotal: ${fmt(total)}\n\n* Precios expresados en MXN, más IVA (16%).`
    : q.price ? `\nPrecio total: ${fmt(q.price)} + IVA (16%)` : "";
  return `Estimado/a ${q.name},

Gracias por contactarnos. A continuación encontrará la cotización para su proyecto.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
COTIZACIÓN — MEZA DIGITAL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Cliente: ${q.name}${q.company ? ` · ${q.company}` : ""}
Tipo de proyecto: ${q.projectType || "Web"}
${q.timeline ? `Tiempo de entrega: ${q.timeline}` : ""}
${q.techStack ? `Tecnologías: ${q.techStack}` : ""}

Descripción:
${q.description}
${priceBlock}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Para proceder o resolver dudas, responda este correo.

Equipo Meza Digital
contacto@mezadigital.com
https://mezadigital.com`;
}

function buildWhatsAppText(q: Quote) {
  const items: QuoteItem[] = Array.isArray(q.items) ? q.items : [];
  const subtotal = items.reduce((s, it) => s + it.qty * it.unitPrice, 0);
  const total    = subtotal * (1 + IVA);
  const priceBlock = items.length > 0
    ? [``, `💰 *Desglose:*`, ...items.map(it => `  • ${it.description}: ${fmt(it.qty * it.unitPrice)}`), ``, `*Total (+ IVA 16%): ${fmt(total)}*`, `_Precios expresados en MXN, más IVA._`]
    : q.price ? [``, `💰 *Precio: ${fmt(q.price)} + IVA (16%)*`] : [];
  return [
    `Hola ${q.name.split(" ")[0]}, soy del equipo *Meza Digital*. 👋`,
    ``,
    `Te comparto la cotización para tu proyecto *${q.projectType || "web"}*:`,
    ``,
    `📋 *Descripción:*`,
    q.description,
    q.timeline ? `\n⏱ *Tiempo estimado:* ${q.timeline}` : "",
    q.techStack ? `🛠 *Tecnologías:* ${q.techStack}` : "",
    ...priceBlock,
    ``,
    `Cualquier duda estamos a tus órdenes. 🙌`,
    `*Meza Digital* — https://mezadigital.com`,
  ].filter(Boolean).join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

/* ── Line items editor ─────────────────────────────────── */
function ItemsEditor({ items, onChange }: { items: QuoteItem[]; onChange: (items: QuoteItem[]) => void }) {
  const add = () => onChange([...items, { description: "", qty: 1, unitPrice: 0 }]);
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));
  const update = (i: number, field: keyof QuoteItem, val: string | number) =>
    onChange(items.map((it, idx) => idx === i ? { ...it, [field]: val } : it));

  const subtotal = items.reduce((s, it) => s + it.qty * it.unitPrice, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {/* Header */}
      {items.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 60px 120px 32px", gap: 6 }}>
          {["Concepto", "Cant.", "Precio unit.", ""].map(h => (
            <span key={h} style={{ fontSize: 8.5, color: "#4a5568", letterSpacing: "0.15em", textTransform: "uppercase" }}>{h}</span>
          ))}
        </div>
      )}
      {items.map((it, i) => (
        <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 60px 120px 32px", gap: 6, alignItems: "center" }}>
          <input
            value={it.description}
            onChange={e => update(i, "description", e.target.value)}
            placeholder="Descripción del concepto"
            style={fieldStyle}
          />
          <input
            type="number" min={1} value={it.qty}
            onChange={e => update(i, "qty", Math.max(1, Number(e.target.value)))}
            style={fieldStyle}
          />
          <input
            type="number" min={0} step={100} value={it.unitPrice}
            onChange={e => update(i, "unitPrice", Number(e.target.value))}
            placeholder="0.00"
            style={fieldStyle}
          />
          <button onClick={() => remove(i)} style={{ ...iconBtn, color: "#ef4444" }}><X size={12} /></button>
        </div>
      ))}

      <button onClick={add} type="button" style={{ ...secBtn, fontSize: 10, padding: "5px 10px", alignSelf: "flex-start" }}>
        + Agregar concepto
      </button>

      {items.length > 0 && (
        <div style={{ background: "rgba(51,133,255,0.06)", border: "1px solid rgba(51,133,255,0.12)", padding: "10px 14px", marginTop: 4, display: "flex", flexDirection: "column", gap: 4 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: 10, color: "#8899aa" }}>Subtotal</span>
            <span style={{ fontSize: 10, color: "#e2eaf5" }}>{fmt(subtotal)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: 10, color: "#8899aa" }}>IVA (16%)</span>
            <span style={{ fontSize: 10, color: "#8899aa" }}>{fmt(subtotal * IVA)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 4, borderTop: "1px solid rgba(51,133,255,0.12)" }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: "#3385ff" }}>Total</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: "#3385ff" }}>{fmt(subtotal * (1 + IVA))}</span>
          </div>
          <span style={{ fontSize: 9, color: "#4a5568", fontStyle: "italic" }}>* Precios expresados en MXN, más IVA (16%).</span>
        </div>
      )}
    </div>
  );
}

/* ── Email Modal ────────────────────────────────────────────── */
function EmailModal({ quote, token, onClose }: { quote: Quote; token: string; onClose: () => void }) {
  const [greeting, setGreeting] = useState(
    `Estimado/a ${quote.name},\n\nEspero que se encuentre muy bien.`
  );
  const [to,       setTo]       = useState(quote.email);
  const [sending,  setSending]  = useState(false);
  const [sent,     setSent]     = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  async function handleSend() {
    setSending(true); setError(null);
    try {
      const res = await fetch(`/api/quotes/${quote.id}/send-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ greeting, to }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Error ${res.status}`);
      }
      setSent(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSending(false);
    }
  }

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1100, background: "rgba(6,10,18,0.88)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ background: "#0d1421", border: "1px solid rgba(51,133,255,0.2)", width: "100%", maxWidth: 500, display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <div style={{ padding: "16px 22px", borderBottom: "1px solid rgba(51,133,255,0.14)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Mail size={14} style={{ color: "#3385ff" }} />
            <span style={{ fontSize: 11, letterSpacing: "0.18em", color: "#e2eaf5", textTransform: "uppercase" }}>Enviar Cotización por Email</span>
          </div>
          <button onClick={onClose} style={iconBtn}><X size={14} /></button>
        </div>

        <div style={{ padding: 22, display: "flex", flexDirection: "column", gap: 16 }}>
          {/* From */}
          <FField label="Remitente">
            <div style={{ ...fieldStyle, color: "#8899aa", cursor: "not-allowed" }}>
              cmeza@mezadigital.com
            </div>
          </FField>

          {/* To */}
          <FField label="Destinatario">
            <input
              type="email" value={to} onChange={e => setTo(e.target.value)}
              style={fieldStyle}
            />
          </FField>

          {/* Greeting */}
          <FField label="Saludo / Mensaje de introducción">
            <textarea
              value={greeting}
              onChange={e => setGreeting(e.target.value)}
              rows={4}
              style={{ ...fieldStyle, resize: "vertical" }}
            />
          </FField>

          {/* Info */}
          <div style={{ fontSize: 10, color: "#4a5568", background: "rgba(51,133,255,0.05)", border: "1px solid rgba(51,133,255,0.1)", padding: "10px 14px" }}>
            Se adjuntará el PDF de la cotización <strong style={{ color: "#8899aa" }}>{"COT-" + quote.id.slice(-6).toUpperCase()}</strong> para <strong style={{ color: "#8899aa" }}>{quote.name}</strong>.
          </div>

          {error && (
            <div style={{ fontSize: 11, color: "#ef4444", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", padding: "10px 14px" }}>
              {error}
            </div>
          )}

          {sent ? (
            <div style={{ fontSize: 12, color: "#10b981", background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", padding: "12px 16px", textAlign: "center" }}>
              Email enviado correctamente a {to}
            </div>
          ) : (
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button onClick={onClose} style={secBtn}>Cancelar</button>
              <button onClick={handleSend} disabled={sending || !to} style={primaryBtn}>
                {sending ? "Enviando…" : "Enviar con PDF"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Cotización Modal ───────────────────────────────────────── */
function CotizacionModal({ quote: initial, token, onClose, onSaved }: {
  quote: Quote; token: string; onClose: () => void; onSaved: (q: Quote) => void;
}) {
  const { saveQuote } = useCrmStore();
  const [items,     setItems]     = useState<QuoteItem[]>(Array.isArray(initial.items) ? initial.items : []);
  const [saving,    setSaving]    = useState(false);
  const [saved,     setSaved]     = useState(false);
  const [showEmail, setShowEmail] = useState(false);

  const q: Quote = { ...initial, items };

  const subtotal = items.reduce((s, it) => s + it.qty * it.unitPrice, 0);

  async function handleSave() {
    setSaving(true);
    try {
      await saveQuote({ items, price: subtotal || null }, initial.id, token);
      setSaved(true);
      onSaved({ ...initial, items, price: subtotal || null });
    } finally { setSaving(false); }
  }

  const emailSubject = encodeURIComponent(`Cotización — Proyecto ${q.projectType || "Web"} | Meza Digital`);
  const emailBody    = encodeURIComponent(buildEmailBody(q));
  const waText       = encodeURIComponent(buildWhatsAppText(q));
  const emailHref    = `mailto:${q.email}?subject=${emailSubject}&body=${emailBody}`;
  const waHref       = `https://wa.me/?text=${waText}`;
  const pdfFileName  = `Cotizacion-MezaDigital-${q.name.replace(/\s+/g, "-")}.pdf`;

  return (
    <>
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(6,10,18,0.85)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, overflowY: "auto" }}>
      <div style={{ background: "#0d1421", border: "1px solid rgba(51,133,255,0.2)", width: "100%", maxWidth: 700, maxHeight: "92vh", display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <div style={{ padding: "18px 24px", borderBottom: "1px solid rgba(51,133,255,0.14)", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 11, letterSpacing: "0.18em", color: "#e2eaf5", textTransform: "uppercase" }}>Cotización</span>
            {saved && <span style={{ fontSize: 10, color: "#10b981", background: "rgba(16,185,129,0.1)", padding: "2px 8px", border: "1px solid rgba(16,185,129,0.3)" }}>Guardada</span>}
          </div>
          <button onClick={onClose} style={iconBtn}><X size={15} /></button>
        </div>

        <div style={{ padding: 24, overflowY: "auto", display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Cliente */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 900, color: "#e2eaf5", letterSpacing: "-0.02em" }}>meza<span style={{ color: "#3385ff" }}>digital</span></div>
              <div style={{ fontSize: 9, color: "#4a5568", letterSpacing: "0.14em", marginTop: 2 }}>COTIZACIÓN DE PROYECTO</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 10, color: "#4a5568" }}>Para</div>
              <div style={{ fontSize: 13, color: "#e2eaf5", fontWeight: 600 }}>{q.name}</div>
              {q.company && <div style={{ fontSize: 11, color: "#8899aa" }}>{q.company}</div>}
              <div style={{ fontSize: 11, color: "#3385ff" }}>{q.email}</div>
            </div>
          </div>

          <div style={{ height: 1, background: "rgba(51,133,255,0.14)" }} />

          {/* Proyecto info */}
          <div style={{ background: "#111827", border: "1px solid rgba(51,133,255,0.12)", padding: 14, display: "flex", gap: 24, flexWrap: "wrap" }}>
            {[
              ["Tipo", q.projectType],
              ["Tiempo", q.timeline],
              ["Tech", q.techStack],
            ].filter(([, v]) => v).map(([k, v]) => (
              <div key={k}>
                <div style={{ fontSize: 8, color: "#4a5568", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 2 }}>{k}</div>
                <div style={{ fontSize: 12, color: "#e2eaf5" }}>{v}</div>
              </div>
            ))}
          </div>

          {/* Descripción */}
          <div>
            <div style={{ fontSize: 9, color: "#4a5568", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 6 }}>Alcance</div>
            <p style={{ fontSize: 12, color: "#8899aa", lineHeight: 1.7, margin: 0 }}>{q.description}</p>
          </div>

          <div style={{ height: 1, background: "rgba(51,133,255,0.14)" }} />

          {/* Desglose de costos */}
          <div>
            <div style={{ fontSize: 9, color: "#4a5568", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 12 }}>Desglose de costos</div>
            <ItemsEditor items={items} onChange={setItems} />
          </div>

          {/* Guardar */}
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button onClick={handleSave} disabled={saving} style={primaryBtn}>
              {saving ? "Guardando…" : "Guardar costos"}
            </button>
          </div>

          <div style={{ height: 1, background: "rgba(51,133,255,0.14)" }} />

          {/* Acciones de envío */}
          <div>
            <div style={{ fontSize: 9, color: "#4a5568", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 12 }}>Enviar / Descargar</div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button onClick={() => setShowEmail(true)} style={{
                flex: 1, minWidth: 140, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                padding: "10px 16px", background: "rgba(51,133,255,0.1)", border: "1px solid rgba(51,133,255,0.3)",
                color: "#3385ff", fontSize: 12, fontWeight: 500, cursor: "pointer",
              }}>
                <Mail size={14} /> Enviar por Email
              </button>
              <a href={waHref} target="_blank" rel="noopener noreferrer" style={{
                flex: 1, minWidth: 140, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                padding: "10px 16px", background: "rgba(37,211,102,0.1)", border: "1px solid rgba(37,211,102,0.3)",
                color: "#25d366", fontSize: 12, fontWeight: 500, textDecoration: "none",
              }}>
                <MessageCircle size={14} /> WhatsApp
              </a>
              <a
                href={`/api/quotes/${q.id}/pdf`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={e => { e.preventDefault(); downloadPDF(q.id, token, pdfFileName); }}
                style={{
                  flex: 1, minWidth: 140, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  padding: "10px 16px", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)",
                  color: "#10b981", fontSize: 12, fontWeight: 500, textDecoration: "none", cursor: "pointer",
                }}
              >
                <Download size={14} /> Descargar PDF
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>

    {showEmail && (
      <EmailModal quote={q} token={token} onClose={() => setShowEmail(false)} />
    )}
    </>
  );
}

/* ── Main page ─────────────────────────────────────────────── */
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
        <div style={{ display: "grid", gridTemplateColumns: "220px 1fr 90px 90px 130px auto", padding: "8px 20px", borderBottom: "1px solid rgba(51,133,255,0.14)" }}>
          {["Cliente", "Proyecto", "Precio", "Fecha", "Estado", ""].map((h, i) => (
            <span key={i} style={{ fontSize: 9, letterSpacing: "0.18em", color: "#4a5568", textTransform: "uppercase" }}>{h}</span>
          ))}
        </div>

        {filtered.map((q, i) => {
          const items: QuoteItem[] = Array.isArray(q.items) ? q.items : [];
          const subtotal = items.reduce((s, it) => s + it.qty * it.unitPrice, 0);
          const priceDisplay = items.length > 0
            ? fmt(subtotal * (1 + IVA))
            : q.price ? fmt(q.price * (1 + IVA)) : "—";

          return (
            <div key={q.id} style={{
              display: "grid", gridTemplateColumns: "220px 1fr 90px 90px 130px auto",
              alignItems: "start", gap: 16, padding: "14px 20px",
              borderBottom: i < filtered.length - 1 ? "1px solid rgba(51,133,255,0.08)" : "none",
            }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13, color: "#e2eaf5", fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{q.name}</div>
                <div style={{ fontSize: 11, color: "#4a5568", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{q.email}</div>
                {q.company && <div style={{ fontSize: 10, color: "#4a5568", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{q.company}</div>}
              </div>

              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 12, color: "#8899aa", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", lineHeight: 1.5 }}>
                  {q.description}
                </div>
                <div style={{ fontSize: 10, color: "#4a5568", marginTop: 4, display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {[q.projectType, q.timeline].filter(Boolean).map((tag, idx) => (
                    <span key={idx} style={{ background: "rgba(51,133,255,0.08)", padding: "1px 6px", border: "1px solid rgba(51,133,255,0.12)" }}>{tag}</span>
                  ))}
                </div>
              </div>

              <div style={{ paddingTop: 2 }}>
                <div style={{ fontSize: 12, color: items.length > 0 || q.price ? "#10b981" : "#4a5568", fontWeight: 500 }}>{priceDisplay}</div>
                {(items.length > 0 || q.price) && <div style={{ fontSize: 9, color: "#4a5568", marginTop: 1 }}>+ IVA</div>}
              </div>

              <span style={{ fontSize: 11, color: "#4a5568", paddingTop: 2 }}>{timeStr(q.createdAt)}</span>

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

              <div style={{ display: "flex", gap: 2, paddingTop: 1 }}>
                <button onClick={() => setCotiz(q)} style={{ ...iconBtn, color: "#10b981" }} title="Cotización / PDF"><FileText size={14} /></button>
                <button onClick={() => { setEditing(q); setShowForm(true); }} style={iconBtn} title="Editar"><Pencil size={13} /></button>
                <button onClick={() => handleDelete(q.id)} style={{ ...iconBtn, color: "#ef4444" }} title="Eliminar"><Trash2 size={13} /></button>
              </div>
            </div>
          );
        })}
      </div>

      {showForm && (
        <Modal title={editing ? "Editar propuesta" : "Nueva propuesta"} onClose={() => { setShowForm(false); setEditing(null); }}>
          <QuoteForm initial={editing} saving={saving} token={token} onSave={handleSave} onCancel={() => { setShowForm(false); setEditing(null); }} />
        </Modal>
      )}

      {cotiz && (
        <CotizacionModal
          quote={cotiz} token={token}
          onClose={() => setCotiz(null)}
          onSaved={updated => setCotiz(updated)}
        />
      )}
    </div>
  );
}

/* ── Form ───────────────────────────────────────────────────── */
function QuoteForm({ initial, saving, token, onSave, onCancel }: {
  initial: Quote | null; saving: boolean; token: string;
  onSave: (d: Partial<Quote>) => void; onCancel: () => void;
}) {
  const [form, setForm] = useState({
    name:        initial?.name        || "",
    email:       initial?.email       || "",
    company:     initial?.company     || "",
    projectType: initial?.projectType || "web",
    description: initial?.description || "",
    timeline:    initial?.timeline    || "",
    techStack:   initial?.techStack   || "",
    status:      initial?.status      || "pendiente",
    notes:       initial?.notes       || "",
  });
  const [items, setItems] = useState<QuoteItem[]>(
    Array.isArray(initial?.items) ? initial.items : []
  );
  const f = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }));

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const subtotal = items.reduce((s, it) => s + it.qty * it.unitPrice, 0);
    onSave({ ...form, items: items.length > 0 ? items : null, price: subtotal || null });
  }

  const subtotal = items.reduce((s, it) => s + it.qty * it.unitPrice, 0);

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <FField label="Nombre"><input value={form.name}  onChange={f("name")}  style={fieldStyle} required /></FField>
        <FField label="Email"><input  value={form.email} onChange={f("email")} style={fieldStyle} required type="email" /></FField>
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
        <FField label="Tiempo estimado">
          <select value={form.timeline} onChange={f("timeline")} style={fieldStyle}>
            <option value="">—</option>
            {TIMELINES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </FField>
        <FField label="Tech stack">
          <input value={form.techStack} onChange={f("techStack")} style={fieldStyle} placeholder="React, Node.js, PostgreSQL…" />
        </FField>
      </div>

      {/* Desglose de costos */}
      <div style={{ borderTop: "1px solid rgba(51,133,255,0.14)", paddingTop: 14 }}>
        <div style={{ fontSize: 9, color: "#4a5568", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 10 }}>Desglose de costos</div>
        <ItemsEditor items={items} onChange={setItems} />
      </div>

      <FField label="Estado">
        <select value={form.status} onChange={f("status")} style={fieldStyle}>
          {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </FField>
      <FField label="Notas internas">
        <textarea value={form.notes} onChange={f("notes")} style={{ ...fieldStyle, resize: "vertical" }} rows={2} />
      </FField>

      <div style={{ display: "flex", gap: 8, justifyContent: "space-between", alignItems: "center", paddingTop: 4, flexWrap: "wrap" }}>
        {/* PDF button — only when there's price data and an existing quote */}
        {initial?.id && subtotal > 0 ? (
          <button
            type="button"
            onClick={() => downloadPDF(initial.id, token, `Cotizacion-MezaDigital-${form.name.replace(/\s+/g, "-")}.pdf`)}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", color: "#10b981", fontSize: 11, fontWeight: 500, cursor: "pointer" }}
          >
            <Download size={13} /> Descargar PDF
          </button>
        ) : <span />}

        <div style={{ display: "flex", gap: 8 }}>
          <button type="button" onClick={onCancel} style={secBtn}>Cancelar</button>
          <button type="submit" disabled={saving} style={primaryBtn}>{saving ? "Guardando…" : "Guardar"}</button>
        </div>
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
