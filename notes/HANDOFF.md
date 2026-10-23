# Handoff — skill-audit (as of 2026-10-23)

Paste this into a new chat (or point a local Claude Code session at this repo) to continue.
The full record of every ruling is in `notes/sdd-ledger.md`.

## Where things stand

- **All three audits are run and written up.** Every result is labelled exploratory because the
  judge misgraded some canaries.

  | Skill | Author's claim | Measured | Verdict |
  |---|---|---|---|
  | uap-release-analyzer | +37.5pp | +42.5pp [+28.4, +54.3] | claim holds |
  | cds-code | +60pp (derived) | +6.0pp [-2.1, +16.2] | claim not reproduced (headless setup could not write files) |
  | otel-go | +100pp (0/3 → 3/3) | +85.0pp [+58.5, +94.8] | claim holds (ceiling rule) |

  Findings are in `findings/`, and raw results in `suites/<skill>/results/`.
- **Authors notified 2026-10-22** by GitHub issue, with the findings inlined:
  - uap: https://github.com/ckpxgfnksd-max/uap-release-analyzer/issues/1
  - cds: https://github.com/coinbase/cds/issues/913
  - otel: https://github.com/ollygarden/opentelemetry-agent-skills/issues/281
- **This repo is still private.**

## Next: on 2026-11-05 (end of the 14-day window)

1. Read any replies on the three issues. Each one goes verbatim into the "Author's reply" section
   of its `findings/<skill>.md`, unless that author asks otherwise.
2. Correct anything a reply shows we got wrong about their method, and note the correction in
   the finding.
3. Make `bharat-goel/skill-audit` public.
4. Post a short follow-up comment on each issue linking to its published finding.
5. Update the README's phase 5 row to "published".

## nullbench (github.com/bharat-goel/nullbench, public) — open, waiting on review/merge

- **PR #7** `feat/skill-dir` → main.
  - Conflicts with #6: keep both bracket ledger entries, in time order.
  - Conflicts with #5 in five files: rebase #5 after.
  - Suggested merge order: #6, #7, then #8, then rebase #5.
- **PR #8** `fix/audit-gaps`, stacked on #7. Reviewed, 220/222 tests pass. It adds:
  - canary misgrade identities in reports and the ledger;
  - the answering backend in reports and the ledger;
  - opt-in `"h_version": 2` covering fixture contents and `canaries.json`;
  - canary validation.
- **Issues:** #9 (snapshot the skill at preflight), #10 (leakage false warnings), #11 (headless
  write refusal).

## Rules carried over

- Every paid run needs an explicit yes that states the call count.
- Work on feature branches, never on main directly.
- Commits end with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Anything sent to other people, or made public, needs an explicit yes first.
