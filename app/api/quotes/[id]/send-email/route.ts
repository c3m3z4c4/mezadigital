import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { db } from "@/lib/db";
import { verifyToken, extractBearerToken } from "@/lib/auth";
import { buildQuotePDF, quoteFileName } from "@/lib/pdf/quote";

const FROM = "cmeza@mezadigital.com";

function getTransporter() {
  return nodemailer.createTransport({
    host:   process.env.SMTP_HOST || "mail.mezadigital.com",
    port:   Number(process.env.SMTP_PORT) || 465,
    secure: (process.env.SMTP_PORT || "465") === "465",
    auth: {
      user: process.env.SMTP_USER || FROM,
      pass: process.env.SMTP_PASS,
    },
  });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = extractBearerToken(req.headers.get("authorization"));
    if (!token || !(await verifyToken(token))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { greeting, to } = await req.json() as { greeting?: string; to?: string };

    const raw = await db.quote.findUnique({ where: { id } });
    if (!raw) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const recipient = (to || raw.email).trim();
    const pdfBuffer = await buildQuotePDF(raw);
    const filename  = quoteFileName(raw.name);

    const greetingLine = greeting?.trim()
      ? greeting.trim()
      : `Estimado/a ${raw.name},`;

    const htmlBody = `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /></head>
<body style="margin:0;padding:0;background:#f5f7fa;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f7fa;padding:32px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #d1d9e6;border-radius:2px;overflow:hidden;">
        <!-- Header -->
        <tr>
          <td style="background:#0f1923;padding:24px 32px;">
            <span style="font-size:22px;font-weight:900;color:#ffffff;letter-spacing:-0.03em;">
              meza<span style="color:#0055CC;">digital</span>
            </span>
            <div style="font-size:9px;color:#4a5568;letter-spacing:0.2em;margin-top:4px;text-transform:uppercase;">Soluciones Digitales</div>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:32px;">
            <p style="margin:0 0 20px;font-size:14px;color:#0f1923;line-height:1.6;">${greetingLine.replace(/\n/g, "<br>")}</p>
            <p style="margin:0 0 20px;font-size:13px;color:#4a5568;line-height:1.6;">
              Adjunto a este correo encontrará la cotización <strong style="color:#0f1923;">${"COT-" + raw.id.slice(-6).toUpperCase()}</strong>
              para el proyecto <strong style="color:#0f1923;">${raw.projectType || "digital"}</strong>.
            </p>
            <p style="margin:0 0 24px;font-size:13px;color:#4a5568;line-height:1.6;">
              El documento incluye el desglose de costos, alcance del proyecto y términos. Para cualquier duda o ajuste,
              responda a este correo y con gusto lo atendemos.
            </p>
            <table cellpadding="0" cellspacing="0" style="margin:24px 0;background:#f5f7fa;border:1px solid #d1d9e6;width:100%;">
              <tr><td style="padding:16px 20px;font-size:11px;color:#4a5568;font-style:italic;">
                * Los precios expresados en la cotización están en MXN y no incluyen IVA (16%).
              </td></tr>
            </table>
            <p style="margin:0;font-size:13px;color:#0f1923;">
              Saludos cordiales,<br>
              <strong>César Meza</strong><br>
              <span style="color:#0055CC;">Meza Digital</span><br>
              <a href="https://mezadigital.com" style="color:#0055CC;text-decoration:none;">mezadigital.com</a>
            </p>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background:#f5f7fa;border-top:1px solid #d1d9e6;padding:14px 32px;">
            <p style="margin:0;font-size:10px;color:#8899aa;">
              mezadigital.com · contacto@mezadigital.com · Este correo fue enviado desde el sistema CRM de Meza Digital.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

    const transporter = getTransporter();

    await transporter.sendMail({
      from:    `"Meza Digital" <${FROM}>`,
      to:      recipient,
      subject: `Cotización — Proyecto ${raw.projectType || "Digital"} | Meza Digital`,
      html:    htmlBody,
      attachments: [{
        filename,
        content:     pdfBuffer,
        contentType: "application/pdf",
      }],
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[send-email error]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
