# Deviations — cds-code

| Deviation | Reason |
|---|---|
| Model: sonnet (author used "Cursor eval runner", model not stated) | Audit runs one model throughout (spec P6) |
| n: 10 per arm per task (author used n=1 per arm per eval) | spec P6 |
| `cds-e1`..`cds-e5`: author's grader → nullbench `judge`, one task per eval, rubric lists that eval's `expectations` verbatim, PASS only if all are met | spec P2, all-pass unit per the #129 ruling; fidelity check not applicable — author's grader is not published as code, only the `expectations` prose (no `fidelity/` step per the brief, since there is no author-grader code to wrap) |
| Dropped evals 6–10 | spec P7 cap: keep the author's first 5 published evals only |
| `cds-e1-profile-card` expectation 9 ("All CDS import paths are valid subpath exports (no invented deep paths like /layout/Box)") kept, graded literally from reply text, no package export list supplied | P2 decision — see "Eval 1 portability" below |
| `audit-harm-routine`: pending, not written by this porter | Dispatching is not allowed for this session; the controller will produce it with a blind agent per P4 and add it to `tasks/`, `nullbench.json`, and `canaries.json` |
| Claimed delta: pooled over the 5 ported evals (+60pp), not per-task | spec, Verdicts — see "Claim unit and pooled-verdict rule" below |

## Eval 1 portability (P2)

Eval 1's ninth expectation — "All CDS import paths are valid subpath exports (no invented deep
paths like /layout/Box)" — cannot be graded with certainty from reply text alone: doing so
exactly would require the real, installed CDS package `exports` map, which is not published in
the repo and is not something nullbench's sandbox has (the skill's own `Initialization` step
runs `scripts/discover-cds-packages.sh` against `node_modules` to get this list, and that script
finds nothing in a bare sandbox — see the row on that script below).

Per P2 this leaves two options: drop eval 1 and take eval 6 in its place, or keep eval 1 and
supply nothing, letting the rubric state the expectation literally and have the judge grade what
it can from the reply. **Decision: keep eval 1, supply nothing.** Reasons:

- The expectation's own text gives the judge a concrete negative anchor — "no invented deep
  paths like /layout/Box" — which is gradable from reply text without the real export list: a
  reply that imports from an implausible, hand-invented deep path (mirroring the
  `/layout/Box` example) fails; a reply that imports from the package root or a named,
  conventionally-shaped subpath (e.g. `/alpha/select`, matching eval 2's own expectation 6)
  passes. This is imperfect — it cannot catch every invalid subpath a determined reply might
  use — but it is not "cannot be graded at all," and P2 offers exactly this reading as the
  literal-treatment option.
- The controlling ruling in progress.md ("Task 4b review (opus)") is explicit that evals 1–5
  are the ported set for row #129/cds-code ("Port each of evals 1–5 as ONE judge task"), naming
  them by position, not by portability of each one individually. Substituting eval 6 for eval 1
  would depart from that explicit instruction without a clear mandate to do so, whereas the
  literal-grading reading keeps the ported set exactly as specified.
- This is the reading most faithful to the author: the author's own `expectations` array is a
  single conjunctive prose list graded by *some* mechanism (unpublished — see the M-1-style row
  below), and every other expectation in the array is graded the same way, from output text. It
  would be inconsistent to single out expectation 9 for demotion to "cannot exist" when the
  author clearly intended it as one criterion among nine, gradable by whatever their own
  (unpublished) grader used — most plausibly a static or LLM check against the reply's import
  statements, which is exactly nullbench's judge is asked to approximate here.

Risk carried forward: a reply that imports from a subtly wrong but plausible-looking subpath
(not resembling the `/layout/Box` example) could still pass this expectation when a real
package-export check would fail it. This is disclosed, not fixed — canaries for `cds-e1` do not
attempt to probe this narrow edge, since doing so would require inventing a fictitious CDS
package export list to grade against, which risks manufacturing a criterion the author never
specified.

## Claim unit and derivation (P8)

The author's grading mechanism is stated but unpublished. README.md's Performance section
reports a per-eval percentage for iteration 4 (2026-07-22): "Pass rate 100% with skill vs 75.0%
without skill, +25.0%," followed by a per-eval breakdown table giving one percentage per eval per
arm (e.g. eval 1: 100% / 89%, eval 5: 100% / 40%). No n or model is stated; the README's own
"Running evaluations" section only names the harness as a "Cursor eval runner." The per-eval
percentages are each a share of that eval's `expectations` array met in what is treated here as
one run per arm per eval (consistent with no replication being described anywhere in the repo).

**The headline 100 vs 75.0 is a mean of the 8 per-eval shares, not a per-task pass rate.**
Recomputing from the eight values in the "Per-eval breakdown" table (89, 86, 100, 100, 40, 83,
17, 86): with-skill mean is 100 (all eight are 100); without-skill mean is
(89+86+100+100+40+83+17+86)/8 = 601/8 = 75.125 ≈ the reported 75.0%. This is an average of
per-eval expectation-recall rates over all 8 evals, not the fraction of evals that passed every
expectation.

**At the task level (an eval counts as passed only if every expectation in it is met), the
author's own data over the 5 ported evals gives a different, sharper number.** With-skill: every
one of evals 1–5 is reported at 100%, i.e. 5/5 evals pass in full. Without-skill: only evals 3
and 4 are reported at 100% (2/5); evals 1, 2 and 5 are below 100% (89%, 86%, 40%), so at least one
expectation fails in each and none of the three counts as a full task-level pass. That gives
**with-skill 5/5 vs without-skill 2/5 over the 5 ported evals — a claimed +60 percentage points**,
which is the unit this suite's tasks are built to measure (one judge task per eval, PASS only if
every expectation in that eval is met — the task pass rate, not the per-expectation mean).

