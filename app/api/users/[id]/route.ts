import { NextRequest, NextResponse } from "next/server";
import { verifyToken, extractBearerToken } from "@/lib/auth";
import { db as prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

async function requireAdmin(req: NextRequest) {
  const token = extractBearerToken(req.headers.get("authorization"));
  if (!token) return null;
  const payload = await verifyToken(token);
  if (!payload) return null;
  if (payload.email === (process.env.ADMIN_EMAIL || "admin@mezadigital.com")) return payload;
  const user = await prisma.user.findUnique({ where: { email: payload.email } });
  if (!user || !user.active || user.role !== "admin") return null;
  return payload;
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const data: Record<string, unknown> = {};
  if (body.password) data.passwordHash = await bcrypt.hash(body.password, 12);
  if (body.role !== undefined) data.role = body.role;
  if (body.active !== undefined) data.active = body.active;

  const user = await prisma.user.update({
    where: { id },
    data,
    select: { id: true, email: true, role: true, active: true, createdAt: true },
  });
  return NextResponse.json(user);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
