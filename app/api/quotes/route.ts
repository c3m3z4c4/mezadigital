import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyToken, extractBearerToken } from "@/lib/auth";

// GET — admin only
export async function GET(req: NextRequest) {
  const token = extractBearerToken(req.headers.get("authorization"));
  if (!token || !(await verifyToken(token))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const quotes = await db.quote.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(quotes);
}

// POST — public (quote request form)
export async function POST(req: NextRequest) {
  const body = await req.json();
  if (!body.name || !body.email || !body.description) {
    return NextResponse.json({ error: "Campos requeridos: name, email, description" }, { status: 400 });
  }

  // If auth token provided, allow admin to set status/notes
  const token = extractBearerToken(req.headers.get("authorization"));
  const isAdmin = token ? !!(await verifyToken(token)) : false;

  const quote = await db.quote.create({
    data: {
      name:        body.name,
      email:       body.email,
      company:     body.company     || null,
      projectType: body.projectType || "web",
      description: body.description,
      budget:      body.budget      || null,
      timeline:    body.timeline    || null,
      techStack:   body.techStack   || null,
      status:      isAdmin ? (body.status || "pendiente") : "pendiente",
      notes:       isAdmin ? (body.notes  || null) : null,
    },
  });
  return NextResponse.json(quote, { status: 201 });
}
