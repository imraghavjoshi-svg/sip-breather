# SIP Breather: product spec

## One-liner
Before you stop your SIP, see every option side by side, and ask anything about what each one means.

## Who it is for
First-time mutual fund investors, 22 to 30, in metro cities, in their first year of investing. Started a ₹500 to ₹5,000 monthly SIP, often because a friend or family member suggested it. Income is not settled yet: early career, between jobs, or about to study. They check the app often but do not fully understand how a SIP works, and think of it as all or nothing.

## The problem
When money gets tight for a month or two, these investors cancel their SIP for good, sometimes from their bank app. Most do not know they could skip a month, pause, or lower the amount, or that their invested money stays invested whatever they choose. Nothing at the moment of stopping lays out the options plainly, so a short gap turns into a permanent exit.

## What we are building
A web app that shows a phone in the middle of the page. Inside the phone is a concept feature for the Groww app: a better "Cancel SIP" moment. Mentors will open it on a laptop.

### The page around the phone (desktop toolbar, like a design review tool)
- Top left: Groww logo, title "SIP Breather", subtitle "Concept: a better Cancel SIP moment".
- Device switch: "iOS" (iPhone Pro Max frame) | "Android" (Pixel 9 frame) | "Frameless".
- Step tabs: "1. Dashboard" → "2. Redeem" (the "You are redeeming" sheet) → "3. SIP options" (options sheet opened from the redeem sheet) → "4. Confirm" (cancel confirm sheet). Clicking a tab jumps to that screen; tabs 2–4 use a ₹1,000 redemption if no amount was typed.
- Reset button (restarts the demo, clears the chat; does not clear the test log or the switch below).
- "Simulate AI failure" switch (off by default): when on, /api/ask skips Groq and returns a failed result, so GR-1 shows the safe fallback ("Here's the official explanation" + rule + sources) with a small grey label "AI failure simulated" above it, so reviewers understand what they see.
- "Test log" button: a table of test runs with "Download CSV" and "Clear" (see Test log below).
- Button "How we test the AI" that opens the evaluation page (see ai_rules.md).
- Zoom: 100% | 90% | 80%.
- Light grey page background, the phone centred.

### Device frames (build these exactly, in code)
- iPhone Pro Max: screen 440 × 956 px, natural titanium frame (light warm grey metal), very thin black bezel, large rounded corners, Dynamic Island pill at top centre, side buttons, iOS status bar (time 9:41, signal, wifi, battery), home indicator at bottom, back chevron "<" style, SF Pro style font (use system-ui / -apple-system).
- Pixel 9: screen 412 × 915 px, dark frame, punch-hole camera at top centre, Android status bar, gesture bar at bottom, back arrow "←" style, Roboto style font.
- Frameless: just the screen with a soft shadow.
- The screen content is the same for all devices. Only the frame, status bar, back icon and font change.
- The frame must never stretch. Keep these exact proportions at every zoom level.

## Screens (inside the phone)
Design reference: `design/android/*/code.html` and `design/ios/*/code.html` (and screen.png where available) for our new SIP screens. Screens copied from the real Groww app follow `design/groww_reference/` as exactly as possible (layout, spacing, placement, font sizes, colours).

### A. Groww's existing screens (copied from design/groww_reference)
The app opens on the Dashboard tab. Header on all four tabs: logo, "MF Prime" with the Prime diamond, search, GR-1 swirl (opens GR-1), avatar. Top tabs For you / Dashboard / SIPs / Watchlist all switch screens; the active tab is bold with a black underline. Bottom nav: Stocks / F&O / Mutual Funds (active) / Loans (shown, not clickable).

