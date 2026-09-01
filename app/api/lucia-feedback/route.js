import { NextResponse } from "next/server";
import { clamp, getClientIp, rateLimit } from "@/lib/rateLimit";
import { insertLuciaFeedback } from "@/lib/luciaFeedback";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const REASONS = new Set(["incorrect", "outdated", "not_understood", "incomplete"]);

export async function POST(request) {
  const ip = getClientIp(request);
  if (!rateLimit(`lucia-feedback:${ip}`, { limit: 20, windowMs: 60_000 })) {
    return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
  }

  try {
    const body = await request.json();
    const answerId = clamp(body?.answerId, 40);
    const rating = Number(body?.rating);
    if (!UUID_RE.test(answerId) || ![-1, 1].includes(rating)) {
      return NextResponse.json({ ok: false, error: "invalid_feedback" }, { status: 400 });
    }

    const reason = REASONS.has(body?.reason) ? body.reason : null;
    await insertLuciaFeedback({
      answer_id: answerId,
      rating,
      reason: rating === -1 ? reason : null,
      comment: rating === -1 ? clamp(body?.comment, 500) || null : null,
      model: clamp(body?.model, 80) || null,
      page_path: clamp(body?.pagePath, 240) || null,
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[/api/lucia-feedback] error:", error?.message || error);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
