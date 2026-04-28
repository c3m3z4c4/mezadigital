import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyToken, extractBearerToken } from "@/lib/auth";

// Public GET — returns all content as { key: value }
export async function GET() {
  const rows = await db.siteContent.findMany();
  const map: Record<string, string> = {};
  for (const r of rows) map[r.key] = r.value;
  return NextResponse.json(map);
}

// Admin PUT — upsert multiple keys at once { key: value, ... }
export async function PUT(req: NextRequest) {
  const token = extractBearerToken(req.headers.get("authorization"));
  if (!token || !(await verifyToken(token))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body: Record<string, string> = await req.json();
  const result: Record<string, string> = {};

  await Promise.all(
    Object.entries(body).map(async ([key, value]) => {
      await db.siteContent.upsert({
        where: { key },
        create: { key, value },
        update: { value },
      });
      result[key] = value;
    })
  );

  return NextResponse.json(result);
}
