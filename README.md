# skill-audit

Re-measuring the published effect claims of three Claude skills, using each author's
own evaluation method ported into [nullbench](https://github.com/bharat-goel/nullbench).
Every result is published, including the ones where the claim holds, with the author's
reply beside it.

Third project in a series: cobra → nullbench → skill-audit. Design:
[`docs/superpowers/specs/2026-09-23-skill-audit-design.md`](docs/superpowers/specs/2026-09-23-skill-audit-design.md).

`npm test` needs [nullbench](https://github.com/bharat-goel/nullbench) checked out as a
sibling directory (`../nullbench`, override with `NULLBENCH_DIR`) — the tools import its
`verify.mjs` and `stats.mjs` directly rather than vendoring them.

## Status

| Phase | State |
|---|---|
| 0 — nullbench bracket on Sonnet | not started |
| 1 — selection rule frozen | frozen 2026-09-23, 5cf2831 |
| 2 — screening | not started |
| 3 — ports registered | not started |
| 4 — runs | not started |
| 5 — authors notified, published | not started |
