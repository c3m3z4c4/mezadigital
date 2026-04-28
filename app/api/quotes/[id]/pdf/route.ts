import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyToken, extractBearerToken } from "@/lib/auth";
import type { QuoteItem } from "@/lib/api/crm";

const BLUE    = "#0055CC";
const INK     = "#0f1923";
const DIM     = "#8899aa";
const BORDER  = "#d1d9e6";
const BG      = "#f5f7fa";
const IVA     = 0.16;
const W       = 512; // usable width (612 - 50 - 50)

function fmt(n: number) {
  return "$" + n.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function quoteNum(id: string) { return "COT-" + id.slice(-6).toUpperCase(); }

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = extractBearerToken(req.headers.get("authorization"));
    if (!token || !(await verifyToken(token))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const raw = await db.quote.findUnique({ where: { id } });
    if (!raw) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const items: QuoteItem[] = Array.isArray(raw.items) && (raw.items as unknown as QuoteItem[]).length > 0
      ? (raw.items as unknown as QuoteItem[])
      : raw.price
        ? [{ description: raw.projectType ? `Desarrollo ${raw.projectType}` : "Proyecto digital", qty: 1, unitPrice: raw.price }]
        : [];

    const subtotal = items.reduce((s, it) => s + it.qty * it.unitPrice, 0);
    const iva      = subtotal * IVA;
    const total    = subtotal + iva;

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const PDFDocument = require("pdfkit");
    const doc = new PDFDocument({ size: "LETTER", margins: { top: 40, bottom: 60, left: 50, right: 50 }, autoFirstPage: true });

    const chunks: Buffer[] = [];
    doc.on("data", (c: Buffer) => chunks.push(c));

    const endPromise = new Promise<void>((resolve, reject) => {
      doc.on("end", resolve);
      doc.on("error", reject);
    });

    const L = 50;   // left margin
    const R = 562;  // right edge

    // ── Header ──────────────────────────────────────────────────
    doc.font("Helvetica-Bold").fontSize(22).fillColor(INK).text("meza", L, 40, { continued: true });
    doc.fillColor(BLUE).text("digital");
    doc.font("Helvetica").fontSize(7).fillColor(DIM).text("SOLUCIONES DIGITALES", L, 66);

    // Meta right column
    const metaX = 380;
    let metaY = 40;
    doc.font("Helvetica").fontSize(7).fillColor(DIM).text("COTIZACIÓN", metaX, metaY, { width: R - metaX, align: "right" });
    metaY += 11;
    doc.font("Helvetica-Bold").fontSize(12).fillColor(BLUE).text(quoteNum(raw.id), metaX, metaY, { width: R - metaX, align: "right" });
    metaY += 18;
    doc.font("Helvetica").fontSize(7).fillColor(DIM).text("FECHA", metaX, metaY, { width: R - metaX, align: "right" });
    metaY += 11;
    doc.fontSize(9).fillColor(INK).text(new Date().toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" }), metaX, metaY, { width: R - metaX, align: "right" });
    if (raw.timeline) {
      metaY += 16;
      doc.font("Helvetica").fontSize(7).fillColor(DIM).text("TIEMPO ESTIMADO", metaX, metaY, { width: R - metaX, align: "right" });
      metaY += 11;
      doc.fontSize(9).fillColor(INK).text(raw.timeline, metaX, metaY, { width: R - metaX, align: "right" });
    }

    // Blue accent line
    let y = 90;
    doc.moveTo(L, y).lineTo(R, y).lineWidth(2).strokeColor(BLUE).stroke();
    y += 20;

    // ── Para ──────────────────────────────────────────────────────
    doc.font("Helvetica").fontSize(7).fillColor(DIM).text("PARA", L, y); y += 14;
    doc.font("Helvetica-Bold").fontSize(14).fillColor(INK).text(raw.name, L, y); y += 18;
    if (raw.company) { doc.font("Helvetica").fontSize(9).fillColor(DIM).text(raw.company, L, y); y += 13; }
    doc.font("Helvetica").fontSize(9).fillColor(BLUE).text(raw.email, L, y); y += 22;

    // ── Detalles del proyecto ──────────────────────────────────────
    const details: [string, string][] = [
      ["Tipo de proyecto", raw.projectType ?? ""],
      ["Tech stack",       raw.techStack   ?? ""],
    ].filter(([, v]) => v) as [string, string][];

    if (details.length > 0) {
      doc.font("Helvetica").fontSize(7).fillColor(DIM).text("DETALLES DEL PROYECTO", L, y); y += 12;
      for (const [k, v] of details) {
        doc.font("Helvetica").fontSize(8.5).fillColor(DIM).text(k, L, y, { width: 130 });
        doc.fillColor(INK).text(v, L + 135, y, { width: W - 135 });
        y += 13;
      }
      y += 8;
    }

    // ── Alcance ────────────────────────────────────────────────────
    doc.font("Helvetica").fontSize(7).fillColor(DIM).text("ALCANCE DEL PROYECTO", L, y); y += 12;
    const descHeight = doc.heightOfString(raw.description, { width: W, lineGap: 3 });
    doc.font("Helvetica").fontSize(8.5).fillColor(INK).text(raw.description, L, y, { width: W, lineGap: 3 });
    y += descHeight + 18;

    // ── Tabla de costos ────────────────────────────────────────────
    if (items.length > 0) {
      doc.font("Helvetica").fontSize(7).fillColor(DIM).text("DESGLOSE DE COSTOS", L, y); y += 10;

      // Table header
      doc.rect(L, y, W, 22).fill(INK);
      doc.font("Helvetica-Bold").fontSize(8).fillColor("#ffffff");
      doc.text("Concepto",     L + 8,       y + 7, { width: W - 220 - 8 });
      doc.text("Cant.",        L + W - 212, y + 7, { width: 40, align: "center" });
      doc.text("Precio unit.", L + W - 165, y + 7, { width: 80, align: "right" });
      doc.text("Total",        L + W - 80,  y + 7, { width: 72, align: "right" });
      y += 23;

      // Rows
      for (let i = 0; i < items.length; i++) {
        const it = items[i];
        const rowH = Math.max(22, doc.heightOfString(it.description, { width: W - 220 }) + 10);
        if (i % 2 !== 0) doc.rect(L, y, W, rowH).fill(BG);
        doc.font("Helvetica").fontSize(8.5).fillColor(INK);
        doc.text(it.description, L + 8, y + 6, { width: W - 220 - 8 });
        doc.fillColor(DIM).text(String(it.qty), L + W - 212, y + 6, { width: 40, align: "center" });
        doc.text(fmt(it.unitPrice), L + W - 165, y + 6, { width: 80, align: "right" });
        doc.font("Helvetica-Bold").fillColor(INK).text(fmt(it.qty * it.unitPrice), L + W - 80, y + 6, { width: 72, align: "right" });
        // border
        doc.moveTo(L, y + rowH).lineTo(R, y + rowH).lineWidth(0.5).strokeColor(BORDER).stroke();
        y += rowH;
      }

      y += 6;

      // Totals (right-aligned)
      const totX = R - 220;
      const totW = 220;
      doc.font("Helvetica").fontSize(8.5).fillColor(DIM).text("Subtotal", totX, y, { width: 120 });
      doc.fillColor(INK).text(fmt(subtotal), totX + 120, y, { width: totW - 120, align: "right" }); y += 14;
      doc.fillColor(DIM).text("IVA (16%)", totX, y, { width: 120 });
      doc.fillColor(INK).text(fmt(iva), totX + 120, y, { width: totW - 120, align: "right" }); y += 4;

      // Total row with blue bg
      doc.rect(totX, y, totW, 22).fill(BLUE);
      doc.font("Helvetica-Bold").fontSize(9).fillColor("#ffffff");
      doc.text("TOTAL", totX + 8, y + 7, { width: 100 });
      doc.text(fmt(total), totX + 100, y + 7, { width: totW - 108, align: "right" });
      y += 30;
    }

    // ── Notas ──────────────────────────────────────────────────────
    if (raw.notes) {
      doc.rect(L, y, W, doc.heightOfString(raw.notes, { width: W - 20 }) + 20).fill(BG);
      doc.font("Helvetica").fontSize(7).fillColor(DIM).text("NOTAS ADICIONALES", L + 10, y + 8);
      doc.fontSize(8.5).fillColor(INK).text(raw.notes, L + 10, y + 20, { width: W - 20 });
    }

    // ── Footer (page bottom) ────────────────────────────────────────
    const footY = doc.page.height - 45;
    doc.moveTo(L, footY).lineTo(R, footY).lineWidth(0.5).strokeColor(BORDER).stroke();
    doc.font("Helvetica").fontSize(7).fillColor(DIM).text("mezadigital.com  ·  contacto@mezadigital.com", L, footY + 8);
    doc.text("* Precios expresados en MXN, más IVA (16%)", L, footY + 8, { width: W, align: "right" });

    doc.end();
    await endPromise;

    const buffer = Buffer.concat(chunks);
    const filename = `Cotizacion-MezaDigital-${raw.name.replace(/\s+/g, "-")}.pdf`;

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[PDF route error]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
