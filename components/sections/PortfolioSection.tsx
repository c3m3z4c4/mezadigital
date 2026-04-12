"use client";

import { useEffect, useState, useCallback } from "react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { useLangStore } from "@/stores/langStore";
import { type Project } from "@/lib/api/portfolio";
import { GitBranch, ExternalLink, X, ChevronLeft, ChevronRight } from "lucide-react";

export function PortfolioSection() {
  const { lang } = useLangStore();
  const [projects, setProjects]     = useState<Project[]>([]);
  const [loading,  setLoading]      = useState(true);
  const [lightbox, setLightbox]     = useState<{ project: Project; idx: number } | null>(null);

  useEffect(() => {
    fetch("/api/projects")
      .then(r => r.json())
      .then((data: Project[]) => {
        setProjects(data.filter(p => p.visible).sort((a, b) => a.order - b.order));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const closeLightbox = useCallback(() => setLightbox(null), []);

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight" && lightbox) {
        const imgs = lightbox.project.images;
        setLightbox(lb => lb ? { ...lb, idx: (lb.idx + 1) % imgs.length } : null);
      }
      if (e.key === "ArrowLeft" && lightbox) {
        const imgs = lightbox.project.images;
        setLightbox(lb => lb ? { ...lb, idx: (lb.idx - 1 + imgs.length) % imgs.length } : null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox, closeLightbox]);

  const title  = lang === "es" ? "Proyectos"       : "Projects";
  const label  = lang === "es" ? "Portafolio"      : "Portfolio";
  const empty  = lang === "es" ? "Próximamente…"   : "Coming soon…";

  if (!loading && projects.length === 0) return null;

  return (
    <section
      id="portafolio"
      style={{ padding: "120px 32px", background: "var(--color-void)", position: "relative" }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        {/* Header */}
        <ScrollReveal>
          <div style={{ marginBottom: 64, maxWidth: 560 }}>
            <span className="label-caps" style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <span style={{ display: "inline-block", width: 24, height: 1.5, background: "var(--color-blue)" }} />
              {label}
            </span>
            <h2 style={{
              fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 3.5vw, 3rem)",
              fontWeight: 900, color: "var(--color-ink)", lineHeight: 1.1, margin: 0,
            }}>
              {title}
            </h2>
          </div>
        </ScrollReveal>

        {/* Loading skeleton */}
        {loading && (
          <div style={{ columns: "280px", gap: 12 }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{
                height: i % 3 === 0 ? 260 : i % 3 === 1 ? 200 : 300,
                background: "var(--color-surface-2)", marginBottom: 12,
                animation: "pulse 1.5s ease-in-out infinite",
              }} />
            ))}
          </div>
        )}

        {/* Masonry grid */}
        {!loading && projects.length === 0 && (
          <p style={{ color: "var(--color-muted)", fontSize: 14 }}>{empty}</p>
        )}

        {!loading && projects.length > 0 && (
          <div style={{ columns: "280px", gap: 12 }}>
            {projects.map((p, i) => {
              const titleText = lang === "es" ? (p.title_es || p.title_en) : (p.title_en || p.title_es);
              const desc      = lang === "es" ? p.description_es : p.description_en;
              const img       = p.images?.[0];

              return (
                <ScrollReveal key={p.id} delay={i * 60}>
                  <div
                    style={{
                      breakInside: "avoid", marginBottom: 12,
                      background: "var(--color-surface)",
                      border: "1px solid var(--color-border)",
                      overflow: "hidden", cursor: img ? "pointer" : "default",
                      transition: "border-color 0.3s, transform 0.3s",
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.borderColor = "var(--color-blue)";
                      (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)";
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.borderColor = "var(--color-border)";
                      (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                    }}
                    onClick={() => img && setLightbox({ project: p, idx: 0 })}
                  >
                    {img && (
                      <div style={{ position: "relative", overflow: "hidden" }}>
                        <img
                          src={img} alt={titleText}
                          style={{ width: "100%", display: "block", objectFit: "cover" }}
                          loading="lazy"
                        />
                        {p.featured && (
                          <span style={{
                            position: "absolute", top: 8, left: 8, fontSize: 9,
                            padding: "2px 7px", background: "var(--color-blue)",
                            color: "#fff", letterSpacing: "0.12em", textTransform: "uppercase",
                          }}>★ Destacado</span>
                        )}
                      </div>
                    )}

                    <div style={{ padding: "16px 18px" }}>
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 8 }}>
                        <h3 style={{
                          fontFamily: "var(--font-display)", fontSize: "1.05rem", fontWeight: 700,
                          color: "var(--color-ink)", margin: 0, lineHeight: 1.2,
                        }}>
                          {titleText}
                        </h3>
                        <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                          {p.githubUrl && (
                            <a href={p.githubUrl} target="_blank" rel="noreferrer"
                              onClick={e => e.stopPropagation()}
                              style={{ color: "var(--color-muted)", display: "flex", alignItems: "center" }}>
                              <GitBranch size={14} />
                            </a>
                          )}
                          {p.liveUrl && (
                            <a href={p.liveUrl} target="_blank" rel="noreferrer"
                              onClick={e => e.stopPropagation()}
                              style={{ color: "var(--color-blue)", display: "flex", alignItems: "center" }}>
                              <ExternalLink size={14} />
                            </a>
                          )}
                        </div>
                      </div>

                      {desc && (
                        <p style={{ fontSize: 13, color: "var(--color-ink-dim)", lineHeight: 1.65, margin: "0 0 12px", fontWeight: 300 }}>
                          {desc}
                        </p>
                      )}

                      {p.techStack?.length > 0 && (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                          {p.techStack.map(t => (
                            <span key={t} style={{
                              fontSize: 9, padding: "2px 7px",
                              background: "var(--color-surface-2)",
                              color: "var(--color-blue)", letterSpacing: "0.08em",
                              border: "1px solid var(--color-border)",
                            }}>
                              {t}
                            </span>
                          ))}
                        </div>
                      )}

                      {(p.client || p.year) && (
                        <div style={{ fontSize: 10, color: "var(--color-muted)", marginTop: 10, letterSpacing: "0.08em" }}>
                          {[p.client, p.year].filter(Boolean).join(" · ")}
                        </div>
                      )}
                    </div>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 1000,
            background: "rgba(6,10,18,0.92)", backdropFilter: "blur(6px)",
            display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
          }}
          onClick={closeLightbox}
        >
          <div
            style={{ position: "relative", maxWidth: 900, width: "100%", maxHeight: "90vh" }}
            onClick={e => e.stopPropagation()}
          >
            <img
              src={lightbox.project.images[lightbox.idx]}
              alt=""
              style={{ width: "100%", maxHeight: "85vh", objectFit: "contain", display: "block" }}
            />

            {lightbox.project.images.length > 1 && (
              <>
                <button
                  onClick={() => setLightbox(lb => lb ? { ...lb, idx: (lb.idx - 1 + lb.project.images.length) % lb.project.images.length } : null)}
                  style={lbArrow("left")}
                ><ChevronLeft size={24} /></button>
                <button
                  onClick={() => setLightbox(lb => lb ? { ...lb, idx: (lb.idx + 1) % lb.project.images.length } : null)}
                  style={lbArrow("right")}
                ><ChevronRight size={24} /></button>
              </>
            )}

            <button onClick={closeLightbox} style={{
              position: "absolute", top: 12, right: 12,
              background: "rgba(6,10,18,0.7)", border: "none", color: "#e2eaf5",
              cursor: "pointer", padding: 6, display: "flex",
            }}><X size={20} /></button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </section>
  );
}

function lbArrow(side: "left" | "right"): React.CSSProperties {
  return {
    position: "absolute", top: "50%", transform: "translateY(-50%)",
    [side]: -48,
    background: "rgba(6,10,18,0.7)", border: "none", color: "#e2eaf5",
    cursor: "pointer", padding: 8, display: "flex", alignItems: "center",
  };
}
