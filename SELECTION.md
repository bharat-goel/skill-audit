# Selection

## Rule

Frozen 2026-09-23, before any candidate was viewed. Changes after this point are new commits
stating their reason; this section is never edited in place.

### Sources, in order

1. `anthropics/skills` — every skill directory, in the order returned by
   `gh api repos/anthropics/skills/contents/skills --jq '.[].name'`, frozen to
   `selection/anthropics-skills.json`.
2. GitHub repository search, frozen to `selection/github-search.json`:

   ```
   gh search repos 'SKILL.md eval OR benchmark OR "with and without" pushed:<2026-09-23' \
     --sort stars --order desc --limit 100 \
     --json fullName,url,stargazersCount,pushedAt,license
   ```

Candidates are screened in that order: all of source 1, then source 2.

### Eligibility — all required

| | Criterion |
|---|---|
| E1 | An Agent Skill (`SKILL.md` with frontmatter) runnable under the `claude` CLI with no external service, API key or paid tool |
| E2 | Publishes a with-versus-without number. A pass rate with no baseline does not count. |
| E3 | Publishes a portable method: task prompts plus a per-task pass criterion expressible as a nullbench verifier (`any` / `none` / `ordered`, or a rubric for `judge`). A criterion that needs executing generated code is not portable. |
| E4 | License permits redistribution (OSI-approved or CC-BY / CC0) |
| E5 | Not written by Bharat Goel; no two selected skills share an author or organisation |

A repository with several skills counts as one candidate per skill that has its own
published claim; screening stops at the first failed criterion, which is the one logged.

### Stopping

Stop at three eligible skills or 100 candidates screened, whichever comes first. Fewer
than three eligible: the audit proceeds with fewer and reports the shortfall as a
finding.

## Log

