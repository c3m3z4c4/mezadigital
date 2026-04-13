import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyToken, extractBearerToken } from "@/lib/auth";

async function requireAuth(req: NextRequest) {
  const token = extractBearerToken(req.headers.get("authorization"));
  return token ? await verifyToken(token) : null;
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAuth(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json();
  const data: Record<string, unknown> = {};
  if (body.number      !== undefined) data.number      = body.number;
  if (body.clientName  !== undefined) data.clientName  = body.clientName;
  if (body.clientEmail !== undefined) data.clientEmail = body.clientEmail;
  if (body.concept     !== undefined) data.concept     = body.concept;
  if (body.amount      !== undefined) data.amount      = Number(body.amount);
  if (body.currency    !== undefined) data.currency    = body.currency;
  if (body.status      !== undefined) data.status      = body.status;
  if (body.dueDate     !== undefined) data.dueDate     = body.dueDate;
  if (body.issuedAt    !== undefined) data.issuedAt    = body.issuedAt;
  if (body.notes       !== undefined) data.notes       = body.notes;
  const invoice = await db.invoice.update({ where: { id }, data });
  return NextResponse.json(invoice);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAuth(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  await db.invoice.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
