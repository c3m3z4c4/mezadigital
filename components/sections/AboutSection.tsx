"use client";

import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { useLangStore } from "@/stores/langStore";

function StatCard({ value, label, delay }: { value: string; label: string; delay: number }) {
  return (
    <ScrollReveal delay={delay}>
      <div
        style={{
          padding: "32px 28px",
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          textAlign: "center",
          transition: "border-color 0.3s, transform 0.3s",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.borderColor = "var(--color-blue)";
          (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.borderColor = "var(--color-border)";
          (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "3rem",
            fontWeight: 900,
            color: "var(--color-blue)",
            lineHeight: 1,
            margin: "0 0 8px",
          }}
        >
          {value}
        </p>
        <p
          className="label-caps"
          style={{ color: "var(--color-ink-dim)", fontSize: 10 }}
        >
          {label}
        </p>
      </div>
    </ScrollReveal>
  );
}

export function AboutSection() {
  const { t } = useLangStore();

  return (
    <section
      id="nosotros"
      style={{
        padding: "120px 32px",
        background: "var(--color-void)",
        position: "relative",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 80,
            alignItems: "center",
          }}
          className="about-grid"
        >
          {/* Left: Text */}
          <div>
            <ScrollReveal>
              <span className="label-caps" style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
                <span style={{ display: "inline-block", width: 24, height: 1.5, background: "var(--color-blue)" }} />
                {t.about.label}
              </span>
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(2rem, 3.5vw, 3rem)",
                  fontWeight: 900,
                  lineHeight: 1.1,
                  color: "var(--color-ink)",
                  marginBottom: 24,
                }}
              >
                {t.about.title}
              </h2>
              <div
                style={{
                  width: 48,
                  height: 2,
                  background: "var(--color-blue)",
                  marginBottom: 24,
                }}
              />
              <p
                style={{
                  fontSize: 15,
                  color: "var(--color-ink-dim)",
                  lineHeight: 1.8,
                  fontWeight: 300,
                }}
              >
                {t.about.body}
              </p>
            </ScrollReveal>
          </div>

          {/* Right: Stats */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 16,
            }}
          >
            <StatCard value={t.about.stat1v} label={t.about.stat1l} delay={0} />
            <StatCard value={t.about.stat2v} label={t.about.stat2l} delay={100} />
            <div style={{ gridColumn: "span 2" }}>
              <StatCard value={t.about.stat3v} label={t.about.stat3l} delay={200} />
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .about-grid {
            grid-template-columns: 1fr !important;
            gap: 48px !important;
          }
        }
      `}</style>
    </section>
  );
}