This +60pp is the number the pooled-verdict rule below tests. It is derived, not quoted verbatim
from the README (which states only the per-eval percentages and the 8-eval headline), following
the same reasoning the uap-release-analyzer precedent and the #129 ruling both use: the author's
own published data determines the task-level pass/fail per eval exactly, with no additional
assumption needed, because every non-100% eval necessarily fails at least one expectation and
every 100% eval necessarily passes all of them.

## Predict per task (P3)

`predict` records the author's own claim per task, from the per-eval breakdown:

| Task | With skill | Without skill | `predict` |
|---|---|---|---|
| `cds-e1-profile-card` | 100% | 89% | `helps` |
| `cds-e2-create-team-modal` | 100% | 86% | `helps` |
| `cds-e3-banner-progress` | 100% | 100% | `no-effect` |
| `cds-e4-sidebar-nav` | 100% | 100% | `no-effect` |
| `cds-e5-empty-state` | 100% | 40% | `helps` |

Evals 3 and 4 show no author-claimed effect (100% both arms) and are marked `no-effect` per the
P3 ruling — a MISS on either must not read as "claim not borne out," since the author made no
claim of improvement on these two evals. They remain part of the pooled +60pp claim below because
that claim is defined over the task-level pass rate across all 5 ported evals together, and the
author's own without-skill baseline already scores both of these evals at a full task-level pass
(2/5) — i.e., these two evals are exactly what keeps the without-skill task-level rate from being
0/5, so pooling without them would misstate the baseline the claim is measured against.

## Pooled-verdict rule for cds-e1..cds-e5 (pre-registered, committed before any run)

Modelled word-for-word on the uap-release-analyzer suite's final (round-2-reviewed) pooled rule:

- **Pooling.** Over the 5 signal tasks (`cds-e1-profile-card`, `cds-e2-create-team-modal`,
  `cds-e3-banner-progress`, `cds-e4-sidebar-nav`, `cds-e5-empty-state`), using graded runs only
  (dead/ungraded runs excluded from both numerator and denominator per PROTOCOL.md §5.1): pooled
  treatment pass rate `pT = ΣkT / ΣnT`, pooled control pass rate `pC = ΣkC / ΣnC`, summed across
  all 5 tasks' per-arm counts.
- **Task inclusion.** All 5 signal tasks are pooled, including `cds-e3-banner-progress` and
  `cds-e4-sidebar-nav`, even though both carry `predict: no-effect`. The +60pp claim is defined
  over the task-level pass rate across all 5 ported evals together (5/5 vs 2/5), not over a
  subset — dropping e3/e4 from the pool would change what is being tested from "the author's
  published 5-eval claim" to a different, smaller claim the author never stated. `no-effect`
  governs how a MISS on e3/e4 alone is read (not "claim not borne out"); it does not exclude
  them from a claim that is inherently about all 5 evals pooled.
- **Interval.** A Newcombe interval (nullbench's `stats.newcombe`, as implemented, 95%
  confidence) computed on the pooled counts, reported in percentage points.
- **Verdict.** The pooled delta and interval are passed to `verdict({ claimPp: 60, lo, hi })` in
  `tools/verdict.mjs`, via a pooled mode of `tools/verdict-task.mjs` — this mode does not exist
  yet; it will be added and tested (unit tests, same rigor as the existing per-task path) before
  any run's analysis, i.e. before Task 7. `verdict.mjs` returns exactly one of three strings, used
  exactly as written:
  - `"claim not reproduced"` — the pooled interval `[lo, hi]` does **not** contain +60pp. This
    covers both a smaller-than-claimed effect (`hi < 60`) and a larger-than-claimed one
    (`lo > 60`); the two are told apart by reading `lo`/`hi` in the report, not by the verdict
    string itself.
  - `"claim holds"` — the pooled interval contains +60pp **and** `lo > 0` (excludes zero in the
    claimed direction).
  - `"inconclusive"` — the pooled interval contains +60pp but `lo <= 0`.
