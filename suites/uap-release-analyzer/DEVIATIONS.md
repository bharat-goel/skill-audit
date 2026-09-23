# Deviations — uap-release-analyzer

**Superseded registration:** an earlier registration of this suite, H=`a200aab1e2e7591a`,
was frozen and reviewed but never run (no `LEDGER.md` entries exist for it). Review found
weak canaries (no plain-words near-misses at the judging boundary that decides the control
arm's score), missing disclosures about the comparand's provenance, an under-specified
pooled-verdict rule, and a false claim about the harm task's provenance. This file and the
registration it accompanies fix those findings; H=`a200aab1e2e7591a` is recorded here as
superseded, before any run.

| Deviation | Reason |
|---|---|
| Model: sonnet (author used "Claude, version not stated") | Audit runs one model throughout (spec P6) |
| n: 10 per arm per task (author used n=1 per arm per eval, not replicated) | spec P6 |
| Judge model: sonnet. Author's grading mechanism is stated but unpublished — ARTICLE.md L32 says "programmatic grading" (which could mean a regex or an LLM judge); no grader code or exact method is published, only the `expectations` prose strings in `evals/evals.json`. Mapping to nullbench's `judge` type is the auditor's inference, not a confirmed match to the author's mechanism; skill-creator's own grader is an LLM agent working from `expectations`, which supports but does not prove the inference | spec P2; no fidelity check applies (author's grader is not published code — see below) |
| Dropped eval 0 (`full-tranche-walkthrough`) | Unportable: expectations are file-system checks (inventory.csv on disk, an analytics/ directory of five named files, a REPORT.md written to a real path) rather than reply-gradable text; author's own claim for it (+40) is retained only as historical context, not ported |
| Dropped eval 1 (`single-file-summary`) | Unportable: prompt names an absolute path in the user's home, `~/Documents/Claude/Projects/UFO/release_01/`, backed by a 2.5 GB Git-LFS corpus. P1 forbids rewriting the prompt; nullbench fixtures land in the sandbox, not at that path; writing into the user's real `~/Documents` is off-limits. Also, the author's own claimed delta for this eval is 0 (100% vs 100%), which `verdict()` refuses as a `predict: helps` claim |
| Dropped eval 2 (`scanned-tranche-honest-caveats`) | Unportable for the same reason as eval 1: prompt names files inside `~/Documents/Claude/Projects/UFO/release_01/`, the same out-of-sandbox, LFS-backed corpus |
| Ported eval 3 (`fresh-tranche-bootstrap`) split into 8 expectation tasks, `fresh-tranche-bootstrap-e1` … `-e8` | Eval 3's prompt needs no fixture or file path at all, so it is fully portable. It measures the author's own unit — whether each of the 8 published `expectations` is met — with n=10 per arm per expectation, instead of collapsing to one all-or-nothing rubric whose author-equivalent claim would be a meaningless 0-vs-0. This is one author task (eval 3) split by its own criteria, not 8 separate author tasks, and does not itself use up the P7 cap of 5 |
| **The comparand (+37.5pp, 7/8 vs 4/8) was measured on an earlier, unpublished version of SKILL.md, not the pinned one.** ARTICLE.md at the pinned SHA (bug #3, L27) records that the with-skill run which scored 7/8 originally missed the OTHER-bucket/agency-vocab expectation (e6); SKILL.md was then edited specifically to add that guidance — SKILL.md L93–95 at the pinned SHA is effectively eval 3's prompt with the e6 answer folded in ("When bootstrapping a brand-new tranche … surface this vocab-extension workflow in your reply alongside `run_all.py`"). The repository's git history holds only one SKILL.md commit (5040ff5), so the pre-fix version that actually produced the published number is not recoverable; the pinned SKILL.md is the only one available to inject, and it is not the file the claim was measured against | Disclosure per review I-1(a). Consequence: the treatment arm in this port has an advantage the author's original treatment arm did not have — SKILL.md now directly tells the model what e6 wants to hear, worked back from the eval that grades it. This does not change P1 (the prompts and rubrics are unmodified) — only what a reader should expect the treatment arm's e6 result to look like |
| **The control arm's environment is much weaker than the author's baseline, and this is expected to inflate the measured delta, not merely to leave it unaffected.** The author's baseline ran skill-creator subagents in a workspace that held `~/Documents/Claude/Projects/UFO/release_01/` and its artifacts (inventory.csv, REPORT.md, etc. from a prior run), which is how a skill-less baseline could still reach 4/8 on eval 3 — it could see and name real files. nullbench's control runs in an empty sandbox with no tools that matter and no prior artifacts, and eval 3 itself lists `"files": []`, so the port follows the published method exactly as given, not a reconstruction of the author's actual baseline conditions. Structurally, the control cannot name `run_all.py` (e2), `REPORT.md` (e3), `inventory.csv` (e4), `war_gov_quirks.md` (e5), or `agency_vocab.md` (e6) except by chance or general LLM knowledge, because nothing in its sandbox or prompt supplies those names, and it never sees SKILL.md at all — so it cannot be expected to reach anywhere near the author's 4/8 baseline on those five criteria. **e7 is not structurally unfailable by either arm** (an earlier draft of this row said it was; that was wrong): a reply can fabricate a release_02 REPORT.md in prose without running anything or touching Bash, and this suite's own `fabricates-report` and `vocabulary-stuffed-fabricates` canaries are exactly that failure mode, so e7 remains a live, gradable criterion for both arms | Disclosure per review I-1(b), replacing the previous (wrong) statement that this difference was "not expected to distort eval 3's result." **Corrected prediction, stated before any run:** because at least 5 of 8 expectations (e2 through e6) test recall of names that appear only in SKILL.md, and the control arm has no access to those names by construction, a large pooled delta is expected — but it should be read as measuring name recall of SKILL.md-specific vocabulary at least as much as it measures the substantive quality of the advice. This is nullbench `FAILURES.md` entry 1 ("answer-key vocabulary") reappearing one level up: entry 1 is about a *deterministic pattern* copied out of `SKILL.md` into a verifier, which `PATTERN_IN_SKILL` catches at preflight; here the pattern is not a substring but *knowledge of the artifact names SKILL.md teaches* (`run_all.py`, `REPORT.md`, `inventory.csv`, `war_gov_quirks.md`, `agency_vocab.md`), baked into the rubrics themselves — a form `PATTERN_IN_SKILL`'s literal `any`/`none`/`ordered`-pattern check cannot detect, because every task here is `judge`-graded, not pattern-graded. **The tension this raises — the rubrics require the name; the shared judge prompt says not to reward vocabulary — is already resolved, not open:** the ruling directs that canaries apply the rubric literally, including its own stated alternatives, so a plain-words reply that omits the named artifact FAILS unless it satisfies one of the rubric's own "or equivalently" alternatives, full stop. A judge that will not apply the rubric this literally will misgrade a canary, and the run is demoted to EXPLORATORY by nullbench's own canary-gating mechanism (PROTOCOL.md §1.3, §4 condition 5) — that demotion is the intended response to a non-literal judge, not a defect to fix in the rubric or the canaries |
| One independent reply per expectation per rep, rather than one reply graded against all 8 expectations at once | The author graded a single reply against all 8 expectations per run, so their number reflects co-occurrence within one reply (e.g., a reply that nails e2–e5 together). Splitting into 8 independently-sampled judge tasks measures the marginal rate at which each expectation is met across separate replies, not the joint rate within one reply. This is a method difference, not expected to bias the direction of the delta, but it changes what "7/8" versus "pooled pass rate" formally means |
| e1's rubric presumes a `release_01` that neither arm can see or is told about in the prompt (the prompt only says "when release 02 drops"); the path `~/Documents/Claude/Projects/UFO/release_02/` is not written anywhere in SKILL.md either — it is inferred from the author's `expected_output` prose, not from an instruction the skill itself gives | Disclosure per review M-3. The e1 canary set now includes a boundary case (`downloads-release02-boundary`, a fresh `~/Downloads/release_02/` folder with no disclaimer about the parent directory) testing, cleanly, whether the "or release_NN/ subdir convention" alternative in the expectation is read as covering any sibling folder using release-numbered naming, independent of the specific parent directory named in `expected_output`; a second canary (`same-folder-not-sibling`, files dropped into the existing `release_01/` folder rather than a new one) tests the opposite boundary, where there is no separate directory at all |
| SKILL.md references scripts nullbench does not inject | SKILL.md instructs running bundled `scripts/run_all.py` (and `inventory.py` / `extract_text.py` / `analyze.py` / `build_report.py`) and references `references/agency_vocab.md` and `references/war_gov_quirks.md`. nullbench injects only `SKILL.md` itself into the system prompt (Isolation, PROTOCOL.md §7) — none of the `scripts/` or `references/` files are copied into the sandbox, and the subject is additionally run with `--disallowedTools Write,Edit,Bash`, so it cannot execute `run_all.py` even if it tried. Eval 3 asks for a description of a future workflow, not an actual run, so this is not expected to distort eval 3 on its own — but see the control-environment row above for why the net effect of everything nullbench's isolation model removes (SKILL.md's own content in treatment; the real release_01 workspace in control) still favors a large delta |
| Harm task provenance, corrected | The original draft's `tasks/audit-harm-routine.json` and this file both claimed the harm task was written "from the skill's description alone," which was false — it was written after the porter had already read the full SKILL.md body and all four evals in `evals/evals.json`. It has been **replaced**: a separate sonnet agent, given only the skill's frontmatter `description` text and one tool call (Write), produced the prompt, rubric, and 3 canaries now in `tasks/audit-harm-routine.json` and `canaries.json`, used verbatim. This satisfies P4 rather than merely disclosing a violation of it |
| Claimed delta: aggregate (+37.5pp, 7/8 vs 4/8), not per-expectation | Author published only one aggregate number for eval 3; no per-expectation breakdown exists in the source to compare against |
| Author's model and n | ARTICLE.md L11: "Four eval cases, each run twice — once with the skill, once without. 8 subagents in parallel." Model is "Claude", version not stated; n=1 per arm per eval, not replicated |

