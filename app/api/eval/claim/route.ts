// POST /api/eval/claim: asked by the evaluation page before "Run evaluation".
// On the live site a run can start at most once every 10 minutes (for all
// visitors), to protect the Groq quota. Locally there is no wait.

import { claimEvalRun } from "@/lib/server/rateLimit";

export async function POST() {
  if (process.env.NODE_ENV !== "production") return Response.json({ allowed: true });
  return Response.json(claimEvalRun());
}
