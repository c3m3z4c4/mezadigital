import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyToken, extractBearerToken } from "@/lib/auth";

function serialize(p: Record<string, unknown>) {
  return {
    ...p,
    images:    JSON.parse((p.images    as string) || "[]"),
    techStack: JSON.parse((p.techStack as string) || "[]"),
    tags:      JSON.parse((p.tags      as string) || "[]"),
  };
}

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
  if (body.images         !== undefined) data.images         = JSON.stringify(body.images);
  if (body.projectType    !== undefined) data.projectType    = body.projectType;
  if (body.techStack      !== undefined) data.techStack      = JSON.stringify(body.techStack);
  if (body.githubUrl      !== undefined) data.githubUrl      = body.githubUrl;
  if (body.liveUrl        !== undefined) data.liveUrl        = body.liveUrl;
  if (body.client         !== undefined) data.client         = body.client;
  if (body.year           !== undefined) data.year           = body.year ? Number(body.year) : null;
  if (body.featured       !== undefined) data.featured       = Boolean(body.featured);
  if (body.visible        !== undefined) data.visible        = Boolean(body.visible);
  if (body.order          !== undefined) data.order          = Number(body.order);
  if (body.tags           !== undefined) data.tags           = JSON.stringify(body.tags);

  const project = await db.project.update({ where: { id }, data });
  return NextResponse.json(serialize(project as Record<string, unknown>));
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAuth(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await db.project.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
