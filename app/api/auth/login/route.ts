import { NextRequest, NextResponse } from "next/server";
import { signToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  const ADMIN_EMAIL    = process.env.ADMIN_EMAIL    || "admin@mezadigital.com";
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "meza2024";

  if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 });
  }

  const token = await signToken({ email });
  return NextResponse.json({ token, email });
}
