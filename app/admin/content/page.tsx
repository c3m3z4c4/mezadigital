"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useContentStore } from "@/stores/contentStore";
import { toast } from "sonner";
import { Save, RefreshCw, Plus, Trash2, ExternalLink, Eye, EyeOff } from "lucide-react";

// ── Client logos ─────────────────────────────────────────────
interface ClientLogo { id: string; name: string; logo?: string; url?: string; visible: boolean; order: number; }

// ── CMS sections ─────────────────────────────────────────────
const SECTIONS = [
  {
    id: "hero",
    label: "Hero — Portada",
    fields: [
      { key: "hero.line1_es",  label: "Línea 1 (ES)",       placeholder: "Desarrollo web" },
      { key: "hero.line1_en",  label: "Line 1 (EN)",         placeholder: "Creative dev" },
      { key: "hero.line2_es",  label: "Línea 2 en azul (ES)", placeholder: "para tu negocio" },
      { key: "hero.line2_en",  label: "Line 2 in blue (EN)",  placeholder: "for your business" },
      { key: "hero.sub_es",    label: "Subtítulo (ES)",       placeholder: "Somos un equipo…", textarea: true },
      { key: "hero.sub_en",    label: "Subtitle (EN)",         placeholder: "We are a team…",   textarea: true },
      { key: "hero.cta1_es",   label: "Botón primario (ES)", placeholder: "Contáctanos" },
      { key: "hero.cta1_en",   label: "Primary button (EN)", placeholder: "Contact us" },
      { key: "hero.cta2_es",   label: "Botón secundario (ES)", placeholder: "Proyectos" },
      { key: "hero.cta2_en",   label: "Secondary button (EN)", placeholder: "Projects" },
    ],
  },
  {
    id: "about",
    label: "Nosotros",
    fields: [
      { key: "about.label_es",  label: "Etiqueta (ES)",    placeholder: "Quiénes somos" },
      { key: "about.label_en",  label: "Label (EN)",        placeholder: "Who we are" },
      { key: "about.title_es",  label: "Título (ES)",       placeholder: "Tecnología que impulsa resultados" },
      { key: "about.title_en",  label: "Title (EN)",         placeholder: "Technology that drives results" },
      { key: "about.body_es",   label: "Cuerpo (ES)",       placeholder: "Descripción larga…", textarea: true },
      { key: "about.body_en",   label: "Body (EN)",          placeholder: "Long description…",  textarea: true },
      { key: "about.stat1v",    label: "Estadística 1 — valor", placeholder: "+10" },
      { key: "about.stat1l_es", label: "Estadística 1 — etiqueta (ES)", placeholder: "Años de experiencia" },
      { key: "about.stat1l_en", label: "Stat 1 — label (EN)",           placeholder: "Years of experience" },
      { key: "about.stat2v",    label: "Estadística 2 — valor", placeholder: "+30" },
      { key: "about.stat2l_es", label: "Estadística 2 — etiqueta (ES)", placeholder: "Proyectos entregados" },
      { key: "about.stat2l_en", label: "Stat 2 — label (EN)",           placeholder: "Projects delivered" },
      { key: "about.stat3v",    label: "Estadística 3 — valor", placeholder: "100%" },
      { key: "about.stat3l_es", label: "Estadística 3 — etiqueta (ES)", placeholder: "Enfoque en resultados" },
      { key: "about.stat3l_en", label: "Stat 3 — label (EN)",           placeholder: "Results-driven" },
    ],
  },
  {
    id: "contact",
    label: "Contacto",
    fields: [
      { key: "contact.title_es", label: "Título (ES)", placeholder: "Trabajemos juntos" },
      { key: "contact.title_en", label: "Title (EN)",  placeholder: "Let's work together" },
      { key: "contact.sub_es",   label: "Subtítulo (ES)", placeholder: "¿Tienes un proyecto…", textarea: true },
      { key: "contact.sub_en",   label: "Subtitle (EN)",  placeholder: "Have a project…",      textarea: true },
    ],
  },
];

