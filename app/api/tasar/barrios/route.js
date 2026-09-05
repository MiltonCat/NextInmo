import { NextResponse } from "next/server";
import { getBarrios } from "@/lib/tasador";

export async function GET() {
  return NextResponse.json({ barrios: await getBarrios() });
}
