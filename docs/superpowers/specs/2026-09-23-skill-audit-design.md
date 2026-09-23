# skill-audit — design

*2026-09-23 · third project in the series (`~/code/SERIES.md`), after cobra and nullbench*

## Purpose

Re-measure the published effect claims of three Claude skills I did not write, using the
authors' own evaluation methods ported into nullbench. Publish every result, including
the ones where the claim holds.

## Gaps this closes

- **nullbench's live bracket has never run on a hosted model.** The worked example ran on
  Sonnet; the placebo / known-positive bracket has only run on a local
  `gemma-4-12b-qat`. The audit runs the bracket on Sonnet first.
- **Every figure in `FAILURES.md` comes from one harness (cobra's).** The audit is a
  source of failure cases from harnesses other than mine — the condition `SERIES.md`
  sets for `FAILURES.md` to stand on its own.

## Non-goals

- Testing a claim on the author's own model. Everything runs on Sonnet.
- Replication across batches (`FAILURES.md` entry 9 stays open).
- A judge from a different model family (entry 3 stays open; that is the next project).
- Skills that publish a number but no method. They are excluded, not guessed at.
- Improving anyone's evaluation. The audit measures the method as published.

## Phases and gates

Each phase has a gate that must pass before the next starts, and commits an artifact, so
git history proves the order.

| # | Phase | Gate | Artifact |
|---|---|---|---|
| 0 | Run nullbench's `verify:live` bracket on Sonnet (~80 invocations: two fixtures of 40) | Placebo interval spans zero **and** known-positive interval excludes it. Either failing stops the audit. | Bracket output; ledger entry in nullbench |
| 1 | Write the selection rule before looking at any candidate | Rule committed | `SELECTION.md` (rule section) |
| 2 | Apply the rule in fixed order; log every candidate considered | 3 eligible skills, or the stop condition reached | `SELECTION.md` (log section) |
| 3 | Port and register one suite per skill | `--dry-run` preflight clean; fidelity check passed; registration hash committed **before the first paid call** | `suites/<skill>/` |
| 4 | Run at reps=10 on Sonnet (subject and judge) | A non-VOID report per registration. A VOID batch is re-run and stays in the ledger. | `results/`, `LEDGER.md` |
| 5 | Notify each author; publish after 14 days or on reply | Window elapsed or reply received | `findings/`, `FINDINGS.md`, `correspondence/` |

Authors see results only after the registration is frozen. Their response can shape the
published reply, never the tasks.

## Selection rule

Committed to `SELECTION.md` before any candidate is viewed.

**Sources, in order — take the first three eligible:**

1. [github.com/anthropics/skills](https://github.com/anthropics/skills), in directory order.
2. GitHub repository search, query fixed at commit time: `SKILL.md` plus
   `eval OR benchmark OR "with and without"`, sorted by stars descending, limited to
   repositories last pushed before the date the rule is committed.

**Eligibility — all required, each recorded with an evidence link:**

| | Criterion |
|---|---|
| E1 | An Agent Skill (`SKILL.md` with frontmatter) runnable under the `claude` CLI with no external service, API key or paid tool |
| E2 | Publishes a with-versus-without number. A pass rate with no baseline does not count. |
| E3 | Publishes a portable method: task prompts plus a per-task pass criterion (verifier code, rubric, or explicit criteria) expressible as a nullbench verifier. A criterion that needs, e.g., executing generated code is not portable. |
| E4 | License permits redistribution |
| E5 | Not written by me; no two selected skills share an author or organisation |

Each selected skill is **pinned to a commit SHA** at selection.

**Stopping.** Stop at three eligible skills or 100 candidates screened, whichever comes
first. Fewer than three eligible means the audit proceeds with fewer and reports the
shortfall as a finding ("N of 100 publish a portable claim"). The criteria are never
loosened after candidates have been seen; any rule change is a new commit stating why,
and the earlier log is kept. Every candidate screened gets a log line, rejections
included.

## Porting rules

Principle: **measure the author's method, not a better one.** A flaw in their grader is
ported, not fixed.

| | Rule |
|---|---|
| P1 | Prompts and fixtures copied byte-for-byte from the pinned SHA |
| P2 | Deterministic criteria map to `any` / `ordered` / `none`; prose or human-judged criteria map to a `judge` rubric restating their criterion. A port that cannot pass the fidelity check (hand-written **and generated** replies) is unportable, dropped per P7, with the reason in `DEVIATIONS.md` — the fidelity check decides this, not the porter's judgement. In particular, nullbench's `ordered` type handles negation (a cue like "don't" or "before you" in front of a `before` pattern suppresses it); an author's own ordering check usually does not, so an author's ordering criterion will usually be unportable, and that is the intended outcome, not a bug in the port. |
| P3 | Their tasks register as `kind: signal`, `predict: helps` — the prediction is the author's claim, not mine, so HIT/MISS reads as "claim borne out" |
| P4 | One `kind: harm`, `predict: no-effect` task per suite, the only task I write: a routine in-domain task the skill should not change, written from the skill's `description` alone, before any run |
| P5 | Canaries (hand-written pass and fail replies) for every judge-graded task |
| P6 | Sonnet subject and judge, reps=10, regardless of the author's model or n |
| P7 | At most 5 of their tasks per suite — the first 5 in their published order — plus the harm task. Omitted tasks are logged. |
| P8 | `DEVIATIONS.md`: one line per difference from their method (model, n, grader mapping, dropped tasks, added harm task), each with its reason, committed with the registration |

**Fidelity check.** Where the author's grader is code, it and the ported nullbench
verifier both grade a set of hand-written sample replies before any paid call, and must
agree on every one; each ported task needs at least one sample the author's grader passes
and one it fails. The check also generates its own edge replies from the ported spec —
case variants, a pattern embedded inside a longer word, a pattern next to punctuation,
the `maxWords` boundary, and, for `ordered`, a `before` pattern preceded by each
negation cue nullbench's verifier understands — and runs those through both graders too;
a disagreement on a generated reply fails the check exactly like a hand-written one.
Disagreement, hand-written or generated, means the port is wrong and is fixed before the
registration is frozen. **If it cannot be made to agree, the task is unportable**: it is
dropped per P7, with the reason recorded in `DEVIATIONS.md`, not forced through with a
loosened criterion. This is expected to eliminate most ported ordering checks — see P2.
The samples live in `fidelity/samples.json`, not `canaries.json` — nullbench only accepts
canaries for judge-graded tasks, and ported code graders become deterministic verifiers.
The runner is `tools/fidelity.mjs`; its output is committed as `fidelity/fidelity.txt`,
which begins with a provenance header (nullbench commit SHA, sha256 of `verify.mjs`, and
sha256 of each task file checked) so a later run can confirm nothing shifted underneath
a passed check before spending on a paid call.

**Self-copying graders.** If the author's deterministic patterns appear verbatim in their
`SKILL.md`, preflight raises `PATTERN_IN_SKILL` and CONFIRMATORY is blocked. For such a
skill, two registrations are frozen before any run:

- `as-published` — their grader exactly; expected EXPLORATORY; reproduces their number.
- `rubric` — the same tasks and criterion restated as behaviour, judge-graded; eligible
  for CONFIRMATORY.

The gap between them is the finding (cf. cobra's `ic-agent-under-pressure`,
+70.0pp → +0.0pp). This is triggered by the preflight result, not chosen after seeing
data.

## Outputs

### Repository layout

```
skill-audit/
  README.md            what this is, status, the results table once published
  SELECTION.md         rule (phase 1), then the full screening log (phase 2)
  suites/<skill>/
    SOURCE.md          repo URL, pinned SHA, license, links to claim and method, nullbench SHA
    DEVIATIONS.md      P8
    SKILL.md  tasks/  nullbench.json  canaries.json
    fidelity/          samples.json, author-grader.mjs, fidelity.txt — where applicable
    LEDGER.md  results/
  findings/<skill>.md  their claim against the measured result, per task, with the author's reply
  FINDINGS.md          cross-skill summary, including the E3 exclusion rate
  correspondence/      outbound messages and replies, verbatim
  docs/superpowers/specs/
```

nullbench is invoked from its own checkout; each `SOURCE.md` records the nullbench commit
that ran the suite. No vendoring, no submodule.

### Verdicts

Every task carries exactly one, assigned by `tools/verdict.mjs` from the author's claimed
delta and the measured interval — code written and tested before any data exists, so an
arguable case cannot be decided generously at write-up time (entry 12):

- **claim holds** — the interval contains their number and excludes zero in the claimed
  direction
- **claim not reproduced** — the interval excludes their number, including when the
  effect is real but smaller than claimed
- **inconclusive** — the interval contains both zero and their number

A registration that drifted (`as-published` with `PATTERN_IN_SKILL`) is labelled
**not measurable as published**, and the `rubric` registration carries the verdict. Where
an author published only an aggregate, the aggregate is each task's claimed value, and
`DEVIATIONS.md` says so.

No averages beyond what nullbench prints. Skills that hold up get the same prominence as
those that do not.

### Author contact

A GitHub issue on the skill's repository, or email if that is what the author lists.
Claude drafts each message; **the user sends it**, under their own name. The message
states that the reply will be published verbatim beside the finding unless the author
asks otherwise.

### Feedback into the series

- **`FAILURES.md`** — after publication, a PR to nullbench filing each failure found in
  an author's method, either as a non-cobra source under an existing entry or as a new
  entry (14+).
- **Crossjudge** — all judged replies stay in `results/*/raw/`, free input for the next
  project.
- **`SERIES.md`** — mark the audit shipped, with the gaps it leaves: Sonnet only, three
  skills, one batch per suite, same-family judge.

## Cost

| Item | Invocations |
|---|---|
| Bracket (phase 0) | ~80 |
| Three suites at reps=10 | ~520 (≈170 each, per the cobra worked example) |
| Second `rubric` registration, per self-copying skill | +~170 each |
| **Total** | **~600, up to ~1,110** |

VOID re-runs are extra and are not avoidable: a VOID batch is no measurement.

## Risks

- **Too few eligible skills.** E3 will exclude most. Mitigation: the shortfall is a
  reported finding, not a failure of the audit.
- **Non-discriminating tasks.** An author's tasks may sit at ceiling in both arms, as two
  of cobra's did. nullbench labels them and may suppress the average. That is a finding
  about their eval, not a reason to replace their tasks.
- **My harm task biases the result.** It is the one task I write. Mitigation: written from
  the `description` alone, before any run, and flagged as mine in `DEVIATIONS.md`.
- **Unfair framing of authors.** Mitigation: their method, their prediction, a 14-day right
  of reply, and equal prominence for skills that hold up.