1. Dashboard (groww_dashboard): card "HOLDINGS (2)" with current value ₹7,084, eye and chart icons, dashed divider, rows 1D returns +₹21 (0.3%), Total returns +₹84 (1.2%), Invested ₹7,000, XIRR ˅ 6.10%, then "Redeem" and "Invest more" with diamond icons. Filter icon and "<> Returns (%)". The two sample funds with a grey "SIP" tag and returns on the right (Flexi Cap +₹36 (+1.2%), Midcap +₹48 (+1.2%)); tapping a fund opens its SIP details. "Import external funds." outlined button. No "Best Pick" or "Average" tags.
2. For you (groww_for_you_1, _2, _3 as one scrollable page): Smart-invest with Prime card (its button says "Start a SIP" instead of Groww's "Get fund recommendations"); "Explore funds" (renamed from "Best Picks by Prime") with 4 sample fund cards and 3Y returns; Collections; All Mutual Funds; Products & tools; About Prime; market-risk disclaimer; About Groww legal block copied exactly. Real fund names replaced with sample names ("Sample Flexi Cap Fund", "Sample Midcap Fund", "Sample Arbitrage Fund", "Sample Small Cap Fund"); no Best Pick / Prime recommends / Average / rating labels ("Best SIP funds" tile renamed "SIP funds", "High return" tile renamed "All categories"). Buttons and cards do nothing and show no error.
3. Watchlist (groww_watchlist): empty state "Start adding funds to Watchlist", then a list of 5 sample funds with bookmark icons under "Explore funds". No return numbers on this tab.
4. SIPs: our SIPs tab (screen B1).
5. Redeem flow (from Dashboard "Redeem"):
   a. "Enter redeem amount" (groww_redeem_amount / _min_error): "₹7,084 available", big amount, keypad with ".", "How Smart Redeem works" banner (opens the Smart Redeem sheet below), errors "Minimum required is ₹100" and "You can redeem up to ₹7,084", Continue. Every new redemption starts empty.
   a2. Smart Redeem intro sheet (groww_smart_redeem), over the dimmed amount screen, Groww blue: "PRIME EXCLUSIVE" with a diamond, "Smart Redeem with expert guidance", a bordered box of placeholder cards sliding slowly upwards in a loop (CSS, about 7 seconds; still when the system asks for reduced motion), three rows with light-blue icon circles ("You choose the amount", "We pick the funds to redeem from", "Optimised for tax, exit load, and portfolio balance"), and "Continue". Opens by itself the first time the amount screen opens in a demo run, and every time the banner is tapped. Continue or the dimmed area closes it. The test log records whether it was seen in that run (smart_redeem_seen).
   b. Summary (groww_redeem_summary): "Redeem ₹X from 1 fund", "REDEMPTION BY [date]" (3 working days after the NAV date), fund row "Sample Flexi Cap Fund Direct Growth – ₹X". Above ₹3,036 (the Flexi Cap value) it becomes "from 2 funds": Flexi Cap in full plus the rest from Midcap. No "Prime recommends", no "Why these funds?", no bank row. Button "Confirm".
   c. Sheet "You are redeeming ₹X" (groww_redeem_sheet): NAV note, Applicable NAV date (today on a weekday before 3 pm, else the next working day), Exit load (Approx) ₹0.00, Capital gains (LTCG ₹0.00, STCG = gain share of the amount). No bank name or account number.
   d. NEW, ours (green, calm), above the button: card "YOUR SIP · ₹500 due on 5 Dec. If money's tight this month, you can also skip or pause your SIP. Your invested money stays invested." with text button "See SIP options" that opens the options sheet (B3) for that SIP. Hidden if that SIP is paused or cancelled. Nothing blocks the redemption.
   e. "Confirm Redeem" → Done: green tick, "Redemption placed. Money usually reaches your bank in 1–3 working days.", the fund(s) and amounts, button "Back to Dashboard". No OTP screen. Holdings on the Dashboard do not change after a redemption (demo).

### B. Our new SIP screens (returns-free)
1. SIPs tab: two SIP cards. Card 1 "Sample Flexi Cap Fund Direct Growth", ₹500 monthly, next instalment, 6 instalments done, chip "Goal: Bike". Card 2 "Sample Midcap Fund Direct Growth", ₹1,000 monthly, 4 instalments done.
2. SIP details: "₹3,000 invested", monthly amount, next instalment, instalments done, goal progress "₹3,000 of ₹60,000" with a bar. "INSTALMENT HISTORY": last 3 instalments (date, amount, green "Successful" tag) and a "View all" link that does nothing. No returns, NAV or units. Buttons "Edit SIP" (→ Lower the amount) and "Ask GR-1". Grey text link "Cancel SIP".
3. Options sheet "You have a few options" over the screen it was opened from (SIP details, or the redeem sheet). Label "YOUR ₹3,000 STAYS INVESTED IN EVERY CASE". Four rows of equal weight: Skip next instalment / Pause for 1 to 3 months / Lower the amount / Cancel SIP, each with one grey line. Link "Not sure? Ask GR-1".
4. Pause: choose 1, 2 or 3 months, see which instalments are skipped, restart date, "We'll remind you 3 days before, with all options again". Button "Confirm pause".
5. Lower the amount: big amount with keypad (whole rupees), current amount shown, inline errors "Minimum required is ₹100" and "Enter less than ₹[current]". Button "Continue" → small confirm sheet → Done.
6. GR-1 assistant bottom sheet: chip "YOUR SIP", 3 suggested questions, chat, input "Ask GR-1 about your SIP". Under every AI answer: "Based on: [rule title]", then "Sources: AMFI investor education · Groww Help Centre" (links), then "Information only, not investment advice". Works as described in ai_rules.md.
7. Cancel confirm sheet over the dimmed options sheet: "You are cancelling ₹500 monthly SIP", "Your invested money stays invested. Only future instalments stop.", rows (Invested money: Stays invested / Last instalment / Restart: Start a new SIP anytime), optional reason chips (Money is tight / Returns / Need the money / Other), primary "Cancel SIP", text button "Go back".
8. Done: green tick, message for the chosen option (skipped / paused till date / amount lowered / cancelled), button "Back to my SIP".

Skip from B3 goes to a small confirm, then B8.

### Test log (for user testing)
Every time a user reaches a Done screen (SIP option or redemption), one row is saved in this browser (localStorage, wrapped in try/catch so the app still works if storage is blocked): time, device, option (skip / pause / lower / cancel / redeem), entry (where SIP options were opened from: redeem / cancel; "edit" for Edit SIP → Lower), pause months, new amount, cancel reason, redeem amount, and the number of GR-1 questions asked since the last Reset. This is a deliberate, PM-approved exception to "no saving between visits"; it never leaves the browser.

## Fixes to apply versus the Stitch designs and Groww screenshots
- Never show a real fund name, bank name, account number, email or phone number on any screen, even if it appears in a design or screenshot. Use "Sample …" fund names only.
- Android screen 02 shows a real fund name; iOS screen 06 shows "Auto-debit: HDFC Bank"; the Groww redeem screenshots show a real fund and bank account: all replaced or removed.
- iOS screen 07 shows a "Redeem ₹100" screen in the background: the background must be the options sheet.
- Reason chips must never break words across lines.
- Dates: compute from today's date. Next instalment is the next time the instalment day comes round after today; last instalment is the most recent one before today (on the instalment day itself, today's counts as the last). Example, today = 6 Nov 2026: Flexi Cap (5th) last 5 Nov, next 5 Dec; Midcap (10th) last 10 Oct, next 10 Nov. Pause dates start from the next instalment. Never show a past year. "Today" is read in the visitor's browser.
- Icons: use an icon library (lucide-react). No empty boxes.