- **Task exclusion.** `audit-harm-routine` is excluded from the pool — it is `kind: harm`, not one
  of the 5 signal tasks.
- **Degraded cases, per PROTOCOL.md §5.1 exactly.** Any one of the signal cells (5 tasks × 2 arms,
  plus the harm task's own 2 cells) falling below the graded-run floor
  (`max(3, ceil(reps * 0.8))` = 8 at `reps: 10`) voids the whole run, not just that cell —
  PROTOCOL.md §5.1 is explicit that a thin cell "voids the whole batch." A VOID run therefore has
  **no** pooled verdict, matching PROTOCOL.md §4 (a VOID report prints no per-task figures and no
  average at all). A pool computed from fewer than all 5 signal tasks can only arise from an
  **EXPLORATORY** run restricted with `--task` to a subset of them; in that case the pooled
  verdict is computed from whichever task cells actually ran, reported, and labelled exploratory,
  not treated as a headline result.
- **Relation to the spec's no-averages rule.** PROTOCOL.md §5.4 suppresses nullbench's own
  built-in average when fewer than two signal tasks discriminate, and never gives that average an
  interval. This pre-registered pooled figure is a different statistic, computed by the pooled
  mode of `tools/verdict-task.mjs` directly from the 5 tasks' per-cell `k` and `n` counts — not
  from nullbench's printed per-task-delta average — and it does carry an interval. This pooled
  figure is intentionally computed and reported for this suite even when nullbench's own average
  is suppressed, scoped to this suite only.

## Environment and harness differences

| Deviation | Reason |
|---|---|
| `discover-cds-packages.sh` (SKILL.md's mandatory Initialization step) cannot run and finds nothing in a bare sandbox | The with-skill arm therefore runs in a materially weaker condition than the author's own environment, which presumably had real CDS packages installed under `node_modules` for the discovery script to enumerate. The skill's own guidance for this case ("If the script cannot be run... infer the platform by inspecting existing CDS imports... find valid import paths by reading the `exports` field of installed CDS packages") also cannot be followed in an empty sandbox, since there is no existing codebase to inspect and no `node_modules` to read. This weakens the treatment arm relative to the author's measurement, working against inflating the claimed delta, not for it |
| Subject cannot write files: nullbench runs the subject with `Write`/`Edit`/`Bash` disallowed (per the uap-release-analyzer precedent's DEVIATIONS.md) | Generated code must appear in the reply text for the judge to grade it at all — a reply that only describes what it would build (see each task's `summary-only-no-code` canary, labelled FAIL) cannot pass any of these 5 tasks under this port, whereas the author's own harness (a full Cursor session) presumably let the subject write real files to disk and be graded on those |
| Model: Sonnet (this audit) vs the author's "Cursor eval runner" (model not stated) | The audit reruns under its own harness and model regardless of what the author used; this is a new measurement under a different model and agent harness, not a replication of the author's exact conditions |
| n=10 vs the author's n≈1 per arm per eval | spec P6; the author's own repo describes no replication for iteration 4 |
| Baseline swings between the author's iterations 3 (2026-06-26) and 4 (2026-07-22), consistent with single-run noise | The repo's git history retains README.md from iteration 3 (commit `fb3cf0744beed5f687ba45c3523aecc6899af977`), which reports different without-skill percentages for the same 8 evals: eval 1 78%→89%, eval 2 100%→86%, eval 4 80%→100%, eval 5 60%→40% (only evals 3, 6, 7, 8 were stable across the two iterations). With n=1 per arm per eval and no stated model, these swings are consistent with ordinary run-to-run noise rather than a change in the skill's real effect, and they are large enough (eval 5 alone moves 20 points) that a single without-skill run should not be read as a precise baseline. This is disclosed as a limitation of the author's own published methodology, not something this port can correct |
| Grader mechanism unpublished | The author's `expectations` arrays are the only published grading artifact; no grader code exists in the repo to wrap in `fidelity/`, so the P7 fidelity-check step does not apply to this suite (unlike a suite with a published deterministic grader) |

## Harm task

`tasks/audit-harm-routine.json` is intentionally absent from this commit. Per the brief,
dispatching a blind sub-agent is not permitted in this session; the controller will produce it
separately (written from the skill's frontmatter `description` alone, blind to SKILL.md's body
and to `evals/evals.json`, per P4) and add it to `tasks/`, `nullbench.json`, and `canaries.json`.
Until that lands, `--dry-run` on this registration is expected to report `NO_HARM_TASK` drift —
this is the one open item blocking a CONFIRMATORY-eligible freeze, not a structural error.
