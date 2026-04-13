"use client";

import { useEffect } from "react";
import { useCrmStore } from "@/stores/crmStore";
import { useAuthStore } from "@/stores/authStore";
import { Mail, FileText, Receipt, Calendar, TrendingUp, Clock } from "lucide-react";

const fmt = (n: number, currency = "MXN") =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency }).format(n);

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)   return "ahora";
  if (m < 60)  return `hace ${m}m`;
  if (m < 1440) return `hace ${Math.floor(m / 60)}h`;
  return `hace ${Math.floor(m / 1440)}d`;
}

export default function DashboardPage() {
  const token = useAuthStore(s => s.token)!;
  const { messages, quotes, invoices, appointments, loading, fetchAll } = useCrmStore();

  useEffect(() => { fetchAll(token); }, []);

  const unreadMessages = messages.filter(m => !m.read).length;
  const pendingQuotes  = quotes.filter(q => q.status === "pendiente").length;
  const unpaidInvoices = invoices.filter(i => i.status === "enviada" || i.status === "vencida");
  const unpaidTotal    = unpaidInvoices.reduce((s, i) => s + i.amount, 0);
  const upcomingMeetings = appointments.filter(a => a.status !== "cancelada" && new Date(a.date) >= new Date()).length;

  const kpis = [
    { label: "Mensajes sin leer",    value: unreadMessages,         icon: <Mail size={20} />,      color: "#3385ff", href: "/admin/messages" },
    { label: "Propuestas pendientes",value: pendingQuotes,           icon: <FileText size={20} />,  color: "#f59e0b", href: "/admin/quotes" },
    { label: "Por cobrar",           value: fmt(unpaidTotal),        icon: <Receipt size={20} />,   color: "#10b981", href: "/admin/invoices" },
    { label: "Reuniones próximas",   value: upcomingMeetings,        icon: <Calendar size={20} />,  color: "#a78bfa", href: "/admin/appointments" },
  ];

  const recent = [
    ...messages.slice(0, 3).map(m => ({ type: "Mensaje", name: m.name, sub: m.email, date: m.createdAt, dot: "#3385ff", unread: !m.read })),
    ...quotes.slice(0, 2).map(q  => ({ type: "Propuesta", name: q.name, sub: q.projectType || "web", date: q.createdAt, dot: "#f59e0b", unread: false })),
    ...appointments.slice(0, 2).map(a => ({ type: "Reunión", name: a.name, sub: `${a.date}${a.time ? ` ${a.time}` : ""}`, date: a.createdAt, dot: "#a78bfa", unread: false })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 6);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        {kpis.map(k => (
          <a key={k.label} href={k.href} style={{ textDecoration: "none" }}>
            <div style={{
              background: "#0d1421", border: "1px solid rgba(51,133,255,0.14)",
              padding: "24px 20px", display: "flex", flexDirection: "column", gap: 12,
              transition: "border-color 0.2s, transform 0.2s",
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = k.color; (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(51,133,255,0.14)"; (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; }}
            >
              <div style={{ color: k.color }}>{k.icon}</div>
              <div>
                <div style={{ fontSize: 24, fontWeight: 700, color: "#e2eaf5", fontFamily: "var(--font-display)", lineHeight: 1.1 }}>
                  {loading ? "—" : k.value}
                </div>
                <div style={{ fontSize: 10, color: "#8899aa", letterSpacing: "0.14em", textTransform: "uppercase", marginTop: 4 }}>
                  {k.label}
                </div>
              </div>
            </div>
          </a>
        ))}
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {/* Quote status breakdown */}
        <div style={{ background: "#0d1421", border: "1px solid rgba(51,133,255,0.14)", padding: "20px 24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <TrendingUp size={14} style={{ color: "#f59e0b" }} />
            <span style={{ fontSize: 10, letterSpacing: "0.18em", color: "#8899aa", textTransform: "uppercase" }}>Propuestas</span>
          </div>
          {[
            { label: "Pendientes", status: "pendiente",  color: "#f59e0b" },
            { label: "En revisión", status: "revision",  color: "#3385ff" },
            { label: "Aprobadas",   status: "aprobada",  color: "#10b981" },
            { label: "Rechazadas",  status: "rechazada", color: "#ef4444" },
          ].map(row => {
            const count = quotes.filter(q => q.status === row.status).length;
            return (
              <div key={row.status} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: row.color, display: "inline-block" }} />
                  <span style={{ fontSize: 12, color: "#8899aa" }}>{row.label}</span>
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#e2eaf5" }}>{loading ? "—" : count}</span>
              </div>
            );
          })}
        </div>

        {/* Invoice status breakdown */}
        <div style={{ background: "#0d1421", border: "1px solid rgba(51,133,255,0.14)", padding: "20px 24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <Receipt size={14} style={{ color: "#10b981" }} />
            <span style={{ fontSize: 10, letterSpacing: "0.18em", color: "#8899aa", textTransform: "uppercase" }}>Facturas</span>
          </div>
          {[
            { label: "Borrador",  status: "borrador", color: "#8899aa" },
            { label: "Enviadas",  status: "enviada",  color: "#3385ff" },
            { label: "Pagadas",   status: "pagada",   color: "#10b981" },
            { label: "Vencidas",  status: "vencida",  color: "#ef4444" },
          ].map(row => {
            const count = invoices.filter(i => i.status === row.status).length;
            return (
              <div key={row.status} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: row.color, display: "inline-block" }} />
                  <span style={{ fontSize: 12, color: "#8899aa" }}>{row.label}</span>
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#e2eaf5" }}>{loading ? "—" : count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent activity */}
      <div style={{ background: "#0d1421", border: "1px solid rgba(51,133,255,0.14)" }}>
        <div style={{ padding: "16px 24px", borderBottom: "1px solid rgba(51,133,255,0.1)", display: "flex", alignItems: "center", gap: 8 }}>
          <Clock size={14} style={{ color: "#8899aa" }} />
          <span style={{ fontSize: 10, letterSpacing: "0.18em", color: "#8899aa", textTransform: "uppercase" }}>Actividad reciente</span>
        </div>
        {loading && <p style={{ padding: "16px 24px", color: "#8899aa", fontSize: 12 }}>Cargando…</p>}
        {!loading && recent.length === 0 && <p style={{ padding: "16px 24px", color: "#4a5568", fontSize: 12 }}>Sin actividad reciente.</p>}
        {recent.map((r, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "center", gap: 14, padding: "12px 24px",
            borderBottom: i < recent.length - 1 ? "1px solid rgba(51,133,255,0.07)" : "none",
          }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: r.dot, flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 11, color: "#e2eaf5", fontWeight: 500 }}>{r.name}</span>
                {r.unread && <span style={{ fontSize: 8, padding: "1px 5px", background: "#3385ff", color: "#fff", letterSpacing: "0.1em" }}>NUEVO</span>}
              </div>
              <span style={{ fontSize: 10, color: "#4a5568" }}>{r.type} · {r.sub}</span>
            </div>
            <span style={{ fontSize: 10, color: "#4a5568", flexShrink: 0 }}>{timeAgo(r.date)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
