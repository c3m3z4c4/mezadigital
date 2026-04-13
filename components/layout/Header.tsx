"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useLangStore } from "@/stores/langStore";
import { useThemeStore } from "@/stores/themeStore";

const NAV_LINKS = [
  { key: "home",      href: "#inicio" },
  { key: "about",     href: "#nosotros" },
  { key: "services",  href: "#servicios" },
  { key: "portfolio", href: "#portafolio" },
  { key: "clients",   href: "#clientes" },
  { key: "contact",   href: "#contacto" },
] as const;

export function Header() {
  const { t, lang, toggle: toggleLang } = useLangStore();
  const { theme, toggle: toggleTheme }  = useThemeStore();
  const router = useRouter();
  const [scrolled,    setScrolled]    = useState(false);
  const [menuOpen,    setMenuOpen]    = useState(false);
  const [activeHash,  setActiveHash]  = useState("#inicio");
  const clickCount = useRef(0);
  const clickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleLogoClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    clickCount.current += 1;
    if (clickCount.current >= 5) {
      clickCount.current = 0;
      router.push("/admin/login");
      return;
    }
    if (clickTimer.current) clearTimeout(clickTimer.current);
    clickTimer.current = setTimeout(() => { clickCount.current = 0; }, 1500);
  }, [router]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Track active section
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActiveHash(`#${e.target.id}`);
        });
      },
      { threshold: 0.35 }
    );
    NAV_LINKS.forEach(({ href }) => {
      const el = document.querySelector(href);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const logoSrc = theme === "dark"
    ? "/assets/images/Logo@2x.png"  // white invert on dark
    : "/assets/images/Logo@2x.png";

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        transition: "background 0.4s, box-shadow 0.4s, border-color 0.4s",
        background: scrolled
          ? "var(--color-surface)"
          : "transparent",
        borderBottom: scrolled
          ? "1px solid var(--color-border)"
          : "1px solid transparent",
        boxShadow: scrolled ? "0 4px 32px rgba(0,0,0,0.06)" : "none",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 32px",
          height: 68,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Logo — 5 clics redirige al admin */}
        <a href="#inicio" aria-label="Meza Digital" onClick={handleLogoClick} style={{ display: "flex", alignItems: "center" }}>
          <Image
            src={logoSrc}
            alt="Meza Digital"
            width={120}
            height={44}
            style={{
              objectFit: "contain",
              filter: theme === "dark" ? "brightness(0) invert(1)" : "none",
              transition: "filter 0.35s",
            }}
            priority
          />
        </a>

        {/* Desktop Nav */}
        <nav
          style={{ display: "flex", alignItems: "center", gap: 36 }}
          className="hidden-mobile"
        >
          {NAV_LINKS.map(({ key, href }) => (
            <a
              key={key}
              href={href}
              className="nav-link"
              style={{
                color: activeHash === href
                  ? "var(--color-blue)"
                  : "var(--color-ink-dim)",
                fontWeight: activeHash === href ? 600 : 400,
              }}
            >
              {t.nav[key]}
            </a>
          ))}
        </nav>

        {/* Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* Lang toggle */}
          <button
            onClick={toggleLang}
            aria-label="Toggle language"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 0,
              border: "1px solid var(--color-border)",
              background: "var(--color-surface-2)",
              padding: "4px 2px",
              cursor: "pointer",
            }}
          >
            {(["es", "en"] as const).map((l) => (
              <span
                key={l}
                style={{
                  padding: "3px 10px",
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: lang === l ? "#fff" : "var(--color-muted)",
                  background: lang === l ? "var(--color-blue)" : "transparent",
                  transition: "all 0.2s",
                }}
              >
                {l}
              </span>
            ))}
          </button>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            style={{
              width: 36,
              height: 36,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid var(--color-border)",
              background: "var(--color-surface-2)",
              cursor: "pointer",
              fontSize: 16,
              transition: "background 0.2s",
            }}
          >
            {theme === "light" ? "🌙" : "☀️"}
          </button>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
            className="show-mobile"
            style={{
              width: 36,
              height: 36,
              display: "none",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 5,
              border: "1px solid var(--color-border)",
              background: "var(--color-surface-2)",
              cursor: "pointer",
            }}
          >
            <span style={{ width: 18, height: 1.5, background: "var(--color-ink)", display: "block", transition: "transform 0.2s", transform: menuOpen ? "rotate(45deg) translateY(6.5px)" : "none" }} />
            <span style={{ width: 18, height: 1.5, background: "var(--color-ink)", display: "block", opacity: menuOpen ? 0 : 1, transition: "opacity 0.2s" }} />
            <span style={{ width: 18, height: 1.5, background: "var(--color-ink)", display: "block", transition: "transform 0.2s", transform: menuOpen ? "rotate(-45deg) translateY(-6.5px)" : "none" }} />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          style={{
            background: "var(--color-surface)",
            borderTop: "1px solid var(--color-border)",
            padding: "16px 32px 24px",
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
          className="show-mobile"
        >
          {NAV_LINKS.map(({ key, href }) => (
            <a
              key={key}
              href={href}
              className="nav-link"
              onClick={() => setMenuOpen(false)}
              style={{ fontSize: 15 }}
            >
              {t.nav[key]}
            </a>
          ))}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .hidden-mobile { display: none !important; }
          .show-mobile   { display: flex !important; }
        }
        @media (min-width: 769px) {
          .show-mobile { display: none !important; }
        }
      `}</style>
    </header>
  );
}
