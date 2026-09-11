import { NextResponse } from "next/server";
import { getBarrios } from "@/lib/tasador";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const ciudad = new URL(request.url).searchParams.get("ciudad") || "sma";
  return NextResponse.json(
    { ciudad, barrios: await getBarrios(ciudad) },
    { headers: { "Cache-Control": "no-store" } },
  );
}
