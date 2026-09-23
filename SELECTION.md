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
