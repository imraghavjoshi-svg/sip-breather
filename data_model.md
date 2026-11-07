# SIP Breather: data model

The smallest set of data that supports every screen. No database: seed data lives in TypeScript files, everything the user does lives in memory for the session. Reset clears it.

Rule used: if a value can be worked out from other values, it is not stored.

## Seed data (exists before the user does anything)

### Sip (2 demo SIPs)
| field | type | required | note |
|---|---|---|---|
| id | string | yes | "sip_flexi", "sip_mid" |
| fundName | string | yes | always a "Sample …" name |
| monthlyAmount | number | yes | ₹ |
| instalmentDay | number | yes | day of month, e.g. 5 |
| instalmentsDone | number | yes | |
| minAmount | number | yes | 100 |
| skipAllowed | boolean | yes | true in demo |
| maxPauseMonths | number | yes | 3 |
| goalName | string | no | "Bike" |
| goalTarget | number | no | 60000 |

Derived, not stored: invested = monthlyAmount × instalmentsDone; goal progress = invested / goalTarget; next instalment date = the next time instalmentDay comes round after today; last instalment date = the most recent instalmentDay before today; pause restart date = next date + pauseMonths.

### Rule (the facts GR-1 is allowed to use)
| field | type | required |
|---|---|---|
| id | string | yes |
| title | string | yes |
| text | string | yes |
| sources | {label: string, url: string}[] | yes |

11 rules (R1 to R11; R11 "Short-term returns" was added with the classic redesign, 7 Nov 2026). Every rule has two sources: "AMFI investor education" (https://www.amfiindia.com/investor-corner) and "Groww Help Centre" (https://groww.in/help). Answers show them as one line: "Sources: AMFI investor education · Groww Help Centre".

Content: see ai_rules.md.

### GoldenItem (22 test questions, golden set v2)
| field | type | required |
|---|---|---|
| id | string | yes |
| question | string | yes |
| expected | "answer" \| "refuse_advice" \| "out_of_scope" | yes |
| mustMention | string[] | no |
| mustNotMention | string[] | no |

Content: see ai_rules.md. Set v1 (G1 to G20) was used for runs 1 to 4; set v2 adds G21 and G22 (from run 5).

### Holding (2, one per SIP; Groww's existing Dashboard and redeem screens only)
| field | type | required | note |
|---|---|---|---|
| sipId | string | yes | "sip_flexi", "sip_mid" |
| currentValue | number | yes | ₹3,036 and ₹4,048 |
| oneDayChange | number | yes | ₹9 and ₹12 |

Plus constants shown as given, not worked out: portfolio XIRR "6.10%", and a sample XIRR per fund for the Dashboard rows (Flexi Cap "6.34%", Midcap "5.92%").

Derived, not stored: invested (from Sip); total current value ₹7,084; total returns = current value − invested (+₹84, 1.2%); 1D returns = sum of oneDayChange (+₹21, 0.3%); amount available to redeem = that fund's current value (classic Groww redeems one fund at a time); short-term capital gain = amount × (currentValue − invested) / currentValue; NAV date and "expected transfer" date (3 working days from today). Returns are shown only on Groww's existing screens, never on our SIP screens.

## Session data (created when the user acts, in memory only)

### Redemption (while on the redeem flow)
| field | type | required |
|---|---|---|
| sipId | string | yes (the fund being redeemed: chosen on the Dashboard, or the SIP itself for "Withdraw money, keep SIP") |
| amount | string as typed, e.g. "1000" or "250.5" | yes |

Cleared when a new redemption starts or on Reset. Dashboard holdings do not change after a redemption (demo).

### Decision (one per demo run)
| field | type | required |
|---|---|---|
| sipId | string | yes |
| option | "skip" \| "pause" \| "lower" \| "cancel" | yes |
| pauseMonths | 1 \| 2 \| 3 | only for pause |
| newAmount | number | only for lower |
| cancelReason | "returns" \| "withdraw" \| "pause" \| "change" \| "goal" \| "other" | no (set when the option was reached from the cancel reasons) |

A skip made on the YOUR SIP card or on SIP details is also a Decision (option "skip"); the screen then shows it in place.

### Cancel reason draft (while on the cancel path)
The reason picked on "Choose your reason to cancel this SIP": "returns" \| "withdraw" \| "pause" \| "change" \| "goal" \| "other". It decides what opens next and is copied into the Decision and the test log row.

### ChatMessage
| field | type | required |
|---|---|---|
| role | "user" \| "assistant" | yes |
| text | string | yes |
| ruleIds | string[] | assistant only |
| status | "ok" \| "fallback" \| "refused" | assistant only |
| simulated | boolean | assistant only; true when "Simulate AI failure" was on |

Where GR-1 was opened from ("redeem" \| "returns" \| "other") is kept in memory to choose its suggested questions; it is not part of a message.

### EvalResult (one per golden item, when "Run evaluation" is pressed)
| field | type | required |
|---|---|---|
| goldenId | string | yes |
| answer | string | yes |
| type | "answer" \| "refuse_advice" \| "out_of_scope" \| null (safe fallback) | yes |
| status | "ok" \| "fallback" \| "refused" | yes |
| passed | boolean | yes |
| reason | string | yes |

Derived, not stored: score, advice leaks count, refusal accuracy. The saved run (`eval/last_run.json`) also records `goldenSet` ("v2" from run 5 on).

## Browser-only data (PM-approved exception: survives reloads, never leaves the browser)

### TestLogRow (one each time a run finishes; localStorage, Clear empties it)
A run finishes at a Done screen, at "Redemption placed", or when a skip is confirmed on SIP details. Stored under a new key since the classic redesign; older rows are not shown.

| field | type | required |
|---|---|---|
| time | ISO timestamp | yes |
| device | "iphone" \| "pixel" \| "frameless" | yes |
| entry | "redeem" \| "cancel" \| "sip_details" | yes (where the run started) |
| cancelReason | "returns" \| "withdraw" \| "pause" \| "change" \| "goal" \| "other" | only when entry is "cancel" |
| finalChoice | "redeem_only" \| "skip" \| "pause" \| "lower" \| "cancel" | yes |
| pauseMonths | 1 \| 2 \| 3 | only for pause |
| newAmount | number | only for lower |
| redeemAmount | number | only when a redemption was placed |
| gr1Questions | number | yes (since the last Reset) |

## Diagram

```mermaid
erDiagram
    SIP ||--o| DECISION : "user chooses an option for"
    SIP ||--o{ CHAT_MESSAGE : "questions are about"
    RULE ||--o{ CHAT_MESSAGE : "answers cite"
    GOLDEN_ITEM ||--o| EVAL_RESULT : "is scored as"
    RULE ||--o{ EVAL_RESULT : "answers cite"

    SIP {
        string id
        string fundName
        number monthlyAmount
        number instalmentDay
        number instalmentsDone
        number minAmount
        boolean skipAllowed
        number maxPauseMonths
        string goalName
        number goalTarget
    }
    DECISION {
        string sipId
        string option
        number pauseMonths
        number newAmount
        string cancelReason
    }
    RULE {
        string id
        string title
        string text
        string sources
    }
    CHAT_MESSAGE {
        string role
        string text
        string ruleIds
        string status
    }
    GOLDEN_ITEM {
        string id
        string question
        string expected
        string mustMention
        string mustNotMention
    }
    EVAL_RESULT {
        string goldenId
        string answer
        string status
        boolean passed
        string reason
    }
```
