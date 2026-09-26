# Deviations — cds-code

| Deviation | Reason |
|---|---|
| Model: sonnet (author used "Cursor eval runner", model not stated) | Audit runs one model throughout (spec P6) |
| n: 10 per arm per task (treated as n=1 per arm per eval in the author's own data — not stated as a fact, since no n is published) | spec P6 |
| `cds-e1`..`cds-e5`: author's grader → nullbench `judge`, one task per eval, rubric lists that eval's `expectations` verbatim, PASS only if all are met | spec P2, all-pass unit per the #129 ruling; fidelity check not applicable — author's grader is not published as code, only the `expectations` prose (no `fidelity/` step per spec P2, since there is no author-grader code to wrap) |
| Dropped evals 6–10 | spec P7 cap: keep the author's first 5 published evals only |
| `cds-e1-profile-card` expectation 9 ("All CDS import paths are valid subpath exports (no invented deep paths like /layout/Box)") kept, graded literally from reply text, no package export list supplied | P2 decision — see "Eval 1 portability" below |
| `audit-harm-routine`: prompt, rubric, and 3 canaries copied verbatim from a blind sonnet agent's output (`.superpowers/sdd/2026-09-23-skill-audit/blind-harm-cds.json`), except that the two disputed PASS canaries were replaced by porter-written ones (see "Harm task" below) | The agent was given only the skill's frontmatter `description` text and told to make one `Write` call, per P4/Step 4. It made 2 tool calls (the harness's count includes the hand-back call that returns its output, so this is not necessarily 2 *content-producing* calls, but the second could not be independently verified either way); this is disclosed as-is rather than asserting strict one-call compliance |
| `skill_dir: "skill"` — the full `skills/cds-code` directory at the pinned SHA, excluding `evals/` | Per the cds re-port ruling in progress.md ("nullbench skill_dir: re-review 2" onward): a real Claude Code skill is more than SKILL.md, and grading only SKILL.md's text understated what the skill does (review I-1). `evals/` is excluded so the treatment arm cannot read its own `expectations` text or grader; it is **not** a claim that no part of `skill_dir` hints at what is graded — `README.md`'s per-eval labels do, disclosed in "Author repo context readable in `skill/README.md` (N-6)" below |
| `cds-app/` fixture (auditor-written minimal CDS project) on all 5 signal tasks, not on the harm task | Reconstructs the author's unpublished in-repo baseline — see "Control-arm fixture (C-2)" below |
| Fixture package versions are the pinned repo's actual published versions (`@coinbase/cds-web` 9.28.0, `@coinbase/cds-common` 9.28.0, `@coinbase/cds-icons` 5.25.0), plus `@coinbase/cds-web-visualization` 4.0.0 added as a dependency | Corrects a review finding (N-7): the prior fixture used illustrative example figures from `guidelines/code-review.md` (9.4.1/5.19.0), not the real pinned versions. Verified directly against each package's `package.json` at `9aca6aebcb62f731a5a754af66c0bd05df86beec` via `gh api`. `cds-web-visualization` is added for package-identity only (a declared dependency, no source) — see "Reading rule (N-1) and N-4/N-7 disclosure" below for what this does and does not change. **Does not move `H`:** checked directly against PROTOCOL.md §3's formula (`H = sha256(canonical({model, judge_model, reps, skill_sha256, tasks:[{id,kind,predict,sha256}]}))`) — a task's declared `fixture` directory *name* is part of the task file's bytes (and so of that task's `sha256`), but a fixture directory's *contents* are not covered by `H` at all, the same way `canaries.json` and this file are not. Confirmed empirically: a fresh `--dry-run` after this change still reports `H=823994c3476651eb`, byte-identical to the prior registration's `H`. This suite's fixture is therefore not itself something a re-freeze changes, unlike the task or `skill_dir` edits in this file's other rows |
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
  single conjunctive prose list graded by *some* mechanism (unpublished — see "Grader mechanism
  unpublished" below), and every other expectation in the array is graded the same way, from
  output text. It would be inconsistent to single out expectation 9 for demotion to "cannot
  exist" when the author clearly intended it as one criterion among nine, gradable by whatever
  their own (unpublished) grader used — most plausibly a static or LLM check against the reply's
  import statements, which is exactly nullbench's judge is asked to approximate here.
- The author's own grader could see real `node_modules` exports (their runs happened inside a
  real CDS project — see "Control-arm fixture (C-2)" below); our judge grades this item with
  strictly less information than the author's grader had. This is a genuine, disclosed
  asymmetry, not something the literal-anchor reading removes.

**Corrected from the pre-review version of this row:** the earlier claim that the risk below
"cannot be probed... without inventing a fictitious CDS package export list" was wrong for the
anchor itself. The expectation's own text names a concrete negative example — a reply importing
from `@coinbase/cds-web/layout/Box` (or `/layout/VStack`) is FAIL by the expectation's own
words, no export list needed to grade it. `cds-e1-profile-card`'s canaries now include
`near-miss-invalid-import-path`, a full-pass reply with exactly one import changed to
`@coinbase/cds-web/layout/Box`, labelled FAIL.

Risk that remains, disclosed rather than fixed: a reply that imports from a subtly wrong but
plausible-looking subpath (not resembling the `/layout/Box` example) could still pass this
expectation when a real package-export check would fail it. No canary probes that narrower edge,
since doing so would require inventing a fictitious CDS package export list to grade against,
which risks manufacturing a criterion the author never specified. The named-example anchor above
is what the expectation itself supplies; anything past that anchor is exactly the strictly-less-
information gap the row above discloses.

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
P3 ruling. e3/e4 carry an actual author claim — "no effect" — not the "author made no claim at
all" case the P3 ruling's own caveat is about, so a per-task HIT/MISS on them is not meaningless
in principle. Per nullbench's own HIT/MISS rule (`src/ledger.mjs`: for `no-effect`, HIT is an
interval that spans zero, MISS is one that does not), a MISS on `cds-e3` or `cds-e4` individually
would ordinarily mean "the author's no-effect result was not borne out."

