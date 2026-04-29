import { NextRequest, NextResponse } from "next/server";
import { signToken } from "@/lib/auth";
import { db as prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  if (!email || !password) {
    return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 });
  }

  const ADMIN_EMAIL    = process.env.ADMIN_EMAIL    || "admin@mezadigital.com";
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "meza2024";

  // env-var superadmin
  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    const token = await signToken({ email, role: "admin" });
    return NextResponse.json({ token, email, role: "admin" });
  }

  // DB users
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.active) {
    return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 });
  }
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 });
  }

  const token = await signToken({ email, role: user.role });
  return NextResponse.json({ token, email, role: user.role });
}
