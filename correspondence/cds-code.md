# cds-code — correspondence

## Draft — not sent

Route: a GitHub issue on [coinbase/cds](https://github.com/coinbase/cds) (confirm issues are
enabled before sending). To be sent by Bharat, under Bharat's own name.

**Title:** Independent re-measurement of the cds-code skill evals (and an eval 3 / guideline mismatch)

Hi — I re-ran part of the cds-code evaluation published in this repo (at `9aca6ae`) with
[nullbench](https://github.com/bharat-goel/nullbench), a pre-registration harness, as part of
an audit of published skill claims. cds-code was one of three skills, out of 123 screened, that
published a with-versus-without number and a method someone else could re-run. Thank you for
publishing `evals/evals.json`.

What I did: evals 1–5. Your prompts were used verbatim. Each eval was graded as one judge
rubric that passes only if all of its expectations are met. I ran 10 replies per arm per eval
on Sonnet, and committed the analysis rule before any run. From your per-eval table that rule
gives a claim of +60pp over evals 1–5 (5/5 vs 2/5 fully met). Every difference from your
method is listed in [DEVIATIONS.md](<link>).

**Result: not reproduced in our setup.** Pooled over evals 1–5, 0/50 → 3/50, +6.0pp
[95% CI −2.1, +16.2]. The result is labelled exploratory because the judge misgraded 3 of 26
calibration checks. I want to be clear about what this does and doesn't show. Our harness runs
the model headless, where file writes are refused. Most replies in both arms tried to write a
file, were refused, and replied with a plan instead of code. Your Cursor runner could write
files, and your baseline had the monorepo around it. So this is a weak test of the skill in
your environment. It is not evidence that the skill doesn't help there.

One thing you may want to fix regardless: eval 3's expectation 5 requires `ProgressBar` /
`ProgressCircle` from `@coinbase/cds-web/visualizations` and not from
`@coinbase/cds-web-visualization`. `guidelines/components.md` (L315, L322, L391) says to
import them from `@coinbase/cds-web-visualization`. All 8 with-skill replies that contained
code followed the guideline and failed that expectation. One of the two probably needs
updating.

Write-up: <link>. I plan to publish on <date + 14 days>. Any reply you send will be published
verbatim beside the finding unless you ask otherwise, and I'll correct anything I got wrong
about your method.

— Bharat

## Reply

*None yet.*
