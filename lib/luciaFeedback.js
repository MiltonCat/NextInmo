import "server-only";

import { rest } from "./supabaseRest";

export async function insertLuciaFeedback(row) {
  await rest("lucia_feedback", {
    method: "POST",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify(row),
  });
}
