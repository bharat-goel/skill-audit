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
| 20 | microsoft/SkillOpt | 2 | ✓ | ✗ | – | – | – | excluded: E2, repo is a skill-training framework with a research paper; README publishes no with-vs-without number for a specific runnable skill | https://github.com/microsoft/SkillOpt/blob/79124b37e9a6371e13b753f8bcd7adb1e493ade1/README.md |
| 21 | wasp-lang/open-saas | 2 | ✓ | ✗ | – | – | – | excluded: E2, SaaS boilerplate bundling onboarding skills; no with-vs-without number published | https://github.com/wasp-lang/open-saas/blob/cbd30162b05d798b3a3f955ab5781940b67bec89/README.md |
| 22 | qiye45/wechatDownload — wechat-article-downloader | 2 | ✓ | ✗ | – | – | – | excluded: E2, download tool; no with-vs-without number published | https://github.com/qiye45/wechatDownload/blob/4e3ee7cbbdc88816ee8d682253d38df81ae607ae/skills/wechat-article-downloader/SKILL.md |
| 23 | SnailSploit/Claude-Red | 2 | ✓ | ✗ | – | – | – | excluded: E2, numbers in README are skill/category counts, not an effect claim | https://github.com/SnailSploit/claude-red/blob/739512a8588b28ff3b554e669391c22508602878/README.md |
| 24 | bergside/awesome-design-skills | 2 | ✓ | ✗ | – | – | – | excluded: E2, `%` occurrences are HTML table-width attributes; curated list of design skills with no effect claim | https://github.com/bergside/awesome-design-skills/blob/f631a09b4fcc0166f2e2c1a8c81906ef680c57e8/README.md |
| 25 | bergside/design-md-chrome | 2 | ✗ | – | – | – | – | excluded: E1, Chrome extension that generates SKILL.md/DESIGN.md files; not itself an Agent Skill (no SKILL.md in repo) | https://github.com/bergside/design-md-chrome/blob/8e07614fb18752ab1ee14dd65a8ff93e63c9b13b/README.md |
| 26 | ciembor/agent-rules-books — a-philosophy-of-software-design | 2 | ✓ | ✓ | ✗ | – | – | excluded: E3, single n=1 whole-codebase refactor experiment (80-task Codex run) judged holistically by ChatGPT ("74/100 vs 46/100"); not task prompts with per-task pass criteria, and grading requires executing/inspecting a generated codebase | https://github.com/ciembor/agent-rules-books/blob/893a88a6fce3a80c565bf39ac65021b43a8b2990/README.md#L197 |
| 27 | elementalsouls/Claude-OSINT | 2 | ✓ | ✗ | – | – | – | excluded: E2, "56/56 PASS... 100%" is a pass rate with no baseline comparison | https://github.com/elementalsouls/Claude-OSINT/blob/13d920413448c026b52ac74efee0f1eb39dd81ff/README.md#L49 |
| 28 | wilwaldon/Claude-Code-Frontend-Design-Toolkit | 2 | ✗ | – | – | – | – | excluded: E1, curated links/commentary document; no SKILL.md in repo | https://github.com/wilwaldon/Claude-Code-Frontend-Design-Toolkit/blob/2a6d0958e6966e0003896f94ce5003466e89e91d/README.md |
| 29 | gamedev-skills/awesome-gamedev-agent-skills | 2 | ✓ | ✗ | – | – | – | excluded: E2, "baseline" refers to engine-version authoring baselines, not an effect number | https://github.com/gamedev-skills/awesome-gamedev-agent-skills/blob/b105e1cf617adf0b68ed98790a716bbb60993179/docs/VERSION-SUPPORT.md |
