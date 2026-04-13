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
  if (body.name   !== undefined) data.name   = body.name;
  if (body.email  !== undefined) data.email  = body.email;
  if (body.date   !== undefined) data.date   = body.date;
  if (body.time   !== undefined) data.time   = body.time;
  if (body.topic  !== undefined) data.topic  = body.topic;
  if (body.notes  !== undefined) data.notes  = body.notes;
  if (body.status !== undefined) data.status = body.status;
  const appointment = await db.appointment.update({ where: { id }, data });
  return NextResponse.json(appointment);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAuth(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  await db.appointment.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