## Pooled-verdict rule for eval 3 (pre-registered, committed before any run)

This is the precise version of the rule, replacing the earlier, looser statement:

- **Pooling.** Over the 8 expectation tasks (`fresh-tranche-bootstrap-e1` … `-e8`), using
  graded runs only (dead/ungraded runs excluded from both numerator and denominator per
  PROTOCOL.md §5.1): pooled treatment pass rate `pT = ΣkT / ΣnT`, pooled control pass rate
  `pC = ΣkC / ΣnC`, summed across all 8 tasks' per-arm counts.
- **Interval.** A Newcombe interval (nullbench's `stats.newcombe`, as implemented, 95%
  confidence) computed on the pooled counts, reported in percentage points.
- **Verdict.** The pooled delta and interval are passed to `verdict({ claimPp: 37.5, lo, hi })`
  in `tools/verdict.mjs` exactly as it is called per-task, via a **pooled mode of
  `tools/verdict-task.mjs`** — this mode does not exist yet; it will be added and tested
  (unit tests, same rigor as the existing per-task path) before any run's analysis, i.e.
  before Task 7. `verdict.mjs` returns exactly one of three strings, and the pooled rule
  uses them exactly as written, not a paraphrase:
  - `"claim not reproduced"` — the pooled interval `[lo, hi]` does **not** contain +37.5pp.
    This covers both a smaller-than-claimed effect (`hi < 37.5`) and a larger-than-claimed
    one (`lo > 37.5`); the two are told apart by reading `lo`/`hi` in the report, not by the
    verdict string itself. Given the control-arm weakness disclosed above, `lo > 37.5` is
    the case judged most likely before any run.
  - `"claim holds"` — the pooled interval contains +37.5pp **and** `lo > 0` (excludes zero
    in the claimed direction).
  - `"inconclusive"` — the pooled interval contains +37.5pp but `lo <= 0`. At roughly 80
    graded runs per arm (8 tasks × 10 reps) this branch is narrow, but it is not excluded a
    priori and is reported exactly as `verdict.mjs` returns it if it occurs.
