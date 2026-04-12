"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/stores/authStore";
import { LayoutGrid, LogOut } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();
  const { token, email, logout } = useAuthStore();

  useEffect(() => {
    if (!token && pathname !== "/admin/login") {
      router.replace("/admin/login");
    }
  }, [token, pathname, router]);

  if (!token && pathname !== "/admin/login") return null;
  if (pathname === "/admin/login") return <>{children}</>;

  function handleLogout() {
    logout();
    router.push("/admin/login");
  }

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
            <span style={{
              fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 900,
              color: "#e2eaf5", letterSpacing: "-0.01em",
            }}>
              meza<span style={{ color: "#3385ff" }}>digital</span>
            </span>
          </Link>
          <p style={{ fontSize: 9, letterSpacing: "0.2em", color: "#8899aa", textTransform: "uppercase", marginTop: 4 }}>
            Admin
          </p>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "16px 0" }}>
          <NavItem href="/admin/portfolio" active={pathname.startsWith("/admin/portfolio")} icon={<LayoutGrid size={15} />}>
            Portafolio
          </NavItem>
        </nav>

        {/* Footer */}
        <div style={{ padding: "16px 20px", borderTop: "1px solid rgba(51,133,255,0.1)" }}>
          <p style={{ fontSize: 10, color: "#4a5568", marginBottom: 10, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {email}
          </p>
          <button onClick={handleLogout} style={{
            display: "flex", alignItems: "center", gap: 6,
            background: "none", border: "none", color: "#4a5568",
            fontSize: 11, cursor: "pointer", padding: 0,
            transition: "color 0.2s",
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
        {/* Topbar */}
        <div style={{
          padding: "20px 32px", borderBottom: "1px solid rgba(51,133,255,0.1)",
          display: "flex", alignItems: "center",
          background: "#0d1421",
        }}>
          <h1 style={{
            fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700,
            color: "#e2eaf5", margin: 0,
          }}>
            {pathname.startsWith("/admin/portfolio") ? "Portafolio" : "Admin"}
          </h1>
        </div>

        {/* Content */}
        <div style={{ padding: "32px", flex: 1 }}>
          {children}
        </div>
      </main>
    </div>
  );
}

function NavItem({ href, active, icon, children }: {
  href: string; active: boolean; icon: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <Link href={href} style={{
      display: "flex", alignItems: "center", gap: 10,
      padding: "10px 20px", fontSize: 12, fontWeight: 500,
      color: active ? "#e2eaf5" : "#8899aa",
      background: active ? "rgba(51,133,255,0.1)" : "none",
      borderLeft: `2px solid ${active ? "#3385ff" : "transparent"}`,
      textDecoration: "none", transition: "color 0.2s, background 0.2s",
      letterSpacing: "0.04em",
    }}>
      {icon}
      {children}
    </Link>
  );
}
