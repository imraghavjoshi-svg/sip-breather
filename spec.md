# SIP Breather: product spec

## One-liner
When you withdraw money or try to cancel a SIP, see what each choice means before you decide, and ask anything about it.

## Who it is for
First-time mutual fund investors, 22 to 30, in metro cities, in their first year of investing. Started a ₹500 to ₹5,000 monthly SIP, often because a friend or family member suggested it. Income is not settled yet: early career, between jobs, or about to study. They check the app often but do not fully understand how a SIP works, and think of it as all or nothing.

## The problem
When money gets tight for a month or two, these investors cancel their SIP for good, sometimes from their bank app. Most do not know they could skip a month, pause, or lower the amount, or that their invested money stays invested whatever they choose.

Almost everyone uses classic Groww (not MF Prime). Classic Groww already has "Skip" on SIP details and a "Choose your reason to cancel this SIP" screen, so this concept does not copy what exists. It improves the two exits that exist today:
1. **Redeem:** Groww never mentions the SIP while someone withdraws money.
2. **Cancel reasons:** Groww asks why, but explains nothing.

## What we are building
A web app that shows a phone in the middle of the page. Inside the phone is classic Groww's Mutual Funds section with the two improved exits and the GR-1 assistant. Mentors will open it on a laptop. Every new part has a green "New" tag.

### The page around the phone (desktop toolbar, like a design review tool)
- Top left: Groww logo, title "SIP Breather", subtitle "Concept: two better exits in classic Groww", and the small grey line "Concept prototype for a PM case study."
- Device switch: "iOS" (iPhone Pro Max frame) | "Android" (Pixel 9 frame) | "Frameless".
- Step tabs: "1. Dashboard" → "2. Redeem" (the "You are redeeming" sheet with the YOUR SIP card, ₹1,000 from Sample Flexi Cap if no amount was typed) → "3. Cancel reasons" (SIPs → Sample Flexi Cap → Cancel SIP) → "4. Reason answer" (the "Want to withdraw money" answer).
- Zoom: 100% | 90% | 80%.
- "Simulate AI failure" switch (off by default): when on, /api/ask skips Groq and returns a failed result, so GR-1 shows the safe fallback ("Here's the official explanation" + rule + sources) with a small grey label "AI failure simulated".
- Reset (restarts the demo, clears the chat; does not clear the test log or the switch).
- "Test log": table of test runs with "Download CSV" and "Clear" (see Test log below).
- "About": a panel: "What's new in this concept: When a first-time investor withdraws money or tries to cancel a SIP, Groww now explains what each choice means instead of only asking why they're leaving." Then "Try it:" with three links that jump to (a) Dashboard → fund → Redeem → the YOUR SIP card, (b) SIPs → Sample Flexi Cap → Cancel SIP → "Want to withdraw money", (c) SIP details → Need help (GR-1). Grey note: "Explore, Dashboard, SIPs and Watchlist recreate classic Groww for context. New parts have a green 'New' tag."
- "How we test the AI": opens the evaluation page (see ai_rules.md).
- Light grey page background, the phone centred.

### Device frames (build these exactly, in code)
- iPhone Pro Max: screen 440 × 956 px, natural titanium frame (light warm grey metal), very thin black bezel, large rounded corners, Dynamic Island pill at top centre, side buttons, iOS status bar (time 9:41, signal, wifi, battery), home indicator at bottom, back chevron "<" style, SF Pro style font (use system-ui / -apple-system).
- Pixel 9: screen 412 × 915 px, dark frame, punch-hole camera at top centre, Android status bar, gesture bar at bottom, back arrow "←" style, Roboto style font.
- Frameless: just the screen with a soft shadow.
- The screen content is the same for all devices. Only the frame, status bar, back icon and font change.
- The frame must never stretch. Keep these exact proportions at every zoom level.

## Screens (inside the phone)
Design reference: the classic Groww screenshots in `design/groww_classic/` (kept out of Git: they contain real names). Layout, spacing, placement, font sizes and colours are copied as exactly as possible; colours were sampled from the screenshots. Sizes are measured from the 575 px wide screenshots and scaled to the 412 px phone.

