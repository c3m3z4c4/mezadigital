import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyToken, extractBearerToken } from "@/lib/auth";

async function requireAuth(req: NextRequest) {
  const token = extractBearerToken(req.headers.get("authorization"));
  return token ? await verifyToken(token) : null;
}

export async function GET(req: NextRequest) {
  if (!(await requireAuth(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const invoices = await db.invoice.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(invoices);
}

export async function POST(req: NextRequest) {
  if (!(await requireAuth(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  // Auto-generate invoice number if not provided
  const count  = await db.invoice.count();
  const number = body.number || `INV-${String(count + 1).padStart(4, "0")}`;
  const invoice = await db.invoice.create({
    data: {
      number,
      clientName:  body.clientName  || "",
      clientEmail: body.clientEmail || null,
      concept:     body.concept     || "",
      amount:      Number(body.amount) || 0,
      currency:    body.currency    || "MXN",
      status:      body.status      || "borrador",
      dueDate:     body.dueDate     || null,
      issuedAt:    body.issuedAt    || null,
      notes:       body.notes       || null,
    },
  });
  return NextResponse.json(invoice, { status: 201 });
}
