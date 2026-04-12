import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyToken, extractBearerToken } from "@/lib/auth";

export async function GET() {
  const services = await db.service.findMany({ orderBy: [{ order: "asc" }, { createdAt: "asc" }] });
  return NextResponse.json(services);
}

export async function POST(req: NextRequest) {
  const token = extractBearerToken(req.headers.get("authorization"));
  if (!token || !(await verifyToken(token))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const service = await db.service.create({
    data: {
      title_en:       body.title_en       || "",
      title_es:       body.title_es       || body.title_en || "",
      description_en: body.description_en || null,
      description_es: body.description_es || null,
      icon:           body.icon           || null,
      image:          body.image          || null,
      visible:        body.visible !== false,
      order:          Number(body.order) || 0,
    },
  });
  return NextResponse.json(service, { status: 201 });
}