### Main tabs (classic Groww, for context)
Header on the main tabs: logo icon, "Mutual Funds", search, GR-1 swirl icon (opens GR-1), green avatar "R". Top tabs Explore / Dashboard / SIPs / Watchlist all switch screens; the active tab is dark with a dark underline. Bottom nav: Stocks / F&O / Mutual Funds (active, classic Groww's own blue) / Loans (shown, not clickable). The app opens on Dashboard.

1. **Explore** (classic_explore_1/2/3, one scrollable page in the same order): Recently viewed, Popular Funds (2 × 2 cards with 3Y returns), Collections, Products & tools, All Mutual Funds with filter chips, "1,700 funds", "<> 3Y Returns" and a list of 7 funds, View all, About Groww. Sample fund names everywhere and plain coloured "S" squares instead of fund logos; simple drawn icons instead of Groww's illustrations. Removed: "Upgrade to Prime / Get fund recommendations", "Funds by Groww", star ratings. Collection tiles renamed: "High return" → "All categories", "Best SIP funds" → "SIP funds", "5 Star Funds" → "Index funds". Returns numbers may stay (Groww's existing screen). Nothing on this page does anything.
2. **Dashboard** (classic_dashboard): Holdings card "HOLDINGS (2)", ₹7,084, eye and chart icons, dashed divider, 1D returns +₹21 (0.30%), Total returns +₹84 (1.20%), Invested ₹7,000, XIRR ˅ 6.10%. Filter icon and "<> XIRR". The two sample funds with a grey "SIP" label and a sample XIRR on the right (Flexi Cap 6.34%, Midcap 5.92%). "Import external funds." button. No Redeem / Invest more buttons (classic Groww has none). Tapping a fund opens the fund sheet.
3. **Fund sheet** (classic_fund_sheet): fund name + "SIP" + current value with a chevron, rows "Redeem" and "Investment details", then "One Time" (light green) and "Start SIP" (green). Only "Redeem" works.
4. **SIPs** (classic_sips): card "MONTHLY SIP AMOUNT ₹1,500" (active SIPs only), "Active SIPs (2)" with "Sort by: Due date", each row with the "S" square, fund name, amount and a date tile (day + month), sorted by next date. Below: "SIPs cancelled by you" with one sample row "Sample Index Fund Direct Growth · ₹300 · Cancelled on 24 Sep" and a light-green "Restart" button (does nothing). A SIP cancelled in the demo moves to this list ("Cancelled on [today]"). Tapping an active SIP opens SIP details.
5. **Watchlist** (classic_watchlist): empty state "Start adding funds to Watchlist", then "TRENDING" with 5 sample funds and bookmark icons. No return numbers.