**However, per the cds re-review ruling (N-1), this port's per-task e3/e4 HIT/MISS is NOT
published as confirming or refuting the author's no-effect result, in either direction.** The
reason is the residual control-arm environment gap disclosed in "Control-arm fixture (C-2)" and
the "Reading rule" section below: this port's control arm still lacks the monorepo context
(`node_modules`, docs, an MCP docs server) that the author's own control had, and that gap is
expected to inflate the measured delta — most sharply on e3 and e4, the two evals where the
author's own control scored 100%. A MISS on e3 or e4 caused by an artificially weak control cell
would look identical, in nullbench's own report, to a MISS caused by a real absence of author-
claimed no-effect — the report cannot tell the two apart from the HIT/MISS label alone. Reporting
either as "the author's claim not borne out" would attribute an artefact of this port's
environment to the author's own published result. **Only the pooled +60pp verdict (below) is
interpreted as a result of this suite; individual e3/e4 HIT/MISS labels are reported, since
nullbench prints them, but are not read as evidence about the author's claim.**

Separately: `tools/verdict.mjs`'s `verdict()` throws on `claimPp === 0` (`if (!Number.isFinite(claimPp) || claimPp === 0) throw ...`), so `cds-e3` and `cds-e4` cannot be
passed through the per-task `verdict-task.mjs <results-dir> <taskId> <claimPp>` path with
`claimPp: 0` — they get only nullbench's own HIT/MISS classification per task, never a
`"claim holds"` / `"inconclusive"` / `"claim not reproduced"` string individually. Only the
pooled call below (`claimPp: 60`, across all 5 tasks together) produces a `verdict()` string, and
that pooled string is what this port treats as interpretable, per the paragraph above.

