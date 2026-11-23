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
| 0 — nullbench bracket on Sonnet | passed 2026-09-24 |
| 1 — selection rule frozen | frozen 2026-09-23, 5cf2831 |
| 2 — screening | 3 eligible (1/100 sources 1-2, 2/23 source 3 — rates not pooled, see SELECTION.md Amendment 1) |
| 3 — ports registered | uap-release-analyzer `ef9be7b4ff77bd4a`, cds-code `823994c3476651eb`, otel-go `22d04167d4f430c6` |
| 4 — runs | all three done, all EXPLORATORY (judge canaries) — see [`findings/`](findings/) |
| 5 — authors notified, published | notified 2026-10-22 (issues linked in [`correspondence/`](correspondence/)); no replies; **published 2026-11-23** with the write-up ["I re-measured three published Claude skill claims"](https://bharatgoel.com/writing/three-skill-claims-re-measured) |

| Skill | Author's claim | Measured | Pre-registered verdict |
|---|---|---|---|
| [uap-release-analyzer](findings/uap-release-analyzer.md) | +37.5pp | +42.5pp [+28.4, +54.3] | claim holds (exploratory) |
| [cds-code](findings/cds-code.md) | +60pp (derived) | +6.0pp [-2.1, +16.2] | claim not reproduced (exploratory) |
| [otel-go](findings/otel-go.md) | +100pp (0/3 → 3/3) | +85.0pp [+58.5, +94.8] | claim holds, ceiling rule (exploratory) |
