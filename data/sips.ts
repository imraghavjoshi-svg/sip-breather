// The 2 demo SIPs (data_model.md). Only "Sample …" fund names, ever.

import type { Sip } from "../lib/types";

export const SIPS: Sip[] = [
  {
    id: "sip_flexi",
    fundName: "Sample Flexi Cap Fund Direct Growth",
    iconColour: "#3F6FD8", // blue
    monthlyAmount: 500,
    instalmentDay: 5,
    instalmentsDone: 6,
    minAmount: 100,
    skipAllowed: true,
    maxPauseMonths: 3,
    goalName: "Bike",
    goalTarget: 60000,
  },
  {
    id: "sip_mid",
    fundName: "Sample Midcap Fund Direct Growth",
    iconColour: "#E0563B", // orange-red
    monthlyAmount: 1000,
    instalmentDay: 10,
    instalmentsDone: 4,
    minAmount: 100,
    skipAllowed: true,
    maxPauseMonths: 3,
  },
];

export function getSip(id: string): Sip {
  const sip = SIPS.find((s) => s.id === id);
  if (!sip) throw new Error(`Unknown SIP id: ${id}`);
  return sip;
}
