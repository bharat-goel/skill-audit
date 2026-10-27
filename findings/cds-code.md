# cds-code

**Claim:** "Pass rate 100% with skill vs 75.0% without skill, +25.0%" —
[README Performance @ 9aca6ae](https://github.com/coinbase/cds/blob/9aca6aebcb62f731a5a754af66c0bd05df86beec/skills/cds-code/README.md#performance).
Over the five evals that could be ported (1–5), the author's per-eval table gives every eval
100% with the skill, and 89 / 86 / 100 / 100 / 40% without it. Counting an eval as passed only
when all of its expectations are met, that is 5/5 vs 2/5: **+60pp**. That figure is derived from
the table, not quoted from it; the derivation is in
[`DEVIATIONS.md`](../suites/cds-code/DEVIATIONS.md) ("Claim unit and derivation"). One run per
arm, no n or model stated, Cursor eval runner.

**Registration:** H=`823994c3476651eb`, **EXPLORATORY** (judge canaries 23/26). This is run 2
of 2. Run 1 was VOID on an API session limit and is recorded in
[`LEDGER.md`](../suites/cds-code/LEDGER.md). The run used nullbench `feat/skill-dir` @ `9bcd56e`.
[`SOURCE.md`](../suites/cds-code/SOURCE.md) names `260e867`. The commits between them change only
fixture `skills/` handling (including refusing symlinks beneath it) and when fixture isolation
is checked. A dry-run immediately before the run reproduced the same H. Both facts are recorded in
[`notes/sdd-ledger.md`](../notes/sdd-ledger.md).

## Verdict (pre-registered pooled rule): **claim not reproduced** — exploratory

| | Control | Treatment | Delta | 95% CI |
|---|---|---|---|---|
| Pooled over e1–e5 | 0.0% (0/50) | 6.0% (3/50) | **+6.0pp** | [-2.1pp, +16.2pp] |

The interval lies entirely below the author's +60pp, and it includes zero. The run is
EXPLORATORY because the judge misgraded 3 of 26 canaries. Under the rule fixed before the run,
this result is reported, labelled exploratory, and not used as a headline. The nullbench version
this run used did not record which canaries were misgraded (see "Judge reliability").

Before the run, the reading rule (N-1) predicted that this port's thinner control environment
would *inflate* the measured delta. The measured delta is far below the claim anyway.

| Task (author's eval) | Predict | Control | Treatment | Delta | 95% CI |
|---|---|---|---|---|---|
| e1 profile card | helps | 0/10 | 0/10 | +0.0pp | [-27.8, +27.8] |
| e2 create-team modal | helps | 0/10 | 3/10 | +30.0pp | [-3.8, +60.3] |
| e3 banner + progress | no-effect | 0/10 | 0/10 | +0.0pp | [-27.8, +27.8] |
| e4 sidebar nav | no-effect | 0/10 | 0/10 | +0.0pp | [-27.8, +27.8] |
| e5 empty state | helps | 0/10 | 0/10 | +0.0pp | [-27.8, +27.8] |

Per the pre-registered reading rule, the e3 and e4 rows do not confirm the author's
"no effect" result and do not refute it. Both tasks are non-discriminating here.

Harm task (written by a separate agent given only the skill's description): 9/10 → 9/10,
+0.0pp. It was predicted `no-effect`, and that prediction was a HIT.

## What the number measures

**Most replies in both arms contain no code.** The frozen port expects this: headless mode
refuses Write, Edit and Bash, so any code has to appear in the reply text. A
`summary-only-no-code` canary (expected FAIL) certifies that the judge fails replies without it.
In practice, the subject usually tried to write a file into the `cds-app` fixture, was refused,
and replied with a plan:

> I couldn't write `src/ProfileCard.tsx` because write permission for that path was denied, so
> nothing has been created yet. […] Approve the write and I'll retry, or tell me a different
> location. — `cds-e1-profile-card__treatment__1.txt`

| Task | Control replies with a code block | Treatment replies with a code block |
|---|---|---|
| e1 | 1/10 | 4/10 |
| e2 | 0/10 | 3/10 |
| e3 | 6/10 | 8/10 |
| e4 | 1/10 | 4/10 |
| e5 | 0/10 | 0/10 |
| **Total** | **8/50** | **19/50** |

The harm task has no fixture, and it behaved differently: 19 of its 20 replies included code
inline. The difference suggests, but does not show, that the fixture project invites the
subject to write files.

Replies that did include code still mostly failed. All 3 passes are e2 treatment replies.
Among code-bearing replies, treatment passed 3/19 and control 0/8.

**Post-hoc sensitivity (not the registered verdict; computed after seeing the data):**

| Reading | Control | Treatment | Delta | 95% CI | vs +60pp |
|---|---|---|---|---|---|
| As graded (registered) | 0/50 | 3/50 | +6.0pp | [-2.1, +16.2] | claim not reproduced |
| Only replies that contain a code block | 0/8 | 3/19 | +15.8pp | [-18.2, +37.6] | claim not reproduced |

What this run shows is narrow. In a headless harness that cannot write files, with a bare fixture
project, Sonnet with the skill did not produce code meeting the author's expectations
meaningfully more often than Sonnet without it. The run does not show how the skill performs in
the author's environment, where Cursor could write files and the control arm had the monorepo.

## The skill contradicts its own eval (e3)

Eval 3's expectation 5 requires `ProgressBar` and `ProgressCircle` to be imported "from
@coinbase/cds-web/visualizations (the correct subpath), not … the separate
@coinbase/cds-web-visualization package". The skill's own guidelines say the opposite:
`guidelines/components.md` L315, L322 and L391 place both components in
`@coinbase/cds-web-visualization`. **All 8 treatment e3 replies that contained code imported
from `@coinbase/cds-web-visualization`, as the skill says**, and every one failed expectation 5.
None of the 6 code-bearing control replies used that package. This contradiction was disclosed
before the run ([`DEVIATIONS.md`](../suites/cds-code/DEVIATIONS.md), N-4). It is the same
pattern as uap-release-analyzer's e6: the skill instructs what its own eval forbids.

## Judge reliability

Canaries: 25/26 (run 1, VOID) and 23/26 (run 2). The nullbench version this run used
(`9bcd56e`) computed which canaries were misgraded but did not write them to the report or to
`records.json`, so the 3 misgrades here cannot be identified without paying for another canary
pass. nullbench has recorded them since [nullbench#8](https://github.com/bharat-goel/nullbench/pull/8). Canaries were not edited after
any result. `canaries.json` was last changed in `90dc00b` (2026-09-26), before either run.

Many judge reasons also penalise replies that *admit* their import paths are unverified. That
is consistent with the rubrics' import-path expectations, which a reply cannot satisfy by
guessing.

## What was different from the author's method

See [`DEVIATIONS.md`](../suites/cds-code/DEVIATIONS.md). The differences most likely to matter:

- **Tool access.** The author's runner could write files and run
  `scripts/discover-cds-packages.sh`. Here neither arm can. The replies above show the most
  visible consequence; how much of the gap to the claim it explains is not measured.
- **Control environment.** The author's control ran inside the Coinbase monorepo, with its
  `CLAUDE.md`, `AGENTS.md`, docs MCP server, package source and `node_modules`. Ours has only a
  `package.json` naming the dependencies (reading rule N-1).
- **Skill README.** `skill/README.md` is readable by the treatment arm and names the components
  each eval grades for (N-6).
- **Scope.** Evals 6–10 were dropped (P7). The run used Sonnet, with n=10 per arm per eval,
  against the author's single run.

**Mapped to FAILURES.md:** entry 7 (the published +25 / derived +60 comes from a single run per
arm with no interval); entry 3 (Sonnet judging Sonnet).

## Author's reply

*Notified 2026-10-22 via [coinbase/cds/issues/913](https://github.com/coinbase/cds/issues/913). No reply yet. Publication planned for 2026-11-05.*
