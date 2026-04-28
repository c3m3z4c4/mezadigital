"use client";

import { useEffect, useRef } from "react";
import { useLangStore } from "@/stores/langStore";
import { useContentStore } from "@/stores/contentStore";

function Ornament() {
  return (
    <svg width="180" height="28" viewBox="0 0 180 28" fill="none" xmlns="http://www.w3.org/2000/svg"
      style={{ margin: "28px 0", opacity: 0.35 }}>
      <path d="M0 14 Q20 4 40 14 Q60 24 80 14 Q100 4 120 14 Q140 24 160 14 Q170 9 180 14"
        stroke="var(--color-blue)" strokeWidth="1.2" fill="none" />
      <circle cx="90" cy="14" r="3" fill="var(--color-blue)" />
      <circle cx="60" cy="14" r="1.5" fill="var(--color-blue)" />
      <circle cx="120" cy="14" r="1.5" fill="var(--color-blue)" />
    </svg>
  );
}

export function HeroSection() {
  const { t, lang } = useLangStore();
  const { get: cms, fetch: fetchContent } = useContentStore();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => { videoRef.current?.play().catch(() => {}); }, []);
  useEffect(() => { fetchContent(); }, [fetchContent]);

  const l = lang === "es" ? "es" : "en";
  const line1 = cms(`hero.line1_${l}`, t.hero.line1);
  const line2 = cms(`hero.line2_${l}`, t.hero.line2);
  const sub   = cms(`hero.sub_${l}`,   t.hero.sub);
  const cta1  = cms(`hero.cta1_${l}`,  t.hero.cta1);
  const cta2  = cms(`hero.cta2_${l}`,  t.hero.cta2);

  return (
    <section id="inicio" style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", overflow: "hidden", background: "var(--color-void)" }}>
      <div className="grid-bg" style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "absolute", top: "10%", right: "5%", width: 600, height: 600, background: "radial-gradient(circle, rgba(0,136,255,0.07) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "120px 32px 80px", width: "100%", display: "grid", gridTemplateColumns: "1fr 1fr", alignItems: "center", gap: 64, position: "relative", zIndex: 1 }}
        className="hero-grid">
        <div>
          <span className="label-caps" style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
            <span style={{ display: "inline-block", width: 24, height: 1.5, background: "var(--color-blue)" }} />
            mezadigital.com
          </span>

          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(3rem, 6vw, 5.5rem)", fontWeight: 900, lineHeight: 1.02, letterSpacing: "-0.02em", color: "var(--color-ink)", margin: 0 }}>
            <span style={{ display: "block" }}>{line1}</span>
            <span style={{ display: "block", color: "var(--color-blue)" }}>{line2}</span>
          </h1>

          <Ornament />

          <p style={{ fontSize: 16, color: "var(--color-ink-dim)", lineHeight: 1.75, maxWidth: 460, marginBottom: 40, fontWeight: 300 }}>
            {sub}
          </p>

          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <a href="#contacto" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 28px", background: "var(--color-blue)", color: "#fff", fontSize: 14, fontWeight: 600, letterSpacing: "0.04em", textDecoration: "none", transition: "background 0.25s, transform 0.25s" }}
              onMouseEnter={e => { e.currentTarget.style.background = "var(--color-blue-bright)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "var(--color-blue)"; e.currentTarget.style.transform = "translateY(0)"; }}>
              {cta1} <span style={{ fontSize: 16 }}>✉</span>
            </a>
            <a href="#servicios" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "13px 28px", background: "transparent", color: "var(--color-ink)", border: "1.5px solid var(--color-ink)", fontSize: 14, fontWeight: 500, letterSpacing: "0.04em", textDecoration: "none", transition: "border-color 0.25s, color 0.25s, transform 0.25s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--color-blue)"; e.currentTarget.style.color = "var(--color-blue)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--color-ink)"; e.currentTarget.style.color = "var(--color-ink)"; e.currentTarget.style.transform = "translateY(0)"; }}>
              {cta2}
            </a>
          </div>
        </div>

        <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ position: "absolute", width: 420, height: 420, background: "radial-gradient(circle, rgba(0,120,255,0.06) 0%, transparent 70%)", borderRadius: "50%" }} />
          <div className="holo-shape" style={{ width: 360, height: 360, position: "relative", overflow: "hidden" }}>
            <video ref={videoRef} muted loop playsInline autoPlay
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", mixBlendMode: "overlay", opacity: 0.55 }}>
              <source src="/assets/video/hero2.mp4" type="video/mp4" />
            </video>
          </div>
          <div style={{ position: "absolute", bottom: "8%", right: "4%", background: "var(--color-surface)", border: "1px solid var(--color-border)", padding: "12px 18px", boxShadow: "0 8px 32px rgba(0,0,0,0.1)", display: "flex", alignItems: "center", gap: 10, animation: "float 4s ease-in-out infinite" }}>
            <span style={{ fontSize: 22 }}>🌐</span>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: "var(--color-blue)", letterSpacing: "0.1em", textTransform: "uppercase", margin: 0 }}>+30</p>
              <p style={{ fontSize: 11, color: "var(--color-ink-dim)", margin: 0 }}>proyectos</p>
            </div>
          </div>
          <div style={{ position: "absolute", top: "12%", left: "0%", background: "var(--color-surface)", border: "1px solid var(--color-border)", padding: "12px 18px", boxShadow: "0 8px 32px rgba(0,0,0,0.1)", display: "flex", alignItems: "center", gap: 10, animation: "float 5s ease-in-out infinite 1s" }}>
            <span style={{ fontSize: 22 }}>✅</span>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: "var(--color-blue)", letterSpacing: "0.1em", textTransform: "uppercase", margin: 0 }}>100%</p>
              <p style={{ fontSize: 11, color: "var(--color-ink-dim)", margin: 0 }}>resultados</p>
            </div>
          </div>
        </div>
      </div>

      <div style={{ position: "absolute", bottom: 32, left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, opacity: 0.5, animation: "float 2.5s ease-in-out infinite" }}>
        <span className="label-caps" style={{ fontSize: 9 }}>scroll</span>
        <div style={{ width: 1, height: 32, background: "linear-gradient(to bottom, var(--color-blue), transparent)" }} />
      </div>

      <style>{`
        @media (max-width: 768px) {
          .hero-grid { grid-template-columns: 1fr !important; gap: 48px !important; padding-top: 100px !important; }
          .hero-grid > div:last-child { display: none; }
        }
      `}</style>
    </section>
  );
}
