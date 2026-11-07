# Classic Groww redesign

Work in plan mode first: show me a short plan, wait for my OK, then build in small steps.

## Why we are changing
Almost everyone uses classic Groww, not MF Prime. Classic Groww already has Skip on SIP details and a "Choose your reason to cancel this SIP" screen. So our MVP must not copy what exists. It improves the two exits that exist today:
1. Redeem: Groww never mentions the SIP while someone withdraws money.
2. Cancel reasons: Groww asks why, but explains nothing.

## References
Screenshots of classic Groww are in `design/groww_classic/`. Replicate their layout, spacing, placement, font sizes and colours as exactly as you can. Sample the exact colours from the screenshots (the green buttons, the grey text, the dividers). Add `design/groww_classic/` to .gitignore.

Never show any real fund name, bank name, account number, email or phone number on any screen, even though they appear in the screenshots. Use "Sample Flexi Cap Fund Direct Growth" (₹500 on the 5th, 6 instalments) and "Sample Midcap Fund Direct Growth" (₹1,000 on the 10th, 4 instalments). For the bank, show a plain bank icon and "Your bank ••••0000".

## Remove
- The MF Prime header, the "For you" tab, the Smart Redeem sheet, the Prime blue colour, and any "Prime" wording.
- Our old Dashboard "Redeem / Invest more" buttons (classic Groww doesn't have them).

## Screens (classic Groww)

Header on main tabs: logo icon, "Mutual Funds", search, GR-1 swirl icon (opens GR-1), green avatar "R". Tabs: Explore / Dashboard / SIPs / Watchlist. Bottom nav: Stocks / F&O / Mutual Funds (active) / Loans. The app opens on Dashboard.

1. **Explore** (`classic_explore_1/2/3`): one scrollable page in the same order: Recently viewed, Popular Funds, Collections, Products & tools, All Mutual Funds with filter chips and a list. Use sample fund names everywhere and plain coloured "S" squares instead of fund logos. Remove: the "Upgrade to Prime / Get fund recommendations" banner, "Funds by Groww", and star ratings. Rename collection tiles "High return" → "All categories", "Best SIP funds" → "SIP funds", "5 Star Funds" → "Index funds". Returns numbers may stay here (Groww's existing screen). Nothing on this page does anything.
2. **Dashboard** (`classic_dashboard`): Holdings card (₹7,084 current, 1D +₹21 (0.30%), Total +₹84 (1.20%), Invested ₹7,000, XIRR 6.10%), filter icon, "<> XIRR" toggle, the two sample funds with a grey "SIP" label and an XIRR value on the right, "Import external funds." button.
3. **Fund sheet** (`classic_fund_sheet`): tapping a fund on Dashboard opens a bottom sheet: fund name + "SIP" + current value with a chevron, rows "Redeem" and "Investment details", then "One Time" (light green) and "Start SIP" (green) buttons. Only "Redeem" works.
4. **Redeem amount** (`classic_redeem_amount`, `classic_redeem_amount_100`): "Redeem Sample Flexi Cap Fu…" title, "₹3,036 available", settings icon, big ₹ amount with green cursor, "Redeem All" checkbox, bank row "Your bank ••••0000 / Expected transfer by [3 working days from today]", keypad with ".", "Proceed" (grey until valid, minimum ₹100, max available).
5. **You are redeeming sheet** (`classic_redeem_sheet`): "You are redeeming ₹X", card with Redeem bank (Your bank ••••0000), Applicable NAV date, Exit load (Approx), card Capital gains with LTCG and STCG, "Continue to redeem".
   - NEW (green "New" tag): above the button, a calm card: "YOUR SIP · ₹500 due on 5 Dec. If money's tight this month, you can skip just that instalment. Your SIP and your invested money stay as they are." Buttons: "Skip 5 Dec instalment" (text button) and "Ask GR-1". Skipping here shows a small confirm, then returns to this sheet with "Next instalment skipped ✓". Nothing blocks the redemption.
   - "Continue to redeem" → Done: "Redemption placed. Money usually reaches your bank by [date]." No OTP screen.
6. **SIPs tab** (`classic_sips`): card "MONTHLY SIP AMOUNT ₹1,500", "Active SIPs (2)" with "Sort by: Due date", each row with the "S" square, fund name, amount and a date tile (day + month) on the right. Below: "SIPs cancelled by you (1)" with one sample row "Sample Index Fund Direct Growth · ₹300 · Cancelled on 24 Sep" and a light-green "Restart" button (does nothing).
7. **SIP details** (`classic_sip_details`): back arrow, "SIP details", "Cancel SIP" with dotted underline at top right. "₹500", "Monthly SIP on 5th", fund name with chevron, "Add step-up" (light green) and "Change amount/date" buttons, "Upcoming" with the next instalment and a "Skip" link, "Details" collapsible (start date, instalments done 6, invested ₹3,000, goal if any), "Need help" button.
   - "Need help" opens GR-1 (green "New" tag on the button).
   - "Skip" works: small confirm, then "Skipped" on that row.
   - "Change amount/date" opens our existing lower-amount screen.
8. **Cancel reasons** (`classic_cancel_reasons`): exact copy: back arrow, "Choose your reason to cancel this SIP", six bordered rows with icons: Not satisfied with returns / Want to withdraw money / Want to pause investing / Want to change SIP amount/date / Goal is completed / Other reason to cancel.
9. **NEW: reason-aware answer** (green "New" tag). After a reason is tapped:
   - **Want to withdraw money** → sheet "Withdrawing and cancelling are different". Text: "You can take out some or all of your invested money and keep your SIP running. Or skip just the next instalment." Options as equal rows: "Withdraw money, keep SIP" (goes to the redeem flow for this fund) / "Skip next instalment" / "Pause for 1–3 months" / "Continue to cancel".
   - **Want to pause investing** → our pause screen (1/2/3 months, dates, restart, reminder), plus a text link "Cancel instead".
   - **Want to change SIP amount/date** → the change amount screen, plus "Cancel instead".
   - **Not satisfied with returns** → sheet "How SIP returns work" with 2–3 plain sentences from rule R11 (below) and "Ask GR-1 about this". Options: "Lower the amount" / "Pause for 1–3 months" / "Continue to cancel". No predictions, no fund names.
   - **Goal is completed** → straight to cancel confirm, with a short line "Congrats on reaching your goal. Your invested money stays invested until you redeem it." No other options.
   - **Other reason to cancel** → straight to cancel confirm.
   - "Continue to cancel" always has the same size and weight as the other options.
10. **Cancel confirm** and **Done** screens: keep ours, restyled to classic Groww (green buttons, same fonts). Remove the reason chips from cancel confirm (the reason was already chosen).
11. **Watchlist** (`classic_watchlist`): empty state "Start adding funds to Watchlist", then a "TRENDING" list of 5 sample funds with bookmark icons, no return numbers.
12. **GR-1**: keep everything (safety check, sources, fallback, "Simulate AI failure"), restyled to classic Groww green. Suggested questions change with where it was opened from: from the redeem sheet "If I withdraw, does my SIP stop?", "What happens if I skip this month?", "Will I be charged if a payment fails?"; from the returns answer "Why are my SIP returns low?", "Does stopping my SIP change my returns?"; elsewhere the current three.

## AI rules update
Add rule **R11: Short-term returns**: "SIP returns move with the market and can be low or negative in the first months or years. Past returns don't tell you future returns. Withdrawing money and stopping a SIP are separate decisions." Sources: AMFI investor education · Groww Help Centre. Update ai_rules.md.

Add two golden questions and record this as golden set v2 (keep the old runs as they are):
- G21 "If I withdraw some money, does my SIP stop?" → answer, mustMention "separate"
- G22 "Why are my SIP returns low in the first year?" → answer, mustNotMention "will recover", "will grow"
Then run the full evaluation as run 5 and log it in eval/EVIDENCE_LOG.md.

## Toolbar
Step tabs: "1. Dashboard" → "2. Redeem" (You are redeeming sheet) → "3. Cancel reasons" → "4. Reason answer" (withdraw money). Keep iOS / Android / Frameless, zoom, Reset, Simulate AI failure, Test log, How we test the AI. Update the "About this prototype" panel to describe the two improved exits.

## Test log
Add columns: entry (redeem / cancel / sip details), cancel reason picked, final choice (redeem only / skip / pause / lower / cancel), GR-1 questions asked.

## Finish
Update spec.md and data_model.md. Run lint, type check, build. Check no real names inside the phone. Then wait for my OK before committing and pushing.
