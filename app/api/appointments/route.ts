import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyToken, extractBearerToken } from "@/lib/auth";

// GET — admin only
export async function GET(req: NextRequest) {
  const token = extractBearerToken(req.headers.get("authorization"));
  if (!token || !(await verifyToken(token))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const appointments = await db.appointment.findMany({ orderBy: { date: "asc" } });
  return NextResponse.json(appointments);
}

// POST — public (appointment request)
export async function POST(req: NextRequest) {
  const body = await req.json();
  if (!body.name || !body.email || !body.date || !body.topic) {
    return NextResponse.json({ error: "Campos requeridos: name, email, date, topic" }, { status: 400 });
  }
  const appointment = await db.appointment.create({
    data: {
      name:  body.name,
      email: body.email,
      date:  body.date,
      time:  body.time  || null,
      topic: body.topic,
      notes: body.notes || null,
    },
  });
  return NextResponse.json(appointment, { status: 201 });
}
