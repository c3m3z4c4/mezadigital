import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyToken, extractBearerToken } from "@/lib/auth";

async function requireAuth(req: NextRequest) {
  const token = extractBearerToken(req.headers.get("authorization"));
  if (!token || !(await verifyToken(token))) return false;
  return true;
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAuth(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const data: Record<string, unknown> = {};
  if (body.title_en       !== undefined) data.title_en       = body.title_en;
  if (body.title_es       !== undefined) data.title_es       = body.title_es;
  if (body.description_en !== undefined) data.description_en = body.description_en;
  if (body.description_es !== undefined) data.description_es = body.description_es;
  if (body.icon           !== undefined) data.icon           = body.icon;
  if (body.image          !== undefined) data.image          = body.image;
  if (body.visible        !== undefined) data.visible        = Boolean(body.visible);
  if (body.order          !== undefined) data.order          = Number(body.order);

  const service = await db.service.update({ where: { id }, data });
  return NextResponse.json(service);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAuth(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await db.service.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