export default function ContentPage() {
  const token = useAuthStore(s => s.token)!;
  const { content, fetch: fetchContent, set: saveContent } = useContentStore();

  const [form, setForm]       = useState<Record<string, string>>({});
  const [dirty, setDirty]     = useState<Set<string>>(new Set());
  const [saving, setSaving]   = useState(false);
  const [activeSection, setActiveSection] = useState("hero");

  // Clients state
  const [clients, setClients]         = useState<ClientLogo[]>([]);
  const [clientForm, setClientForm]   = useState({ name: "", logo: "", url: "" });
  const [editClient, setEditClient]   = useState<ClientLogo | null>(null);
  const [savingClient, setSavingClient] = useState(false);

  const loadClients = useCallback(async () => {
    const res = await fetch("/api/clients", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) setClients(await res.json());
  }, [token]);

  useEffect(() => { fetchContent(); loadClients(); }, [fetchContent, loadClients]);

  // Sync form with store
  useEffect(() => {
    setForm(prev => ({ ...content, ...prev }));
  }, [content]);

  function handleChange(key: string, value: string) {
    setForm(p => ({ ...p, [key]: value }));
    setDirty(p => new Set(p).add(key));
  }

  async function handleSaveSection(sectionId: string) {
    const section = SECTIONS.find(s => s.id === sectionId);
    if (!section) return;
    const keys = section.fields.map(f => f.key).filter(k => dirty.has(k));
    if (keys.length === 0) { toast.info("Sin cambios"); return; }
    const updates: Record<string, string> = {};
    keys.forEach(k => { updates[k] = form[k] ?? ""; });
    setSaving(true);
    try {
      await saveContent(updates, token);
      setDirty(prev => { const n = new Set(prev); keys.forEach(k => n.delete(k)); return n; });
      toast.success("Contenido guardado");
    } catch { toast.error("Error al guardar"); }
    finally { setSaving(false); }
  }

  async function handleSaveClient() {
    setSavingClient(true);
    try {
      if (editClient) {
        await fetch(`/api/clients/${editClient.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(clientForm),
        });
      } else {
        await fetch("/api/clients", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(clientForm),
        });
      }
      await loadClients();
      setClientForm({ name: "", logo: "", url: "" });
      setEditClient(null);
      toast.success(editClient ? "Cliente actualizado" : "Cliente agregado");
    } catch { toast.error("Error al guardar cliente"); }
    finally { setSavingClient(false); }
  }

  async function handleDeleteClient(id: string) {
    if (!confirm("¿Eliminar este cliente?")) return;
    await fetch(`/api/clients/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    await loadClients();
    toast.success("Cliente eliminado");
  }

  async function handleToggleVisible(c: ClientLogo) {
    await fetch(`/api/clients/${c.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ visible: !c.visible }),
    });
    await loadClients();
  }

  const currentSection = SECTIONS.find(s => s.id === activeSection);
  const sectionDirtyCount = currentSection?.fields.filter(f => dirty.has(f.key)).length ?? 0;

  return (
    <div style={{ display: "flex", gap: 24, maxWidth: 1200, alignItems: "flex-start" }}>
      {/* Sidebar nav */}
      <div style={{ width: 180, flexShrink: 0, display: "flex", flexDirection: "column", gap: 2 }}>
        {[...SECTIONS, { id: "clients", label: "Clientes" }].map(s => (
          <button key={s.id} onClick={() => setActiveSection(s.id)} style={{
            padding: "9px 14px", fontSize: 11, letterSpacing: "0.08em", textAlign: "left",
            background: activeSection === s.id ? "rgba(51,133,255,0.12)" : "none",
            border: `1px solid ${activeSection === s.id ? "rgba(51,133,255,0.3)" : "rgba(51,133,255,0.1)"}`,
            color: activeSection === s.id ? "#e2eaf5" : "#8899aa",
            cursor: "pointer", transition: "all 0.15s",
          }}>
            {s.label}
          </button>
        ))}
        <a href="/" target="_blank" rel="noopener noreferrer" style={{
          marginTop: 8, display: "flex", alignItems: "center", gap: 6,
          padding: "8px 14px", fontSize: 10, color: "#4a5568", textDecoration: "none",
          border: "1px solid rgba(51,133,255,0.08)",
        }}>
          <ExternalLink size={11} /> Ver landing
        </a>
      </div>

      {/* Content area */}
      <div style={{ flex: 1 }}>
        {activeSection !== "clients" && currentSection && (
          <div style={{ background: "#0d1421", border: "1px solid rgba(51,133,255,0.14)" }}>
            <div style={{
              padding: "14px 20px", borderBottom: "1px solid rgba(51,133,255,0.1)",
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <span style={{ fontSize: 11, letterSpacing: "0.18em", color: "#e2eaf5", textTransform: "uppercase" }}>
                {currentSection.label}
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {sectionDirtyCount > 0 && (
                  <span style={{ fontSize: 9, color: "#f59e0b", letterSpacing: "0.1em" }}>
                    {sectionDirtyCount} cambio{sectionDirtyCount > 1 ? "s" : ""}
                  </span>
                )}
                <button onClick={() => { fetchContent(); setDirty(new Set()); }} style={iconBtn} title="Recargar">
                  <RefreshCw size={12} />
                </button>
                <button onClick={() => handleSaveSection(activeSection)} disabled={saving || sectionDirtyCount === 0} style={{
                  ...primaryBtn, opacity: sectionDirtyCount === 0 ? 0.4 : 1,
                  display: "flex", alignItems: "center", gap: 6,
                }}>
                  <Save size={12} /> {saving ? "Guardando…" : "Guardar"}
                </button>
              </div>
            </div>
            <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
              {currentSection.fields.map(field => (
                <div key={field.key}>
                  <label style={labelStyle}>
                    {field.label}
                    {dirty.has(field.key) && <span style={{ color: "#f59e0b", marginLeft: 6 }}>●</span>}
                  </label>
                  {field.textarea ? (
                    <textarea
                      value={form[field.key] ?? ""}
                      onChange={e => handleChange(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      rows={3}
                      style={{ ...inputStyle, resize: "vertical" }}
                    />
                  ) : (
                    <input
                      value={form[field.key] ?? ""}
                      onChange={e => handleChange(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      style={inputStyle}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSection === "clients" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Add/Edit client form */}
            <div style={{ background: "#0d1421", border: "1px solid rgba(51,133,255,0.14)" }}>
              <div style={{ padding: "14px 20px", borderBottom: "1px solid rgba(51,133,255,0.1)" }}>
                <span style={{ fontSize: 11, letterSpacing: "0.18em", color: "#e2eaf5", textTransform: "uppercase" }}>
                  {editClient ? "Editar cliente" : "Agregar cliente"}
                </span>
              </div>
              <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={labelStyle}>Nombre *</label>
                    <input value={clientForm.name} onChange={e => setClientForm(p => ({ ...p, name: e.target.value }))}
                      placeholder="Empresa cliente" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Logo (URL o /assets/…)</label>
                    <input value={clientForm.logo} onChange={e => setClientForm(p => ({ ...p, logo: e.target.value }))}
                      placeholder="/assets/clientes/logo.png" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Sitio web</label>
                    <input value={clientForm.url} onChange={e => setClientForm(p => ({ ...p, url: e.target.value }))}
                      placeholder="https://cliente.com" style={inputStyle} />
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={handleSaveClient} disabled={savingClient || !clientForm.name} style={{
                    ...primaryBtn, display: "flex", alignItems: "center", gap: 6,
                    opacity: !clientForm.name ? 0.4 : 1,
                  }}>
                    <Plus size={12} /> {savingClient ? "Guardando…" : editClient ? "Actualizar" : "Agregar"}
                  </button>
                  {editClient && (
                    <button onClick={() => { setEditClient(null); setClientForm({ name: "", logo: "", url: "" }); }}
                      style={secBtn}>
                      Cancelar
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Clients list */}
            <div style={{ background: "#0d1421", border: "1px solid rgba(51,133,255,0.14)" }}>
              <div style={{ padding: "14px 20px", borderBottom: "1px solid rgba(51,133,255,0.1)" }}>
                <span style={{ fontSize: 11, letterSpacing: "0.18em", color: "#e2eaf5", textTransform: "uppercase" }}>
                  Clientes actuales ({clients.length})
                </span>
              </div>
              {clients.length === 0 && (
                <p style={{ padding: "16px 20px", color: "#4a5568", fontSize: 12 }}>
                  Sin clientes. Agrega el primero arriba.
                </p>
              )}
              {clients.map((c, i) => (
                <div key={c.id} style={{
                  display: "flex", alignItems: "center", gap: 14, padding: "12px 20px",
                  borderBottom: i < clients.length - 1 ? "1px solid rgba(51,133,255,0.08)" : "none",
                  opacity: c.visible ? 1 : 0.5,
                }}>
                  {c.logo && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={c.logo} alt={c.name} style={{ width: 48, height: 28, objectFit: "contain", filter: "grayscale(1)" }} />
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, color: "#e2eaf5", fontWeight: 500 }}>{c.name}</div>
                    {c.url && <div style={{ fontSize: 10, color: "#4a5568", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.url}</div>}
                  </div>
                  <div style={{ display: "flex", gap: 4 }}>
                    <button onClick={() => handleToggleVisible(c)} style={iconBtn} title={c.visible ? "Ocultar" : "Mostrar"}>
                      {c.visible ? <Eye size={13} /> : <EyeOff size={13} />}
                    </button>
                    <button onClick={() => { setEditClient(c); setClientForm({ name: c.name, logo: c.logo || "", url: c.url || "" }); }}
                      style={iconBtn} title="Editar">
                      ✏️
                    </button>
                    <button onClick={() => handleDeleteClient(c.id)} style={{ ...iconBtn, color: "#ef4444" }} title="Eliminar">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  fontSize: "9.5px", letterSpacing: "0.22em", color: "#8899aa",
  textTransform: "uppercase", display: "block", marginBottom: 5,
};
const inputStyle: React.CSSProperties = {
  width: "100%", padding: "9px 11px", background: "#111827",
  border: "1px solid rgba(51,133,255,0.2)", color: "#e2eaf5",
  fontSize: 12, outline: "none", boxSizing: "border-box",
};
const iconBtn: React.CSSProperties = { background: "none", border: "none", color: "#8899aa", cursor: "pointer", padding: 4, display: "flex", alignItems: "center" };
const secBtn: React.CSSProperties  = { padding: "7px 14px", background: "none", border: "1px solid rgba(51,133,255,0.2)", color: "#8899aa", fontSize: 11, cursor: "pointer" };
const primaryBtn: React.CSSProperties = { padding: "7px 16px", background: "#3385ff", border: "none", color: "#fff", fontSize: 11, fontWeight: 600, cursor: "pointer" };