e3/e4 remain part of the pooled +60pp claim below because that claim is defined over the
task-level pass rate across all 5 ported evals together, and the author's own without-skill
baseline already scores both of these evals at a full task-level pass (2/5) — i.e., these two
evals are exactly what keeps the without-skill task-level rate from being 0/5, so pooling without
them would misstate the baseline the claim is measured against.

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
  published 5-eval claim" to a different, smaller claim the author never stated. Per-task e3/e4
  HIT/MISS is not published as confirming or refuting the author's no-effect result either way
  (see "Predict per task (P3)" above and "Reading rule (N-1)" below) — that reading rule governs
  how a per-task MISS on e3/e4 is *not* used; it does not exclude e3/e4 from a pooled claim that
  is inherently about all 5 evals together.
- **Interval.** A Newcombe interval (nullbench's `stats.newcombe`, as implemented, 95%
  confidence) computed on the pooled counts, reported in percentage points.
- **Verdict.** The pooled delta and interval are passed to `verdict({ claimPp: 60, lo, hi })` in
  `tools/verdict.mjs`, via the pooled mode of `tools/verdict-task.mjs`, merged to `main` as
  `8db40e2` ("Merge feat/pooled-verdict: pooled verdict with per-cell floor") and present on this
  branch (confirmed: `git merge-base --is-ancestor 8db40e2 HEAD`). Invocation:
  `node tools/verdict-task.mjs <results-dir> --pooled <claimPp> <taskId> [<taskId> ...]`, i.e. for
  this suite `node tools/verdict-task.mjs suites/cds-code/results/<timestamp> --pooled 60
  cds-e1-profile-card cds-e2-create-team-modal cds-e3-banner-progress cds-e4-sidebar-nav
  cds-e5-empty-state`. `pooledVerdictForTasks()` sums `k`/`n` per arm across the named tasks using
  graded records only, enforces PROTOCOL.md §5.1's graded-run floor (`max(3, ceil(reps*0.8))`) per
  task×arm cell before summing — throwing rather than silently pooling a thin or all-dead cell —
  computes one Newcombe interval on the pooled counts, and passes it to `verdict()` once.
  `verdict.mjs` returns exactly one of three strings, used exactly as written:
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

## Reading rule (N-1): the residual control-arm gap, and how e3/e4 will be read

**Pre-registered, before any run**, per the cds re-review ruling ("cds re-review (opus)" onward
in progress.md):

Even with the `cds-app` fixture (added in the prior fix round; versions corrected in this round,
see N-7 below), this port's control arm still lacks everything else the author's own control had:
the Coinbase monorepo's `CLAUDE.md`, `AGENTS.md`, an `.mcp.json` docs server, the actual
`packages/web` source tree, and a real `node_modules` with real package exports. The author's own
control scored 100% on eval 3 and 100% on eval 4 *without* the skill — evidence that the author's
control environment supplied real CDS context on its own, independent of SKILL.md. This port's
control has only a bare `package.json` naming five dependencies; it cannot read real component
source, real exports, or repo-level agent instructions the way the author's control could.

**This residual gap is expected to inflate this port's measured delta relative to the author's
own contrast, concentrated on `cds-e3-banner-progress` and `cds-e4-sidebar-nav` — the two evals
where the author's control scored 100%.** A control cell that is artificially weak (because it
lacks monorepo context the author's had) will tend to score lower than the author's own baseline
on exactly these two tasks, which widens the measured with-vs-without gap beyond what the
author's own environment would have shown.

**Consequence for interpretation, stated before any run:**
- Per-task `cds-e3`/`cds-e4` HIT/MISS labels are **not** published as confirming or refuting the
  author's no-effect result, in either direction (restated from "Predict per task (P3)" above).
