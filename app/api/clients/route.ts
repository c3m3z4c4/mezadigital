import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyToken, extractBearerToken } from "@/lib/auth";

// Public GET
export async function GET() {
  const clients = await db.clientLogo.findMany({
    where: { visible: true },
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
  });
  return NextResponse.json(clients);
}

// Admin POST
export async function POST(req: NextRequest) {
  const token = extractBearerToken(req.headers.get("authorization"));
  if (!token || !(await verifyToken(token))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  if (!body.name) {
    return NextResponse.json({ error: "name es requerido" }, { status: 400 });
  }

  const client = await db.clientLogo.create({
    data: {
      name:    body.name,
      logo:    body.logo    || null,
      url:     body.url     || null,
      visible: body.visible !== false,
      order:   Number(body.order) || 0,
    },
  });
  return NextResponse.json(client, { status: 201 });
}
