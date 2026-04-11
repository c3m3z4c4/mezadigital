"use client";

import Image from "next/image";
import { useLangStore } from "@/stores/langStore";
import { useThemeStore } from "@/stores/themeStore";

export function Footer() {
  const { t } = useLangStore();
  const { theme } = useThemeStore();

  return (
    <footer
      style={{
        borderTop: "1px solid var(--color-border)",
        background: "var(--color-surface)",
        padding: "48px 32px 32px",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 48,
            marginBottom: 40,
          }}
          className="footer-grid"
        >
          {/* Brand */}
          <div>
            <Image
              src="/assets/images/Logo@2x.png"
              alt="Meza Digital"
              width={110}
              height={40}
              style={{
                objectFit: "contain",
                filter: theme === "dark" ? "brightness(0) invert(1)" : "none",
                marginBottom: 16,
              }}
            />
            <p style={{ fontSize: 13, color: "var(--color-ink-dim)", lineHeight: 1.6, maxWidth: 220 }}>
              {t.footer.tagline}
            </p>
          </div>

          {/* Links */}
          <div>
            <p className="label-caps" style={{ marginBottom: 16 }}>Meza Digital</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {(["home", "about", "services", "clients", "contact"] as const).map((k) => (
                <a
                  key={k}
                  href={`#${k === "home" ? "inicio" : k === "about" ? "nosotros" : k === "services" ? "servicios" : k === "clients" ? "clientes" : "contacto"}`}
                  style={{ fontSize: 13, color: "var(--color-ink-dim)", textDecoration: "none", transition: "color 0.2s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-blue)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-ink-dim)")}
                >
                  {t.nav[k]}
                </a>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <p className="label-caps" style={{ marginBottom: 16 }}>Contacto</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <a
                href="mailto:contacto@mezadigital.com"
                style={{ fontSize: 13, color: "var(--color-ink-dim)", textDecoration: "none" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-blue)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-ink-dim)")}
              >
                contacto@mezadigital.com
              </a>
              <span style={{ fontSize: 13, color: "var(--color-muted)" }}>México</span>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            paddingTop: 24,
            borderTop: "1px solid var(--color-border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          <p style={{ fontSize: 12, color: "var(--color-muted)" }}>
            © {new Date().getFullYear()} Meza Digital. {t.footer.rights}
          </p>
          <div style={{ display: "flex", gap: 16 }}>
            <a
              href="https://github.com/cemeza"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              style={{ fontSize: 18, color: "var(--color-muted)", textDecoration: "none", transition: "color 0.2s" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-blue)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-muted)")}
            >
              ⌘
            </a>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .footer-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
        }
      `}</style>
    </footer>
  );
}
