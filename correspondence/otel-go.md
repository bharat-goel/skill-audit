# otel-go — correspondence

## Sent 2026-10-22 — https://github.com/ollygarden/opentelemetry-agent-skills/issues/281

Posted by Bharat as a GitHub issue; body as in `issues/otel-go.md` (publish date 2026-11-05). The text below is the earlier draft.

### Draft

Route: a GitHub issue on
[ollygarden/opentelemetry-agent-skills](https://github.com/ollygarden/opentelemetry-agent-skills)
(confirm issues are enabled before sending). To be sent by Bharat, under Bharat's own name.

**Title:** Independent re-measurement of the go-v145-upgrade-review eval (PR #218)

Hi — I re-ran the `go-v145-upgrade-review` eval published with PR #218 (at `73a557b`) with
[nullbench](https://github.com/bharat-goel/nullbench), a pre-registration harness, as part of
an audit of published skill claims. otel-go was one of three skills, out of 123 screened, that
published a with-versus-without number and a method someone else could re-run. Thank you for
publishing `evals/evals.json` and `results.md`.

What I did: your prompt and fixture were used verbatim, with your four expectations as one
all-must-pass judge rubric. I ran 20 replies per arm on Sonnet, and committed the analysis rule
before any run. Because your claim of 0/3 → 3/3 sits at the +100pp ceiling, the rule compares
our interval with your own interval for that claim, [+20.6, +100]. Every difference from your
method is listed in [DEVIATIONS.md](<link>).

**Result: your claim holds.** 0/20 → 17/20, +85.0pp [95% CI +58.5, +94.8]. The result is
labelled exploratory because the judge misgraded 1 of 10 calibration checks.

One thing you may want to know: in your run, expectations A–C passed in every rep of both arms
and only D varied. In ours it was the other way round. Without the skill, Sonnet never stated
the v1.45.0 changes (A–C) and usually declined because it couldn't verify them. With the skill,
it read them from `references/` (`breaking-changes.md`, `performance.md`, which state them
nearly as the expectations do). D separated the arms only a little: the without-skill replies missed it in 5 of 20. So on Sonnet the skill's value
here is the reference content, more than the verification instruction #218 added. Part of that
is our baseline: it had only the fixture, while yours had the repo's other skills and
`AGENTS.md`.

Write-up: <link>. I plan to publish on <date + 14 days>. Any reply you send will be published
verbatim beside the finding unless you ask otherwise, and I'll correct anything I got wrong
about your method.

— Bharat

## Reply

*None yet.*
