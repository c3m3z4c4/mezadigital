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

export async function GET() {
  const projects = await db.project.findMany({ orderBy: [{ order: "asc" }, { createdAt: "asc" }] });
  return NextResponse.json(projects.map(serialize));
}

export async function POST(req: NextRequest) {
  const token = extractBearerToken(req.headers.get("authorization"));
  if (!token || !(await verifyToken(token))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const project = await db.project.create({
    data: {
      title_en:       body.title_en       || "",
      title_es:       body.title_es       || body.title_en || "",
      description_en: body.description_en || null,
      description_es: body.description_es || null,
      images:         JSON.stringify(body.images    || []),
      projectType:    body.projectType    || "web",
      techStack:      JSON.stringify(body.techStack || []),
      githubUrl:      body.githubUrl      || null,
      liveUrl:        body.liveUrl        || null,
      client:         body.client         || null,
      year:           body.year           ? Number(body.year) : null,
      featured:       Boolean(body.featured),
      visible:        body.visible !== false,
      order:          Number(body.order)  || 0,
      tags:           JSON.stringify(body.tags || []),
    },
  });
  return NextResponse.json(serialize(project as Record<string, unknown>), { status: 201 });
}