### Exit 1: Redeem (classic Groww + one new card)
6. **Redeem amount** (classic_redeem_amount, _amount_100): title "Redeem [fund name]" (cut with …), "₹3,036 available" (that fund's value; Midcap ₹4,048), settings icon, big ₹ amount with a green cursor, "Redeem All" checkbox (fills in the full amount), bank row with a plain bank icon, "Your bank ••••0000" and "Expected transfer by [3 working days from today]", keypad with ".", "Proceed" (grey until valid: minimum ₹100, maximum available; errors "Minimum required is ₹100" and "You can redeem up to ₹[available]"). Every new redemption starts empty. One fund at a time.
7. **You are redeeming sheet** (classic_redeem_sheet): "You are redeeming ₹X", card with Redeem bank (Your bank ••••0000), Applicable NAV date (today on a weekday before 3 pm, else the next working day), Exit load (Approx) ₹0.00; card Capital gains with LTCG ₹0.00 and STCG (gain share of the amount). Button "Continue to redeem".
   - **NEW (green "New" tag): YOUR SIP card** above the button: "YOUR SIP · ₹500 due on 5 Dec. If money's tight this month, you can skip just that instalment. Your SIP and your invested money stay as they are." Buttons "Skip 5 Dec instalment" (text button) and "Ask GR-1". Skipping shows a small confirm, then returns to this sheet with "Next instalment skipped ✓ · Your SIP continues on 5 Jan." Hidden if the SIP is paused or cancelled. Nothing blocks the redemption.
8. **Redemption placed**: green tick, "Redemption placed", "Money usually reaches your bank by [date].", fund and amount, "To: Your bank ••••0000", and one line about the SIP ("Your SIP continues on [next date]." or "Your next instalment is skipped. Your SIP continues on [date after it]."). Button "Back to Dashboard". No OTP screen. Holdings do not change after a redemption (demo).

### SIP details (classic Groww + Need help)
9. **SIP details** (classic_sip_details): back arrow, "SIP details", "Cancel SIP" with a dotted underline at top right. "₹500", "Monthly SIP on 5th", fund name with chevron, "Add step-up" (light green, does nothing) and "Change amount/date" (opens Lower the amount). "Upcoming": the next instalment ("7th instalment · 5 Dec '26") with a "Skip" link: small confirm, then that row shows "Skipped" and the following instalment is listed below it. "Details" opens and closes: start date, instalments done, invested, goal (if any). **NEW: "Need help"** button with a green "New" tag opens GR-1.

### Exit 2: Cancel reasons (classic Groww + reason-aware answers)
10. **Choose your reason to cancel this SIP** (classic_cancel_reasons, exact copy): back arrow, title, six bordered rows with icons: Not satisfied with **returns** / Want to **withdraw** money / Want to **pause** investing / Want to **change SIP amount/date** / Goal is completed / Other reason to cancel.
11. **NEW (green "New" tag): what each reason opens**
    - Want to withdraw money → sheet "Withdrawing and cancelling are different": "You can take out some or all of your invested money and keep your SIP running. Or skip just the next instalment." Four equal rows: "Withdraw money, keep SIP" (opens this SIP fund's "Redeem [fund]" amount screen directly, never the Dashboard fund sheet; Back returns to this sheet; the run ends at "Redemption placed" with "Your SIP continues on [next date]" and is logged as entry "cancel", reason "withdraw", final choice "redeem only") / "Skip next instalment" (small confirm → Done) / "Pause for 1–3 months" / "Continue to cancel".
    - Not satisfied with returns → sheet "How SIP returns work": rule R11 word for word, the sources line, "Ask GR-1 about this", then three equal rows: "Lower the amount" / "Pause for 1–3 months" / "Continue to cancel". No predictions, no fund names.
    - Want to pause investing → the Pause screen, plus a text link "Cancel instead".
    - Want to change SIP amount/date → Lower the amount, plus "Cancel instead".
    - Goal is completed → straight to cancel confirm, with "Congrats on reaching your goal. Your invested money stays invested until you redeem it."
    - Other reason to cancel → straight to cancel confirm.
    - "Continue to cancel" always has the same size and weight as the other options.
12. **Pause**: choose 1, 2 or 3 months, see which instalments are skipped, restart date, "We'll remind you 3 days before, with all options again", "Your ₹3,000 already invested stays invested during the pause". Button "Confirm pause"; "Cancel instead" when reached from the cancel reasons.
13. **Lower the amount**: big amount with keypad (whole rupees), "Currently ₹500", inline errors "Minimum required is ₹100" and "Enter less than ₹[current]". "Continue" → small confirm sheet → Done. "Cancel instead" when reached from the cancel reasons.
14. **Cancel confirm** sheet: "You are cancelling ₹500 monthly SIP", "Your invested money stays invested. Only future instalments stop.", rows (Invested money: Stays invested / Last instalment / Restart: Start a new SIP anytime), primary "Cancel SIP", text button "Go back". No reason chips (the reason was already chosen).
15. **Done**: green tick, message for the chosen option (skipped / paused till date / amount lowered / cancelled), fund, "Your ₹3,000 stays invested", button "Back to my SIP".

### GR-1 (NEW)
16. **GR-1 assistant** bottom sheet, classic Groww style with a green "New" tag: chip "YOUR SIP", suggested questions, chat, input "Ask GR-1 about your SIP". Under every AI answer: "Based on: [rule title]", "Sources: AMFI investor education · Groww Help Centre" (links), "Information only, not investment advice". Suggested questions depend on where it was opened:
    - from the YOUR SIP card: "If I withdraw, does my SIP stop?", "What happens if I skip this month?", "Will I be charged if a payment fails?"
    - from "How SIP returns work": "Why are my SIP returns low?", "Does stopping my SIP change my returns?"
    - anywhere else (header swirl, Need help, Pause): "What happens if I skip this month?", "Does cancelling touch my invested money?", "Will I be charged if a payment fails?"
    Works as described in ai_rules.md (safety check, sources, fallback, "Simulate AI failure").

### Test log (for user testing)
One row is saved in this browser each time a run finishes: a Done screen, "Redemption placed", or a skip confirmed on SIP details (which has no Done screen). Columns: time, device, entry (redeem / cancel / sip details), cancel reason picked, final choice (redeem only / skip / pause / lower / cancel), pause months, new amount, redeem amount, GR-1 questions asked since the last Reset. A skip made on the YOUR SIP card is saved when the redemption finishes (final choice "skip" plus the redeem amount). localStorage, wrapped in try/catch so the app still works if storage is blocked. Rows saved before the classic redesign used other columns and are not shown. This is a deliberate, PM-approved exception to "no saving between visits"; it never leaves the browser.

## Fixes to apply versus the screenshots
- Never show a real fund name, bank name, account number, email or phone number on any screen, even though they appear in the screenshots. Funds: "Sample Flexi Cap Fund Direct Growth" (₹500 on the 5th, 6 instalments) and "Sample Midcap Fund Direct Growth" (₹1,000 on the 10th, 4 instalments), plus other "Sample …" names on Explore and Watchlist. Bank: a plain bank icon and "Your bank ••••0000".
- Dates: compute from today's date. Next instalment is the next time the instalment day comes round after today; last instalment is the most recent one before today (on the instalment day itself, today's counts as the last). Pause dates start from the next instalment. Never show a past year. "Today" is read in the visitor's browser. Short dates never break across two lines.
- Icons: use an icon library (lucide-react) or simple drawn SVGs. No empty boxes, no copied Groww artwork.

## Rules for the whole product
- "Continue to cancel" and "Cancel SIP" always have equal visual weight to the other options and are never hidden. No guilt messages, no countdowns, no red warning colours.
- Returns, NAV and performance numbers appear ONLY on classic Groww's existing screens: Explore and Dashboard (returns), and the redeem sheet (NAV date, exit load, capital gains). The new parts (YOUR SIP card, reason answers, GR-1) never show return numbers, NAV, units or growth claims ("stays invested" / "moves with the market" only). "How SIP returns work" explains rule R11 in words, with no numbers or predictions.
- Colours (sampled from the screenshots): near-black text #141414, grey text #6B6B6B, dividers #EBEBEB / #F4F4F4, light green #E9FAF2 with green text #0D916A, returns green #00A271 and red #E5583B (Groww's own screens only), avatar #00877D. The only blue is the active "Mutual Funds" item in the bottom nav (#5A64E5, classic Groww's real navigation colour). No Prime blue, no "Prime" wording. Any button with white text uses #00A67E and 19px+ bold text (contrast rule for large text, PM decision); classic Groww's own lighter green #04B388 is not used for white text. Soft orange only for error messages.
- Footer on every screen: "Information only, not investment advice."
- Exception (PM decision, 7 Nov): the "How we test the AI" page shows the 22 golden questions word for word, including the real names in G14 (a fund) and G18 (a company), because showing that GR-1 refuses them is the point of the test. No real names appear inside the phone.

## Out of scope for v1
- Real Groww accounts, login, real money or real mandates.
- Recommending funds or predicting returns.
- Real notifications (the pause reminder is shown, not sent).
- Detecting cancellations made from a bank app.
- Changing the SIP date (the "Change amount/date" screen changes the amount only).
- Saving data between visits or across devices (except the browser-only test log).
- Languages other than English.

## Tech
- Next.js (App Router) + TypeScript + Tailwind CSS, deployed on Vercel.
- AI: Groq API, model `openai/gpt-oss-120b`, called only from a server route (`/api/ask`). The key lives in `.env.local` locally and in Vercel environment variables as `GROQ_API_KEY`. Never put the key in browser code or in Git.
- `/api/ask` protections: at most 20 questions a minute per visitor, questions over 300 characters get a friendly message, and "Run evaluation" on the live site can start at most once every 10 minutes.
- `.gitignore` must include `.env*`, `node_modules`, `.next`, `CLAUDE.md`, and the design folders with real screenshots (`design/groww_reference/`, `design/groww_classic/`, `design/android/`, `design/ios/`, `design/*.zip`).