| # | Candidate | Source | E1 | E2 | E3 | E4 | E5 | Result | Evidence |
|---|---|---|---|---|---|---|---|---|---|
| 1 | anthropics/skills — academy-guide | 1 | ✓ | ✗ | – | – | – | excluded: E2, no with-vs-without number published | https://github.com/anthropics/skills/blob/34040c9c568585f6929bedeaad110ad08f079624/skills/academy-guide/SKILL.md |
| 2 | anthropics/skills — algorithmic-art | 1 | ✓ | ✗ | – | – | – | excluded: E2, only a stylistic ratio ("90% generation, 10% params"), no effect claim | https://github.com/anthropics/skills/blob/34040c9c568585f6929bedeaad110ad08f079624/skills/algorithmic-art/SKILL.md |
| 3 | anthropics/skills — brand-guidelines | 1 | ✓ | ✗ | – | – | – | excluded: E2, no with-vs-without number published | https://github.com/anthropics/skills/blob/34040c9c568585f6929bedeaad110ad08f079624/skills/brand-guidelines/SKILL.md |
| 4 | anthropics/skills — canvas-design | 1 | ✓ | ✗ | – | – | – | excluded: E2, only a stylistic ratio ("90% visual, 10% text"), no effect claim | https://github.com/anthropics/skills/blob/34040c9c568585f6929bedeaad110ad08f079624/skills/canvas-design/SKILL.md |
| 5 | anthropics/skills — claude-api | 1 | ✓ | ✗ | – | – | – | excluded: E2, describes a cost-optimization workflow, no published pass-rate or effect number | https://github.com/anthropics/skills/blob/34040c9c568585f6929bedeaad110ad08f079624/skills/claude-api/SKILL.md |
| 6 | anthropics/skills — discernment-nudge | 1 | ✓ | ✗ | – | – | – | excluded: E2, "benchmarks" refers to user's own CPL vertical benchmarks, not a skill effect number | https://github.com/anthropics/skills/blob/34040c9c568585f6929bedeaad110ad08f079624/skills/discernment-nudge/SKILL.md |
| 7 | anthropics/skills — doc-coauthoring | 1 | ✓ | ✗ | – | – | – | excluded: E2, no with-vs-without number published | https://github.com/anthropics/skills/blob/34040c9c568585f6929bedeaad110ad08f079624/skills/doc-coauthoring/SKILL.md |
| 8 | anthropics/skills — docx | 1 | ✓ | ✗ | – | – | – | excluded: E2, no with-vs-without number published | https://github.com/anthropics/skills/blob/34040c9c568585f6929bedeaad110ad08f079624/skills/docx/SKILL.md |
| 9 | anthropics/skills — frontend-design | 1 | ✓ | ✗ | – | – | – | excluded: E2, no with-vs-without number published | https://github.com/anthropics/skills/blob/34040c9c568585f6929bedeaad110ad08f079624/skills/frontend-design/SKILL.md |
| 10 | anthropics/skills — internal-comms | 1 | ✓ | ✗ | – | – | – | excluded: E2, no with-vs-without number published | https://github.com/anthropics/skills/blob/34040c9c568585f6929bedeaad110ad08f079624/skills/internal-comms/SKILL.md |
| 11 | anthropics/skills — mcp-builder | 1 | ✓ | ✗ | – | – | – | excluded: E2, "Evaluations" section is a how-to for building MCP-server evals, not a published effect number for the skill itself | https://github.com/anthropics/skills/blob/34040c9c568585f6929bedeaad110ad08f079624/skills/mcp-builder/SKILL.md |
| 12 | anthropics/skills — pdf | 1 | ✓ | ✗ | – | – | – | excluded: E2, no with-vs-without number published | https://github.com/anthropics/skills/blob/34040c9c568585f6929bedeaad110ad08f079624/skills/pdf/SKILL.md |
| 13 | anthropics/skills — pptx | 1 | ✓ | ✗ | – | – | – | excluded: E2, "baseline" refers to `validate.py --original` schema diffing, not an effect number | https://github.com/anthropics/skills/blob/34040c9c568585f6929bedeaad110ad08f079624/skills/pptx/SKILL.md |
| 14 | anthropics/skills — skill-creator | 1 | ✓ | ✗ | – | – | – | excluded: E2, describes how to build evals/benchmarks for other skills; no with-vs-without number for skill-creator itself | https://github.com/anthropics/skills/blob/34040c9c568585f6929bedeaad110ad08f079624/skills/skill-creator/SKILL.md |
| 15 | anthropics/skills — slack-gif-creator | 1 | ✓ | ✗ | – | – | – | excluded: E2, no with-vs-without number published | https://github.com/anthropics/skills/blob/34040c9c568585f6929bedeaad110ad08f079624/skills/slack-gif-creator/SKILL.md |
| 16 | anthropics/skills — theme-factory | 1 | ✓ | ✗ | – | – | – | excluded: E2, no with-vs-without number published | https://github.com/anthropics/skills/blob/34040c9c568585f6929bedeaad110ad08f079624/skills/theme-factory/SKILL.md |
| 17 | anthropics/skills — web-artifacts-builder | 1 | ✓ | ✗ | – | – | – | excluded: E2, no with-vs-without number published | https://github.com/anthropics/skills/blob/34040c9c568585f6929bedeaad110ad08f079624/skills/web-artifacts-builder/SKILL.md |
| 18 | anthropics/skills — webapp-testing | 1 | ✓ | ✗ | – | – | – | excluded: E2, no with-vs-without number published | https://github.com/anthropics/skills/blob/34040c9c568585f6929bedeaad110ad08f079624/skills/webapp-testing/SKILL.md |
| 19 | anthropics/skills — xlsx | 1 | ✓ | ✗ | – | – | – | excluded: E2, "evaluate" refers to spreadsheet formula recalculation, not a skill effect number | https://github.com/anthropics/skills/blob/34040c9c568585f6929bedeaad110ad08f079624/skills/xlsx/SKILL.md |
