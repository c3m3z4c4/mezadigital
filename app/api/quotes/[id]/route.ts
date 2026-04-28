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
  if (body.name        !== undefined) data.name        = body.name;
  if (body.email       !== undefined) data.email       = body.email;
  if (body.company     !== undefined) data.company     = body.company;
  if (body.projectType !== undefined) data.projectType = body.projectType;
  if (body.description !== undefined) data.description = body.description;
  if (body.budget      !== undefined) data.budget      = body.budget;
  if (body.timeline    !== undefined) data.timeline    = body.timeline;
  if (body.techStack   !== undefined) data.techStack   = body.techStack;
  if (body.status      !== undefined) data.status      = body.status;
  if (body.notes       !== undefined) data.notes       = body.notes;
  if (body.price       !== undefined) data.price       = body.price;
  if (body.items       !== undefined) data.items       = body.items;
  const quote = await db.quote.update({ where: { id }, data });
  return NextResponse.json(quote);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAuth(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  await db.quote.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
