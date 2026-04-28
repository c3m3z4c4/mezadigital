import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyToken, extractBearerToken } from "@/lib/auth";
import { buildQuotePDF, quoteFileName } from "@/lib/pdf/quote";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = extractBearerToken(req.headers.get("authorization"));
    if (!token || !(await verifyToken(token))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const raw = await db.quote.findUnique({ where: { id } });
    if (!raw) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const buffer   = await buildQuotePDF(raw);
    const filename = quoteFileName(raw.name);

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[PDF route error]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
