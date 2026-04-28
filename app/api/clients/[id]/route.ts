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
  if (body.name    !== undefined) data.name    = body.name;
  if (body.logo    !== undefined) data.logo    = body.logo;
  if (body.url     !== undefined) data.url     = body.url;
  if (body.visible !== undefined) data.visible = Boolean(body.visible);
  if (body.order   !== undefined) data.order   = Number(body.order);
  const client = await db.clientLogo.update({ where: { id }, data });
  return NextResponse.json(client);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAuth(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  await db.clientLogo.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
