// Display only: splits a GR-1 answer into blocks for the chat bubble, so a
// long answer that walks through the options (Compare "Explain this") is easy
// to scan. Never changes, adds or drops a word: if the blocks do not join back
// to the original text, the caller shows the answer as one paragraph.

export type AnswerBlock = {
  /** Words before the bold option word, e.g. "while ". */
  lead: string;
  /** The option word opening this block (e.g. "Pausing"), or "" if none. */
  bold: string;
  rest: string;
};

/** Option words, longest first so "Keeping" wins over "Keep". Any case. */
const OPTION = "(?:keeping|keep|skipping|skip|pausing|pause|lowering|lower|cancelling|cancel|withdrawing|withdraw)\\b";

/** A full stop, then space, then a new sentence (capital letter or ₹). */
const SENTENCE_BREAK = /\.(\s+)(?=[A-Z₹])/g;
/** ", while <option>" and "; <option>": break after the comma / semicolon. */
const OPTION_BREAK = new RegExp(`(?:,(\\s+)(?=while\\s+${OPTION})|;(\\s+)(?=${OPTION}))`, "gi");
const OPENS_WITH_OPTION = new RegExp(`^(while\\s+)?(${OPTION})`, "i");

/** Fewer sentences than this: shown exactly as before, as one paragraph. */
const MIN_SENTENCES = 3;

const squash = (s: string) => s.replace(/\s+/g, " ").trim();

/**
 * Blocks for an answer with 3 or more sentences, or null to show it as one
 * paragraph (short answers, or if splitting would change the text).
 */
export function answerBlocks(text: string): AnswerBlock[] | null {
  const cuts: { end: number; next: number }[] = [];
  let sentences = 1;
  for (const m of text.matchAll(SENTENCE_BREAK)) {
    sentences++;
    cuts.push({ end: m.index + 1, next: m.index + m[0].length });
  }
  if (sentences < MIN_SENTENCES) return null;
  for (const m of text.matchAll(OPTION_BREAK)) {
    cuts.push({ end: m.index + 1, next: m.index + m[0].length });
  }
  cuts.sort((a, b) => a.end - b.end);

  const pieces: string[] = [];
  let start = 0;
  for (const c of cuts) {
    pieces.push(text.slice(start, c.end).trim());
    start = c.next;
  }
  pieces.push(text.slice(start).trim());
  const parts = pieces.filter(Boolean);

  // Safety: every word kept, in order.
  if (squash(parts.join(" ")) !== squash(text)) return null;

  return parts.map((p) => {
    const m = p.match(OPENS_WITH_OPTION);
    if (!m) return { lead: "", bold: "", rest: p };
    const lead = m[1] ?? "";
    return { lead, bold: m[2], rest: p.slice(lead.length + m[2].length) };
  });
}
