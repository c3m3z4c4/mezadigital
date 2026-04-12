"use client";

import { useState, useEffect } from "react";
import { usePortfolioStore } from "@/stores/portfolioStore";
import { useAuthStore } from "@/stores/authStore";
import { type Project, type Service } from "@/lib/api/portfolio";
import { portfolioApi } from "@/lib/api/portfolio";
import { toast } from "sonner";
import {
  Plus, Trash2, Pencil, X, Upload, Star, Eye, EyeOff, GitBranch, ExternalLink,
} from "lucide-react";

type Tab = "projects" | "services";

const PROJECT_TYPES = ["web", "mobile", "api", "saas", "ecommerce", "desktop", "otro"];

export default function PortfolioPage() {
  const token = useAuthStore((s) => s.token)!;
  const {
    projects, services, loading, saving,
    fetchAll, saveProject, deleteProject, toggleProjectField,
    saveService, deleteService, toggleServiceVisible,
  } = usePortfolioStore();

  const [tab, setTab] = useState<Tab>("projects");
  const [editProject, setEditProject]         = useState<Project | null>(null);
  const [editService, setEditService]         = useState<Service | null>(null);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showServiceForm, setShowServiceForm] = useState(false);

  useEffect(() => { fetchAll(token); }, []);

  async function handleSaveProject(data: Partial<Project>) {
    try {
      await saveProject(data, editProject?.id, token);
      setShowProjectForm(false);
      setEditProject(null);
    } catch { /* toast shown in store */ }
  }

  async function handleDeleteProject(id: string) {
    if (!confirm("¿Eliminar este proyecto?")) return;
    await deleteProject(id, token);
  }

  async function handleSaveService(data: Partial<Service>) {
    try {
      await saveService(data, editService?.id, token);
      setShowServiceForm(false);
      setEditService(null);
    } catch { /* toast shown in store */ }
  }

  async function handleDeleteService(id: string) {
    if (!confirm("¿Eliminar este servicio?")) return;
    await deleteService(id, token);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 1000 }}>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid rgba(51,133,255,0.14)" }}>
        {(["projects", "services"] as Tab[]).map(tb => (
          <button key={tb} onClick={() => setTab(tb)} style={{
            padding: "10px 24px", background: "none", border: "none",
            borderBottom: `2px solid ${tab === tb ? "#3385ff" : "transparent"}`,
            color: tab === tb ? "#e2eaf5" : "#8899aa",
            fontSize: 11, letterSpacing: "0.14em", cursor: "pointer", textTransform: "uppercase",
          }}>
            {tb === "projects" ? "Proyectos" : "Servicios"}
          </button>
        ))}
      </div>

      {/* ── PROJECTS ─────────────────────────────────────────────────────── */}
      {tab === "projects" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 11, letterSpacing: "0.2em", color: "#8899aa", textTransform: "uppercase" }}>
              {projects.length} proyectos
            </span>
            <button onClick={() => { setEditProject(null); setShowProjectForm(true); }} style={addBtn}>
              <Plus size={14} /> Nuevo proyecto
            </button>
          </div>

          {loading && <p style={{ color: "#8899aa", fontSize: 13 }}>Cargando…</p>}
          {!loading && projects.length === 0 && (
            <p style={{ color: "#8899aa", fontSize: 13 }}>Sin proyectos. Crea el primero.</p>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
            {projects.map(p => (
              <div key={p.id} style={{
                background: "#0d1421", border: "1px solid rgba(51,133,255,0.14)", overflow: "hidden",
              }}>
                <div style={{ position: "relative", height: 160, background: "#111827" }}>
                  {p.images?.[0]
                    ? <img src={p.images[0]} alt={p.title_en} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#4a5568", fontSize: 12 }}>Sin imagen</div>
                  }
                  <div style={{ position: "absolute", top: 8, left: 8, display: "flex", gap: 4 }}>
                    {p.featured && <span style={badge("blue")}>★ Destacado</span>}
                    {!p.visible && <span style={badge("gray")}>Oculto</span>}
                  </div>
                </div>
                <div style={{ padding: "14px 16px" }}>
                  <div style={{ fontSize: 13, color: "#e2eaf5", fontWeight: 500, marginBottom: 4 }}>{p.title_es || p.title_en}</div>
                  <div style={{ fontSize: 11, color: "#8899aa", marginBottom: 4 }}>
                    {[p.projectType, p.year].filter(Boolean).join(" · ")}
                  </div>
                  {p.techStack?.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 10 }}>
                      {p.techStack.slice(0, 4).map(t => (
                        <span key={t} style={{ fontSize: 9, padding: "2px 6px", background: "rgba(51,133,255,0.12)", color: "#3385ff", letterSpacing: "0.08em" }}>
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <button onClick={() => toggleProjectField(p.id, "featured", !p.featured, token)} style={iconBtn} title="Destacar">
                      <Star size={14} style={{ fill: p.featured ? "#3385ff" : "none", color: p.featured ? "#3385ff" : "#4a5568" }} />
                    </button>
                    <button onClick={() => toggleProjectField(p.id, "visible", !p.visible, token)} style={iconBtn} title="Visibilidad">
                      {p.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                    </button>
                    {p.githubUrl && <a href={p.githubUrl} target="_blank" rel="noreferrer" style={{ ...iconBtn, textDecoration: "none" }}><GitBranch size={14} /></a>}
                    {p.liveUrl   && <a href={p.liveUrl}   target="_blank" rel="noreferrer" style={{ ...iconBtn, textDecoration: "none" }}><ExternalLink size={14} /></a>}
                    <div style={{ flex: 1 }} />
                    <button onClick={() => { setEditProject(p); setShowProjectForm(true); }} style={iconBtn}><Pencil size={14} /></button>
                    <button onClick={() => handleDeleteProject(p.id)} style={{ ...iconBtn, color: "#ef4444" }}><Trash2 size={14} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── SERVICES ─────────────────────────────────────────────────────── */}
      {tab === "services" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 11, letterSpacing: "0.2em", color: "#8899aa", textTransform: "uppercase" }}>
              {services.length} servicios
            </span>
            <button onClick={() => { setEditService(null); setShowServiceForm(true); }} style={addBtn}>
              <Plus size={14} /> Nuevo servicio
            </button>
          </div>

          {loading && <p style={{ color: "#8899aa", fontSize: 13 }}>Cargando…</p>}
          {!loading && services.length === 0 && (
            <p style={{ color: "#8899aa", fontSize: 13 }}>Sin servicios. Crea el primero.</p>
          )}

          <div style={{ background: "#0d1421", border: "1px solid rgba(51,133,255,0.14)" }}>
            {services.map((s, i) => (
              <div key={s.id} style={{
                display: "flex", alignItems: "center", gap: 16, padding: "14px 20px",
                borderBottom: i < services.length - 1 ? "1px solid rgba(51,133,255,0.1)" : "none",
              }}>
                <div style={{
                  width: 48, height: 48, flexShrink: 0, background: "#111827",
                  display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden",
                }}>
                  {s.image
                    ? <img src={s.image} alt={s.title_es} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : <span style={{ fontSize: 20 }}>{s.icon || "⚙️"}</span>
                  }
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, color: "#e2eaf5", fontWeight: 500 }}>{s.title_es || s.title_en}</div>
                  <div style={{ fontSize: 11, color: "#8899aa", marginTop: 2 }}>{s.title_en}</div>
                  <div style={{ fontSize: 11, color: "#4a5568", marginTop: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {s.description_es}
                  </div>
                </div>
                <button onClick={() => toggleServiceVisible(s.id, !s.visible, token)} style={iconBtn}>
                  {s.visible ? <Eye size={14} /> : <EyeOff size={14} style={{ color: "#4a5568" }} />}
                </button>
                <button onClick={() => { setEditService(s); setShowServiceForm(true); }} style={iconBtn}><Pencil size={14} /></button>
                <button onClick={() => handleDeleteService(s.id)} style={{ ...iconBtn, color: "#ef4444" }}><Trash2 size={14} /></button>
              </div>
            ))}
          </div>
        </div>
      )}

      {showProjectForm && (
        <Modal
          title={editProject ? "Editar proyecto" : "Nuevo proyecto"}
          onClose={() => { setShowProjectForm(false); setEditProject(null); }}
        >
          <ProjectForm
            initial={editProject} saving={saving} token={token}
            onSave={handleSaveProject}
            onCancel={() => { setShowProjectForm(false); setEditProject(null); }}
          />
        </Modal>
      )}

      {showServiceForm && (
        <Modal
          title={editService ? "Editar servicio" : "Nuevo servicio"}
          onClose={() => { setShowServiceForm(false); setEditService(null); }}
        >
          <ServiceForm
            initial={editService} saving={saving} token={token}
            onSave={handleSaveService}
            onCancel={() => { setShowServiceForm(false); setEditService(null); }}
          />
        </Modal>
      )}
    </div>
  );
}

// ── Project Form ──────────────────────────────────────────────────────────────
function ProjectForm({ initial, saving, token, onSave, onCancel }: {
  initial: Project | null; saving: boolean; token: string;
  onSave: (d: Partial<Project>) => void; onCancel: () => void;
}) {
  const [form, setForm] = useState({
    title_en:       initial?.title_en       || "",
    title_es:       initial?.title_es       || "",
    description_en: initial?.description_en || "",
    description_es: initial?.description_es || "",
    projectType:    initial?.projectType    || "web",
    techStack:      initial?.techStack?.join(", ") || "",
    githubUrl:      initial?.githubUrl      || "",
    liveUrl:        initial?.liveUrl        || "",
    client:         initial?.client         || "",
    year:           initial?.year?.toString() || new Date().getFullYear().toString(),
    tags:           initial?.tags?.join(", ") || "",
    images:         initial?.images         || [] as string[],
    newImageUrl:    "",
  });
  const [uploading, setUploading] = useState(false);

  const field = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  function addImageUrl() {
    if (!form.newImageUrl.trim()) return;
    setForm(f => ({ ...f, images: [...f.images, f.newImageUrl.trim()], newImageUrl: "" }));
  }

  function removeImage(i: number) {
    setForm(f => ({ ...f, images: f.images.filter((_, idx) => idx !== i) }));
  }

  async function uploadImage(file: File) {
    setUploading(true);
    try {
      const { path } = await portfolioApi.uploadFile(file, token);
      setForm(f => ({ ...f, images: [...f.images, path] }));
    } catch {
      toast.error("Error al subir imagen");
    } finally {
      setUploading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave({
      title_en:       form.title_en,
      title_es:       form.title_es,
      description_en: form.description_en || undefined,
      description_es: form.description_es || undefined,
      projectType:    form.projectType,
      techStack:      form.techStack.split(",").map(s => s.trim()).filter(Boolean),
      githubUrl:      form.githubUrl || undefined,
      liveUrl:        form.liveUrl   || undefined,
      client:         form.client    || undefined,
      year:           form.year ? parseInt(form.year) : undefined,
      tags:           form.tags.split(",").map(s => s.trim()).filter(Boolean),
      images:         form.images,
    });
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <FField label="Título ES"><input value={form.title_es} onChange={field("title_es")} style={fieldStyle} required placeholder="ej. Tienda en línea" /></FField>
        <FField label="Title EN"><input value={form.title_en} onChange={field("title_en")} style={fieldStyle} placeholder="e.g. Online Store" /></FField>
      </div>
      <FField label="Descripción ES"><textarea value={form.description_es} onChange={field("description_es")} style={{ ...fieldStyle, resize: "vertical" }} rows={3} /></FField>
      <FField label="Description EN"><textarea value={form.description_en} onChange={field("description_en")} style={{ ...fieldStyle, resize: "vertical" }} rows={3} /></FField>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
        <FField label="Tipo">
          <select value={form.projectType} onChange={field("projectType")} style={fieldStyle}>
            {PROJECT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </FField>
        <FField label="Cliente"><input value={form.client} onChange={field("client")} style={fieldStyle} /></FField>
        <FField label="Año"><input type="number" value={form.year} onChange={field("year")} style={fieldStyle} min="2000" max="2035" /></FField>
      </div>

      <FField label="Tech Stack (coma separado)">
        <input value={form.techStack} onChange={field("techStack")} style={fieldStyle} placeholder="React, Next.js, TypeScript, PostgreSQL" />
      </FField>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <FField label="GitHub URL"><input value={form.githubUrl} onChange={field("githubUrl")} style={fieldStyle} placeholder="https://github.com/…" /></FField>
        <FField label="Live URL"><input value={form.liveUrl} onChange={field("liveUrl")} style={fieldStyle} placeholder="https://…" /></FField>
      </div>

      <FField label="Tags (coma separado)">
        <input value={form.tags} onChange={field("tags")} style={fieldStyle} placeholder="ecommerce, react, api" />
      </FField>

      {/* Images */}
      <FField label="Imágenes">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
          {form.images.map((img, i) => (
            <div key={i} style={{ position: "relative", width: 72, height: 72 }}>
              <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", border: "1px solid rgba(51,133,255,0.2)" }} />
              <button type="button" onClick={() => removeImage(i)} style={{
                position: "absolute", top: 2, right: 2, background: "rgba(6,10,18,0.85)",
                border: "none", color: "#e2eaf5", cursor: "pointer", padding: "2px", display: "flex",
              }}><X size={10} /></button>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
          <input value={form.newImageUrl} onChange={e => setForm(f => ({ ...f, newImageUrl: e.target.value }))}
            style={{ ...fieldStyle, flex: 1 }} placeholder="https://url-de-imagen.com/foto.jpg" />
          <button type="button" onClick={addImageUrl} style={smBtn}>Agregar URL</button>
        </div>
        <label style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 12px", border: "1px dashed rgba(51,133,255,0.3)", color: "#8899aa", fontSize: 11, cursor: "pointer" }}>
          <Upload size={13} /> {uploading ? "Subiendo…" : "Subir archivo"}
          <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => e.target.files?.[0] && uploadImage(e.target.files[0])} />
        </label>
      </FField>

      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", paddingTop: 4 }}>
        <button type="button" onClick={onCancel} style={secBtn}>Cancelar</button>
        <button type="submit" disabled={saving} style={primaryBtn}>{saving ? "Guardando…" : "Guardar"}</button>
      </div>
    </form>
  );
}

// ── Service Form ──────────────────────────────────────────────────────────────
function ServiceForm({ initial, saving, token, onSave, onCancel }: {
  initial: Service | null; saving: boolean; token: string;
  onSave: (d: Partial<Service>) => void; onCancel: () => void;
}) {
  const [form, setForm] = useState({
    title_es:       initial?.title_es       || "",
    title_en:       initial?.title_en       || "",
    description_es: initial?.description_es || "",
    description_en: initial?.description_en || "",
    icon:           initial?.icon           || "",
    image:          initial?.image          || "",
  });
  const [uploading, setUploading] = useState(false);

  const field = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  async function uploadImage(file: File) {
    setUploading(true);
    try {
      const { path } = await portfolioApi.uploadFile(file, token);
      setForm(f => ({ ...f, image: path }));
    } catch {
      toast.error("Error al subir imagen");
    } finally {
      setUploading(false);
    }
  }

  return (
    <form onSubmit={e => { e.preventDefault(); onSave(form); }} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <FField label="Título ES"><input value={form.title_es} onChange={field("title_es")} style={fieldStyle} required /></FField>
        <FField label="Title EN"><input value={form.title_en} onChange={field("title_en")} style={fieldStyle} /></FField>
      </div>
      <FField label="Descripción ES"><textarea value={form.description_es} onChange={field("description_es")} style={{ ...fieldStyle, resize: "vertical" }} rows={3} /></FField>
      <FField label="Description EN"><textarea value={form.description_en} onChange={field("description_en")} style={{ ...fieldStyle, resize: "vertical" }} rows={3} /></FField>
      <FField label="Ícono (emoji)"><input value={form.icon} onChange={field("icon")} style={fieldStyle} placeholder="🌐  🎨  ⚙️  📈" /></FField>

      <FField label="Imagen">
        {form.image && (
          <div style={{ marginBottom: 8, position: "relative", display: "inline-block" }}>
            <img src={form.image} alt="" style={{ height: 72, objectFit: "cover", border: "1px solid rgba(51,133,255,0.2)" }} />
            <button type="button" onClick={() => setForm(f => ({ ...f, image: "" }))} style={{
              position: "absolute", top: 2, right: 2, background: "rgba(6,10,18,0.85)",
              border: "none", color: "#e2eaf5", cursor: "pointer", padding: 2, display: "flex",
            }}><X size={10} /></button>
          </div>
        )}
        <label style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 12px", border: "1px dashed rgba(51,133,255,0.3)", color: "#8899aa", fontSize: 11, cursor: "pointer" }}>
          <Upload size={13} /> {uploading ? "Subiendo…" : "Subir imagen"}
          <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => e.target.files?.[0] && uploadImage(e.target.files[0])} />
        </label>
      </FField>

      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", paddingTop: 4 }}>
        <button type="button" onClick={onCancel} style={secBtn}>Cancelar</button>
        <button type="submit" disabled={saving} style={primaryBtn}>{saving ? "Guardando…" : "Guardar"}</button>
      </div>
    </form>
  );
}

// ── Shared ────────────────────────────────────────────────────────────────────
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(6,10,18,0.8)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 24, overflowY: "auto",
    }}>
      <div style={{
        background: "#0d1421", border: "1px solid rgba(51,133,255,0.2)",
        width: "100%", maxWidth: 600, maxHeight: "90vh", display: "flex", flexDirection: "column",
      }}>
        <div style={{
          padding: "18px 24px", borderBottom: "1px solid rgba(51,133,255,0.14)",
          display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0,
        }}>
          <span style={{ fontSize: 12, letterSpacing: "0.18em", color: "#e2eaf5", textTransform: "uppercase" }}>{title}</span>
          <button onClick={onClose} style={iconBtn}><X size={16} /></button>
        </div>
        <div style={{ padding: 24, overflowY: "auto" }}>{children}</div>
      </div>
    </div>
  );
}

function FField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ fontSize: "9.5px", letterSpacing: "0.22em", color: "#8899aa", textTransform: "uppercase", display: "block", marginBottom: 4 }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function badge(color: "blue" | "gray"): React.CSSProperties {
  return {
    fontSize: 9, letterSpacing: "0.1em", padding: "2px 6px",
    background: "rgba(6,10,18,0.85)",
    color: color === "blue" ? "#3385ff" : "#8899aa",
    border: `1px solid ${color === "blue" ? "rgba(51,133,255,0.4)" : "rgba(51,133,255,0.1)"}`,
    textTransform: "uppercase",
  };
}

const addBtn: React.CSSProperties     = { display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", background: "rgba(51,133,255,0.1)", border: "1px solid rgba(51,133,255,0.3)", color: "#e2eaf5", fontSize: 11, letterSpacing: "0.1em", cursor: "pointer" };
const iconBtn: React.CSSProperties    = { background: "none", border: "none", color: "#8899aa", cursor: "pointer", padding: 4, display: "flex", alignItems: "center" };
const secBtn: React.CSSProperties     = { padding: "8px 16px", background: "none", border: "1px solid rgba(51,133,255,0.2)", color: "#8899aa", fontSize: 12, cursor: "pointer" };
const smBtn: React.CSSProperties      = { padding: "8px 12px", background: "rgba(51,133,255,0.1)", border: "1px solid rgba(51,133,255,0.3)", color: "#e2eaf5", fontSize: 11, cursor: "pointer", whiteSpace: "nowrap" };
const primaryBtn: React.CSSProperties = { padding: "8px 20px", background: "#3385ff", border: "none", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer" };
const fieldStyle: React.CSSProperties = { width: "100%", padding: "9px 11px", background: "#111827", border: "1px solid rgba(51,133,255,0.2)", color: "#e2eaf5", fontSize: 12, outline: "none", boxSizing: "border-box" };
