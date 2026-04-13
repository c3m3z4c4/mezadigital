"use client";

import { useEffect, useState } from "react";
import { useCrmStore } from "@/stores/crmStore";
import { useAuthStore } from "@/stores/authStore";
import { type Invoice } from "@/lib/api/crm";
import { Plus, Trash2, Pencil, X, Mail } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  borrador: "#8899aa",
  enviada:  "#3385ff",
  pagada:   "#10b981",
  vencida:  "#ef4444",
};
const STATUS_LABELS: Record<string, string> = {
  borrador: "Borrador",
  enviada:  "Enviada",
  pagada:   "Pagada",
  vencida:  "Vencida",
};

const fmt = (n: number, cur = "MXN") =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: cur }).format(n);

function timeStr(d: string) { return new Date(d).toLocaleDateString("es-MX"); }

export default function InvoicesPage() {
  const token = useAuthStore(s => s.token)!;
  const { invoices, loading, saving, fetchAll, saveInvoice, deleteInvoice, setInvoiceStatus } = useCrmStore();
  const [editing, setEditing]   = useState<Invoice | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter]     = useState("all");

  useEffect(() => { fetchAll(token); }, []);

  const filtered = filter === "all" ? invoices : invoices.filter(i => i.status === filter);
  const totalPaid    = invoices.filter(i => i.status === "pagada").reduce((s, i) => s + i.amount, 0);
  const totalPending = invoices.filter(i => i.status === "enviada" || i.status === "vencida").reduce((s, i) => s + i.amount, 0);

  async function handleSave(data: Partial<Invoice>) {
    try { await saveInvoice(data, editing?.id, token); setShowForm(false); setEditing(null); }
    catch { /* toast en store */ }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 1000 }}>
      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
        {[
          { label: "Cobrado",         value: fmt(totalPaid),    color: "#10b981" },
          { label: "Por cobrar",      value: fmt(totalPending), color: "#f59e0b" },
          { label: "Total facturas",  value: invoices.length,   color: "#3385ff" },
        ].map(c => (
          <div key={c.label} style={{ background: "#0d1421", border: "1px solid rgba(51,133,255,0.14)", padding: "16px 20px" }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: c.color, fontFamily: "var(--font-display)" }}>{loading ? "—" : c.value}</div>
            <div style={{ fontSize: 9, letterSpacing: "0.16em", color: "#8899aa", textTransform: "uppercase", marginTop: 4 }}>{c.label}</div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 6 }}>
          {["all", "borrador", "enviada", "pagada", "vencida"].map(f => (
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
          <Plus size={13} /> Nueva factura
        </button>
      </div>

      {loading && <p style={{ color: "#8899aa", fontSize: 13 }}>Cargando…</p>}
      {!loading && filtered.length === 0 && <p style={{ color: "#4a5568", fontSize: 13 }}>Sin facturas.</p>}

      {/* Table */}
      <div style={{ background: "#0d1421", border: "1px solid rgba(51,133,255,0.14)" }}>
        {filtered.map((inv, i) => (
          <div key={inv.id} style={{
            display: "grid", gridTemplateColumns: "80px 1fr 1fr 100px 120px auto",
            alignItems: "center", gap: 14, padding: "14px 20px",
            borderBottom: i < filtered.length - 1 ? "1px solid rgba(51,133,255,0.08)" : "none",
          }}>
            <span style={{ fontSize: 11, color: "#3385ff", fontWeight: 600 }}>{inv.number}</span>
            <div>
              <div style={{ fontSize: 13, color: "#e2eaf5", fontWeight: 500 }}>{inv.clientName}</div>
              {inv.clientEmail && <div style={{ fontSize: 10, color: "#4a5568" }}>{inv.clientEmail}</div>}
            </div>
            <div style={{ fontSize: 12, color: "#8899aa", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {inv.concept}
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#e2eaf5" }}>{fmt(inv.amount, inv.currency)}</div>
              {inv.dueDate && <div style={{ fontSize: 9, color: "#4a5568" }}>Vence: {inv.dueDate}</div>}
            </div>
            <select
              value={inv.status}
              onChange={e => setInvoiceStatus(inv.id, e.target.value, token)}
              style={{
                background: "rgba(51,133,255,0.08)", border: `1px solid ${STATUS_COLORS[inv.status] || "#8899aa"}40`,
                color: STATUS_COLORS[inv.status] || "#8899aa", fontSize: 10, padding: "4px 8px", cursor: "pointer",
              }}
            >
              {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
            <div style={{ display: "flex", gap: 4 }}>
              {inv.clientEmail && <a href={`mailto:${inv.clientEmail}?subject=Factura ${inv.number}`} style={{ ...iconBtn, textDecoration: "none" }}><Mail size={13} /></a>}
              <button onClick={() => { setEditing(inv); setShowForm(true); }} style={iconBtn}><Pencil size={13} /></button>
              <button onClick={async () => { if (!confirm("¿Eliminar?")) return; await deleteInvoice(inv.id, token); }} style={{ ...iconBtn, color: "#ef4444" }}><Trash2 size={13} /></button>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <Modal title={editing ? "Editar factura" : "Nueva factura"} onClose={() => { setShowForm(false); setEditing(null); }}>
          <InvoiceForm initial={editing} saving={saving} onSave={handleSave} onCancel={() => { setShowForm(false); setEditing(null); }} />
        </Modal>
      )}
    </div>
  );
}

function InvoiceForm({ initial, saving, onSave, onCancel }: {
  initial: Invoice | null; saving: boolean;
  onSave: (d: Partial<Invoice>) => void; onCancel: () => void;
}) {
  const [form, setForm] = useState({
    number:      initial?.number      || "",
    clientName:  initial?.clientName  || "",
    clientEmail: initial?.clientEmail || "",
    concept:     initial?.concept     || "",
    amount:      initial?.amount?.toString() || "0",
    currency:    initial?.currency    || "MXN",
    status:      initial?.status      || "borrador",
    dueDate:     initial?.dueDate     || "",
    issuedAt:    initial?.issuedAt    || "",
    notes:       initial?.notes       || "",
  });
  const f = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setForm(p => ({ ...p, [k]: e.target.value }));

  return (
    <form onSubmit={e => { e.preventDefault(); onSave({ ...form, amount: parseFloat(form.amount) || 0 }); }} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <FField label="No. Factura"><input value={form.number} onChange={f("number")} style={fieldStyle} placeholder="INV-0001" /></FField>
        <FField label="Estado">
          <select value={form.status} onChange={f("status")} style={fieldStyle}>
            {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </FField>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <FField label="Cliente"><input value={form.clientName} onChange={f("clientName")} style={fieldStyle} required /></FField>
        <FField label="Email cliente"><input value={form.clientEmail} onChange={f("clientEmail")} type="email" style={fieldStyle} /></FField>
      </div>
      <FField label="Concepto"><input value={form.concept} onChange={f("concept")} style={fieldStyle} required /></FField>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <FField label="Monto"><input value={form.amount} onChange={f("amount")} type="number" style={fieldStyle} min="0" step="0.01" /></FField>
        <FField label="Moneda">
          <select value={form.currency} onChange={f("currency")} style={fieldStyle}>
            <option value="MXN">MXN</option>
            <option value="USD">USD</option>
          </select>
        </FField>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <FField label="Fecha emisión"><input value={form.issuedAt} onChange={f("issuedAt")} type="date" style={fieldStyle} /></FField>
        <FField label="Fecha vencimiento"><input value={form.dueDate} onChange={f("dueDate")} type="date" style={fieldStyle} /></FField>
      </div>
      <FField label="Notas"><textarea value={form.notes} onChange={f("notes")} style={{ ...fieldStyle, resize: "vertical" }} rows={2} /></FField>
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
      <div style={{ background: "#0d1421", border: "1px solid rgba(51,133,255,0.2)", width: "100%", maxWidth: 560, maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
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