- **Only the pooled +60pp verdict is interpreted as this suite's result**, and it is read with
  the inflation direction stated here: if the pooled interval excludes zero and contains +60pp
  ("claim holds"), that is read as *at least* consistent with the author's claim, not stronger
  than the author's claim, because part of any measured gap may be this port's own control-arm
  weakness rather than the skill's real effect. If the pooled interval sits entirely above +60pp
  (`lo > 60`, one of the two "claim not reproduced" cases), that specific outcome is read as
  **more likely explained by this residual environment gap than by the skill outperforming its
  own author's measurement** — the opposite reading (the skill is more effective than its author
  found) is not ruled out, but the environment explanation is disclosed here as the prior,
  before seeing any data.
- This rule does not change how `cds-e1`, `cds-e2`, or `cds-e5` are read (their `predict: helps`
  tasks are not the ones the residual gap concentrates on to the same degree, and their own
  per-task verdicts remain interpretable as before).

**What this rule does not do:** it does not attempt to rebuild the Coinbase monorepo inside the
sandbox (ruled out explicitly — "do not try to rebuild the Coinbase monorepo"), and it does not
retroactively change `predict` labels, rubrics, or any hashed content. It is a reading
constraint on how the eventual report is interpreted and written up, agreed before any run, not a
change to what is measured.

## Environment and harness differences

| Deviation | Reason |
|---|---|
| `discover-cds-packages.sh` (SKILL.md's mandatory Initialization step) cannot run | See "Tool restriction (C-1)" below — Bash is refused by headless mode's own permission system, not by an explicit deny flag. The script now physically exists in the sandbox (via `skill_dir`) and would find the `cds-app` fixture's `package.json`-declared scopes if it could run, but it never runs at all |
| Subject not denied Write/Edit/Bash by an explicit flag; code must still appear in the reply | See "Tool restriction (C-1)" below — corrects the prior, false version of this row |
| Model: Sonnet (this audit) vs the author's "Cursor eval runner" (model not stated) | The audit reruns under its own harness and model regardless of what the author used; this is a new measurement under a different model and agent harness, not a replication of the author's exact conditions |
| n=10 vs the author's n≈1 per arm per eval | spec P6; the author's own repo describes no replication for iteration 4 |
| Baseline swings between the author's iterations 3 (2026-06-26) and 4 (2026-07-22), consistent with single-run noise | **Corrected from the pre-review version of this row, which had two of the four eval numbers reversed and miscounted the stable set.** The repo's git history retains README.md from iteration 3 (commit `fb3cf0744beed5f687ba45c3523aecc6899af977`). Checked directly, side by side with iteration 4: eval 1 (78→89, `helps` in both), eval 2 (100→86 — **iteration 3 has no claimed effect here (100/100); iteration 4 claims `helps` (100/86) — the predict label flips between iterations**), eval 4 (80→100 — **the reverse flip: iteration 3 claims `helps` (100/80); iteration 4 has no claimed effect (100/100)**), eval 5 (60→40, `helps` in both, magnitude only), eval 8 (71→86, **moved, not stable**). Only evals 3, 6 and 7 are stable across the two iterations (all three at 100/100, 83/83, 17/17 respectively) — **not** "3, 6, 7, 8" as the pre-review row said. With n=1 per arm per eval and no stated model, these swings are consistent with ordinary run-to-run noise rather than a change in the skill's real effect. The predict labels this port uses for `cds-e2-create-team-modal` (`helps`) and `cds-e4-sidebar-nav` (`no-effect`) are pinned to iteration 4 specifically (the SHA this suite is pinned to; PR #784's body confirms "Existing evals 1–8 are unchanged" at the pinned commit, consistent with the pinned SKILL.md being the one iteration 4 measured) — under iteration 3's data those two labels would swap. **Corrected in this round (N-2): the
pre-review version of this sentence was itself wrong.** The pooled 2/5 without-skill task-level
baseline does not change *in count* between iterations, but the two full-task passes are not the
same pair: at iteration 4 (the pinned SHA) they are evals 3 and 4 (both 100%); at iteration 3 they
are evals **2 and 3** (eval 2 was 100/100 at iteration 3, per the flip noted above; eval 4 was
100/80, a helps case, so it is not a full pass at iteration 3). The 2/5 *count* is stable across
both published iterations — which is what keeps the +60pp claim itself stable — but which two
evals supply that count is not, and the pre-review text's claim that it was "evals 3 and 4 either
way, just for different reasons" conflated the two iterations' different pairs into one. This is disclosed as a limitation of the author's own published methodology, not something this port can correct |
| Grader mechanism unpublished | The author's `expectations` arrays are the only published grading artifact; no grader code exists in the repo to wrap in `fidelity/`, so **spec P2's fidelity check** does not apply to this suite (unlike a suite with a published deterministic grader) — corrected from the pre-review version of this row, which mis-cited this as "the P7 fidelity-check step" |

