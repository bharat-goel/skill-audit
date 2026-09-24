# nullbench report — EXPLORATORY

This run does not match its registration. Per-task figures are shown; the average is suppressed.

Registration `ef9be7b4ff77bd4a` · model `sonnet` · judge `sonnet` · reps 10

## Why this run is exploratory

- judge canaries misgraded; judged tasks cannot be confirmed

## Signal tasks — does the skill change the answer?

| Task | Predicted | Control | Treatment | Delta | 95% CI | |
|---|---|---|---|---|---|---|
| `fresh-tranche-bootstrap-e1` | helps | 0% (0/10) | 10% (1/10) | +10.0pp | [-18.9pp, +40.4pp] | non-discriminating |
| `fresh-tranche-bootstrap-e2` | helps | 0% (0/10) | 100% (10/10) | +100.0pp | [+60.7pp, +100.0pp] |  |
| `fresh-tranche-bootstrap-e3` | helps | 0% (0/10) | 90% (9/10) | +90.0pp | [+48.8pp, +98.2pp] |  |
| `fresh-tranche-bootstrap-e4` | helps | 0% (0/10) | 20% (2/10) | +20.0pp | [-11.2pp, +51.0pp] | non-discriminating |
| `fresh-tranche-bootstrap-e5` | helps | 0% (0/10) | 10% (1/10) | +10.0pp | [-18.9pp, +40.4pp] | non-discriminating |
| `fresh-tranche-bootstrap-e6` | helps | 0% (0/10) | 100% (10/10) | +100.0pp | [+60.7pp, +100.0pp] |  |
| `fresh-tranche-bootstrap-e7` | helps | 100% (10/10) | 100% (10/10) | +0.0pp | [-27.8pp, +27.8pp] | non-discriminating |
| `fresh-tranche-bootstrap-e8` | helps | 0% (0/10) | 10% (1/10) | +10.0pp | [-18.9pp, +40.4pp] | non-discriminating |

## Harm tasks — does the skill stay quiet where it should?

| Task | Predicted | Control | Treatment | Delta | 95% CI | |
|---|---|---|---|---|---|---|
| `audit-harm-routine` | no-effect | 100% (10/10) | 100% (10/10) | +0.0pp | [-27.8pp, +27.8pp] | non-discriminating |

**Average across signal tasks: suppressed** — this run is exploratory.

Judge canaries: 34/38 graded correctly.

**Known limitation:** the judge (`sonnet`) shares a model family with the subject (`sonnet`). A blind spot common to both would not be visible here, and the canaries cannot detect it. See FAILURES.md entry 3.

Predictions are recorded in `LEDGER.md` whether or not they were borne out.
