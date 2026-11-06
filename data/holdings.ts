// Sample numbers for Groww's existing Dashboard (PM-approved, 7 Nov).
// Returns appear ONLY on Groww's existing screens (Dashboard, For you).
//
// They add up:
//   invested       ₹3,000 + ₹4,000 = ₹7,000  (from the SIPs: amount × instalments)
//   current value  ₹3,036 + ₹4,048 = ₹7,084
//   total returns  +₹36 + +₹48 = +₹84 (1.2%)
//   1D returns     +₹9 + +₹12 = +₹21 (0.3%)

import type { Holding } from "../lib/types";

export const HOLDINGS: Holding[] = [
  { sipId: "sip_flexi", currentValue: 3036, oneDayChange: 9 },
  { sipId: "sip_mid", currentValue: 4048, oneDayChange: 12 },
];

/** Shown as given; XIRR is not worked out in this demo. */
export const PORTFOLIO_XIRR = "6.10%";

export function getHolding(sipId: string): Holding {
  const h = HOLDINGS.find((x) => x.sipId === sipId);
  if (!h) throw new Error(`No holding for ${sipId}`);
  return h;
}
