import path from "path";
import type { QuoteItem } from "@/lib/api/crm";

const BLUE   = "#0055CC";
const INK    = "#0f1923";
const DIM    = "#8899aa";
const BORDER = "#d1d9e6";
const BG     = "#f5f7fa";
const IVA    = 0.16;
const L      = 50;
const W      = 512;
const R      = L + W;
const COL_DESC = W - 232;
const COL_QTY  = 42;
const COL_UNIT = 90;
const COL_TOT  = W - COL_DESC - COL_QTY - COL_UNIT;
const ROW_H    = 22;

function fmt(n: number) {
  return "$" + n.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function quoteNum(id: string) { return "COT-" + id.slice(-6).toUpperCase(); }

interface QuoteRaw {
  id: string;
  name: string;
  email: string;
  company?: string | null;
  projectType?: string | null;
  techStack?: string | null;
  timeline?: string | null;
  description: string;
  notes?: string | null;
  price?: number | null;
  items?: unknown;
}

export async function buildQuotePDF(raw: QuoteRaw): Promise<Buffer> {
  const items: QuoteItem[] = Array.isArray(raw.items) && (raw.items as QuoteItem[]).length > 0
    ? (raw.items as QuoteItem[])
    : raw.price
      ? [{ description: raw.projectType ? `Desarrollo ${raw.projectType}` : "Proyecto digital", qty: 1, unitPrice: raw.price }]
      : [];

  const subtotal = items.reduce((s, it) => s + it.qty * it.unitPrice, 0);
  const iva      = subtotal * IVA;
  const total    = subtotal + iva;

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const PDFDocument = require("pdfkit");
  const doc = new PDFDocument({
    size: "LETTER",
    margins: { top: 40, bottom: 60, left: L, right: L },
    autoFirstPage: true,
  });

  const chunks: Buffer[] = [];
  doc.on("data", (c: Buffer) => chunks.push(c));
  const endPromise = new Promise<void>((resolve, reject) => {
    doc.on("end", resolve);
    doc.on("error", reject);
  });

  // ── HEADER ────────────────────────────────────────────────────────
  const logoPath = path.join(process.cwd(), "public", "assets", "images", "Logo@2x.png");
  doc.image(logoPath, L, 36, { width: 140 });

  const metaX = 370;
  let metaY = 36;
  doc.font("Helvetica").fontSize(7).fillColor(DIM)
     .text("COTIZACIÓN", metaX, metaY, { width: R - metaX, align: "right" });
  metaY += 12;
  doc.font("Helvetica-Bold").fontSize(13).fillColor(BLUE)
     .text(quoteNum(raw.id), metaX, metaY, { width: R - metaX, align: "right" });
  metaY += 20;
  doc.font("Helvetica").fontSize(7).fillColor(DIM)
     .text("FECHA", metaX, metaY, { width: R - metaX, align: "right" });
  metaY += 12;
  doc.font("Helvetica").fontSize(9).fillColor(INK)
     .text(new Date().toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" }),
       metaX, metaY, { width: R - metaX, align: "right" });
  if (raw.timeline) {
    metaY += 18;
    doc.font("Helvetica").fontSize(7).fillColor(DIM)
       .text("TIEMPO ESTIMADO", metaX, metaY, { width: R - metaX, align: "right" });
    metaY += 12;
    doc.font("Helvetica").fontSize(9).fillColor(INK)
       .text(raw.timeline, metaX, metaY, { width: R - metaX, align: "right" });
  }

  let y = Math.max(metaY + 20, 110);
  doc.moveTo(L, y).lineTo(R, y).lineWidth(2).strokeColor(BLUE).stroke();
  y += 20;

  // ── PARA ──────────────────────────────────────────────────────────
  doc.font("Helvetica").fontSize(7).fillColor(DIM).text("PARA", L, y);
  y += 14;
  doc.font("Helvetica-Bold").fontSize(14).fillColor(INK).text(raw.name, L, y);
  y += 20;
  if (raw.company) {
    doc.font("Helvetica").fontSize(9).fillColor(DIM).text(raw.company, L, y);
    y += 14;
  }
  doc.font("Helvetica").fontSize(9).fillColor(BLUE).text(raw.email, L, y);
  y += 22;

  // ── DETALLES DEL PROYECTO ─────────────────────────────────────────
  const details: [string, string][] = [
    ["Tipo de proyecto", raw.projectType ?? ""],
    ["Tech stack",       raw.techStack   ?? ""],
  ].filter(([, v]) => v) as [string, string][];

  if (details.length > 0) {
    doc.font("Helvetica").fontSize(7).fillColor(DIM).text("DETALLES DEL PROYECTO", L, y);
    y += 13;
    for (const [k, v] of details) {
      const vWidth = W - 140;
      const rowH = Math.max(13, doc.heightOfString(v, { width: vWidth, fontSize: 8.5 }));
      doc.font("Helvetica").fontSize(8.5).fillColor(DIM).text(k, L, y, { width: 130, lineBreak: false });
      doc.fillColor(INK).text(v, L + 140, y, { width: vWidth });
      y += rowH + 4;
    }
    y += 6;
  }

  // ── ALCANCE DEL PROYECTO ──────────────────────────────────────────
  doc.font("Helvetica").fontSize(7).fillColor(DIM).text("ALCANCE DEL PROYECTO", L, y);
  y += 13;
  const descH = doc.heightOfString(raw.description, { width: W, lineGap: 2 });
  doc.font("Helvetica").fontSize(8.5).fillColor(INK).text(raw.description, L, y, { width: W, lineGap: 2 });
  y += descH + 20;

  // ── DESGLOSE DE COSTOS ────────────────────────────────────────────
  if (items.length > 0) {
    doc.font("Helvetica").fontSize(7).fillColor(DIM).text("DESGLOSE DE COSTOS", L, y);
    y += 11;

    doc.rect(L, y, W, ROW_H).fill(INK);
    doc.font("Helvetica-Bold").fontSize(8).fillColor("#ffffff");
    doc.text("Concepto",     L + 8,                                y + 7, { width: COL_DESC - 8,  lineBreak: false });
    doc.text("Cant.",        L + COL_DESC,                         y + 7, { width: COL_QTY,  align: "center", lineBreak: false });
    doc.text("Precio unit.", L + COL_DESC + COL_QTY,              y + 7, { width: COL_UNIT, align: "right",  lineBreak: false });
    doc.text("Total",        L + COL_DESC + COL_QTY + COL_UNIT,  y + 7, { width: COL_TOT - 8, align: "right", lineBreak: false });
    y += ROW_H + 1;

    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      const textH = doc.heightOfString(it.description, { width: COL_DESC - 16, fontSize: 8.5 });
      const rowH  = Math.max(ROW_H, textH + 10);

      if (i % 2 !== 0) doc.rect(L, y, W, rowH).fill(BG);

      doc.font("Helvetica").fontSize(8.5).fillColor(INK);
      doc.text(it.description, L + 8, y + 6, { width: COL_DESC - 16 });

      const midY = y + (rowH - 11) / 2;
      doc.fillColor(DIM)
         .text(String(it.qty), L + COL_DESC, midY, { width: COL_QTY, align: "center", lineBreak: false });
      doc.text(fmt(it.unitPrice), L + COL_DESC + COL_QTY, midY, { width: COL_UNIT, align: "right", lineBreak: false });
      doc.font("Helvetica-Bold").fillColor(INK)
         .text(fmt(it.qty * it.unitPrice), L + COL_DESC + COL_QTY + COL_UNIT, midY, { width: COL_TOT - 8, align: "right", lineBreak: false });

      doc.moveTo(L, y + rowH).lineTo(R, y + rowH).lineWidth(0.4).strokeColor(BORDER).stroke();
      y += rowH;
    }

    y += 8;

    const totColX = L + COL_DESC + COL_QTY + COL_UNIT;
    const totW    = R - totColX;
    const amtW    = totW - 8;
    const lblX    = totColX - 110;
    const lineH   = 18;

    doc.font("Helvetica").fontSize(8.5);
    doc.fillColor(DIM).text("Subtotal",    lblX,    y, { width: 110,  lineBreak: false });
    doc.fillColor(INK).text(fmt(subtotal), totColX, y, { width: amtW, align: "right", lineBreak: false });
    y += lineH;
    doc.fillColor(DIM).text("IVA (16%)",  lblX,    y, { width: 110,  lineBreak: false });
    doc.fillColor(INK).text(fmt(iva),      totColX, y, { width: amtW, align: "right", lineBreak: false });
    y += lineH + 2;

    const grandW = totW + 110;
    const grandX = lblX;
    doc.rect(grandX, y, grandW, 24).fill(BLUE);
    doc.font("Helvetica-Bold").fontSize(9).fillColor("#ffffff");
    doc.text("TOTAL",    grandX + 10, y + 8, { width: 80,            lineBreak: false });
    doc.text(fmt(total), grandX + 90, y + 8, { width: grandW - 98, align: "right", lineBreak: false });
    y += 34;
  }

  // ── NOTAS ADICIONALES ─────────────────────────────────────────────
  if (raw.notes) {
    const notesH = doc.heightOfString(raw.notes, { width: W - 20, fontSize: 8.5, lineGap: 2 });
    const boxH   = notesH + 28;
    doc.rect(L, y, W, boxH).fill(BG);
    doc.font("Helvetica").fontSize(7).fillColor(DIM).text("NOTAS ADICIONALES", L + 10, y + 9);
    doc.font("Helvetica").fontSize(8.5).fillColor(INK)
       .text(raw.notes, L + 10, y + 21, { width: W - 20, lineGap: 2 });
    y += boxH + 10;
  }

  // ── FOOTER ────────────────────────────────────────────────────────
  const footY = doc.page.height - 44;
  doc.moveTo(L, footY).lineTo(R, footY).lineWidth(0.5).strokeColor(BORDER).stroke();
  doc.font("Helvetica").fontSize(7).fillColor(DIM)
     .text("mezadigital.com  ·  contacto@mezadigital.com", L, footY + 9);
  doc.text("* Precios expresados en MXN, más IVA (16%)", L, footY + 9, { width: W, align: "right" });

  doc.end();
  await endPromise;

  return Buffer.concat(chunks);
}

export function quoteFileName(name: string) {
  return `Cotizacion-MezaDigital-${name.replace(/\s+/g, "-")}.pdf`;
}
