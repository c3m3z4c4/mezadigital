"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/stores/authStore";
import { useCrmStore } from "@/stores/crmStore";
import { LayoutDashboard, Mail, FileText, Receipt, Calendar, LayoutGrid, LogOut } from "lucide-react";

const NAV = [
  { href: "/admin/dashboard",     label: "Dashboard",   icon: LayoutDashboard },
  { href: "/admin/messages",      label: "Mensajes",    icon: Mail,        badge: "messages" },
  { href: "/admin/quotes",        label: "Propuestas",  icon: FileText,    badge: "quotes" },
  { href: "/admin/invoices",      label: "Facturas",    icon: Receipt },
  { href: "/admin/appointments",  label: "Reuniones",   icon: Calendar,    badge: "appointments" },
  { href: "/admin/portfolio",     label: "Portafolio",  icon: LayoutGrid },
];

const PAGE_TITLES: Record<string, string> = {
  "/admin/dashboard":    "Dashboard",
  "/admin/messages":     "Mensajes",
  "/admin/quotes":       "Propuestas",
  "/admin/invoices":     "Facturas",
  "/admin/appointments": "Reuniones",
  "/admin/portfolio":    "Portafolio",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();
  const { token, email, logout } = useAuthStore();
  const { messages, quotes, appointments, fetchAll } = useCrmStore();

  useEffect(() => {
    if (!token && pathname !== "/admin/login") router.replace("/admin/login");
  }, [token, pathname, router]);

  useEffect(() => {
    if (token) fetchAll(token);
  }, [token]);

  if (!token && pathname !== "/admin/login") return null;
  if (pathname === "/admin/login") return <>{children}</>;

  function handleLogout() { logout(); router.push("/admin/login"); }

  const unreadMessages  = messages.filter(m => !m.read).length;
  const pendingQuotes   = quotes.filter(q => q.status === "pendiente").length;
  const upcomingMeets   = appointments.filter(a => a.status === "pendiente").length;

  function getBadge(key?: string): number {
    if (key === "messages")     return unreadMessages;
    if (key === "quotes")       return pendingQuotes;
    if (key === "appointments") return upcomingMeets;
    return 0;
  }

  const currentTitle = Object.entries(PAGE_TITLES).find(([k]) => pathname.startsWith(k))?.[1] || "Admin";

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#060a12" }}>
      {/* Sidebar */}
      <aside style={{
        width: 220, flexShrink: 0,
        background: "#0d1421", borderRight: "1px solid rgba(51,133,255,0.12)",
        display: "flex", flexDirection: "column",
      }}>
        {/* Logo */}
        <div style={{ padding: "24px 20px 20px", borderBottom: "1px solid rgba(51,133,255,0.1)" }}>
          <Link href="/" style={{ textDecoration: "none" }}>
            <span style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 900, color: "#e2eaf5" }}>
              meza<span style={{ color: "#3385ff" }}>digital</span>
            </span>
          </Link>
          <p style={{ fontSize: 9, letterSpacing: "0.2em", color: "#8899aa", textTransform: "uppercase", marginTop: 4 }}>Admin</p>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "12px 0" }}>
          {NAV.map(({ href, label, icon: Icon, badge }) => {
            const active = pathname.startsWith(href);
            const count  = getBadge(badge);
            return (
              <Link key={href} href={href} style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "10px 20px", fontSize: 12, fontWeight: 500,
                color: active ? "#e2eaf5" : "#8899aa",
                background: active ? "rgba(51,133,255,0.1)" : "none",
                borderLeft: `2px solid ${active ? "#3385ff" : "transparent"}`,
                textDecoration: "none", transition: "color 0.2s, background 0.2s",
                letterSpacing: "0.04em", position: "relative",
              }}>
                <Icon size={15} />
                <span style={{ flex: 1 }}>{label}</span>
                {count > 0 && (
                  <span style={{
                    minWidth: 18, height: 18, padding: "0 5px",
                    background: badge === "messages" ? "#3385ff" : "#f59e0b",
                    color: "#fff", fontSize: 9, fontWeight: 700,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    letterSpacing: 0,
                  }}>
                    {count > 99 ? "99+" : count}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div style={{ padding: "16px 20px", borderTop: "1px solid rgba(51,133,255,0.1)" }}>
          <p style={{ fontSize: 10, color: "#4a5568", marginBottom: 10, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {email}
          </p>
          <button onClick={handleLogout} style={{
            display: "flex", alignItems: "center", gap: 6,
            background: "none", border: "none", color: "#4a5568",
            fontSize: 11, cursor: "pointer", padding: 0, transition: "color 0.2s",
          }}
            onMouseEnter={e => (e.currentTarget.style.color = "#8899aa")}
            onMouseLeave={e => (e.currentTarget.style.color = "#4a5568")}
          >
            <LogOut size={13} /> Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "auto" }}>
        <div style={{
          padding: "20px 32px", borderBottom: "1px solid rgba(51,133,255,0.1)",
          background: "#0d1421",
        }}>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700, color: "#e2eaf5", margin: 0 }}>
            {currentTitle}
          </h1>
        </div>
        <div style={{ padding: "32px", flex: 1 }}>
          {children}
        </div>
      </main>
    </div>
  );
}
