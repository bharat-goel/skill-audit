# Phase 0 — nullbench live bracket on Sonnet

Run 2026-09-24T00:14Z, nullbench `6653ca4` (branch `chore/bracket-on-sonnet`), model `sonnet`, reps 10.
**Backend: the real `claude` CLI (`/Users/bharatgoel/.local/bin/claude`), `NULLBENCH_CLAUDE_BIN` unset.**
Stated separately because nullbench's ledger records the registered model name, not the
backend that answered: its 2026-09-18 entries also read `model=sonnet` for runs made on a
local gemma model.

| Arm | Result | Required | Met |
|---|---|---|---|
| placebo (H=d3331de4d78e20b4) | +0.0pp [-27.8pp, +27.8pp], 40 graded, 0 dead | spans zero | yes |
| known-positive (H=6a4ac8cdf32d57b9) | +100.0pp [+60.7pp, +100.0pp], 40 graded, 0 dead | excludes zero | yes |

**Gate: PASS.** Raw output: `bracket-sonnet.log`.