## Tool restriction (C-1)

**Corrected from the pre-review version of this suite's DEVIATIONS, which stated a false
premise.** The prior text claimed nullbench runs the subject with `Write`/`Edit`/`Bash`
explicitly disallowed. That is not what the worktree build's protocol says, checked directly
against `/Users/bharatgoel/code/nullbench-skilldir/PROTOCOL.md` §7 ("Isolation"), quoted here
rather than paraphrased because the exact mechanism matters:

> The subject is invoked with no tool-restriction flags at all -- `src/claude.mjs` carries
> `SUBJECT_DISALLOWED_TOOLS` unused, deliberately. [...] It turns out not to matter either way,
> and this is worth stating plainly: headless mode itself already refuses any tool that would
> need interactive approval, before it runs, regardless of what the subject is invoked with. `-p`
> with `--setting-sources project` and no project settings present gives the CLI's own permission
> system nothing to approve against, so Write/Edit/Bash are refused by that system, not by a
> flag. The consequence is the same as if they'd been explicitly denied: **a skill whose method
> depends on running a script is measured here without that script ever running.**

So: no `disallowedTools` flag is passed to the subject for any task in this suite, and
`scripts/discover-cds-packages.sh` (now physically present in the sandbox via `skill_dir`) is
never executed by either arm regardless — not because it is denied by name, but because headless
mode's own permission system has nothing to approve `Bash` against and refuses it. The practical
consequence for grading is the same either way: **generated code must still appear in the reply
text**, since no tool call can write it to disk and have the judge see it. Every signal task's
`summary-only-no-code` canary (FAIL) exists for exactly this reason. This correction changes only
the *mechanism* named (permission-system refusal, not an explicit deny list) — it does not change
what actually happens to a Write/Edit/Bash call in this port, which remains: refused, every time.

## Control-arm fixture (C-2)

**Corrected from the pre-review version of this suite's DEVIATIONS, which asserted the
environment-loss bias ran in only one direction.** Without any fixture, this port's control arm
would be worse than merely "not seeing the skill" — it would have no way to know it is working
inside a CDS project at all, since none of the five prompts mention CDS, Coinbase, or the design
system by name. The author's own baseline was not like that: PR #784's body records that
evaluation runs (including the ones behind the iteration-4 README numbers this suite's claim is
built on) used "the `skill-creator` workflow," and that "the pre-PR skill entered the full CDS
coding workflow" for its comparison evals — i.e., the author's *without-skill* condition still ran
inside a real, CDS-aware repository, with real installed packages and (per SKILL.md's own
Initialization step) a real `node_modules` for `discover-cds-packages.sh` to enumerate. Eval 3 at
100% *without* the skill (`ProgressBar`/`ProgressCircle` from `@coinbase/cds-web/visualizations`,
`Banner variant="warning"`) is not achievable by a model with zero CDS context — the author's
baseline evidently had that context from its environment, not from a rubric-fed hint.

