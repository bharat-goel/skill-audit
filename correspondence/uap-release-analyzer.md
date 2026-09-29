# uap-release-analyzer — correspondence

## Draft — not sent

Route: a GitHub issue on
[ckpxgfnksd-max/uap-release-analyzer](https://github.com/ckpxgfnksd-max/uap-release-analyzer)
(issues are enabled). To be sent by Bharat, under Bharat's own name.

**Title:** Independent re-measurement of the eval 3 result

Hi — I re-ran part of the evaluation published in this repo (at `c171d88`) with
[nullbench](https://github.com/bharat-goel/nullbench), a pre-registration harness, as part
of an audit of published skill claims. Your skill was one of three, out of 123 screened,
that met all of the audit's eligibility criteria, including publishing a with-versus-without
number and a method someone else could re-run, so thank you for publishing
`evals/evals.json`.

What I did: eval 3 (fresh-tranche bootstrap) only — evals 0–2 need the release_01 corpus
at a home-directory path. Your prompt, verbatim; each of your 8 expectations graded as its
own judge rubric; 10 replies per arm per expectation on Sonnet; the analysis rule committed
before any run. Every difference from your method is listed in
[DEVIATIONS.md](<link>).

**Result: your claim holds.** Pooled over the 8 expectations, 12.5% → 55.0%,
+42.5pp [95% CI +28.4, +54.3], against your +37.5. It is labelled exploratory because the
judge misgraded 4 of 38 calibration checks.

Two things you may want to know:

1. Most of the gain comes from the with-skill replies naming the skill's own files
   (`run_all.py`, `REPORT.md`, `agency_vocab.md`). The without-skill replies named none of
   them in 80 tries, partly because our baseline ran without release_01 present, unlike
   yours. The expectations about the substance of the advice (e1, e5, e8) moved from 0 to
   1 of 10.
2. SKILL.md L93 says to add new prefixes to `PREFIX_RULES` in the scripts; expectation 6
   says "rather than hard-coded into the scripts". 9 of 10 with-skill replies followed
   SKILL.md. One of the two probably needs updating.

Write-up: <link>. I plan to publish on <date + 14 days>. Any reply you send will be
published verbatim beside the finding unless you ask otherwise, and I'll correct anything
I got wrong about your method.

— Bharat

## Reply

*None yet.*
