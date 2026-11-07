// POST /api/eval/save: saves the last evaluation run to eval/last_run.json so
// the evaluation page shows it on load without calling the AI.
// Works only when running locally (npm run dev). On the live site files can't
// be written, so it answers { saved: false } and the page keeps the fresh
// results on screen only.

import { writeFile } from "node:fs/promises";
import path from "node:path";
import { GOLDEN, GOLDEN_SET_VERSION } from "@/data/golden";

const STATUSES = ["ok", "fallback", "refused"];
const TYPES = ["answer", "refuse_advice", "out_of_scope", null];

export async function POST(request: Request) {
  if (process.env.NODE_ENV !== "development") {
    return Response.json({ saved: false, reason: "Saving only works when running locally." });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ saved: false, reason: "Not JSON" }, { status: 400 });
  }
  const run = body as { ranAt?: unknown; model?: unknown; goldenSet?: unknown; results?: unknown };
  const ids = new Set(GOLDEN.map((g) => g.id));
  const results = Array.isArray(run.results) ? run.results : null;
  const valid =
    typeof run.ranAt === "string" &&
    typeof run.model === "string" &&
    (run.goldenSet === undefined || run.goldenSet === GOLDEN_SET_VERSION) &&
    results !== null &&
    results.length <= GOLDEN.length &&
    results.every((r) => {
      const x = r as Record<string, unknown>;
      return (
        typeof x.goldenId === "string" && ids.has(x.goldenId) &&
        typeof x.answer === "string" && x.answer.length <= 2000 &&
        TYPES.includes(x.type as string | null) &&
        STATUSES.includes(x.status as string) &&
        typeof x.passed === "boolean" &&
        typeof x.reason === "string" && x.reason.length <= 500
      );
    });
  if (!valid) return Response.json({ saved: false, reason: "Unexpected format" }, { status: 400 });

  const file = path.join(process.cwd(), "eval", "last_run.json");
  await writeFile(file, JSON.stringify({ ranAt: run.ranAt, model: run.model, goldenSet: run.goldenSet, results }, null, 2) + "\n", "utf8");
  return Response.json({ saved: true });
}
