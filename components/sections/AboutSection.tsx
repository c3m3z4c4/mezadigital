"use client";

import { useEffect } from "react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { useLangStore } from "@/stores/langStore";
import { useContentStore } from "@/stores/contentStore";

function StatCard({ value, label, delay }: { value: string; label: string; delay: number }) {
  return (
    <ScrollReveal delay={delay}>
      <div style={{ padding: "32px 28px", background: "var(--color-surface)", border: "1px solid var(--color-border)", textAlign: "center", transition: "border-color 0.3s, transform 0.3s" }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--color-blue)"; (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)"; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--color-border)"; (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; }}>
        <p style={{ fontFamily: "var(--font-display)", fontSize: "3rem", fontWeight: 900, color: "var(--color-blue)", lineHeight: 1, margin: "0 0 8px" }}>{value}</p>
        <p className="label-caps" style={{ color: "var(--color-ink-dim)", fontSize: 10 }}>{label}</p>
      </div>
    </ScrollReveal>
  );
}

export function AboutSection() {
  const { t, lang } = useLangStore();
  const { get: cms, fetch: fetchContent } = useContentStore();

  useEffect(() => { fetchContent(); }, [fetchContent]);

  const l = lang === "es" ? "es" : "en";
  const label  = cms(`about.label_${l}`,  t.about.label);
  const title  = cms(`about.title_${l}`,  t.about.title);
  const body   = cms(`about.body_${l}`,   t.about.body);
  const stat1v = cms("about.stat1v",      t.about.stat1v);
  const stat1l = cms(`about.stat1l_${l}`, t.about.stat1l);
  const stat2v = cms("about.stat2v",      t.about.stat2v);
  const stat2l = cms(`about.stat2l_${l}`, t.about.stat2l);
  const stat3v = cms("about.stat3v",      t.about.stat3v);
  const stat3l = cms(`about.stat3l_${l}`, t.about.stat3l);

  return (
    <section id="nosotros" style={{ padding: "120px 32px", background: "var(--color-void)", position: "relative" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }} className="about-grid">
          <div>
            <ScrollReveal>
              <span className="label-caps" style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
                <span style={{ display: "inline-block", width: 24, height: 1.5, background: "var(--color-blue)" }} />
                {label}
              </span>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 3.5vw, 3rem)", fontWeight: 900, lineHeight: 1.1, color: "var(--color-ink)", marginBottom: 24 }}>
                {title}
              </h2>
              <div style={{ width: 48, height: 2, background: "var(--color-blue)", marginBottom: 24 }} />
              <p style={{ fontSize: 15, color: "var(--color-ink-dim)", lineHeight: 1.8, fontWeight: 300 }}>{body}</p>
            </ScrollReveal>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <StatCard value={stat1v} label={stat1l} delay={0} />
            <StatCard value={stat2v} label={stat2l} delay={100} />
            <div style={{ gridColumn: "span 2" }}>
              <StatCard value={stat3v} label={stat3l} delay={200} />
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .about-grid { grid-template-columns: 1fr !important; gap: 48px !important; }
        }
      `}</style>
    </section>
  );
}