Without a fixture, this port's control would predictably score near zero on the CDS-only
naming criteria in `cds-e1`, `cds-e2`, `cds-e3` and `cds-e5` (ListCell/fgMuted, the alpha `Select`
subpath, the `cds-web/visualizations` import, "a CDS illustration component"), for a reason that
has nothing to do with the skill's own value: it would simply never have been told this is a CDS
codebase. That is control-arm-side environment loss, symmetric with (and independent of) the
treatment-arm-side environment loss already disclosed elsewhere in this file
(`discover-cds-packages.sh` cannot run; see "Tool restriction (C-1)" above) — the earlier version
of this file disclosed only the treatment-side loss and asserted, wrongly, that the net effect
worked only against inflating the delta.

**Mitigation, per the cds re-port ruling:** `cds-app/package.json` (an auditor-written minimal
CDS project — see the top-level deviation row) is set as the `fixture` on all 5 signal tasks and
copied into *both* arms' sandboxes (PROTOCOL.md §7: "A fixture is copied fresh for every run,"
copied to every arm, control included). This gives the control arm the one piece of context it
was otherwise structurally denied — that this is a project with `@coinbase/cds-web`,
`@coinbase/cds-common`, `@coinbase/cds-icons`, `@coinbase/cds-web-visualization`, `react` and
`react-dom` as dependencies (versions corrected to the pinned repo's real published versions in
this round — see N-7 below) — without telling it anything about CDS's actual API surface, which
is exactly what SKILL.md and its injected `guidelines/` supply to the treatment arm alone. This
reconstructs the author's unpublished in-repo baseline as far as a `package.json` alone can: it
does not include a real `node_modules` (so `discover-cds-packages.sh` still finds nothing even
though it now exists in the sandbox, and it cannot run there anyway per C-1), it does not include
any existing source file with a real CDS import for either arm to imitate (SKILL.md's own "match
whatever scope existing files use" guidance has nothing to match against), and it does not include
the monorepo's `CLAUDE.md`/`AGENTS.md`/`.mcp.json` docs server or the real `packages/web` source
the author's own control had.

**Corrected from the pre-review version of this section, which framed the remaining gap as
uncomplicated and fully intentional ("as it should be, since that gap is the very thing under
test"):** that framing is not wrong about what the fixture accomplishes — it closes the *is this
a CDS project at all* question and leaves the *what does the CDS API actually look like* question
as the treatment arm's exclusive advantage via `skill/guidelines/*.md`, which is correctly the
thing under test. But it is incomplete, because the fixture does not fully close the control-side
gap either: the author's own control, per PR #784, ran inside the real monorepo and scored 100%
on eval 3 and eval 4 without the skill, which our bare-`package.json` control structurally cannot
approach. So a portion of the *is this a CDS project* gap remains open on the control side even
after the fixture, on top of the *API surface* gap that is deliberately left open on the treatment
side. **See "Reading rule (N-1)" above for exactly how this residual gap is disclosed and how it
constrains interpretation of the eventual result** — it is not treated as fully resolved by the
fixture, and it is not silently absorbed into "as it should be."

## Guidelines and scripts now present via `skill_dir` (I-1)

**Corrected from the pre-review version of this suite, which injected `SKILL.md`'s text alone.**
With `skill_dir: "skill"`, the treatment arm's sandbox now physically contains
`skill/guidelines/components.md`, `icons.md`, `illustrations.md`, `code-review.md`, and
`skill/scripts/discover-cds-icons.mjs`, `discover-cds-illustrations.mjs`,
`discover-cds-packages.sh` — every file SKILL.md instructs the model to read (SKILL.md's own
Step 1–3 language: "read the platform-specific docs," "Use `guidelines/components.md` to help
identify the appropriate CDS components," "read the corresponding guidelines files"). The control
arm's sandbox contains none of this (`skill_dir` is only ever copied into the treatment sandbox,
per PROTOCOL.md §1.4: "Only the treatment arm ever sees it"). This directly supplies the
knowledge behind several of the ported expectations: `ListCell` for settings rows
(`components.md:38`), `Select` from `@coinbase/cds-web/alpha/select` (`components.md:150`), nav
icon sizing/active-state conventions (`icons.md`), and illustration-dimension conventions
(`illustrations.md`). The scripts remain present but non-executable (see "Tool restriction (C-1)"
above) — the model can *read* their source (e.g. to see which package suffixes
`discover-cds-packages.sh` looks for) but cannot *run* them in either arm.

**N-8, disclosed only, not fixed:** `scripts/discover-cds-packages.sh` is `100755` (executable) in
the upstream repo and `100644` (non-executable) as copied into `suites/cds-code/skill/`. File mode
is not covered by PROTOCOL.md §3's `H` (the manifest hashes bytes, not mode bits), so this does not
move the registration hash, and it has no behavioral effect in this port regardless — the script
never executes either way, since headless mode refuses `Bash` outright (see "Tool restriction
(C-1)" above). This is a nit against a literal byte-for-byte copy claim, not a measurement defect,
and per the ruling is disclosed rather than corrected.

**Contradiction disclosed as a finding, not fixed:** `guidelines/components.md` (lines 315, 322,
391 at the pinned SHA) tells the model that circular and linear progress indicators come from
`@coinbase/cds-web-visualization` — the separate package, not a `cds-web` subpath. `cds-e3`'s own
expectation 5 explicitly FAILS a reply that imports from `@coinbase/cds-web-visualization`,
requiring the `@coinbase/cds-web/visualizations` subpath instead. The author's own published
guideline and the author's own published eval expectation disagree with each other. Previously
(SKILL.md-only injection) this was harmless because the guideline was never in the sandbox to be
read. Now that `components.md` is actually present and readable, a treatment-arm reply that
follows its own injected guideline literally would fail `cds-e3` expectation 5 on exactly the
point the guideline told it to get right — a plausible, disclosed source of treatment-arm MISSes
on `cds-e3` that has nothing to do with the model's competence and everything to do with the
author's own guidelines and evals not agreeing with each other.

**Consequence for the verdict, spelled out (N-4), not left implicit:**
- (a) If enough treatment replies follow `components.md`'s guidance on `cds-e3` and fail
  expectation 5 as a result, `cds-e3`'s own interval can move down — potentially far enough that,
  combined with the pooled Newcombe interval, it pulls the pooled result toward (or below) zero.
  Per nullbench's HIT/MISS rule this would register as a `no-effect` **MISS in the harms
  direction** for `cds-e3` specifically (an interval below zero, not spanning it) — and per the
  "Reading rule (N-1)" above, that per-task MISS is *not* published as "the author's claim not
  borne out," precisely because this guideline/eval contradiction (not a real skill weakness) is
  a plausible cause.
- (b) Any `cds-e3` treatment MISSes caused this way lower the pooled treatment pass rate that
  feeds the +60pp pooled verdict, working in the *opposite* direction from the control-arm
  inflation disclosed in "Reading rule (N-1)" — i.e., this is one of the few mechanisms in this
  port that could plausibly work *against* the claimed delta rather than for it, partially
  offsetting (not necessarily cancelling) the control-arm inflation.
- (c) The author's own treatment arm, running inside the real monorepo, could consult real
  `node_modules` exports directly (per SKILL.md's own Initialization fallback) rather than relying
  solely on `components.md`'s prose — so the author's treatment plausibly avoided this exact trap
  by checking the real package structure, an option this port's treatment arm does not have
  (no real `node_modules`, and `discover-cds-packages.sh` cannot run — see "Tool restriction
  (C-1)"). This is a further way in which this port's treatment arm is measured under weaker
  conditions than the author's own, on this one expectation specifically.
- Also disclosed: `cds-app/package.json` in this round adds `@coinbase/cds-web-visualization` as a
  declared dependency (see N-7 below), for real-repo package identity. This does not resolve the
  contradiction — `components.md` still names that package for progress indicators, and `cds-e3`'s
  expectation 5 still FAILs an import from it — but it is disclosed here because declaring the
  package as a dependency (rather than omitting it, as the pre-review fixture did) makes it a
  slightly more available, plausible import target for either arm to reach for, which bears
  directly on the exact expectation this contradiction is about.

## Author repo context readable in `skill/README.md` (N-6)

**New disclosure, this round.** `skill/README.md` (copied verbatim, part of `skill_dir`) is
readable by the treatment arm and carries a "Per-eval breakdown" table whose row labels are
one-to-one hints at this suite's own prompts and expectations: "Profile card (Avatar, ListCell,
tokens)" (→ `cds-e1`), "Create team modal (Modal, Select alpha)" (→ `cds-e2`), "Sidebar nav (icon
names, active state)" (→ `cds-e4`), "Empty state + illustration sizing" (→ `cds-e5`). Keeping
`README.md` in `skill_dir` is author-faithful — it ships with the real skill, and excluding it
would mean the treatment arm sees less of the real skill than a real installation provides.
SKILL.md itself never points to `README.md`, so this is not something the skill instructs the
model to read, but it is present on disk and readable if the model looks. This means the claim
made in the top-of-file deviation row and in "Eval 1 portability" above — that excluding `evals/`
keeps the treatment arm from reading its own grading criteria — is not fully true: `README.md`'s
row labels are not the `expectations` text itself, but they do name several of the exact
components each rubric grades for (`ListCell`, `Select alpha`, "icon names, active state"). This
is disclosed rather than fixed by editing the file, since editing `README.md` would break its
byte-identity to the pinned SHA (verified in Step 1 of this suite's construction) and this port's
whole premise is porting the skill unmodified.

## Harm task

`tasks/audit-harm-routine.json`'s `prompt` and `verify.rubric` are copied verbatim from
`.superpowers/sdd/2026-09-23-skill-audit/blind-harm-cds.json`, produced by a separate sonnet
agent given only the skill's frontmatter `description` text (never SKILL.md's body, never
`evals/evals.json`) and told to make one `Write` call, per P4/Step 4. The harness's tool-call
count for that agent's run was 2, not 1; that count includes the call that hands the agent's
output back to its caller, so it is not necessarily evidence of a second *content-producing*
call, but the controller could not independently verify what the second call actually was
either way. This is disclosed as-is rather than asserting strict one-call compliance — the
task's content (a routine, out-of-scope TypeScript formatting request, matching the
description's own "not... tests" exclusion) gives no indication the extra call leaked SKILL.md
content into the draft, but the audit does not claim to have ruled that out.

**Canary replacement (per the cds-canaries ruling in progress.md):** the blind agent's two PASS
canaries (`obvious-pass`, `correct-plus-offer`) were disputed in review — each had 5 unit tests,
all mid-bucket (30s, 15m, 3h, 26h, 21d), none at a bucket boundary, against a rubric that requires
"3-4 unit tests that exercise at least a few of these bucket boundaries." A literal judge could
FAIL both, which would suppress the harm task's certification entirely. Per the ruling, these two
are **replaced by porter-written PASS canaries** (`boundary-tests-low`: 59s/61s/59m/61m;
`boundary-tests-high`: 23h59m/24h01m/47h59m/7d01m — each pair straddling a real bucket boundary,
every expected output computed and hand-verified against the rubric's own bucket definitions
before being written into the canary). The blind `prompt`, `verify.rubric`, and the blind
`wrong-or-incomplete` FAIL canary are kept verbatim (checked programmatically: `===` against
`blind-harm-cds.json`). This is disclosed rather than treated as a silent fix: **canaries certify
the judge, they are not the task itself** — the harm task's prompt and pass/fail criterion remain
entirely the blind agent's, unedited; only the judge-certification set is partly not blind.