## Rules for the whole product
- "Cancel SIP" always has equal visual weight to the other options and is never hidden. No guilt messages, no countdowns, no red warning colours.
- Returns, NAV and performance numbers appear ONLY on Groww's existing screens: Dashboard and For you (returns), and Groww's redeem sheet (NAV date, exit load, capital gains). Our new SIP screens (B1–B8, the SIP card in the redeem sheet, GR-1) never show returns, NAV, units or growth claims ("stays invested" only).
- Colours: Groww blue (#5367FF) only on screens copied from Groww (Dashboard, For you, Watchlist, Redeem) and the shared app header and bottom nav. Our new SIP screens, GR-1 and the SIP card use Groww green (#00D09C for icons, bars and accents with no text; #00A67E for green text and for buttons). Any button with white text uses 19px+ bold text (contrast rule for large text). Soft orange only for error messages.
- Footer on every screen: "Information only, not investment advice."
- Exception (PM decision, 7 Nov): the "How we test the AI" page shows the 20 golden questions word for word, including the real names in G14 (a fund) and G18 (a company), because showing that GR-1 refuses them is the point of the test. No real names appear inside the phone.
- Small grey line in the desktop toolbar: "Concept prototype for a PM case study."

## Out of scope for v1
- Real Groww accounts, login, real money or real mandates.
- Recommending funds or predicting returns.
- Real notifications (the pause reminder is shown, not sent).
- Detecting cancellations made from a bank app.
- Saving data between visits or across devices (except the browser-only test log).
- Languages other than English.

## Tech
- Next.js (App Router) + TypeScript + Tailwind CSS, deployed on Vercel.
- AI: Groq API, model `openai/gpt-oss-120b`, called only from a server route (`/api/ask`). The key lives in `.env.local` locally and in Vercel environment variables as `GROQ_API_KEY`. Never put the key in browser code or in Git.
- `.gitignore` must include `.env*`, `node_modules`, `.next`, `CLAUDE.md`.