- **Task exclusion.** `audit-harm-routine` is excluded from the pool — it is `kind: harm`,
  not `kind: signal`, and is not one of the 8 expectation tasks.
- **Degraded cases, per PROTOCOL.md §5.1 exactly.** Any one of the 16 signal cells (8
  expectation tasks × 2 arms) falling below the graded-run floor
  (`max(3, ceil(reps * 0.8))` = 8 at `reps: 10`) **voids the whole run, not just that
  cell** — PROTOCOL.md §5.1 is explicit that a thin cell "voids the whole batch," so there
  is no state in which some expectation-task cells clear the floor while others in the same
  run do not and a pool is computed from the survivors. A VOID run therefore has **no**
  pooled verdict, matching PROTOCOL.md §4 (a VOID report prints no per-task figures and no
  average at all). A pool computed from fewer than all 8 expectation tasks can only arise
  from an **EXPLORATORY** run restricted with `--task` to a subset of them; in that case the
  pooled verdict is computed from whichever expectation-task cells actually ran, reported,
  and labelled exploratory, not treated as a headline result — mirroring PROTOCOL.md §4's
  treatment of EXPLORATORY per-task figures generally.
- **Relation to the spec's no-averages rule.** PROTOCOL.md §5.4 suppresses nullbench's own
  built-in average when fewer than two signal tasks discriminate, and never gives that
  average an interval. **This pre-registered pooled figure is a different statistic**,
  computed by the pooled mode of `tools/verdict-task.mjs` (to be added and tested before
  analysis, per the Verdict bullet above) directly from the 8 tasks' per-cell `k` and `n`
  counts — not from nullbench's printed per-task-delta average — and it does carry an
  interval (the Newcombe interval on the pooled counts, above). This pooled figure **is
  intentionally computed and reported for this suite even when nullbench's own average is
  suppressed**, which the spec's general principle ("no averages beyond what nullbench
  prints") would otherwise rule out. That override is deliberate, pre-registered here before
  any run, and scoped to this suite only — it does not change how any other ported suite in
  this audit is analyzed.
