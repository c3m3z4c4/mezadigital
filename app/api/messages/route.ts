import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyToken, extractBearerToken } from "@/lib/auth";

// GET — admin only
export async function GET(req: NextRequest) {
  const token = extractBearerToken(req.headers.get("authorization"));
  if (!token || !(await verifyToken(token))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const messages = await db.message.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(messages);
}

// POST — public (contact form)
export async function POST(req: NextRequest) {
  const body = await req.json();
  if (!body.name || !body.email || !body.message) {
    return NextResponse.json({ error: "Campos requeridos: name, email, message" }, { status: 400 });
  }
  const message = await db.message.create({
    data: {
      name:    body.name,
      email:   body.email,
      phone:   body.phone || null,
      message: body.message,
    },
  });
  return NextResponse.json(message, { status: 201 });
}
