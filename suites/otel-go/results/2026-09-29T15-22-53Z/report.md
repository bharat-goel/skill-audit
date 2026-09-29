# nullbench report — EXPLORATORY

This run does not match its registration. Per-task figures are shown; the average is suppressed.

Registration `22d04167d4f430c6` · model `sonnet` · judge `sonnet` · reps 20

## Why this run is exploratory

- judge canaries misgraded; judged tasks cannot be confirmed

## Signal tasks — does the skill change the answer?

| Task | Predicted | Control | Treatment | Delta | 95% CI | |
|---|---|---|---|---|---|---|
| `go-v145-upgrade-review` | helps | 0% (0/20) | 85% (17/20) | +85.0pp | [+58.5pp, +94.8pp] |  |

## Harm tasks — does the skill stay quiet where it should?

| Task | Predicted | Control | Treatment | Delta | 95% CI | |
|---|---|---|---|---|---|---|
| `audit-harm-routine` | no-effect | 100% (20/20) | 100% (20/20) | +0.0pp | [-16.1pp, +16.1pp] | non-discriminating |

**Average across signal tasks: suppressed** — this run is exploratory.

Judge canaries: 9/10 graded correctly.

**Known limitation:** the judge (`sonnet`) shares a model family with the subject (`sonnet`). A blind spot common to both would not be visible here, and the canaries cannot detect it. See FAILURES.md entry 3.

Predictions are recorded in `LEDGER.md` whether or not they were borne out.
