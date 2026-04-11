"use client";

import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { useLangStore } from "@/stores/langStore";

export function ServicesSection() {
  const { t } = useLangStore();

  return (
    <section
      id="servicios"
      style={{
        padding: "120px 32px",
        background: "var(--color-surface-2)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative grid */}
      <div
        className="grid-bg"
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          opacity: 0.6,
        }}
      />

      <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative", zIndex: 1 }}>
        {/* Header */}
        <ScrollReveal>
          <div style={{ marginBottom: 64, maxWidth: 560 }}>
            <span
              className="label-caps"
              style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}
            >
              <span
                style={{
                  display: "inline-block",
                  width: 24,
                  height: 1.5,
                  background: "var(--color-blue)",
                }}
              />
              {t.services.label}
            </span>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(2rem, 3.5vw, 3rem)",
                fontWeight: 900,
                color: "var(--color-ink)",
                lineHeight: 1.1,
                margin: 0,
              }}
            >
              {t.services.title}
            </h2>
          </div>
        </ScrollReveal>

        {/* Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: 2,
          }}
          className="services-grid"
        >
          {t.services.items.map((svc, i) => (
            <ScrollReveal key={i} delay={i * 80}>
              <div
                style={{
                  padding: "44px 40px",
                  background: "var(--color-surface)",
                  borderLeft: "3px solid transparent",
                  transition: "border-color 0.3s, transform 0.3s",
                  height: "100%",
                  cursor: "default",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderLeftColor = "var(--color-blue)";
                  (e.currentTarget as HTMLElement).style.transform = "translateX(4px)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderLeftColor = "transparent";
                  (e.currentTarget as HTMLElement).style.transform = "translateX(0)";
                }}
              >
                <div style={{ fontSize: 36, marginBottom: 20 }}>{svc.icon}</div>
                <h3
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "1.4rem",
                    fontWeight: 700,
                    color: "var(--color-ink)",
                    marginBottom: 12,
                  }}
                >
                  {svc.title}
                </h3>
                <div
                  style={{
                    width: 32,
                    height: 1.5,
                    background: "var(--color-blue)",
                    marginBottom: 16,
                    opacity: 0.5,
                  }}
                />
                <p
                  style={{
                    fontSize: 14,
                    color: "var(--color-ink-dim)",
                    lineHeight: 1.75,
                    fontWeight: 300,
                    margin: 0,
                  }}
                >
                  {svc.desc}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .services-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
