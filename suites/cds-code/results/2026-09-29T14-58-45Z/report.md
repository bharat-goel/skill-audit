# nullbench report — EXPLORATORY

This run does not match its registration. Per-task figures are shown; the average is suppressed.

Registration `823994c3476651eb` · model `sonnet` · judge `sonnet` · reps 10

## Why this run is exploratory

- judge canaries misgraded; judged tasks cannot be confirmed

## Signal tasks — does the skill change the answer?

| Task | Predicted | Control | Treatment | Delta | 95% CI | |
|---|---|---|---|---|---|---|
| `cds-e1-profile-card` | helps | 0% (0/10) | 0% (0/10) | +0.0pp | [-27.8pp, +27.8pp] | non-discriminating |
| `cds-e2-create-team-modal` | helps | 0% (0/10) | 30% (3/10) | +30.0pp | [-3.8pp, +60.3pp] | non-discriminating |
| `cds-e3-banner-progress` | no-effect | 0% (0/10) | 0% (0/10) | +0.0pp | [-27.8pp, +27.8pp] | non-discriminating |
| `cds-e4-sidebar-nav` | no-effect | 0% (0/10) | 0% (0/10) | +0.0pp | [-27.8pp, +27.8pp] | non-discriminating |
| `cds-e5-empty-state` | helps | 0% (0/10) | 0% (0/10) | +0.0pp | [-27.8pp, +27.8pp] | non-discriminating |

## Harm tasks — does the skill stay quiet where it should?

| Task | Predicted | Control | Treatment | Delta | 95% CI | |
|---|---|---|---|---|---|---|
| `audit-harm-routine` | no-effect | 90% (9/10) | 90% (9/10) | +0.0pp | [-31.5pp, +31.5pp] | non-discriminating |

**Average across signal tasks: suppressed** — this run is exploratory.

Judge canaries: 23/26 graded correctly.

**Known limitation:** the judge (`sonnet`) shares a model family with the subject (`sonnet`). A blind spot common to both would not be visible here, and the canaries cannot detect it. See FAILURES.md entry 3.

Predictions are recorded in `LEDGER.md` whether or not they were borne out.
