import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { db } from "@/lib/db";
import { verifyToken, extractBearerToken } from "@/lib/auth";
import { QuotePDFDoc } from "@/components/QuotePDF";
import { createElement } from "react";
import type { Quote, QuoteItem } from "@/lib/api/crm";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = extractBearerToken(req.headers.get("authorization"));
  if (!token || !(await verifyToken(token))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const raw = await db.quote.findUnique({ where: { id } });
  if (!raw) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const quote: Quote = {
    id:          raw.id,
    name:        raw.name,
    email:       raw.email,
    company:     raw.company     ?? undefined,
    projectType: raw.projectType ?? undefined,
    description: raw.description,
    budget:      raw.budget      ?? undefined,
    timeline:    raw.timeline    ?? undefined,
    techStack:   raw.techStack   ?? undefined,
    status:      raw.status,
    notes:       raw.notes       ?? undefined,
    price:       raw.price       ?? null,
    items:       (raw.items as unknown as QuoteItem[]) ?? null,
    createdAt:   raw.createdAt.toISOString(),
    updatedAt:   raw.updatedAt.toISOString(),
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const buffer = await renderToBuffer(createElement(QuotePDFDoc, { quote }) as any);
  const filename = `Cotizacion-MezaDigital-${raw.name.replace(/\s+/g, "-")}.pdf`;

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
