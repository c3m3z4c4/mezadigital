"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { useLangStore } from "@/stores/langStore";
import { useContentStore } from "@/stores/contentStore";

interface ClientLogo { id: string; name: string; logo?: string; url?: string; }

const FALLBACK_CLIENTS: ClientLogo[] = [
  { id: "1", name: "Adobe Morteros",         logo: "/assets/clientes/am.png",      url: "https://cemeza.github.io/AdobeMorteros/" },
  { id: "2", name: "Real Telecomunicaciones", logo: "/assets/clientes/rt.png",      url: "https://www.realtech.com.mx" },
  { id: "3", name: "Qtek Computación",        logo: "/assets/clientes/qtek.png",    url: "https://www.qtekcomputacion.com.mx/" },
  { id: "4", name: "Ticket Max",              logo: "/assets/clientes/LogoTM.png",  url: "https://ticketmax.mx/" },
];

export function ClientsSection() {
  const { t, lang } = useLangStore();
  const { get: cms, fetch: fetchContent } = useContentStore();
  const [clients, setClients] = useState<ClientLogo[]>([]);
  const [loaded, setLoaded]   = useState(false);

  useEffect(() => { fetchContent(); }, [fetchContent]);

  useEffect(() => {
    fetch("/api/clients")
      .then(r => r.ok ? r.json() : [])
      .then((data: ClientLogo[]) => {
        setClients(data.length > 0 ? data : FALLBACK_CLIENTS);
        setLoaded(true);
      })
      .catch(() => { setClients(FALLBACK_CLIENTS); setLoaded(true); });
  }, []);

  const label  = cms("clients.label", t.clients.label);
  const title  = cms("clients.title", t.clients.title);
  const list   = loaded ? clients : FALLBACK_CLIENTS;

  return (
    <section id="clientes" style={{ padding: "120px 32px", background: "var(--color-void)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <ScrollReveal>
          <div style={{ textAlign: "center", marginBottom: 72 }}>
            <span className="label-caps" style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <span style={{ display: "inline-block", width: 24, height: 1.5, background: "var(--color-blue)" }} />
              {label}
              <span style={{ display: "inline-block", width: 24, height: 1.5, background: "var(--color-blue)" }} />
            </span>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 3.5vw, 3rem)", fontWeight: 900, color: "var(--color-ink)", lineHeight: 1.1 }}>
              {title}
            </h2>
          </div>
        </ScrollReveal>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 2 }} className="clients-grid">
          {list.map((c, i) => (
            <ScrollReveal key={c.id} delay={i * 100}>
              <a href={c.url || "#"} target="_blank" rel="noopener noreferrer"
                style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 32px", background: "var(--color-surface)", border: "1px solid var(--color-border)", transition: "border-color 0.3s, transform 0.3s, box-shadow 0.3s", textDecoration: "none" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--color-blue)"; (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 12px 40px rgba(0,85,204,0.12)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--color-border)"; (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}>
                {c.logo ? (
                  <Image src={c.logo} alt={c.name} width={140} height={70}
                    style={{ objectFit: "contain", filter: "grayscale(1)", opacity: 0.7, transition: "filter 0.3s, opacity 0.3s", maxHeight: 60 }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.filter = "grayscale(0)"; (e.currentTarget as HTMLElement).style.opacity = "1"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.filter = "grayscale(1)"; (e.currentTarget as HTMLElement).style.opacity = "0.7"; }}
                  />
                ) : (
                  <span style={{ fontSize: 13, color: "var(--color-muted)", fontWeight: 500 }}>{c.name}</span>
                )}
              </a>
            </ScrollReveal>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) { .clients-grid { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (max-width: 480px) { .clients-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  );
}
