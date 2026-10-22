# uap-release-analyzer

**Claim:** "Fresh-tranche bootstrap 88% with skill vs 50% baseline, +38" —
[README L97–105 @ c171d88](https://github.com/ckpxgfnksd-max/uap-release-analyzer/blob/c171d88deb15c747c14ca11aa1486167a6208b95/README.md#L97-L105)
(7 of 8 expectations met vs 4 of 8, one run per arm: +37.5pp).

**Registration:** H=`ef9be7b4ff77bd4a`, nullbench `6653ca4`, **EXPLORATORY**
(judge canaries 34/38). Run 3 of 3; runs 1 and 2 were VOID on an API session limit
and are in [`LEDGER.md`](../suites/uap-release-analyzer/LEDGER.md).

## Verdict (pre-registered pooled rule): **claim holds** — exploratory

| | Control | Treatment | Delta | 95% CI |
|---|---|---|---|---|
| Pooled over e1–e8 | 12.5% (10/80) | 55.0% (44/80) | **+42.5pp** | [+28.4pp, +54.3pp] |

The interval contains the author's +37.5pp and excludes zero. The run is EXPLORATORY
because the judge misgraded 4 of 38 canaries, so under the rule fixed before the run this
is reported and not used as a headline. Before the run, a result above the claim
(`lo > 37.5`) was judged the most likely outcome. It did not happen.

| Expectation (eval 3) | Control | Treatment | Delta | 95% CI |
|---|---|---|---|---|
| e1 new tranche in a sibling `release_NN/` directory | 0/10 | 1/10 | +10.0pp | [-18.9, +40.4] |
| e2 run `scripts/run_all.py` | 0/10 | 10/10 | +100.0pp | [+60.7, +100.0] |
| e3 review `REPORT.md` | 0/10 | 9/10 | +90.0pp | [+48.8, +98.2] |
| e4 diff `inventory.csv` across releases | 0/10 | 2/10 | +20.0pp | [-11.2, +51.0] |
| e5 reference `war_gov_quirks.md` or its concerns | 0/10 | 1/10 | +10.0pp | [-18.9, +40.4] |
| e6 new prefixes go in `agency_vocab.md`, not the scripts | 0/10 | 10/10 | +100.0pp | [+60.7, +100.0] |
| e7 does not fabricate a release_02 report | 10/10 | 10/10 | +0.0pp | [-27.8, +27.8] |
| e8 concrete enough to copy-paste | 0/10 | 1/10 | +10.0pp | [-18.9, +40.4] |

Harm task (written by a separate agent given only the skill's description): 10/10 → 10/10, +0.0pp —
`predict: no-effect` HIT. The skill did not degrade a routine answer in its own domain.

## What the number measures

**The claim reproduces, and almost all of it is the treatment arm naming the skill's own
files.** Counted across all 160 replies from both arms:

| File named in SKILL.md | Control replies | Treatment replies |
|---|---|---|
| `run_all.py` | 0 / 80 | 80 / 80 |
| `agency_vocab.md` | 0 / 80 | 80 / 80 |
| `REPORT.md` | 0 / 80 | 77 / 80 |
| `inventory.csv` | 0 / 80 | 56 / 80 |
| `war_gov_quirks.md` | 0 / 80 | 6 / 80 |

29 of the treatment arm's 34 extra passes come from e2, e3 and e6, expectations that pass
only when the reply names a file the control arm has never seen. That is
[nullbench `FAILURES.md` entry 1](https://github.com/bharat-goel/nullbench/blob/main/FAILURES.md),
answer-key vocabulary, one level up: here the answer key is not a substring pattern but the
artifact names that SKILL.md teaches, built into the rubrics. nullbench's
`PATTERN_IN_SKILL` preflight cannot see it, because every task is judge-graded. This was
predicted in writing before the run
([`DEVIATIONS.md`](../suites/uap-release-analyzer/DEVIATIONS.md)).

The expectations that test the *substance* of the advice, not its vocabulary, barely
moved: e1, e5 and e8 each went 0 → 1 of 10.

## The skill contradicts its own eval, and the judge missed it

Expectation e6 requires new prefixes to go into `references/agency_vocab.md` "rather than
hard-coded into the scripts". SKILL.md itself instructs adding them to `PREFIX_RULES` in the
scripts as well ([SKILL.md L93 @ c171d88](https://github.com/ckpxgfnksd-max/uap-release-analyzer/blob/c171d88deb15c747c14ca11aa1486167a6208b95/SKILL.md#L93)). **9 of 10 treatment replies did what SKILL.md says**, adding the prefix to
`agency_vocab.md` *and* to `PREFIX_RULES` in `inventory.py`/`analyze.py`. Read literally,
each of those fails e6. The judge passed all 10. That is the same misgrade the pre-run canary
diagnostic caught on the e6 canary
([`canary-diagnostic.log`](../suites/uap-release-analyzer/canary-diagnostic.log)).

**Post-hoc sensitivity (not the registered verdict; computed after seeing the data):**

| Reading | Delta | 95% CI | Verdict |
|---|---|---|---|
| As graded (registered) | +42.5pp | [+28.4, +54.3] | claim holds |
| The 9 hard-coding e6 replies graded FAIL | +31.3pp | [+17.5, +43.5] | claim holds |
| e6 excluded | +34.3pp | [+19.1, +47.4] | claim holds |

The verdict does not depend on the judge's e6 error.

## Judge reliability

Canaries across four passes: 32/38 (run 1), 33/38 (diagnostic), 34/38 (run 2), 34/38 (run 3). Misgrades split
two ways: the judge was *stricter* than the literal rubric on the author's "like …" /
"(or …)" alternatives (e1, e5), and *more lenient* on a paraphrase that never names
`inventory.csv` (e4) and on the e6 hard-coding case. Canaries were not edited after any
result; they were fixed and reviewed twice before data existed.

## What was different from the author's method

See [`DEVIATIONS.md`](../suites/uap-release-analyzer/DEVIATIONS.md). The one most likely to
matter is **the control arm's environment**: the author's baseline ran in a workspace that
held release_01 and its artifacts, which is how it could reach 4/8. Ours runs in an empty
sandbox, as eval 3's `"files": []` specifies, and scored 12.5% pooled (1/8 per reply on
average, e7 only). Also: the claim was measured on an earlier, unpublished SKILL.md
(ARTICLE.md, bug #3); evals 0, 1 and 2 could not be ported; Sonnet, n=10 per arm per
expectation against the author's n=1.

**Correction to the frozen `DEVIATIONS.md` (row "SKILL.md references scripts nullbench does
not inject").** That row says the subject "is additionally run with `--disallowedTools
Write,Edit,Bash`". That is false. nullbench passes the subject no tool-restriction flag. Headless
`-p` mode refuses Write, Edit and Bash on its own, because with no project settings present its
permission system has nothing to approve them against (nullbench PROTOCOL.md §7). The effect
is the same: the subject cannot run `run_all.py`. The row is left as frozen, and the mechanism
is corrected here.

**Mapped to FAILURES.md:** entry 1 (answer-key vocabulary, at the rubric level); entry 7
(the published +38 is a single run per arm with no interval); entry 3 (Sonnet judging
Sonnet — the e6 misgrade is the kind of error a same-family judge shares with its subject).

## Author's reply

*Notified 2026-10-22 via [ckpxgfnksd-max/uap-release-analyzer/issues/1](https://github.com/ckpxgfnksd-max/uap-release-analyzer/issues/1). No reply yet. Publication planned for 2026-11-05.*
