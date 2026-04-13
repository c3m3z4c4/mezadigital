"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { useLangStore } from "@/stores/langStore";

const schema = z.object({
  name:    z.string().min(2),
  email:   z.string().email(),
  message: z.string().min(10),
});

type FormData = z.infer<typeof schema>;

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label
        className="label-caps"
        style={{ color: error ? "#e53e3e" : "var(--color-ink-dim)" }}
      >
        {label}
      </label>
      {children}
      {error && (
        <span style={{ fontSize: 11, color: "#e53e3e" }}>{error}</span>
      )}
    </div>
  );
}

const INPUT_STYLE: React.CSSProperties = {
  padding: "12px 16px",
  background: "var(--color-surface)",
  border: "1px solid var(--color-border)",
  color: "var(--color-ink)",
  fontSize: 14,
  fontFamily: "var(--font-body)",
  outline: "none",
  width: "100%",
  transition: "border-color 0.2s",
};

export function ContactSection() {
  const { t } = useLangStore();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      toast.success(t.contact.success);
      reset();
    } catch {
      toast.error(t.contact.error);
    }
  }

  return (
    <section
      id="contacto"
      style={{
        padding: "120px 32px",
        background: "var(--color-surface-2)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Accent line top */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: "linear-gradient(90deg, var(--color-blue), var(--color-cyan))",
        }}
      />

      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 80,
          alignItems: "start",
        }}
        className="contact-grid"
      >
        {/* Left: Info */}
        <ScrollReveal>
          <span
            className="label-caps"
            style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}
          >
            <span
              style={{
                display: "inline-block",
                width: 24,
                height: 1.5,
                background: "var(--color-blue)",
              }}
            />
            {t.contact.label}
          </span>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(2rem, 3.5vw, 3rem)",
              fontWeight: 900,
              color: "var(--color-ink)",
              lineHeight: 1.1,
              marginBottom: 24,
            }}
          >
            {t.contact.title}
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
              maxWidth: 400,
              marginBottom: 40,
            }}
          >
            {t.contact.sub}
          </p>

          {/* Contact detail */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "16px 20px",
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
              }}
            >
              <span style={{ fontSize: 20 }}>✉️</span>
              <div>
                <p className="label-caps" style={{ fontSize: 9, marginBottom: 2 }}>Email</p>
                <a
                  href="mailto:contacto@mezadigital.com"
                  style={{ fontSize: 13, color: "var(--color-blue)", textDecoration: "none", fontWeight: 500 }}
                >
                  contacto@mezadigital.com
                </a>
              </div>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "16px 20px",
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
              }}
            >
              <span style={{ fontSize: 20 }}>📍</span>
              <div>
                <p className="label-caps" style={{ fontSize: 9, marginBottom: 2 }}>Ubicación</p>
                <p style={{ fontSize: 13, color: "var(--color-ink-dim)", margin: 0 }}>
                  México
                </p>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Right: Form */}
        <ScrollReveal delay={150}>
          <form
            onSubmit={handleSubmit(onSubmit)}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 20,
              padding: "40px",
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
            }}
          >
            <Field label={t.contact.name} error={errors.name?.message}>
              <input
                {...register("name")}
                placeholder={t.contact.namePlaceholder}
                style={{
                  ...INPUT_STYLE,
                  borderColor: errors.name ? "#e53e3e" : "var(--color-border)",
                }}
                onFocus={(e) => (e.target.style.borderColor = "var(--color-blue)")}
                onBlur={(e) => (e.target.style.borderColor = errors.name ? "#e53e3e" : "var(--color-border)")}
              />
            </Field>

            <Field label={t.contact.email} error={errors.email?.message}>
              <input
                {...register("email")}
                type="email"
                placeholder={t.contact.emailPlaceholder}
                style={{
                  ...INPUT_STYLE,
                  borderColor: errors.email ? "#e53e3e" : "var(--color-border)",
                }}
                onFocus={(e) => (e.target.style.borderColor = "var(--color-blue)")}
                onBlur={(e) => (e.target.style.borderColor = errors.email ? "#e53e3e" : "var(--color-border)")}
              />
            </Field>

            <Field label={t.contact.message} error={errors.message?.message}>
              <textarea
                {...register("message")}
                placeholder={t.contact.messagePlaceholder}
                rows={5}
                style={{
                  ...INPUT_STYLE,
                  resize: "vertical",
                  borderColor: errors.message ? "#e53e3e" : "var(--color-border)",
                }}
                onFocus={(e) => (e.target.style.borderColor = "var(--color-blue)")}
                onBlur={(e) => (e.target.style.borderColor = errors.message ? "#e53e3e" : "var(--color-border)")}
              />
            </Field>

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                padding: "14px 32px",
                background: isSubmitting ? "var(--color-muted)" : "var(--color-blue)",
                color: "#fff",
                border: "none",
                fontSize: 14,
                fontWeight: 600,
                fontFamily: "var(--font-body)",
                letterSpacing: "0.06em",
                cursor: isSubmitting ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                transition: "background 0.25s, transform 0.25s",
              }}
              onMouseEnter={(e) => {
                if (!isSubmitting) {
                  (e.currentTarget as HTMLElement).style.background = "var(--color-blue-bright)";
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                }
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = isSubmitting ? "var(--color-muted)" : "var(--color-blue)";
                (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
              }}
            >
              {isSubmitting ? t.contact.sending : t.contact.submit}
              {!isSubmitting && <span>→</span>}
            </button>
          </form>
        </ScrollReveal>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .contact-grid { grid-template-columns: 1fr !important; gap: 48px !important; }
        }
      `}</style>
    </section>
  );
}
