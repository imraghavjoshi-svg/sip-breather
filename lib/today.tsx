"use client";

// "Today" is read once, in the visitor's browser, never on the server.
// If the server worked it out at build time, the live site would show the
// build date forever. The server renders the phone frame with an empty
// screen; the browser fills the screen in straight away with the real date.

import { createContext, useContext, useSyncExternalStore } from "react";

let cachedToday: Date | null = null;

function getBrowserToday(): Date {
  if (!cachedToday) cachedToday = new Date();
  return cachedToday;
}

const noSubscribe = () => () => {};

/** Today's date in the browser, or null while rendering on the server. */
export function useBrowserToday(): Date | null {
  return useSyncExternalStore(noSubscribe, getBrowserToday, () => null);
}

const TodayContext = createContext<Date | null>(null);
export const TodayProvider = TodayContext.Provider;

/** For screens: today's date (always set inside the phone). */
export function useToday(): Date {
  const today = useContext(TodayContext);
  if (!today) throw new Error("useToday must be used inside TodayProvider");
  return today;
}
