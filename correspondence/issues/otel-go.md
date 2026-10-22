<!-- Paste-ready issue. Open: https://github.com/ollygarden/opentelemetry-agent-skills/issues/new?title=Independent%20re-measurement%20of%20the%20go-v145-upgrade-review%20eval%20%28PR%20%23218%29 -->
<!-- Title: Independent re-measurement of the go-v145-upgrade-review eval (PR #218) -->

Hi — I re-ran the `go-v145-upgrade-review` eval published with PR #218 (at `73a557b`) with [nullbench](https://github.com/bharat-goel/nullbench), a pre-registration harness, as part of an audit of published skill claims. otel-go was one of three skills, out of 123 screened, that published a with-versus-without number and a method someone else could re-run. Thank you for publishing `evals/evals.json` and `results.md`.

What I did: your prompt and fixture were used verbatim, with your four expectations as one all-must-pass judge rubric. I ran 20 replies per arm on Sonnet, and committed the analysis rule before any run. Because your claim of 0/3 → 3/3 sits at the +100pp ceiling, the rule compares our interval with your own interval for that claim, [+20.6, +100]. Every difference from your method is summarised in the write-up below.

**Result: your claim holds.** 0/20 → 17/20, +85.0pp [95% CI +58.5, +94.8]. The result is labelled exploratory because the judge misgraded 1 of 10 calibration checks.

One thing you may want to know: in your run, expectations A–C passed in every rep of both arms and only D varied. In ours it was the other way round. Without the skill, Sonnet never stated the v1.45.0 changes (A–C) and usually declined because it couldn't verify them. With the skill, it read them from `references/` (`breaking-changes.md`, `performance.md`, which state them nearly as the expectations do). D separated the arms only a little: the without-skill replies missed it in 5 of 20. So on Sonnet the skill's value here is the reference content, more than the verification instruction #218 added. Part of that is our baseline: it had only the fixture, while yours had the repo's other skills and `AGENTS.md`.

The full write-up is below. I plan to publish it, with the complete method, deviations and raw data, on 2026-11-05. Any reply you send will be published verbatim beside the finding unless you ask otherwise, and I'll correct anything I got wrong about your method.

— Bharat

<details>
<summary>Full write-up (draft, as it will be published)</summary>

### otel-go

**Claim:** "Target skill withheld: 0 pass, 3 fail; Proposed PR skill: 3 pass, 0 fail" — [results.md @ 73a557b](https://github.com/ollygarden/opentelemetry-agent-skills/blob/73a557bd3a79c0590995f90ab2cebaae203409b3/skills/otel-go/evals/results.md) and the PR #218 body. The claim covers one case (`go-v145-upgrade-review`) with 3 reps per arm. A rep passes only if all four expectations (A–D) hold, so the claim is 0/3 → 3/3 = +100pp. The author's own Newcombe interval for that claim is [+20.6pp, +100pp].

**Registration:** H=`22d04167d4f430c6`, reps=20, nullbench `feat/skill-dir` @ `9bcd56e`, **EXPLORATORY** (judge canaries 9/10). Run 1 of 1. 170 invocations, 0 of 80 subject runs dead.

#### Verdict (pre-registered ceiling rule): **claim holds** — exploratory

| | Control | Treatment | Delta | 95% CI |
|---|---|---|---|---|
| `go-v145-upgrade-review` | 0% (0/20) | 85% (17/20) | **+85.0pp** | [+58.5pp, +94.8pp] |

The ceiling rule was fixed before the run (C-2) because a +100pp claim sits at the maximum a delta can take. Under it, the audit interval excludes zero and overlaps the author's [+20.6, +100]. nullbench classes the run EXPLORATORY because the judge misgraded 1 of 10 canaries, and the result is reported with that label.

**Point-claim rule (degenerate at the ceiling), secondary:** `verdict({claimPp: 100})` returns "claim not reproduced", because [+58.5, +94.8] does not contain 100. Before the run, DEVIATIONS.md stated that this rule can return "claim holds" only on a perfect 20/20 vs 0/20 sweep. That is why it is not the primary verdict.

At reps=20 the ceiling rule could have gone either way: a null 0/20 vs 0/20 reads "claim not reproduced". This run's result was far from that boundary.

Harm task (written by a separate agent given only the skill's description): 20/20 → 20/20, +0.0pp. It was predicted `no-effect`, and that prediction was a HIT.

#### What the number measures (exploratory attribution, I-3)

This attribution was pre-registered as a post-hoc read of the judge's stated reasons. It is exploratory and not part of the verdict.

**The lift here comes from expectations A–C, not D, which is the opposite of the author's run.** In the author's data, A–C passed in every rep of both arms. Only D varied: it requires no false "compiled/validated" claim and a safe local verification path proposed instead. Here:

- **Control, 20/20 FAIL:** every judge reason cites A and C missing, and B missing, hedged, or "partly met" (#15). The control replies mostly decline to state the v1.45.0 behaviour changes, saying they cannot verify them. D is cited as missing in 5 of 20 (#3, #13, #16, #17, #19).
- **Treatment, 3/20 FAIL:** two failed on C alone (#4, #16), and one on A, B and C (#14). None failed on D.

The facts A–C test are written in the skill's `references/`, nearly in the expectations' own words. For example, `performance.md` L340–342: "Since v1.45.0 the HTTP exporters correctly interpret integer `Retry-After` values as seconds and also support HTTP-date values. On v1.44.0, integer values were mistakenly treated as nanoseconds and HTTP-date values were ignored." Compare expectation C. `breaking-changes.md` L52–59 covers A and B the same way. 15 of 20 treatment replies cite a skill file (`references/…`, `SKILL.md`); 0 of 20 control replies do.

This is the pattern recorded as [nullbench `FAILURES.md` entry 1](https://github.com/bharat-goel/nullbench/blob/main/FAILURES.md) at the rubric level, as in uap-release-analyzer. Here it has a legitimate reading too. Supplying version-specific facts the base model lacks is what a reference skill is for. The measured +85pp is real in that sense. What it shows is that Sonnet with the skill can reproduce the skill's own release notes for the release notes' own scenario. It does not show that the change the author's PR made, the D instruction, was responsible. The author's "withheld" arm got A–C right without this skill (see below). Sonnet's control arm did not.

#### Judge reliability

Canaries: 9/10. nullbench computes which canary was misgraded but does not write it to the report or to `records.json`, so it cannot be identified from this run. Canaries were not edited after the result.

#### What was different from the author's method

See `DEVIATIONS.md`. The differences most likely to matter:

- **Control environment (I-1).** The author's "withheld" arm withheld only `otel-go`. It still had the repository's other 16 skills and `AGENTS.md`. The model was `gpt-5.6-sol`, and it got A–C right. Our control arm has only the fixture file. That gap plausibly accounts for much of the difference between the author's A–C results and ours.
- **Model and n.** Sonnet with reps=20 per arm, against the author's `gpt-5.6-sol` with 3 per arm. reps=20 was chosen before the run, for power, which deviates from P6.
- **Scope.** Only the fixture file (`skills/otel-go/evals/files/go-v145-upgrade.md`) is ported into the sandbox, never the surrounding `skills/otel-go/` tree, which holds `evals.json` and `results.md`.

**Mapped to FAILURES.md:** entry 1 (answer-key vocabulary, at the rubric level, via `references/`); entry 7 (+100 from n=3 per arm); entry 3 (Sonnet judging Sonnet).

</details>
