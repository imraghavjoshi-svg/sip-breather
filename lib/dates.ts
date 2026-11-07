// Every date in the app is worked out here from today's date and the SIP's
// instalment day, using the real calendar. Nothing is hard-coded, so no past
// year can ever appear.
//
//   next instalment = the next time the instalment day comes round after today
//   last instalment = the most recent one before today
//   (if today IS the instalment day, today's instalment counts as the last one)
//
// Example, today = 6 Nov 2026:
//   Flexi Cap (5th):  last 5 Nov 2026,  next 5 Dec 2026
//   Midcap   (10th):  last 10 Oct 2026, next 10 Nov 2026
// Pause and skip dates start from the next instalment:
//   Flexi Cap, pause 2 months: 5 Dec + 5 Jan skipped, restarts 5 Feb 2027,
//   reminder 3 days before (2 Feb 2027).

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Date on `day` of the month that is `monthOffset` months after `from`. Short months are handled (31st → 30th/28th). */
export function dayOfMonth(from: Date, monthOffset: number, day: number): Date {
  const first = new Date(from.getFullYear(), from.getMonth() + monthOffset, 1);
  const lastDay = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
  return new Date(first.getFullYear(), first.getMonth(), Math.min(day, lastDay));
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/** 0 if the next instalment is later this month, 1 if it is next month. */
function nextMonthOffset(instalmentDay: number, today: Date): number {
  return dayOfMonth(today, 0, instalmentDay) > startOfDay(today) ? 0 : 1;
}

export function nextInstalment(instalmentDay: number, today: Date): Date {
  return dayOfMonth(today, nextMonthOffset(instalmentDay, today), instalmentDay);
}

export function lastInstalment(instalmentDay: number, today: Date): Date {
  return dayOfMonth(today, nextMonthOffset(instalmentDay, today) - 1, instalmentDay);
}

/** The most recent `count` instalments, newest first (e.g. 5 Nov, 5 Oct, 5 Sep). */
export function pastInstalments(instalmentDay: number, count: number, today: Date): Date[] {
  const lastOffset = nextMonthOffset(instalmentDay, today) - 1;
  return Array.from({ length: count }, (_, i) => dayOfMonth(today, lastOffset - i, instalmentDay));
}

/** The instalment that is `n` months after the next one (n = 0 is the next one). */
export function instalmentAfterNext(instalmentDay: number, n: number, today: Date): Date {
  return dayOfMonth(today, nextMonthOffset(instalmentDay, today) + n, instalmentDay);
}

/** Instalments that are not taken during a pause of `months` months. */
export function pausedInstalments(instalmentDay: number, months: number, today: Date): Date[] {
  return Array.from({ length: months }, (_, i) => instalmentAfterNext(instalmentDay, i, today));
}

/** First instalment after a pause of `months` months. */
export function pauseRestart(instalmentDay: number, months: number, today: Date): Date {
  return instalmentAfterNext(instalmentDay, months, today);
}

export function daysBefore(date: Date, days: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() - days);
}

// ---------- Working days (redeem flow; weekends only, no holiday list) ----------

function isWeekend(d: Date): boolean {
  return d.getDay() === 0 || d.getDay() === 6;
}

export function addWorkingDays(from: Date, days: number): Date {
  const d = startOfDay(from);
  let added = 0;
  while (added < days) {
    d.setDate(d.getDate() + 1);
    if (!isWeekend(d)) added++;
  }
  return d;
}

/** NAV date for a redemption placed now: today on a weekday before 3 pm, otherwise the next working day. */
export function applicableNavDate(now: Date): Date {
  if (!isWeekend(now) && now.getHours() < 15) return startOfDay(now);
  return addWorkingDays(now, 1);
}

/** "Redemption by" date: 3 working days after the NAV date. */
export function redemptionByDate(now: Date): Date {
  return addWorkingDays(applicableNavDate(now), 3);
}

/** "09 Nov" (Groww's style in the redeem sheet) */
export function formatDayMonth2(d: Date): string {
  return `${String(d.getDate()).padStart(2, "0")} ${MONTHS[d.getMonth()]}`;
}

/** "5 Dec" (non-breaking space, so a date never splits across two lines) */
export function formatDayMonth(d: Date): string {
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

/** "5 Dec 2026" (non-breaking spaces, so a date never splits across two lines) */
export function formatFullDate(d: Date): string {
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

/** "January", used in "SIP continues in January". */
export function formatMonthName(d: Date): string {
  return d.toLocaleString("en-IN", { month: "long" });
}

/** Classic Groww's "Expected transfer by" date: 3 working days from today. */
export function expectedTransferDate(today: Date): Date {
  return addWorkingDays(today, 3);
}

/** "12 Nov '26" (classic Groww's style for dates with a year) */
export function formatDayMonthYear(d: Date): string {
  return `${d.getDate()} ${MONTHS[d.getMonth()]} '${String(d.getFullYear()).slice(-2)}`;
}

/** 1 → "1st", 5 → "5th", 22 → "22nd" */
export function ordinal(n: number): string {
  const rem100 = n % 100;
  if (rem100 >= 11 && rem100 <= 13) return `${n}th`;
  return `${n}${["th", "st", "nd", "rd"][n % 10] ?? "th"}`;
}

// ---------- Changing the SIP date (rule R12) ----------

/**
 * When a new SIP date takes effect: always from the next cycle. The upcoming
 * instalment stays on its old date, and the new date starts in the month
 * after it.
 *   today 7 Nov 2026, old day 5 (next 5 Dec): new 15th → 5 Dec stays, then 15 Jan 2027;
 *   new 2nd → 5 Dec stays, then 2 Jan 2027.
 */
export function dateChangeStart(
  oldDay: number,
  newDay: number,
  today: Date,
): { oldInstalmentStays: Date; firstOnNewDay: Date } {
  const oldInstalmentStays = nextInstalment(oldDay, today);
  return { oldInstalmentStays, firstOnNewDay: dayOfMonth(oldInstalmentStays, 1, newDay) };
}

/** "Your 5 Dec instalment stays as it is. From 15 Jan 2027, your SIP runs on the 15th every month." */
export function dateChangeSentence(oldDay: number, newDay: number, today: Date): string {
  const { oldInstalmentStays, firstOnNewDay } = dateChangeStart(oldDay, newDay, today);
  return `Your ${formatDayMonth(oldInstalmentStays)} instalment stays as it is. From ${formatFullDate(firstOnNewDay)}, your SIP runs on the ${ordinal(newDay)} every month.`;
}
